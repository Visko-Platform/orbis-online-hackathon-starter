type JointPoints = readonly [center: number | readonly [number, number], from: number, to: number];
type FacePoints = readonly [...JointPoints, blink?: "left" | "right"];
export type JointModel = "pose" | "hand" | "face";

const leftBody = {
  Shoulder: [11, 11, 13], Elbow: [13, 11, 13], Wrist: [15, 13, 15],
  Hip: [23, 11, 23], Knee: [25, 23, 25], Ankle: [27, 25, 27],
  Heel: [29, 29, 31], "Front of foot": [31, 29, 31],
} as const satisfies Record<string, JointPoints>;

const hand = {
  Palm: [[0, 9], 0, 9],
  "Thumb base": [1, 0, 1], "Thumb knuckle": [2, 1, 2],
  "Thumb joint": [3, 2, 3], "Thumb tip": [4, 3, 4],
  "Index knuckle": [5, 5, 6], "Index middle joint": [6, 5, 6],
  "Index end joint": [7, 6, 7], "Index fingertip": [8, 7, 8],
  "Middle knuckle": [9, 9, 10], "Middle finger middle joint": [10, 9, 10],
  "Middle finger end joint": [11, 10, 11], "Middle fingertip": [12, 11, 12],
  "Ring knuckle": [13, 13, 14], "Ring middle joint": [14, 13, 14],
  "Ring end joint": [15, 14, 15], "Ring fingertip": [16, 15, 16],
  "Little finger knuckle": [17, 17, 18], "Little finger middle joint": [18, 17, 18],
  "Little finger end joint": [19, 18, 19], "Little fingertip": [20, 19, 20],
} as const satisfies Record<string, JointPoints>;

export type BodySide = "Left" | "Right";

const face = {
  "Left eye": [[386, 374], 263, 362], "Right eye": [[159, 145], 133, 33],
  "Left iris": [473, 263, 362, "left"], "Right iris": [468, 133, 33, "right"],
  "Left upper eyelid": [386, 263, 362], "Right upper eyelid": [159, 133, 33],
  "Left lower eyelid": [374, 263, 362], "Right lower eyelid": [145, 133, 33],
  "Left eyebrow": [334, 276, 336], "Right eyebrow": [105, 107, 46],
  "Nose bridge": [168, 362, 133], "Nose tip": [1, 327, 98],
  "Left nostril": [327, 327, 98], "Right nostril": [98, 327, 98],
  Mouth: [[13, 14], 291, 61], "Upper lip": [0, 291, 61], "Lower lip": [17, 291, 61],
  "Left mouth corner": [291, 291, 61], "Right mouth corner": [61, 291, 61],
  "Left cheek": [425, 263, 362], "Right cheek": [205, 133, 33],
  Forehead: [10, 263, 33], Chin: [152, 291, 61],
} as const satisfies Record<string, FacePoints>;

// The face mesh ends at the outline of the head. Pose landmarks supply the ears.
const ears = { "Left ear": [7, 7, 3], "Right ear": [8, 6, 8] } as const satisfies Record<string, JointPoints>;

export type JointId = `${BodySide} ${Lowercase<keyof typeof leftBody | keyof typeof hand>}` | keyof typeof face | keyof typeof ears;

type Joint = {
  id: JointId;
  label: string;
  side?: BodySide;
  kind: JointModel;
  center: readonly [number, number];
  from: number;
  to: number;
  horizontal?: boolean;
  blink?: "left" | "right";
};

function centerIndices(center: JointPoints[0], offset = 0): Joint["center"] {
  return typeof center === "number" ? [center + offset, center + offset] : [center[0] + offset, center[1] + offset];
}

function group(side: BodySide, kind: "pose" | "hand", points: Record<string, JointPoints>) {
  const offset = kind === "pose" && side === "Right" ? 1 : 0;
  return {
    label: `${side} ${kind === "pose" ? "body" : "hand"}`,
    joints: Object.entries(points).map(([part, [center, from, to]]): Joint => ({
      id: `${side} ${part.toLowerCase()}` as JointId,
      label: `${side} ${part.toLowerCase()}`,
      side,
      kind,
      center: centerIndices(center, offset),
      from: from + offset,
      to: to + offset,
    })),
  };
}

function facialJoints(points: Record<string, FacePoints>, kind: "face" | "pose"): Joint[] {
  return Object.entries(points).map(([label, [center, from, to, blink]]) => ({
    id: label as JointId, label, kind, center: centerIndices(center), from, to, horizontal: true, blink,
  }));
}

export const jointGroups = [group("Left", "pose", leftBody), group("Right", "pose", leftBody),
  group("Left", "hand", hand), group("Right", "hand", hand),
  { label: "Face", joints: [...facialJoints(face, "face"), ...facialJoints(ears, "pose")] }];
export const trackedJoints = jointGroups.flatMap(({ joints }) => joints);
const jointModels = new Map<string, JointModel>(trackedJoints.map(({ id, kind }) => [id, kind]));
export const isJointId = (value: string): value is JointId => jointModels.has(value);
export const jointModel = (id: JointId) => jointModels.get(id);
export const defaultJoint: JointId = "Right index fingertip";
