import type { Point } from "./ink";

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isFist(points: Point[] | undefined) {
  if (!points || points.length < 21) return false;
  const wrist = points[0];
  const folded = [8, 12, 16, 20].filter((tip) =>
    distance(points[tip], wrist) < distance(points[tip - 2], wrist) * 1.15).length;
  return folded >= 3;
}
