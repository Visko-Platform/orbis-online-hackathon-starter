import { describeAccessory } from "@/lib/camera/accessory";
import type { Wardrobe } from "@/lib/camera/wardrobe";
import type { Environment } from "@/lib/looks/draft";
import { DEFAULT_CAMERA_SCENE } from "@/lib/orbis-camera-motion";

export function buildOpeningScene({ wardrobe, environment, referenceDirection, startingPrompt, hasCameraSignal }: {
  wardrobe: Wardrobe;
  environment?: Environment;
  referenceDirection: string;
  startingPrompt: string;
  hasCameraSignal: boolean;
}) {
  const extraDirection = startingPrompt.trim();
  const overlays = wardrobe.pieces
    .filter(({ id, placement, prompt }) => wardrobe.worn[placement] === id && prompt.trim())
    .map(({ placement, prompt }) => describeAccessory(placement, prompt))
    .filter((direction) => !referenceDirection.includes(direction));
  const description = environment?.description.trim();
  const motion = environment?.motion.trim();
  const context = [
    ...overlays,
    referenceDirection,
    description && `Environment: ${description}`,
    motion && `Environment motion: ${motion}`,
  ].filter(Boolean);
  if (!extraDirection && !context.length && hasCameraSignal) context.push(DEFAULT_CAMERA_SCENE);
  if (environment?.is360 && (extraDirection || context.length)) {
    context.push("Allow a gradual camera pan when requested.");
  }
  const inheritedPrompt = context.join("\n");
  return { inheritedPrompt, openingScene: [extraDirection, inheritedPrompt].filter(Boolean).join("\n") };
}
