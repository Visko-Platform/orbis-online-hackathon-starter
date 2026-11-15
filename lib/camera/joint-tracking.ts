import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { trackedJoints, type BodySide, type JointId } from "./joints";
import { HEIGHT, WIDTH, type Point, type Shoulder } from "./ink";
import { motionFilter } from "./tracking-filter";

export type HandDetection = {
  side?: string;
  confidence?: number;
  wrist: Point;
  thumb: Point;
  tip: Point;
  knuckle: Point;
  points?: NormalizedLandmark[];
};

type MapPoint = (point: Point) => Point;
type Hands = [HandDetection | undefined, HandDetection | undefined];
export type JointAnchors = ReadonlyMap<JointId, Shoulder>;
type FaceFrame = { points: NormalizedLandmark[]; blinks: Record<"left" | "right", number> };

function visiblePoint(point: NormalizedLandmark | undefined, map: MapPoint, checkVisibility: boolean) {
  if (!point || (checkVisibility && !(point.visibility >= 0.55))) return;
  if (!(point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1)) return;
  const projected = map(point);
  if (projected.x >= 0 && projected.x <= WIDTH && projected.y >= 0 && projected.y <= HEIGHT) return projected;
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function trackJoints() {
  const filters = new Map<JointId, ReturnType<typeof motionFilter>>();
  const history: Partial<Record<BodySide, { point: Point; time: number }>> = {};

  function matchHands(detected: HandDetection[], pose: NormalizedLandmark[] | undefined, map: MapPoint, time: number): Hands {
    const sides = ["Left", "Right"] as const;
    const wrists = [visiblePoint(pose?.[15], map, true), visiblePoint(pose?.[16], map, true)];
    const scale = Math.hypot(WIDTH, HEIGHT);
    const cost = (hand: HandDetection | undefined, index: number) => {
      if (!hand) return 0;
      const side = sides[index];
      const wrist = map(hand.wrist);
      const expected = wrists[index];
      const prior = history[side];
      const previous = prior && time - prior.time <= 200 ? prior.point : undefined;
      const labelPenalty = hand.side === side ? 0 : (hand.confidence ?? 0) * scale * 0.06;
      const motion = previous ? Math.min(distance(wrist, previous), scale * 0.1) : 0;
      const poseEvidence = expected ? Math.min(scale * 0.12, distance(wrist, expected) * 2 - scale * 0.12) : 0;
      return poseEvidence + labelPenalty + motion * 0.35;
    };
    const [a, b] = detected;
    const direct = cost(a, 0) + cost(b, 1);
    const swapped = cost(a, 1) + cost(b, 0);
    if (Math.abs(direct - swapped) < scale * 0.01) return [undefined, undefined];
    const matched: Hands = direct < swapped ? [a, b] : [b, a];
    matched.forEach((hand, index) => {
      if (hand) history[sides[index]] = { point: map(hand.wrist), time };
    });
    return matched;
  }

  return {
    update(pose: NormalizedLandmark[] | undefined, detected: HandDetection[], map: MapPoint, time: number, face?: FaceFrame) {
      const [left, right] = matchHands(detected, pose, map, time);
      const sources = {
        pose: pose?.map((point) => visiblePoint(point, map, true)),
        Left: left?.points?.map((point) => visiblePoint(point, map, false)),
        Right: right?.points?.map((point) => visiblePoint(point, map, false)),
      };
      const anchors = new Map<JointId, Shoulder>();
      for (const joint of trackedJoints) {
        if (joint.blink && face && face.blinks[joint.blink] >= 0.65) {
          filters.delete(joint.id);
          continue;
        }
        const points = joint.kind === "pose" ? sources.pose : joint.side ? sources[joint.side] : undefined;
        const point = (index: number) => joint.kind === "face" ? visiblePoint(face?.points[index], map, false) : points?.[index];
        const start = point(joint.from), end = point(joint.to);
        const first = point(joint.center[0]), last = point(joint.center[1]);
        if (!start || !end || !first || !last || distance(start, end) < 3) {
          filters.delete(joint.id);
          continue;
        }
        let filter = filters.get(joint.id);
        if (!filter) {
          filter = motionFilter(4, 0.045);
          filters.set(joint.id, filter);
        }
        const [x, y, dx, dy] = filter([(first.x + last.x) / 2, (first.y + last.y) / 2,
          end.x - start.x, end.y - start.y], time);
        const width = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) - (joint.horizontal ? Math.PI / 2 : 0);
        if (width >= 3) anchors.set(joint.id, { center: { x, y }, angle, width });
      }
      return { anchors, hands: [left, right] as Hands };
    },
    clear() {
      filters.clear();
      delete history.Left;
      delete history.Right;
    },
  };
}
