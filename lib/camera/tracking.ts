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
import { createHandDrawing } from "./hand-drawing";
import { sendTrackingFrame } from "./tracking-input";

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
type WorkerResult = TrackingFrame | { type: "hands"; time: number; hands: HandDetection[] } |
  { type: "triangles"; triangles: Triangle[] } |
  { type: "error"; kind: "hand" | "pose" | "face" };

const HOLD_MS = 650;
const JOINT_MAX_AGE_MS = 650;
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
    worker = new Worker("/camera-tracker.js?protocol=11&stream=body", { name: "camera-body-tracking" });
  } catch {
    status("Camera tracking unavailable. You can still draw with the pointer.");
    return Object.assign(() => {}, { upperBody: () => undefined, fullBody: () => undefined });
  }
  let handWorker: Worker | undefined;
  try {
    if (!overlayOnly) handWorker = new Worker("/camera-tracker.js?protocol=11&stream=hands", { name: "camera-hand-tracking" });
  } catch {
    status(errors.hand);
  }
  let closed = false;
  let busy = false;
  let handBusy = false;
  let frame = 0;
  let lastTime = -1;
  let lastHandTime = -1;
  let latestHandsTime = -Infinity;
  let latestHands: HandDetection[] = [];
  let cameraTime = 0;
  let lastPose = -Infinity;
  let lastFace = -Infinity;
  let lastGrip = -Infinity;
  let sentAt = 0;
  let namedFaceRequested = false;
  let jointPoseRequested = false;
  let fullBodyRequested = false;
  let jointExpiry: number | undefined;
  const joints = trackJoints();
  const handDrawing = createHandDrawing(ink, onFistChange);
  let triangles: Triangle[] = [];
  const smoothMatrix = motionFilter(2.5, 1.2);
  const smoothFace = motionFilter(4.5, 0.035);
  const surfaces = trackSurfaces(ink, accessory?.headwear);
  const upperBody = trackUpperBody();
  const fullBodyTracker = trackFullBody();
  const input = document.createElement("canvas");
  const handInput = document.createElement("canvas");
  // Match the 30 fps canvas stream and leave capture/rendering independent of inference.
  const usesVideoFrames = typeof video.requestVideoFrameCallback === "function";

  function geometry() {
    const rect = overlayOnly?.geometry() ?? cover(video.videoWidth, video.videoHeight);
    const map = (point: Point) => ({
      x: overlayOnly ? rect.x + point.x * rect.width : WIDTH - rect.x - point.x * rect.width,
      y: rect.y + point.y * rect.height,
    });
    return { rect, map };
  }

  const onMessage = ({ data }: MessageEvent<WorkerResult>) => {
    if (closed) return;
    if (data.type === "triangles") { triangles = data.triangles; return; }
    if (data.type === "hands") {
      handBusy = false;
      latestHands = data.hands;
      latestHandsTime = data.time;
      const { map } = geometry();
      handDrawing.update(data.hands, data.time, cameraTime, map, !!overlayOnly);
      if (accessory && cameraTime - data.time <= HOLD_MS) {
        const [left, right] = handDrawing.match(data.hands, data.time, map);
        lastGrip = data.time;
        accessory.updateHands(accessoryGrips(left, right, map));
      }
      return;
    }
    if (data.type === "error") {
      if (data.kind === "hand") { handBusy = false; handDrawing.stop(); }
      if (data.kind === "pose") { ink.shoulder = undefined; upperBody.clear(); fullBodyTracker.clear(); }
      if (data.kind === "face") {
        ink.face = undefined;
        accessory?.updateFace(undefined);
      }
      status(errors[data.kind]);
      return;
    }
    busy = false;
    const { time, shoulders, face, body, pose: posePoints } = data;
    const detected = cameraTime - latestHandsTime <= HOLD_MS ? latestHands : [];
    if (data.motion && motionTracking?.enabled() && performance.now() - sentAt < 500) {
      motionTracking.onFrame({ aspect: video.videoWidth / video.videoHeight, pose: posePoints, face });
    }
    if (cameraTime - time > HOLD_MS) return;
    const { rect, map } = geometry();
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
    const shouldersUpdated = anchorIsCurrent && upperBody.update(shoulders, map, time);
    if (anchorIsCurrent && fullBodyRequested) fullBodyTracker.update(posePoints, map, time);
    if (shouldersUpdated) {
      const [left, right] = upperBody.at(time)!.shoulders;
      lastPose = time;
      ink.shoulder = {
        center: { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 },
        angle: Math.atan2(right.y - left.y, right.x - left.x),
        width: Math.hypot(right.x - left.x, right.y - left.y),
      };
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
  };
  worker.onmessage = onMessage;
  if (handWorker) handWorker.onmessage = onMessage;

  function schedule() {
    frame = usesVideoFrames
      ? video.requestVideoFrameCallback((_, metadata) => update(metadata.mediaTime * 1000))
      : requestAnimationFrame(() => update(video.currentTime * 1000));
  }

  function update(time: number) {
    schedule();
    cameraTime = time;
    handDrawing.expire(time);
    surfaces.expire(time);
    if (time - lastPose > HOLD_MS) ink.shoulder = undefined;
    if (time - lastGrip > HOLD_MS) accessory?.updateHands({});
    if (time - lastFace > HOLD_MS) {
      ink.face = undefined;
      accessory?.updateFace(undefined);
    }
    if (handWorker && !handBusy && video.readyState >= 2 && video.videoWidth &&
      (lastHandTime < 0 || time - lastHandTime >= 30)) {
      lastHandTime = time;
      handBusy = true;
      sendTrackingFrame(video, handInput, handWorker, 960, time, {}, failHand);
    }
    if (busy || video.readyState < 2 || !video.videoWidth || (lastTime >= 0 && time - lastTime < 30)) return;
    lastTime = time;
    // Fast Refresh can preserve Ink instances from before this method was added.
    const placements = accessory?.placements();
    const { hat, garment } = surfaces.needed();
    const motion = motionTracking?.enabled() ?? false;
    const targets = [...Ink.prototype.followedJoints.call(ink), ...accessory?.followedJoints() ?? [], ...ink.overlayJoints?.() ?? []].map(jointModel);
    namedFaceRequested = targets.includes("face");
    const face = namedFaceRequested || motion || hat || !!placements?.some(isFaceAccessory) || Ink.prototype.follows.call(ink, "face");
    const shoulders = overlayOnly?.shoulders() || ink.overlayShoulders?.() ||
      !!placements?.some((placement) => placement === "shoulders" || placement === "fullBody") ||
      Ink.prototype.follows.call(ink, "shoulders");
    jointPoseRequested = targets.includes("pose") || targets.includes("hand");
    const needsFullBody = placements?.includes("fullBody") ?? false;
    if (fullBodyRequested && !needsFullBody) fullBodyTracker.clear();
    fullBodyRequested = needsFullBody;
    const fullBody = jointPoseRequested || fullBodyRequested;
    if (!jointPoseRequested && !namedFaceRequested && jointExpiry !== undefined) clearJoints();
    if (!face && !shoulders && !hat && !garment && !fullBody && !motion) return;
    busy = true;
    sentAt = performance.now();
    sendTrackingFrame(video, input, worker, 720, time, { face, shoulders, hat, garment, fullBody, motion }, fail);
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
    handWorker?.terminate();
    handWorker = undefined;
    clearJoints();
    handDrawing.stop();
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

  function failHand() {
    if (closed || !handWorker) return;
    handWorker.terminate();
    handWorker = undefined;
    handBusy = false;
    handDrawing.stop();
    status(errors.hand);
  }

  worker.onerror = worker.onmessageerror = fail;
  if (handWorker) handWorker.onerror = handWorker.onmessageerror = failHand;
  schedule();
  return Object.assign(stop, { upperBody: () => upperBody.at(cameraTime), fullBody: () => fullBodyTracker.at(cameraTime) });
}
