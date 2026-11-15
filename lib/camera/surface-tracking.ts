import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { HEIGHT, Ink, WIDTH, type Point } from "./ink";
import { rearHeadPose, rigidPose, torsoPose } from "./surface-pose";
import { focalLength, surfaceScene, type SurfacePoses } from "./surface-scene";
import { motionFilter } from "./tracking-filter";
import type { Headwear } from "./headwear";

export type BodyFrame = { points: NormalizedLandmark[]; world: NormalizedLandmark[] };

export function trackSurfaces(ink: Ink, getHeadwear?: () => Headwear | undefined) {
  const center = { x: WIDTH / 2, y: HEIGHT / 2 };
  let smoothHat = motionFilter(4, 1.2);
  const smoothTorso = motionFilter(3.5, 0.8);
  const poses: SurfacePoses = {};
  let focal = focalLength(HEIGHT);
  let lastHat = -Infinity;
  let lastTorso = -Infinity;
  let previousHeadwear: Headwear | undefined;
  let previousHatDrawing = false;

  function publish() {
    previousHeadwear = getHeadwear?.();
    previousHatDrawing = Ink.prototype.follows.call(ink, "hat");
    ink.scene = poses.hat || poses.garment ?
      surfaceScene({ ...poses }, center, focal, previousHeadwear, previousHatDrawing) : undefined;
  }

  const needed = () => ({
    hat: !!getHeadwear?.() || Ink.prototype.follows.call(ink, "hat"),
    garment: Ink.prototype.follows.call(ink, "garment"),
  });

  return {
    needed,
    update(time: number, height: number, map: (point: Point) => Point, face?: number[], body?: BodyFrame) {
      const { hat, garment } = needed();
      if (!hat && !garment) return;
      focal = focalLength(height);
      const points = body?.points.map((point) => ({ ...point, ...map(point) }));
      const torso = points && body && torsoPose(points, body.world, center, focal);
      const head = face ?? (hat && points && body && torso
        ? rearHeadPose(points.slice(4), body.world.slice(4), torso, center, focal) : undefined);
      if (hat && head) {
        poses.hat = rigidPose(smoothHat(head, time));
        lastHat = time;
      }
      if (garment && torso) {
        poses.garment = rigidPose(smoothTorso(torso, time));
        lastTorso = time;
      }
      if ((hat && head) || (garment && torso)) publish();
    },
    expire(time: number) {
      const { hat, garment } = needed();
      const hideHat = poses.hat && (!hat || time - lastHat > 650);
      const hideTorso = poses.garment && (!garment || time - lastTorso > 650);
      if (hideHat) {
        delete poses.hat;
        smoothHat = motionFilter(4, 1.2);
      }
      if (hideTorso) delete poses.garment;
      if (hideHat || hideTorso || previousHeadwear !== getHeadwear?.() ||
          previousHatDrawing !== Ink.prototype.follows.call(ink, "hat")) publish();
    },
  };
}
