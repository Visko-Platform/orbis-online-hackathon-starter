import type { Category, NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { CameraMotion } from "../orbis-camera-motion";
import { cover, WIDTH } from "./ink";
import { faceMatrix } from "./surface-pose";

export type CameraMotionFrame = {
  aspect: number;
  pose?: NormalizedLandmark[];
  face?: { points: NormalizedLandmark[]; matrix: number[]; expressions?: Category[] };
};

export type CameraMotionTracking = {
  enabled: () => boolean;
  onFrame: (frame: CameraMotionFrame | null) => void;
};

function isVisible(point: NormalizedLandmark | undefined): point is NormalizedLandmark {
  return !!point && point.visibility >= 0.55 && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

function armPose(pose: NormalizedLandmark[], left: boolean, aspect: number, scale: number): CameraMotion["leftArm"] {
  const shoulder = pose[left ? 11 : 12];
  const elbow = pose[left ? 13 : 14];
  const wrist = pose[left ? 15 : 16];
  if (!isVisible(shoulder) || !isVisible(wrist)) return;

  const up = (shoulder.y - wrist.y) / scale;
  const out = (wrist.x - shoulder.x) * aspect / scale * (left ? 1 : -1);
  const eye = pose[left ? 2 : 5];
  if (isVisible(eye) && wrist.y < eye.y - 0.05 * scale) return "overhead";
  if (up > 0.25) return "high";
  if (up > -0.38 && out > 0.58) return "out";
  if (up > -0.80 && out < -0.34) return "across";
  if (isVisible(elbow) && elbow.y - wrist.y > scale * 0.16) return "bent";
  if (up < -0.45) return "down";
  return "bent";
}

function hasBentKnee(pose: NormalizedLandmark[], index: number, aspect: number) {
  const [hip, knee, ankle] = [pose[index], pose[index + 2], pose[index + 4]];
  if (!isVisible(hip) || !isVisible(knee) || !isVisible(ankle)) return;
  const thigh = [(hip.x - knee.x) * aspect, hip.y - knee.y, (hip.z - knee.z) * aspect];
  const shin = [(ankle.x - knee.x) * aspect, ankle.y - knee.y, (ankle.z - knee.z) * aspect];
  const length = Math.hypot(...thigh) * Math.hypot(...shin);
  if (length < 0.002) return;
  return thigh.reduce((sum, axis, i) => sum + axis * shin[i], 0) / length > -0.67;
}

function horizontal(value: number, threshold: number) {
  if (value < -threshold) return "left";
  if (value > threshold) return "right";
}

export function readCameraMotion({ aspect, pose, face }: CameraMotionFrame): CameraMotion {
  const motion: CameraMotion = {};
  if (pose) {
    const [left, right, leftHip, rightHip] = [pose[11], pose[12], pose[23], pose[24]];
    if (isVisible(left) && isVisible(right)) {
      const shoulderSpan = Math.hypot((left.x - right.x) * aspect, left.y - right.y, (left.z - right.z) * aspect);
      if (shoulderSpan > 0.06) {
        const preview = cover(aspect, 1);
        const shoulderCenter = (left.x + right.x) / 2;
        const previewX = 1 - (preview.x + shoulderCenter * preview.width) / WIDTH;
        motion.position = horizontal(previewX - 0.5, 0.16) ?? "center";
        motion.leftArm = armPose(pose, true, aspect, shoulderSpan);
        motion.rightArm = armPose(pose, false, aspect, shoulderSpan);
        if (isVisible(leftHip) && isVisible(rightHip)) {
          const lean = ((leftHip.x + rightHip.x) - (left.x + right.x)) * aspect / (2 * shoulderSpan);
          motion.torso = horizontal(lean, 0.24) ?? "upright";
        }
      }
    }
    const leftKnee = hasBentKnee(pose, 23, aspect);
    const rightKnee = hasBentKnee(pose, 24, aspect);
    if (leftKnee !== undefined && leftKnee === rightKnee) motion.knees = leftKnee ? "bent" : "straight";
  }

  if (face?.matrix.length === 16) {
    const matrix = faceMatrix(face.matrix);
    const yaw = Math.atan2(-matrix[8], matrix[10]);
    const pitch = Math.atan2(matrix[9], Math.hypot(matrix[8], matrix[10]));
    const roll = Math.atan2(matrix[1], matrix[0]);
    const templeA = face.points[127], templeB = face.points[356], bridge = face.points[168];
    // Follow the mirrored preview. The bridge helps disambiguate yaw at profile angles.
    const bridgeOffset = templeA && templeB && bridge ? (templeA.x + templeB.x) / 2 - bridge.x : 0;
    const turn = Math.abs(bridgeOffset) > 0.008 ? Math.sign(bridgeOffset) * Math.abs(yaw) : yaw;
    motion.headTurn = horizontal(turn, 0.24) ?? "front";
    motion.headTilt = horizontal(roll, 0.20) ?? "level";
    motion.headPitch = pitch > 0.18 ? "up" : pitch < -0.20 ? "down" : "level";
  }
  if (face?.expressions?.length) {
    const score = (name: string) => face.expressions?.find((entry) => entry.categoryName === name)?.score ?? 0;
    motion.smile = (score("mouthSmileLeft") + score("mouthSmileRight")) / 2 > 0.45 ? "on" : "off";
    motion.mouth = score("jawOpen") > 0.36 ? "open" : "closed";
    motion.brows = Math.max(score("browInnerUp"), (score("browOuterUpLeft") + score("browOuterUpRight")) / 2) > 0.45
      ? "raised" : "relaxed";
    motion.eyes = Math.min(score("eyeBlinkLeft"), score("eyeBlinkRight")) > 0.68 ? "closed" : "open";
  }
  return motion;
}
