import type { Point, Shoulder } from "./ink";

export function toAnchor(point: Point, anchor: Shoulder): Point {
  const x = (point.x - anchor.center.x) / anchor.width;
  const y = (point.y - anchor.center.y) / anchor.width;
  const cos = Math.cos(anchor.angle);
  const sin = Math.sin(anchor.angle);
  return { x: x * cos + y * sin, y: -x * sin + y * cos };
}

export function anchorOffset(point: Point, anchor: Shoulder): Point {
  const cos = Math.cos(anchor.angle);
  const sin = Math.sin(anchor.angle);
  return {
    x: anchor.width * (point.x * cos - point.y * sin),
    y: anchor.width * (point.x * sin + point.y * cos),
  };
}

export function fromAnchor(point: Point, anchor: Shoulder): Point {
  const offset = anchorOffset(point, anchor);
  return { x: anchor.center.x + offset.x, y: anchor.center.y + offset.y };
}
