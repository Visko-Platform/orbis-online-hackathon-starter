import type { Point } from "./ink";
import { add, cross, dot, length, scale, subtract, unit, type Vec3 } from "./surface-mesh";

type Landmark = Point & { z: number; visibility: number };

function matrix(x: Vec3, y: Vec3, z: Vec3, origin: Vec3) {
  return [...x, 0, ...y, 0, ...z, 0, ...origin, 1];
}

export function faceMatrix(data: number[]) {
  // The affine bottom row distinguishes packed row-major and column-major matrices.
  return Math.abs(data[14]) > Math.abs(data[11])
    ? data : data.map((_, i) => data[(i % 4) * 4 + Math.floor(i / 4)]);
}

function world({ x, y, z }: Landmark): Vec3 {
  return [x, -y, -z];
}

function midpoint(a: Vec3, b: Vec3) { return scale(add(a, b), 0.5); }

function orientation(x: Vec3, up: Vec3): [Vec3, Vec3, Vec3] {
  const right = unit(x);
  const forward = unit(cross(right, up));
  return [right, cross(forward, right), forward];
}

function translation(pixel: Point, center: Point, focal: number, depth: number): Vec3 {
  return [(center.x - pixel.x) * depth / focal, (center.y - pixel.y) * depth / focal, -depth];
}

function pixelsPerUnit(a: Point, b: Point, axis: Vec3) {
  const span = Math.hypot(axis[0], axis[1]);
  return span > 4 ? Math.hypot(a.x - b.x, a.y - b.y) / span : 0;
}

export function torsoPose(points: Landmark[], landmarks: Landmark[], center: Point, focal: number) {
  const [left, right, leftHip, rightHip] = landmarks;
  if (!left || !right || !leftHip || !rightHip || Math.min(points[0].visibility, points[1].visibility) < 0.28) return;
  const a = scale(world(left), 100), b = scale(world(right), 100);
  const shoulder = midpoint(a, b);
  const up = subtract(shoulder, scale(midpoint(world(leftHip), world(rightHip)), 100));
  const lateral = subtract(a, b);
  if (length(lateral) < 12 || length(cross(unit(lateral), unit(up))) < 0.5) return;
  const [x, y, z] = orientation(lateral, up);
  const mid = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
  const hip = { x: (points[2].x + points[3].x) / 2, y: (points[2].y + points[3].y) / 2 };
  const across = pixelsPerUnit(points[0], points[1], lateral);
  const down = pixelsPerUnit(mid, hip, up);
  const pixels = across > 0.2 && Math.hypot(x[0], x[1]) > 0.55 ? across : down;
  if (pixels < 0.2) return;
  return matrix(x, y, z, translation(mid, center, focal, focal / pixels));
}

export function rearHeadPose(ears: Landmark[], landmarks: Landmark[], torso: number[], center: Point, focal: number) {
  const [left, right] = landmarks;
  if (!left || !right || Math.max(ears[0].visibility, ears[1].visibility) < 0.55) return;
  const axis = subtract(world(left), world(right));
  if (length(axis) < 0.065) return;
  const [x, y, z] = orientation(axis, [torso[4], torso[5], torso[6]]);
  // When the face returns, its own transform supersedes the rear estimate.
  if (z[2] > 0.25 || length(z) < 0.9) return;
  const pixels = pixelsPerUnit(ears[0], ears[1], scale(x, 14.5));
  const depth = pixels > 0.4 && Math.hypot(x[0], x[1]) > 0.55 ? focal / pixels : -torso[14];
  const pixel = { x: (ears[0].x + ears[1].x) / 2, y: (ears[0].y + ears[1].y) / 2 };
  const toEar = translation(pixel, center, focal, depth);
  // Canonical ear midpoint is behind and slightly above the face model origin.
  const origin = add(toEar, add(scale(y, -1.5), scale(z, 3)));
  return matrix(x, y, z, origin);
}

export function rigidPose(pose: number[]) {
  const x: Vec3 = [pose[0], pose[1], pose[2]];
  const y: Vec3 = [pose[4], pose[5], pose[6]];
  const [right, up, forward] = orientation(x, y);
  const size = (length(x) + Math.abs(dot(y, up))) / 2;
  return matrix(scale(right, size), scale(up, size), scale(forward, size), [pose[12], pose[13], pose[14]]);
}
