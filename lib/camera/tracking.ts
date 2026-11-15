import type { NormalizedLandmark, Category } from "@mediapipe/tasks-vision";
import { isFaceAccessory, type AccessoryPlacement } from "./accessory";
import { accessoryFace, accessoryGrips, type AccessoryFace, type AccessoryHands } from "./accessory-overlay";
import { faceAnchor } from "./face-anchor";
import { cover, HEIGHT, Ink, WIDTH, type Point } from "./ink";
import { motionFilter } from "./tracking-filter";
import { faceMatrix } from "./surface-pose";
import { trackSurfaces, type BodyFrame } from "./surface-tracking";
import type { Headwear } from "./headwear";
import { trackUpperBody } from "./upper-body";
import { trackFullBody } from "./full-body";
import { trackJoints, type HandDetection } from "./joint-tracking";
import { jointModel, type JointId } from "./joints";
import type { CameraMotionTracking } from "./motion";
import { isFist } from "./fist";

type Triangle = [number, number, number];
type TrackingFrame = {
  type: "frame";
  time: number;
  shoulders?: NormalizedLandmark[];
  fullBody?: boolean;
  motion?: boolean;
  hands?: HandDetection[];
  pose?: NormalizedLandmark[];
  body?: BodyFrame;
  face?: { points: NormalizedLandmark[]; matrix: number[]; expressions?: Category[] };
};
type WorkerResult = TrackingFrame | { type: "triangles"; triangles: Triangle[] } |
  { type: "error"; kind: "hand" | "pose" | "face" };

const HOLD_MS = 140;
const JOINT_MAX_AGE_MS = 200;
const HAND_HOLD_MS = 250;
const HAND_RELEASE_MS = 85;
const PINCH_START_RATIO = 0.27;
const PINCH_RELEASE_RATIO = 0.43;
const errors = {
  hand: "Hand tracking unavailable. You can still draw with the pointer.",
  pose: "Body tracking unavailable. Change the Follow setting to draw.",
  face: "Face tracking unavailable. Change the Follow setting to draw.",
};

type AccessoryTracking = {
  placements: () => AccessoryPlacement[];
  followedJoints: () => JointId[];
  headwear: () => Headwear | undefined;
  updateFace: (face: AccessoryFace | undefined) => void;
  updateHands: (hands: AccessoryHands) => void;
};

export function track(video: HTMLVideoElement, ink: Ink, status: (message: string) => void,
  accessory?: AccessoryTracking, motionTracking?: CameraMotionTracking, overlayOnly?: { geometry: () => { width: number; height: number; x: number; y: number }; shoulders: () => boolean },
  onFistChange?: (held: boolean) => void) {
  let worker: Worker;
  try {
    worker = new Worker("/camera-tracker.js?protocol=8", { name: "camera-tracking" });
  } catch {
    status("Camera tracking unavailable. You can still draw with the pointer.");
    return Object.assign(() => {}, { upperBody: () => undefined, fullBody: () => undefined });
  }
  let closed = false;
  let busy = false;
  let frame = 0;
  let lastTime = -1;
  let cameraTime = 0;
  let lastPose = -Infinity;
  let lastFace = -Infinity;
  let lastGrip = -Infinity;
  let sentAt = 0;
  let namedFaceRequested = false;
  let jointPoseRequested = false;
  let fullBodyRequested = false;
  let jointExpiry: number | undefined;
  let fistHeld = false;
  let fistSince = -1;
  let fistReleased = -1;
  let lastFistFrame = -Infinity;
  const joints = trackJoints();
  const hands = ["Left", "Right"].map((side) => ({
    side, source: `hand:${side}`, lastSeen: -Infinity, pinching: false,
    releaseTime: undefined as number | undefined, smooth: motionFilter(3.5, 18), wrist: undefined as Point | undefined,
  }));
  let triangles: Triangle[] = [];
  const smoothShoulders = motionFilter(2.0, 0.035);
  const smoothMatrix = motionFilter(2.5, 1.2);
  const smoothFace = motionFilter(4.5, 0.035);
  const surfaces = trackSurfaces(ink, accessory?.headwear);
  const upperBody = trackUpperBody();
  const fullBodyTracker = trackFullBody();
  const input = document.createElement("canvas");
  const inputContext = input.getContext("2d")!;
  // Match the 30 fps canvas stream and leave capture/rendering independent of inference.
  const usesVideoFrames = typeof video.requestVideoFrameCallback === "function";

  function endStroke(state: typeof hands[number], cancel = false) {
    if (state.pinching) ink.apply(state.source, cancel ? "cancel" : "end");
    state.pinching = false;
    state.releaseTime = undefined;
    state.smooth = motionFilter(3.5, 18);
  }

  function updateHand(state: typeof hands[number], hand: HandDetection | undefined, time: number, map: (point: Point) => Point) {
    if (!hand) {
      if (state.pinching && time - state.lastSeen > HAND_RELEASE_MS) endStroke(state);
      return;
    }
    if (state.pinching && time - state.lastSeen > HAND_HOLD_MS) endStroke(state);
    state.lastSeen = time;
    const tip = map(hand.tip);
    const thumb = map(hand.thumb);
    const wrist = map(hand.wrist);
    state.wrist = wrist;
    const knuckle = map(hand.knuckle);
    const span = Math.hypot(wrist.x - knuckle.x, wrist.y - knuckle.y);
    const ratio = Math.hypot(thumb.x - tip.x, thumb.y - tip.y) / Math.max(1, span);
    const touching = ratio < (state.pinching ? PINCH_RELEASE_RATIO : PINCH_START_RATIO);
    if (!touching) {
      if (!state.pinching) return;
      state.releaseTime ??= time;
      if (time - state.releaseTime >= 30) endStroke(state);
      return;
    }
    state.releaseTime = undefined;
    const [x, y] = state.smooth([(tip.x * 0.75 + thumb.x * 0.25) / WIDTH, (tip.y * 0.75 + thumb.y * 0.25) / HEIGHT], time);
    ink.apply(state.source, state.pinching ? "move" : "start", { x, y });
    state.pinching = true;
  }

  worker.onmessage = ({ data }: MessageEvent<WorkerResult>) => {
    if (closed) return;
    if (data.type === "triangles") { triangles = data.triangles; return; }
    if (data.type === "error") {
      if (data.kind === "hand") { hands.forEach((hand) => endStroke(hand)); setFist(false); }
      if (data.kind === "pose") { ink.shoulder = undefined; upperBody.clear(); fullBodyTracker.clear(); }
      if (data.kind === "face") {
        ink.face = undefined;
        accessory?.updateFace(undefined);
      }
      status(errors[data.kind]);
      return;
    }
    busy = false;
    const { time, shoulders, face, body, pose: posePoints, hands: detected = [] } = data;
    if (data.motion && motionTracking?.enabled() && performance.now() - sentAt < 500) {
      motionTracking.onFrame({ aspect: video.videoWidth / video.videoHeight, pose: posePoints, face });
    }
    if (cameraTime - time > HAND_HOLD_MS) return;
    const fistDetected = !!onFistChange && detected.some((hand) => isFist(hand.points));
    if (onFistChange) {
      lastFistFrame = time;
      if (fistDetected) {
        fistReleased = -1;
        if (fistSince < 0) fistSince = time;
        if (time - fistSince >= 180) setFist(true);
      } else {
        fistSince = -1;
        if (fistReleased < 0) fistReleased = time;
        if (time - fistReleased >= 140) setFist(false);
      }
    }
    const rect = overlayOnly?.geometry() ?? cover(video.videoWidth, video.videoHeight);
    const map = (point: Point) => ({
      x: overlayOnly ? rect.x + point.x * rect.width : WIDTH - rect.x - point.x * rect.width, y: rect.y + point.y * rect.height,
    });
    const score = (name: string) => face?.expressions?.find((entry) => entry.categoryName === name)?.score ?? 0;
    const blinks = { left: score("eyeBlinkLeft"), right: score("eyeBlinkRight") };
    const timeRemaining = JOINT_MAX_AGE_MS - (performance.now() - sentAt);
    const jointFrame = (jointPoseRequested || namedFaceRequested) && timeRemaining > 0
      ? joints.update(jointPoseRequested ? posePoints : undefined, jointPoseRequested ? detected : [], map, time,
        namedFaceRequested && face ? { points: face.points, blinks } : undefined)
      : undefined;
    if (jointFrame) {
      window.clearTimeout(jointExpiry);
      ink.setJointAnchors(jointFrame.anchors);
      jointExpiry = window.setTimeout(clearJoints, timeRemaining);
    }
    const anchorIsCurrent = cameraTime - time <= HOLD_MS;
    if (anchorIsCurrent) upperBody.update(shoulders, map, time);
    if (anchorIsCurrent && fullBodyRequested) fullBodyTracker.update(posePoints, map, time);
    const [left, right] = anchorIsCurrent ? shoulders ?? [] : [];
    if (left?.visibility > 0.55 && right?.visibility > 0.55) {
      const a = map(left);
      const b = map(right);
      const [ax, ay, bx, by] = smoothShoulders([a.x, a.y, b.x, b.y], time);
      const width = Math.hypot(bx - ax, by - ay);
      if (width > 30) {
        lastPose = time;
        ink.shoulder = { center: { x: (ax + bx) / 2, y: (ay + by) / 2 }, angle: Math.atan2(by - ay, bx - ax), width };
      }
    }
    const pose = face && anchorIsCurrent ? faceMatrix(face.matrix) : undefined;
    if (face && pose) {
      const matrix = smoothMatrix(pose, time);
      lastFace = time;
      const coords = smoothFace(face.points.flatMap((point) => {
        const pixel = map(point);
        return [pixel.x, pixel.y, point.z * rect.width];
      }), time);
      const points = face.points.map((_, index) => ({ x: coords[index * 3], y: coords[index * 3 + 1], z: coords[index * 3 + 2] }));
      accessory?.updateFace(accessoryFace(points, matrix, rect.height));
      ink.face = faceAnchor(points, triangles, matrix, { x: WIDTH / 2, y: HEIGHT / 2 }, rect.height, blinks);
    }
    if (anchorIsCurrent) surfaces.update(time, rect.height, map, pose, body);
    const [leftHand, rightHand] = (jointPoseRequested ? jointFrame?.hands : undefined) ?? matchHands(detected, hands, time, map);
    if (accessory && anchorIsCurrent) {
      lastGrip = time;
      accessory.updateHands(accessoryGrips(leftHand, rightHand, map));
    }
    if (overlayOnly) return;
    if (fistDetected || fistHeld) { hands.forEach((hand) => endStroke(hand, true)); return; }
    updateHand(hands[0], leftHand, time, map);
    updateHand(hands[1], rightHand, time, map);
  };

  function schedule() {
    frame = usesVideoFrames
      ? video.requestVideoFrameCallback((_, metadata) => update(metadata.mediaTime * 1000))
      : requestAnimationFrame(() => update(video.currentTime * 1000));
  }

  function update(time: number) {
    schedule();
    cameraTime = time;
    if (time - lastFistFrame > HAND_HOLD_MS) {
      fistSince = -1;
      fistReleased = -1;
      setFist(false);
    }
    surfaces.expire(time);
    if (time - lastPose > HOLD_MS) ink.shoulder = undefined;
    if (time - lastGrip > HOLD_MS) accessory?.updateHands({});
    if (time - lastFace > HOLD_MS) {
      ink.face = undefined;
      accessory?.updateFace(undefined);
    }
    for (const hand of hands) {
      if (hand.pinching && time - hand.lastSeen > HAND_HOLD_MS) endStroke(hand);
    }
    if (busy || video.readyState < 2 || !video.videoWidth || (lastTime >= 0 && time - lastTime < 30)) return;
    lastTime = time;
    busy = true;
    // Fast Refresh can preserve Ink instances from before this method was added.
    const placements = accessory?.placements();
    const { hat, garment } = surfaces.needed();
    const motion = motionTracking?.enabled() ?? false;
    const targets = [...Ink.prototype.followedJoints.call(ink), ...accessory?.followedJoints() ?? [], ...ink.overlayJoints?.() ?? []].map(jointModel);
    namedFaceRequested = targets.includes("face");
    const face = namedFaceRequested || motion || hat || !!placements?.some(isFaceAccessory) || Ink.prototype.follows.call(ink, "face");
    const shoulders = overlayOnly?.shoulders() || ink.overlayShoulders?.() || !!placements?.includes("shoulders") || Ink.prototype.follows.call(ink, "shoulders");
    jointPoseRequested = targets.includes("pose") || targets.includes("hand");
    const needsFullBody = placements?.includes("fullBody") ?? false;
    if (fullBodyRequested && !needsFullBody) fullBodyTracker.clear();
    fullBodyRequested = needsFullBody;
    const fullBody = jointPoseRequested || fullBodyRequested;
    if (!jointPoseRequested && !namedFaceRequested && jointExpiry !== undefined) clearJoints();
    const scale = Math.min(1, (face || fullBody ? 960 : 640) / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);
    if (input.width !== width || input.height !== height) { input.width = width; input.height = height; }
    sentAt = performance.now();
    inputContext.drawImage(video, 0, 0, width, height);
    void createImageBitmap(input).then((image) => {
      if (closed) { image.close(); return; }
      try {
        worker.postMessage({ image, time, face, shoulders, hat, garment, fullBody, motion, gesture: !!onFistChange }, [image]);
      } catch {
        image.close();
        fail();
      }
    }).catch(fail);
  }

  function clearJoints() {
    window.clearTimeout(jointExpiry);
    jointExpiry = undefined;
    joints.clear();
    ink.setJointAnchors();
  }

  function stop() {
    if (closed) return;
    closed = true;
    if (usesVideoFrames) video.cancelVideoFrameCallback(frame);
    else cancelAnimationFrame(frame);
    worker.terminate();
    clearJoints();
    hands.forEach((hand) => endStroke(hand));
    setFist(false);
    ink.face = undefined;
    ink.shoulder = undefined;
    upperBody.clear();
    fullBodyTracker.clear();
    ink.scene = undefined;
    accessory?.updateFace(undefined);
    accessory?.updateHands({});
    motionTracking?.onFrame(null);
  }

  function fail() {
    if (closed) return;
    stop();
    status("Camera tracking unavailable. Change Follow to Off to draw with the pointer.");
  }

  function setFist(held: boolean) {
    if (fistHeld === held) return;
    fistHeld = held;
    onFistChange?.(held);
  }

  worker.onerror = worker.onmessageerror = fail;
  schedule();
  return Object.assign(stop, { upperBody: () => upperBody.at(cameraTime), fullBody: () => fullBodyTracker.at(cameraTime) });
}

function matchHands(detected: HandDetection[], states: { side: string; lastSeen: number; wrist?: Point }[],
  time: number, map: (point: Point) => Point) {
  const cost = (hand: HandDetection | undefined, index: number) => {
    if (!hand) return 0;
    const { wrist, side, lastSeen } = states[index];
    const point = map(hand.wrist);
    const distance = wrist && time - lastSeen < HAND_HOLD_MS ? Math.hypot(wrist.x - point.x, wrist.y - point.y) : 0;
    return distance + (hand.side === side ? 0 : 65);
  };
  const [a, b] = detected;
  return cost(a, 0) + cost(b, 1) <= cost(a, 1) + cost(b, 0) ? [a, b] : [b, a];
}
