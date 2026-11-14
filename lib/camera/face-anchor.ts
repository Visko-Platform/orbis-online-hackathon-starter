import type { Point } from "./ink";

type Triangle = [number, number, number];
type Vertex = Point & { z: number };
export type FacePoint = Point & { triangle?: Triangle; winding?: number; iris?: "left" | "right" };
export type FaceAnchor = ReturnType<typeof faceAnchor>;

const irises: { side: "left" | "right"; triangles: Triangle[] }[] = [
  { side: "right", triangles: [[468, 469, 470], [468, 470, 471], [468, 471, 472], [468, 472, 469]] },
  { side: "left", triangles: [[473, 474, 475], [473, 475, 476], [473, 476, 477], [473, 477, 474]] },
];

export function faceAnchor(vertices: Vertex[], triangles: Triangle[], matrix: number[], center: Point,
  height: number, blinks: Record<"left" | "right", number>) {
  // MediaPipe's virtual camera has a 63° vertical FOV and looks down -Z.
  // Mirror both screen axes relative to its camera space to match the selfie canvas.
  const focal = -height / (2 * Math.tan(63 * Math.PI / 360));
  const [xx, xy, xz, , yx, yy, yz, , , , , , tx, ty, tz] = matrix;
  const project = (x: number, y: number): Point | undefined => {
    const depth = -(xz * x + yz * y + tz);
    if (depth <= 1) return;
    return {
      x: center.x + focal * (xx * x + yx * y + tx) / depth,
      y: center.y + focal * (xy * x + yy * y + ty) / depth,
    };
  };

  return {
    attach(point: Point): FacePoint | undefined {
      // Attach to the nearest visible mesh surface. Barycentric coordinates let the ink
      // deform with the face, including the eyelids and irises, on subsequent frames.
      let depth = Infinity;
      let closest: FacePoint | undefined;
      function tryTriangle(triangle: Triangle, iris?: "left" | "right") {
        const a = vertices[triangle[0]];
        const b = vertices[triangle[1]];
        const c = vertices[triangle[2]];
        if (!a || !b || !c) return;
        const bx = b.x - a.x;
        const by = b.y - a.y;
        const cx = c.x - a.x;
        const cy = c.y - a.y;
        const determinant = bx * cy - by * cx;
        if (Math.abs(determinant) < 0.01) return;
        const dx = point.x - a.x;
        const dy = point.y - a.y;
        const x = (dx * cy - dy * cx) / determinant;
        const y = (dy * bx - dx * by) / determinant;
        if (x < 0 || y < 0 || x + y > 1) return;
        const z = a.z + x * (b.z - a.z) + y * (c.z - a.z);
        if (z >= depth) return;
        depth = z;
        closest = { x, y, triangle, winding: Math.sign(determinant), iris };
      }
      for (const { side, triangles: eye } of irises) {
        if (blinks[side] < 0.65) for (const triangle of eye) tryTriangle(triangle, side);
      }
      if (closest) return closest;
      for (const triangle of triangles) tryTriangle(triangle);
      if (closest) return closest;

      // Ink outside the mesh lives on the canonical head plane in 3D.
      const px = (point.x - center.x) / focal;
      const py = (point.y - center.y) / focal;
      const a = xx + px * xz;
      const b = yx + px * yz;
      const c = xy + py * xz;
      const d = yy + py * yz;
      const e = -tx - px * tz;
      const f = -ty - py * tz;
      const determinant = a * d - b * c;
      if (Math.abs(determinant) < 0.05) return;
      const local = { x: (e * d - b * f) / determinant, y: (a * f - e * c) / determinant };
      if (project(local.x, local.y)) return local;
    },
    project(point: FacePoint): Point | undefined {
      if (!point.triangle) return project(point.x, point.y);
      if (point.iris && blinks[point.iris] >= 0.65) return;
      const a = vertices[point.triangle[0]];
      const b = vertices[point.triangle[1]];
      const c = vertices[point.triangle[2]];
      if (!a || !b || !c) return;
      const determinant = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (Math.sign(determinant) !== point.winding) return;
      return {
        x: a.x + (b.x - a.x) * point.x + (c.x - a.x) * point.y,
        y: a.y + (b.y - a.y) * point.x + (c.y - a.y) * point.y,
      };
    },
  };
}
