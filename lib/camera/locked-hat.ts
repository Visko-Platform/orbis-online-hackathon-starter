import type { SurfacePose } from "./surface-mesh";
import type { SurfaceStroke } from "./surface-renderer";

export type HatView = {
  pose: SurfacePose;
  focal: number;
  pixels: Uint8ClampedArray;
  angle: number;
};

export type LockedHat = { strokes: SurfaceStroke[]; views: HatView[] };
export type CameraReference = (image: File, direction: string, hat?: LockedHat) => void;
