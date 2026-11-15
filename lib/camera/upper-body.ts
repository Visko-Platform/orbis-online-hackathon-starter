import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { Point, Shoulder } from "./ink";
import { drawTextureMesh } from "./texture-mesh";
import { motionFilter } from "./tracking-filter";

type Edge = [Point, Point];
export type UpperBody = { shoulders: Edge; hips?: Edge };
export type GarmentFit = { shoulderRow: number; shoulderSpan: number };
const defaultFit: GarmentFit = { shoulderRow: 0.23, shoulderSpan: 0.88 };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const mix = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const midpoint = ([a, b]: Edge) => mix(a, b, 0.5);
const width = ([a, b]: Edge) => Math.hypot(b.x - a.x, b.y - a.y);
const expand = ([a, b]: Edge, scale: number): Edge => [mix(a, b, (1 - scale) / 2), mix(b, a, (1 - scale) / 2)];
const move = (edge: Edge, delta: Point, scale: number): Edge =>
  edge.map(({ x, y }) => ({ x: x + delta.x * scale, y: y + delta.y * scale })) as Edge;

export function garmentFit(image: ImageBitmap, fullBody = false): GarmentFit {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const expectedRow = fullBody ? 0.07 : defaultFit.shoulderRow;
  const fallback = fullBody ? { shoulderRow: expectedRow, shoulderSpan: 0.6 } : defaultFit;
  if (!ctx) return fallback;
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let best = fallback;
  let bestScore = 0;
  // Find the shoulder seams near the top of the silhouette. Longer garments
  // reach that row earlier. Ignore stray pixels at the boundaries.
  for (let y = fullBody ? 2 : 13; y <= (fullBody ? 12 : 33); y++) {
    const columns = [];
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3] > 160) columns.push(x);
    }
    if (columns.length < 10) continue;
    const trim = Math.floor(columns.length * 0.02);
    const span = (columns[columns.length - 1 - trim] - columns[trim] + 1) / size;
    const score = span - Math.abs(y / size - expectedRow) * 0.35;
    if (score <= bestScore) continue;
    bestScore = score;
    best = { shoulderRow: y / size, shoulderSpan: clamp(span, fullBody ? 0.2 : 0.76, 1) };
  }
  return best;
}

export function trackUpperBody() {
  let smooth = motionFilter(3.2, 0.055);
  let hips = motionFilter(2.4, 0.055);
  let lastSeen = -Infinity;
  let lastHips = -Infinity;
  let current: UpperBody | undefined;
  return {
    update(points: NormalizedLandmark[] | undefined, map: (point: Point) => Point, time: number) {
      const [first, second, firstHip, secondHip] = points ?? [];
      if (!first || !second || Math.min(first.visibility, second.visibility) < 0.5) return;
      const a = map(first), b = map(second);
      const reversed = a.x > b.x;
      const [l, r] = reversed ? [b, a] : [a, b];
      if (Math.hypot(l.x - r.x, l.y - r.y) < 32) return;
      const [lx, ly, rx, ry] = smooth([l.x, l.y, r.x, r.y], time);
      const shoulders: Edge = [{ x: lx, y: ly }, { x: rx, y: ry }];
      let hipEdge = time - lastHips < 160 ? current?.hips : undefined;
      if (firstHip && secondHip && Math.min(firstHip.visibility, secondHip.visibility) >= 0.5) {
        const h1 = map(reversed ? secondHip : firstHip), h2 = map(reversed ? firstHip : secondHip);
        if (midpoint([h1, h2]).y - midpoint(shoulders).y >= width(shoulders) * 0.35) {
          const [ax, ay, bx, by] = hips([h1.x, h1.y, h2.x, h2.y], time);
          hipEdge = [{ x: ax, y: ay }, { x: bx, y: by }];
          lastHips = time;
        }
      }
      current = { shoulders, hips: hipEdge };
      lastSeen = time;
    },
    at(time: number) {
      return time - lastSeen <= 160 ? current : undefined;
    },
    clear() {
      current = undefined;
      lastSeen = lastHips = -Infinity;
      smooth = motionFilter(3.2, 0.055);
      hips = motionFilter(2.4, 0.055);
    },
  };
}

export function garmentEdges(body: UpperBody, fit = defaultFit) {
  const { shoulders, hips } = body;
  const span = width(shoulders);
  const center = midpoint(shoulders);
  const [left, right] = shoulders;
  const down = { x: -(right.y - left.y) / span, y: (right.x - left.x) / span };
  const hipCenter = hips && midpoint(hips);
  const torso = hipCenter ? { x: hipCenter.x - center.x, y: hipCenter.y - center.y } :
    { x: down.x * span * 1.24, y: down.y * span * 1.24 };
  const length = Math.hypot(torso.x, torso.y);
  const hemDistance = clamp(length, span * 0.84, span * 1.6);
  const axis = { x: torso.x / length, y: torso.y / length };
  const shoulderEdge = expand(shoulders, 1.5 / fit.shoulderSpan);
  const top = move(shoulderEdge, axis, -span * 0.17);
  const hemSpan = hips ? clamp(width(hips) * 1.31, span * 1.13, span * 1.48) : span * 1.25;
  const hemBase = hips && width(hips) > span * 0.4 ? expand(hips, hemSpan / width(hips)) : expand(shoulders, hemSpan / span);
  const hemCenter = midpoint(hemBase);
  const hem = move(hemBase, {
    x: center.x + axis.x * hemDistance - hemCenter.x,
    y: center.y + axis.y * hemDistance - hemCenter.y,
  }, 1);
  return { top, shoulderEdge, hem, shoulderRow: fit.shoulderRow };
}

export function drawUpperBody(ctx: CanvasRenderingContext2D, image: ImageBitmap, fit: GarmentFit | undefined,
  body: UpperBody | undefined, shoulder: Shoulder | undefined) {
  if (!body) {
    if (!shoulder) return;
    const { center, angle, width: span } = shoulder;
    const half = { x: Math.cos(angle) * span / 2, y: Math.sin(angle) * span / 2 };
    const left = { x: center.x - half.x, y: center.y - half.y };
    const right = { x: center.x + half.x, y: center.y + half.y };
    body = { shoulders: left.x <= right.x ? [left, right] : [right, left] };
  }
  const { top, shoulderEdge, hem, shoulderRow } = garmentEdges(body, fit);
  const division = image.height * shoulderRow;
  drawTextureMesh(ctx, image, [
    { corners: [...top, shoulderEdge[1], shoulderEdge[0]], source: [0, 0, image.width, division] },
    { corners: [...shoulderEdge, hem[1], hem[0]], source: [0, division, image.width, image.height - division] },
  ]);
}
