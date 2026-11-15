import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { Point, Shoulder } from "./ink";
import { drawTextureMesh, type TexturePatch } from "./texture-mesh";
import { motionFilter } from "./tracking-filter";
import type { GarmentFit, UpperBody } from "./upper-body";

const landmarkPairs = [[11, 12], [23, 24], [25, 26], [27, 28]] as const;
const holdMs = 160;
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

type FullBody = { shoulder: Shoulder; hips: Point; knees: Point; ankles: Point };

function visible(point: NormalizedLandmark | undefined): point is NormalizedLandmark {
  return !!point && point.visibility >= 0.5 && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

export function trackFullBody() {
  let smooth = motionFilter(3.2, 0.055);
  let current: FullBody | undefined;
  let lastSeen = -Infinity;

  return {
    update(pose: NormalizedLandmark[] | undefined, map: (point: Point) => Point, time: number) {
      if (!pose) return;
      const pairs: [Point, Point][] = [];
      for (const [left, right] of landmarkPairs) {
        const a = pose[left], b = pose[right];
        if (!visible(a) || !visible(b)) return;
        pairs.push([map(a), map(b)]);
      }
      const [shoulders, hipPair, kneePair, anklePair] = pairs;
      const [left, right] = shoulders[0].x <= shoulders[1].x ? shoulders : [shoulders[1], shoulders[0]];
      const centers = [midpoint(left, right), midpoint(...hipPair), midpoint(...kneePair), midpoint(...anklePair)];
      if (right.x - left.x < 12 || centers.some((center, index) => index > 0 && center.y <= centers[index - 1].y + 4)) return;

      const [x, y, dx, dy, hx, hy, kx, ky, ax, ay] = smooth([
        centers[0].x, centers[0].y, right.x - left.x, right.y - left.y,
        centers[1].x, centers[1].y, centers[2].x, centers[2].y, centers[3].x, centers[3].y,
      ], time);
      current = {
        shoulder: { center: { x, y }, width: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) },
        hips: { x: hx, y: hy }, knees: { x: kx, y: ky }, ankles: { x: ax, y: ay },
      };
      lastSeen = time;
    },
    at(time: number) { return time - lastSeen <= holdMs ? current : undefined; },
    clear() {
      current = undefined;
      lastSeen = -Infinity;
      smooth = motionFilter(3.2, 0.055);
    },
  };
}

export type { FullBody };

export function estimateFullBody(body: UpperBody): FullBody {
  const [left, right] = body.shoulders;
  const shoulder: Shoulder = {
    center: midpoint(left, right),
    width: Math.hypot(right.x - left.x, right.y - left.y),
    angle: Math.atan2(right.y - left.y, right.x - left.x),
  };
  const hips = body.hips ? midpoint(...body.hips) : {
    x: shoulder.center.x, y: shoulder.center.y + shoulder.width * 1.25,
  };
  const torso = Math.max(shoulder.width, hips.y - shoulder.center.y);
  return {
    shoulder,
    hips,
    knees: { x: hips.x, y: hips.y + torso * 0.85 },
    ankles: { x: hips.x, y: hips.y + torso * 1.75 },
  };
}

export function fullBodyGarmentPatches(image: Pick<ImageBitmap, "width" | "height">, fit: GarmentFit, body: FullBody) {
  const { shoulder, hips, knees, ankles } = body;
  const garmentWidth = shoulder.width / fit.shoulderSpan;
  const scale = garmentWidth / image.width;
  const shoulderY = fit.shoulderRow * image.height;
  // Estimate garment length from its proportions at the shoulders, then fit each
  // section to the wearer's actual leg and torso lengths.
  const referenceLength = 3.25 * fit.shoulderSpan * image.width;
  const rows = [
    { y: shoulderY, center: shoulder.center, angle: shoulder.angle },
    { y: shoulderY + referenceLength * 0.35, center: hips, angle: 0 },
    { y: shoulderY + referenceLength * 0.68, center: knees, angle: 0 },
    { y: shoulderY + Math.max(referenceLength, image.height - shoulderY), center: ankles, angle: 0 },
  ];
  const top = {
    y: 0,
    center: {
      x: shoulder.center.x + Math.sin(shoulder.angle) * shoulderY * scale,
      y: shoulder.center.y - Math.cos(shoulder.angle) * shoulderY * scale,
    },
    angle: shoulder.angle,
  };
  const edge = ({ center, angle }: typeof top): [Point, Point] => {
    const x = Math.cos(angle) * garmentWidth / 2, y = Math.sin(angle) * garmentWidth / 2;
    return [{ x: center.x - x, y: center.y - y }, { x: center.x + x, y: center.y + y }];
  };

  const patches: TexturePatch[] = [];
  let start = top;
  for (const row of rows) {
    const endY = Math.min(row.y, image.height);
    const t = (endY - start.y) / (row.y - start.y);
    const [left, right] = edge({ y: endY, center: {
      x: start.center.x + (row.center.x - start.center.x) * t,
      y: start.center.y + (row.center.y - start.center.y) * t,
    }, angle: start.angle + (row.angle - start.angle) * t });
    patches.push({ corners: [...edge(start), right, left], source: [0, start.y, image.width, endY - start.y] });
    if (endY === image.height) break;
    start = row;
  }
  return patches;
}

export function drawFullBody(ctx: CanvasRenderingContext2D, image: ImageBitmap, fit: GarmentFit, body: FullBody) {
  drawTextureMesh(ctx, image, fullBodyGarmentPatches(image, fit, body));
}
