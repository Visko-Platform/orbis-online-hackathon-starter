export const ACCESSORY_PROMPT_LIMIT = 500;
export const ACCESSORY_REFERENCE_LIMIT = 3 * 1024 * 1024;
export const accessoryReferenceTypes = ["image/jpeg", "image/png", "image/webp"];

export function validAccessoryReference(file: File) {
  return file.size > 0 && file.size <= ACCESSORY_REFERENCE_LIMIT && accessoryReferenceTypes.includes(file.type);
}

export const accessoryPlacements = {
  eyes: { label: "Eyes", example: "Gold aviator sunglasses", view: "eyewear with lenses and fully open temple arms" },
  face: { label: "Face", example: "A silver masquerade mask", view: "an accessory worn across the face" },
  upperLip: { label: "Upper lip", example: "A giant black handlebar mustache", view: "a standalone mustache or other requested upper-lip accessory" },
  head: { label: "Head", example: "A velvet wizard hat", view: "an accessory that sits on top of the head" },
  shoulders: { label: "Upper body", example: "Silver shoulder armor", view: "a wearable spanning the shoulders and upper torso" },
  fullBody: { label: "Full body", example: "A floor-length yellow dress with black flowers", view: "a complete dress, jumpsuit, or other full-body garment from neckline to hem" },
  leftHand: { label: "Left hand", example: "A brass lantern", view: "a handheld prop with a clear grip or handle" },
  rightHand: { label: "Right hand", example: "A vintage microphone", view: "a handheld prop with a clear grip or handle" },
};

export type AccessoryPlacement = keyof typeof accessoryPlacements;

export function isAccessoryPlacement(value: unknown): value is AccessoryPlacement {
  return typeof value === "string" && Object.hasOwn(accessoryPlacements, value);
}

export function resolveAccessoryPlacement(prompt: string, placement: AccessoryPlacement): AccessoryPlacement {
  if (/\b(?:dress(?!\s+shirt)|gown|jumpsuit|romper|overalls)\b/i.test(prompt)) return "fullBody";
  if ((placement === "eyes" || placement === "face") && /\bmo?ustaches?\b/i.test(prompt)) return "upperLip";
  return placement;
}

export const accessoryViews = ["Front", "Facing screen left", "Facing screen right",
  "Left profile", "Right profile", "Inside"] as const;
export const isHandAccessory = (placement: AccessoryPlacement) => placement === "leftHand" || placement === "rightHand";
export const isFaceAccessory = (placement: AccessoryPlacement) =>
  placement === "head" || placement === "eyes" || placement === "face" || placement === "upperLip";

export function describeAccessory(placement: AccessoryPlacement, prompt: string) {
  if (placement === "fullBody") {
    return `Dress the person in ${prompt} from neckline to hem. Replace their original jacket, shirt, and lower-body clothing wherever the garment covers them; do not layer it over the old outfit. Keep the garment's full length, silhouette, and materials consistent as the person moves, even when only the upper body is in frame.`;
  }
  return isHandAccessory(placement)
    ? `The person's ${placement === "leftHand" ? "left" : "right"} hand holds ${prompt}. Fingers curl naturally around its grip, with correct finger occlusion. Maintain physically plausible contact while the person moves or uses the prop as directed.`
    : `Keep ${prompt} fitted to the ${accessoryPlacements[placement].label.toLowerCase()}, with consistent shape and materials as the person turns.`;
}
