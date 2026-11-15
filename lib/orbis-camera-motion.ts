import { PHOTOREAL_DIRECTION } from "./orbis-prompt";

const arm = {
  down: "rests at their side",
  bent: "bends with the hand near their chest",
  across: "crosses in front of their chest",
  out: "extends out at shoulder height",
  high: "lifts with the hand above their shoulder",
  overhead: "lifts with the hand above their head",
};

const directions = {
  leftArm: arm,
  rightArm: arm,
  headTurn: { left: "turns toward screen left", front: "faces the camera", right: "turns toward screen right" },
  headPitch: { up: "lifts their chin", level: "holds their chin level", down: "lowers their chin" },
  headTilt: { left: "tilts toward screen left", level: "holds their head upright", right: "tilts toward screen right" },
  torso: { left: "leans toward screen left", upright: "straightens their torso", right: "leans toward screen right" },
  position: { left: "moves to the left side of the frame", center: "moves to the center of the frame", right: "moves to the right side of the frame" },
  knees: { bent: "bends their knees", straight: "straightens their knees" },
  smile: { on: "smiles", off: "relaxes their smile" },
  mouth: { open: "opens their mouth", closed: "closes their mouth" },
  brows: { raised: "raises their eyebrows", relaxed: "relaxes their eyebrows" },
  eyes: { closed: "closes both eyes", open: "keeps their eyes open" },
};

type Directions = typeof directions;
export type CameraMotion = { [K in keyof Directions]?: keyof Directions[K] };
export const CAMERA_MOTION_KEYS = Object.keys(directions) as (keyof CameraMotion)[];
export const DEFAULT_CAMERA_SCENE = "A single character is clearly visible in a steady medium shot with room to move their arms.";
export const CAMERA_SCENE_LIMIT = 2_400;
export const CAMERA_EDIT_LIMIT = 1_500;

export function isCameraMotion(value: unknown): value is CameraMotion {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length > 0 && entries.every(([key, state]) =>
    Object.hasOwn(directions, key) && typeof state === "string" &&
    Object.hasOwn(directions[key as keyof Directions], state));
}

export function describeCameraMotion(motion: CameraMotion) {
  const parts = CAMERA_MOTION_KEYS.flatMap((key) => {
    const state = motion[key];
    if (!state) return [];
    const phrase = (directions[key] as Record<string, string>)[state];
    if (key === "leftArm") return [`Their left arm ${phrase}.`];
    if (key === "rightArm") return [`Their right arm ${phrase}.`];
    if (key === "headTurn" || (key === "headTilt" && state !== "level")) return [`Their head ${phrase}.`];
    return [`They ${phrase}.`];
  });
  return parts.join(" ");
}

export function cameraMotionPayload(scene: string, edit: string, motion: CameraMotion) {
  return cameraSteeringPayload(scene, [edit], "", motion);
}

export function cameraSteeringPayload(scene: string, edits: string[], sketch: string, motion: CameraMotion) {
  const pose = describeCameraMotion(motion);
  return {
    prompt: [
      `${PHOTOREAL_DIRECTION} Continue the same uninterrupted shot. Keep the character identity, wardrobe, props, lighting, setting and framing consistent except where specified below.`,
      `Opening look and setting (before later scene changes): ${scene.trim()}`,
      sketch && `Live camera effect: ${sketch}`,
      ...edits.filter(Boolean).map((edit) => `Current scene direction (supersedes conflicting opening details; later statements supersede earlier ones): ${edit.trim()}`),
      pose && `The character smoothly follows this current pose. It supersedes earlier body actions. ${pose} Keep unspecified body parts and facial features in their current pose.`,
    ].filter(Boolean).join("\n\n"),
    passthrough: true,
  };
}
