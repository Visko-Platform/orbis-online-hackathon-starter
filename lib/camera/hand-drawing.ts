import { HEIGHT, WIDTH, type Ink, type Point } from "./ink";
import type { HandDetection } from "./joint-tracking";
import { motionFilter } from "./tracking-filter";
import { handGesture } from "./hand-gesture";

const HOLD_MS = 650;
const STROKE_RELEASE_MS = 800;

export function createHandDrawing(ink: Ink, onFistChange?: (held: boolean) => void) {
  const hands = ["Left", "Right"].map((side) => ({
    side, source: `hand:${side}`, lastSeen: -Infinity, drawing: false,
    lastPinched: -Infinity, smooth: motionFilter(3.5, 18), wrist: undefined as Point | undefined,
  }));
  let fistHeld = false;
  let fistSince = -1;
  let fistReleased = -1;
  let lastFistFrame = -Infinity;
  let lastStrokeEnd = -Infinity;

  function setFist(held: boolean) {
    if (fistHeld === held) return;
    fistHeld = held;
    onFistChange?.(held);
  }

  function endStroke(state: typeof hands[number], time?: number) {
    if (state.drawing) {
      ink.apply(state.source, "end");
      if (time !== undefined) lastStrokeEnd = time;
    }
    state.drawing = false;
    state.lastPinched = -Infinity;
    state.smooth = motionFilter(3.5, 18);
  }

  function updateHand(state: typeof hands[number], hand: HandDetection | undefined,
    pinched: boolean, time: number, map: (point: Point) => Point) {
    if (!hand) return;
    state.lastSeen = time;
    state.wrist = map(hand.wrist);
    if (!pinched) return;
    state.lastPinched = time;
    const point = map(hand.thumb);
    const [x, y] = state.smooth([point.x / WIDTH, point.y / HEIGHT], time);
    ink.apply(state.source, state.drawing ? "move" : "start", { x, y });
    state.drawing = true;
  }

  function expireStrokes(time: number) {
    for (const hand of hands) {
      if (hand.drawing && time - hand.lastPinched >= STROKE_RELEASE_MS) endStroke(hand, time);
    }
  }

  function match(detected: HandDetection[], time: number, map: (point: Point) => Point) {
    const cost = (hand: HandDetection | undefined, index: number) => {
      if (!hand) return 0;
      const { wrist, side, lastSeen } = hands[index];
      const point = map(hand.wrist);
      const other = hands[1 - index];
      // An empty slot should not beat a nearby wrist after a missed frame.
      const distance = wrist && time - lastSeen < STROKE_RELEASE_MS
        ? Math.hypot(wrist.x - point.x, wrist.y - point.y)
        : other.drawing ? 140 : 0;
      return distance + (hand.side === side ? 0 : 65);
    };
    const [a, b] = detected;
    return cost(a, 0) + cost(b, 1) <= cost(a, 1) + cost(b, 0) ? [a, b] : [b, a];
  }

  return {
    match,
    update(detected: HandDetection[], time: number, cameraTime: number,
      map: (point: Point) => Point, overlayOnly: boolean) {
      if (overlayOnly || cameraTime - time > HOLD_MS) return;
      expireStrokes(time);
      const [left, right] = match(detected, time, map);
      const leftGesture = handGesture(left?.points, hands[0].drawing);
      const rightGesture = handGesture(right?.points, hands[1].drawing);
      const pinching = leftGesture === "pinch" || rightGesture === "pinch";
      const sketchActive = pinching || hands.some((hand) => hand.drawing);
      const fistDetected = !sketchActive && time - lastStrokeEnd >= 450 &&
        (leftGesture === "fist" || rightGesture === "fist");
      if (onFistChange) {
        lastFistFrame = time;
        if (fistDetected) {
          fistReleased = -1;
          if (fistSince < 0) fistSince = time;
          if (time - fistSince >= 280) setFist(true);
        } else {
          fistSince = -1;
          if (fistReleased < 0) fistReleased = time;
          if (time - fistReleased >= 220) setFist(false);
        }
      }
      if (fistHeld) return;
      updateHand(hands[0], left, leftGesture === "pinch", time, map);
      updateHand(hands[1], right, rightGesture === "pinch", time, map);
    },
    expire(time: number) {
      if (time - lastFistFrame > HOLD_MS) {
        fistSince = -1;
        fistReleased = -1;
        setFist(false);
      }
      expireStrokes(time);
    },
    stop() {
      hands.forEach((hand) => endStroke(hand));
      setFist(false);
    },
  };
}
