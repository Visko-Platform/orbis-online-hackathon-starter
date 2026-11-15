import type { HatView } from "./locked-hat";

export const sampleWidth = 96;
export const sampleHeight = 54;
type Match = { view: HatView; x: number; y: number; scale: number; score: number };
type Feature = { x: number; y: number; value: number };
const centerX = sampleWidth / 2;
const centerY = sampleHeight / 2;

function edges(data: Uint8ClampedArray) {
  const luminance = new Float32Array(sampleWidth * sampleHeight);
  const gradients = new Float32Array(luminance.length);
  for (let i = 0; i < luminance.length; i++) {
    const p = i * 4;
    luminance[i] = (data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114) / 255;
  }
  for (let y = 1; y < sampleHeight - 1; y++) {
    for (let x = 1; x < sampleWidth - 1; x++) {
      const i = y * sampleWidth + x;
      gradients[i] = Math.min(0.32, Math.hypot(luminance[i + 1] - luminance[i - 1],
        luminance[i + sampleWidth] - luminance[i - sampleWidth]));
    }
  }
  return gradients;
}

function features(view: HatView) {
  const gradients = edges(view.pixels);
  const values: Feature[] = [];
  for (let y = 5; y < sampleHeight - 4; y += 2) {
    for (let x = 18; x < sampleWidth - 18; x += 2) {
      const value = gradients[y * sampleWidth + x];
      values.push({ x: x - centerX, y: y - centerY, value });
    }
  }
  return values;
}

function score(points: Feature[], image: Float32Array, x: number, y: number, scale: number) {
  let xy = 0, xx = 0, yy = 0, sumX = 0, sumY = 0;
  for (const p of points) {
    const px = Math.round(p.x * scale + centerX + x);
    const py = Math.round(p.y * scale + centerY + y);
    const v = px >= 1 && py >= 1 && px < sampleWidth - 1 && py < sampleHeight - 1
      ? image[py * sampleWidth + px] : 0;
    xy += p.value * v;
    xx += p.value * p.value;
    yy += v * v;
    sumX += p.value;
    sumY += v;
  }
  return (xy - sumX * sumY / points.length) /
    Math.max(0.0001, Math.sqrt(Math.max(0, (xx - sumX ** 2 / points.length) * (yy - sumY ** 2 / points.length))));
}

export function matchHatViews(views: HatView[]) {
  const templates = views.map((view) => ({ view, points: features(view) }));
  let previous: Match | undefined;
  return (pixels: Uint8ClampedArray) => {
    const image = edges(pixels);
    let best: Match | undefined;
    const hint = previous;
    function search(xs: number[], ys: number[], scales: number[], near?: HatView) {
      for (const { view, points } of templates) {
        if (near && Math.abs(view.angle - near.angle) > 12) continue;
        for (const scale of scales) for (const y of ys) for (const x of xs) {
          const value = score(points, image, x, y, scale);
          const rank = value - (hint ? 0.0015 * Math.abs(view.angle - hint.view.angle) : 0);
          const bestRank = best && best.score - (hint ? 0.0015 * Math.abs(best.view.angle - hint.view.angle) : 0);
          if (bestRank === undefined || rank > bestRank) best = { view, scale, x, y, score: value };
        }
      }
    }
    if (hint) search([hint.x - 2, hint.x, hint.x + 2], [hint.y - 2, hint.y, hint.y + 2],
      [hint.scale * 0.96, hint.scale, hint.scale * 1.04], hint.view);
    if (!best || best.score < 0.34) search([-10, -5, 0, 5, 10], [-8, -4, 0, 4, 8], [0.8, 0.92, 1, 1.1, 1.22]);
    if (!best || best.score < 0.25) { previous = undefined; return; }
    const { x, y, scale, view } = best;
    search([x - 1, x, x + 1], [y - 1, y, y + 1], [scale * 0.97, scale, scale * 1.03], view);
    previous = best;
    return previous;
  };
}
