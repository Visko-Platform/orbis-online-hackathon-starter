export type Vec3 = [number, number, number];
export type SurfaceMode = "hat" | "garment";
export type SurfaceVertex = { position: Vec3; u: number; v: number };
export type Mesh = { vertices: SurfaceVertex[]; indices: number[]; chartWidth: number; chartHeight: number };
export type SurfacePoint = SurfaceVertex & { mesh: number };
export type SurfacePose = readonly number[];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const subtract = (a: Vec3, b: Vec3): Vec3 => add(a, scale(b, -1));
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const length = (a: Vec3) => Math.hypot(...a);
export const unit = (a: Vec3): Vec3 => scale(a, 1 / Math.max(1e-6, length(a)));
export const cross = (a: Vec3, b: Vec3): Vec3 =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export type Ring = [y: number, radiusX: number, radiusZ: number, centerZ: number];

export function rings(profile: Ring[]): Mesh {
  const vertices: Mesh["vertices"] = [];
  const indices: number[] = [];
  const sides = 48;
  const distances = [0];
  for (let row = 1; row < profile.length; row++) {
    distances.push(distances[row - 1] + Math.hypot(...subtract(
      [profile[row][0], profile[row][1], profile[row][2] + profile[row][3]],
      [profile[row - 1][0], profile[row - 1][1], profile[row - 1][2] + profile[row - 1][3]],
    )));
  }
  for (let row = 0; row < profile.length; row++) {
    const [y, rx, rz, z] = profile[row];
    for (let side = 0; side <= sides; side++) {
      const theta = side * 2 * Math.PI / sides;
      vertices.push({ position: [rx * Math.sin(theta), y, z - rz * Math.cos(theta)],
        u: side / sides, v: 0.01 + 0.98 * distances[row] / distances.at(-1)! });
      if (row && side) {
        const i = vertices.length - 1;
        const above = i - sides - 1;
        indices.push(above - 1, above, i, above - 1, i, i - 1);
      }
    }
  }
  const chartWidth = Math.PI * Math.max(...profile.map(([, rx, rz]) => rx + rz));
  return { vertices, indices, chartWidth, chartHeight: distances.at(-1)! / 0.98 };
}

// All dimensions are in the tracker’s canonical centimeter space. The UV seam is at the back.
export const surfaces: Record<SurfaceMode, Mesh[]> = {
  hat: [
    rings([[7.2, 7.9, 7.8, -1.5], [8, 7.9, 7.8, -1.5], [10.5, 7.5, 7.4, -1.6],
      [12.4, 6.6, 6.4, -1.6], [13.5, 4.7, 4.5, -1.6], [13.9, 0, 0, -1.6]]),
    rings([[7.15, 7.7, 7.5, -1.5], [6.65, 11.8, 11.8, -0.4], [7.15, 12, 12, -0.4],
      [7.6, 11.8, 11.8, -0.4], [7.7, 7.7, 7.5, -1.5]]),
  ],
  garment: [
    rings([[3.2, 6.5, 5.4, 0], [2, 12.7, 7, 0], [-1.5, 19, 9, 0],
      [-11, 18, 11, 0], [-22, 16, 10, -0.5], [-34, 15, 9, -1], [-44, 16, 9.5, -1]]),
  ],
};

export const headOccluder = rings(Array.from({ length: 13 }, (_, row): Ring => {
  const latitude = row * Math.PI / 12;
  return [0.6 - Math.cos(latitude) * 8.7, Math.sin(latitude) * 7.65, Math.sin(latitude) * 7.5, -1.65];
}));

export function transform(pose: SurfacePose, [x, y, z]: Vec3): Vec3 {
  return [
    pose[0] * x + pose[4] * y + pose[8] * z + pose[12],
    pose[1] * x + pose[5] * y + pose[9] * z + pose[13],
    pose[2] * x + pose[6] * y + pose[10] * z + pose[14],
  ];
}
