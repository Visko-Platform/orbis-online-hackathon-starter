import type { Point } from "./ink";
import type { Headwear } from "./headwear";
import { headOccluder, surfaces, transform, type Mesh, type SurfaceMode, type SurfacePoint,
  type SurfacePose, type Vec3 } from "./surface-mesh";

export type SurfacePoses = Partial<Record<SurfaceMode, SurfacePose>>;
export type SurfaceObject = { mode: SurfaceMode; mesh: number; geometry: Mesh; pose: SurfacePose; visible: boolean; color?: Vec3 };
type Projected = Point & { depth: number };

export const focalLength = (height: number) => height / (2 * Math.tan(63 * Math.PI / 360));

function projected([x, y, z]: Vec3, center: Point, focal: number): Projected {
  return { x: center.x + focal * x / z, y: center.y + focal * y / z, depth: -z };
}

export function surfaceScene(poses: SurfacePoses, center: Point, focal: number, headwear?: Headwear, hatDrawing = true) {
  const objects: SurfaceObject[] = [];
  if (poses.hat) {
    objects.push({ mode: "hat", mesh: -1, geometry: headOccluder, pose: poses.hat, visible: false });
    const geometry = headwear?.geometry ?? surfaces.hat;
    geometry.forEach((geometry, mesh) =>
      objects.push({ mode: "hat", mesh, geometry, pose: poses.hat!, visible: true, color: headwear?.colors[mesh] }));
  }
  if (poses.garment) {
    objects.push({ mode: "garment", mesh: 0, geometry: surfaces.garment[0], pose: poses.garment, visible: true });
  }
  let projections: Projected[][] | undefined;

  return {
    objects, center, focal,
    pick(point: Point, mode: SurfaceMode): SurfacePoint | undefined {
      if (!poses[mode]) return;
      projections ??= objects.map(({ geometry, pose }) =>
        geometry.vertices.map(({ position }) => projected(transform(pose, position), center, focal)));
      let nearest = Infinity;
      let hit: SurfacePoint | undefined;
      objects.forEach(({ geometry, mesh, mode: objectMode, visible }, index) => {
        const points = projections![index];
        const { vertices, indices } = geometry;
        for (let i = 0; i < indices.length; i += 3) {
          const [ia, ib, ic] = [indices[i], indices[i + 1], indices[i + 2]];
          const a = points[ia], b = points[ib], c = points[ic];
          if (Math.min(a.depth, b.depth, c.depth) <= 1) continue;
          const bx = b.x - a.x, by = b.y - a.y, cx = c.x - a.x, cy = c.y - a.y;
          const determinant = bx * cy - by * cx;
          if (Math.abs(determinant) < 1e-5) continue;
          const dx = point.x - a.x, dy = point.y - a.y;
          const s = (dx * cy - dy * cx) / determinant;
          const t = (dy * bx - dx * by) / determinant;
          if (s < 0 || t < 0 || s + t > 1) continue;
          const wa = (1 - s - t) / a.depth, wb = s / b.depth, wc = t / c.depth;
          const depth = 1 / (wa + wb + wc);
          if (depth >= nearest) continue;
          nearest = depth;
          hit = undefined;
          if (!visible || objectMode !== mode) continue;
          if (mode === "hat" && !hatDrawing) continue;
          const first = vertices[ia], second = vertices[ib], third = vertices[ic];
          const interpolate = (a: number, b: number, c: number) => depth * (wa * a + wb * b + wc * c);
          hit = { mesh, u: interpolate(first.u, second.u, third.u), v: interpolate(first.v, second.v, third.v),
            position: [0, 1, 2].map((axis) =>
              interpolate(first.position[axis], second.position[axis], third.position[axis])) as Vec3 };
        }
      });
      return hit;
    },
  };
}

export type SurfaceScene = ReturnType<typeof surfaceScene>;
