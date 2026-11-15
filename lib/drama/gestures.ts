// Webcam gestures. Orbis can't see the camera, so the browser tracks the
// player's hands (MediaPipe, on-device, ~30 fps) and turns three moves into
// instant prompts: no director round trip, so they land within one chunk.
//
//   slap   a fast sideways swing of an open hand
//   point  index finger out, other fingers curled, held still for half a second
//   crown  both hands up at the top of the frame, then brought down together
//
// The classifier below is pure (landmarks in, gesture out) so it can be
// tested without a camera. Coordinates are MediaPipe's normalized image space:
// x and y in [0, 1], y grows downward.

export type Gesture = "slap" | "point" | "crown";

export type Point = { x: number; y: number };
/** 21 MediaPipe hand landmarks. */
export type Hand = { key: string; landmarks: Point[] };

const WRIST = 0;
const FINGERS = {
  index: { mcp: 5, pip: 6, tip: 8 },
  middle: { mcp: 9, pip: 10, tip: 12 },
  ring: { mcp: 13, pip: 14, tip: 16 },
  pinky: { mcp: 17, pip: 18, tip: 20 },
} as const;

// A real swing blurs on a webcam: the tracker often loses the hand, or stops
// seeing it as open, partway through. So the slap is judged on the wrist's
// path over the last 450 ms (kept for a moment after the hand is lost), and
// the hand only has to have been open at some point in that window.
const SLAP_WINDOW_MS = 450;
const SLAP_MIN_DX = 0.12; // an eighth of the frame width...
const SLAP_MIN_SPEED = 0.6; // ...at 0.6 frame widths per second or faster
const LOST_HAND_GRACE_MS = 400;
// A hand raised before a slap can briefly look like a point, and a point that
// fires first also starts the cooldown that eats the slap. So a point needs a
// longer, stiller hold, a clearly pointing shape, and no swing under way.
const POINT_HOLD_MS = 900;
const POINT_MAX_SPEED = 0.25;
const CROWN_UP_Y = 0.35;
const CROWN_DOWN_Y = 0.55;
const CROWN_UP_HOLD_MS = 250;
const CROWN_DROP_WITHIN_MS = 1_500;
const COOLDOWN_MS = 2_500;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function extended(hand: Point[], finger: keyof typeof FINGERS) {
  const f = FINGERS[finger];
  return dist(hand[f.tip], hand[WRIST]) > dist(hand[f.pip], hand[WRIST]) * 1.15;
}

function curled(hand: Point[], finger: keyof typeof FINGERS) {
  const f = FINGERS[finger];
  return dist(hand[f.tip], hand[WRIST]) < dist(hand[f.pip], hand[WRIST]);
}

// A real slap is often a half-open hand, so two straight fingers count.
export function isOpenHand(hand: Point[]) {
  return (["index", "middle", "ring", "pinky"] as const).filter((f) => extended(hand, f)).length >= 2;
}

export function isPointing(hand: Point[]) {
  const reach = (finger: keyof typeof FINGERS) => dist(hand[FINGERS[finger].tip], hand[WRIST]);
  return (
    extended(hand, "index") &&
    curled(hand, "middle") &&
    curled(hand, "ring") &&
    curled(hand, "pinky") &&
    // The index clearly out-reaches the curled fingers.
    reach("index") > reach("middle") * 1.5
  );
}

type Sample = { t: number; x: number; y: number; open: boolean };

export class GestureDetector {
  private history = new Map<string, Sample[]>();
  private pointSince = new Map<string, number>();
  private crownUpSince: number | null = null;
  private crownArmedAt: number | null = null;
  private lastFired = -Infinity;
  /** Largest sideways sweep in the slap window, for the on-screen meter. */
  lastSwing = 0;

  /** Feed one video frame's hands; returns a gesture when one completes. */
  update(hands: Hand[], t: number): Gesture | null {
    for (const hand of hands) {
      const wrist = hand.landmarks[WRIST];
      const samples = this.history.get(hand.key) ?? [];
      samples.push({ t, x: wrist.x, y: wrist.y, open: isOpenHand(hand.landmarks) });
      while (samples.length && t - samples[0].t > 600) samples.shift();
      this.history.set(hand.key, samples);
    }
    for (const [key, samples] of [...this.history.entries()]) {
      if (hands.some((hand) => hand.key === key)) continue;
      this.pointSince.delete(key);
      // Keep a lost hand's path briefly: a blurred swing often ends in a loss.
      const lastSeen = samples[samples.length - 1]?.t ?? -Infinity;
      if (t - lastSeen > LOST_HAND_GRACE_MS) this.history.delete(key);
    }
    if (t - this.lastFired < COOLDOWN_MS) return null;

    const slap = this.slap(hands, t);
    // While any sideways swing is building, it is a slap in the making.
    const swinging = this.lastSwing >= SLAP_MIN_DX * 0.4;
    const fired = this.crown(hands, t) ?? slap ?? (swinging ? null : this.point(hands, t));
    if (fired) {
      this.lastFired = t;
      this.pointSince.clear();
      this.crownUpSince = null;
      this.crownArmedAt = null;
    }
    return fired;
  }

  private speed(key: string, t: number, windowMs: number) {
    const samples = this.history.get(key) ?? [];
    const recent = samples.filter((s) => t - s.t <= windowMs);
    if (recent.length < 2) return { dx: 0, speed: 0 };
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = Math.max(1, last.t - first.t) / 1000;
    const dx = last.x - first.x;
    return { dx, speed: Math.hypot(dx, last.y - first.y) / dt };
  }

  private slap(_hands: Hand[], t: number): Gesture | null {
    this.lastSwing = 0;
    for (const samples of this.history.values()) {
      const recent = samples.filter((s) => t - s.t <= SLAP_WINDOW_MS);
      if (recent.length < 2) continue;
      const xs = recent.map((s) => s.x);
      const span = Math.max(...xs) - Math.min(...xs);
      this.lastSwing = Math.max(this.lastSwing, span);
      if (!recent.some((s) => s.open)) continue;
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = Math.max(1, last.t - first.t) / 1000;
      const speed = Math.abs(last.x - first.x) / dt;
      if (span >= SLAP_MIN_DX && Math.abs(last.x - first.x) >= SLAP_MIN_DX * 0.8 && speed >= SLAP_MIN_SPEED) {
        return "slap";
      }
    }
    return null;
  }

  private point(hands: Hand[], t: number): Gesture | null {
    for (const hand of hands) {
      const still = this.speed(hand.key, t, 300).speed < POINT_MAX_SPEED;
      if (isPointing(hand.landmarks) && still) {
        const since = this.pointSince.get(hand.key) ?? t;
        this.pointSince.set(hand.key, since);
        if (t - since >= POINT_HOLD_MS) return "point";
      } else {
        this.pointSince.delete(hand.key);
      }
    }
    return null;
  }

  private crown(hands: Hand[], t: number): Gesture | null {
    const wrists = hands.map((hand) => hand.landmarks[WRIST]);
    const bothUp = hands.length >= 2 && wrists.every((w) => w.y < CROWN_UP_Y);
    if (bothUp) {
      this.crownUpSince ??= t;
      if (t - this.crownUpSince >= CROWN_UP_HOLD_MS) this.crownArmedAt = t;
      return null;
    }
    this.crownUpSince = null;
    if (this.crownArmedAt === null) return null;
    if (t - this.crownArmedAt > CROWN_DROP_WITHIN_MS) {
      this.crownArmedAt = null;
      return null;
    }
    const down = hands.length >= 1 && wrists.every((w) => w.y > CROWN_DOWN_Y);
    return down ? "crown" : null;
  }
}

// ---- camera + MediaPipe (browser only) -------------------------------------

export type GestureTracker = { stop: () => void };

// A local copy (public/mediapipe/hand_landmarker.task) works offline at a
// venue; otherwise use Google's hosted model.
const HOSTED_HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
async function handModelPath() {
  const local = "/mediapipe/hand_landmarker.task";
  const found = await fetch(local, { method: "HEAD" }).then((r) => r.ok).catch(() => false);
  return found ? local : HOSTED_HAND_MODEL;
}

export type TrackerStatus = { hands: number; open: boolean; swing: number };

export async function startGestureTracker(
  video: HTMLVideoElement,
  onGesture: (gesture: Gesture) => void,
  onStatus?: (status: TrackerStatus) => void,
): Promise<GestureTracker> {
  const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 360, facingMode: "user" },
    audio: false,
  });
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
  const landmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: await handModelPath(), delegate: "GPU" },
    runningMode: "VIDEO",
    numHands: 2,
    // Defaults (0.5) drop a hand as soon as a fast swing blurs it.
    minHandDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
  });

  const detector = new GestureDetector();
  let running = true;
  let lastVideoTime = -1;
  const loop = () => {
    if (!running) return;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const now = performance.now();
      const result = landmarker.detectForVideo(video, now);
      const hands: Hand[] = result.landmarks.map((landmarks, index) => ({
        key: result.handedness[index]?.[0]?.categoryName ?? String(index),
        landmarks,
      }));
      const gesture = detector.update(hands, now);
      onStatus?.({
        hands: hands.length,
        open: hands.some((hand) => isOpenHand(hand.landmarks)),
        swing: detector.lastSwing / SLAP_MIN_DX,
      });
      if (gesture) onGesture(gesture);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  return {
    stop: () => {
      running = false;
      landmarker.close();
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    },
  };
}
