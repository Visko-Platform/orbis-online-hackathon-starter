import { rings, type Mesh, type Ring, type Vec3 } from "./surface-mesh";

export type Headwear = { geometry: [Mesh, Mesh]; colors: [Vec3, Vec3] };
export type HatSilhouette = { width: number; height: number; rows: number[]; crownColor: Vec3; brimColor: Vec3 };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function readSilhouette(image: ImageBitmap): HatSilhouette {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, 96, 96);
  const { data } = ctx.getImageData(0, 0, 96, 96);
  const rows: number[] = [];
  const colors = [[0, 0, 0, 0], [0, 0, 0, 0]];
  for (let y = 0; y < 96; y++) {
    let first = 96, last = -1;
    for (let x = 0; x < 96; x++) {
      const i = (y * 96 + x) * 4;
      if (data[i + 3] < 215) continue;
      first = Math.min(first, x);
      last = x;
      const color = colors[y < 64 ? 0 : 1];
      for (let channel = 0; channel < 3; channel++) color[channel] += data[i + channel];
      color[3]++;
    }
    rows.push(Math.max(0, last - first + 1) / 96);
  }
  const [crownColor, brimColor] = colors.map((color) =>
    color.slice(0, 3).map((value) => value / (255 * Math.max(color[3], 1))) as Vec3);
  return { width: image.width, height: image.height, rows, crownColor, brimColor };
}

export function fitHeadwear(front: HatSilhouette, profile: HatSilhouette): Headwear {
  const crownWidth = clamp(Math.max(...front.rows.slice(23, 52)), 0.24, 1);
  const crownDepth = clamp(Math.max(...profile.rows.slice(23, 52)), 0.24, 1);
  const brimX = clamp(7.9 / crownWidth, 8, 17);
  const brimZ = clamp(7.7 / crownDepth, 8, 17);
  const height = clamp(front.height / front.width * brimX * 1.42, 2.3, 19);
  const base = 7.2;
  const shape: Ring[] = [[base, 7.9, 7.7, -1.5]];
  for (let level = 1; level <= 9; level++) {
    const fraction = level / 10;
    const row = Math.round((1 - fraction) * 57 + 3);
    const radius = (silhouette: HatSilhouette, crown: number) =>
      clamp(Math.max(...silhouette.rows.slice(row - 2, row + 3)) / crown, 0.06, 1.08);
    shape.push([base + fraction * height, 7.9 * radius(front, crownWidth), 7.7 * radius(profile, crownDepth), -1.5]);
  }
  shape.push([base + height, 0, 0, -1.5]);
  const brim = rings([[base - 0.28, 7.8, 7.6, -1.5], [base - 0.42, brimX, brimZ, -1.5],
    [base - 0.02, brimX, brimZ, -1.5], [base + 0.2, 7.9, 7.7, -1.5]]);
  return { geometry: [rings(shape), brim], colors: [front.crownColor, front.brimColor] };
}

export function headwearFromViews(views: ImageBitmap[]) {
  return fitHeadwear(readSilhouette(views[0]), readSilhouette(views[3]));
}
