import { headViews } from "./head-views";
import { surfaceScene } from "./surface-scene";

export function hatReferenceScenes(size: number) {
  const center = { x: size / 2, y: size * 0.64 };
  const focal = size * 1.58;
  return headViews.map(({ yaw }) => {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return surfaceScene({
      hat: [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 3, -52, 1],
    }, center, focal);
  });
}
