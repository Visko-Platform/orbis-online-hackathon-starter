import type { Point } from "./ink";

type Landmark = Point & { z?: number };
const fingertips = [8, 12, 16, 20];
const PINCH_START_RATIO = 0.27;
const PINCH_RELEASE_RATIO = 0.36;

function distance(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

export function handGesture(points: Landmark[] | undefined, drawing = false) {
  if (!points || points.length < 21) return;
  const wrist = points[0], thumb = points[4];
  const palmLength = distance(wrist, points[9]);
  if (!palmLength) return;

  const widestGap = Math.max(...fingertips.map((tip) => distance(points[tip], thumb))) / palmLength;
  if (widestGap <= (drawing ? PINCH_RELEASE_RATIO : PINCH_START_RATIO)) return "pinch";
  if (widestGap <= PINCH_RELEASE_RATIO) return;

  const folded = fingertips.filter((tip) =>
    distance(points[tip], wrist) < distance(points[tip - 2], wrist) * 1.15).length;
  if (folded >= 3) return "fist";
}
