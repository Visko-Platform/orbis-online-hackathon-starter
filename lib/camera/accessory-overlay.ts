import { accessoryViews, type AccessoryPlacement } from "./accessory";
import type { Point, Shoulder } from "./ink";
import { drawEyewear, type EyewearPose } from "./eyewear";
import { focalLength } from "./surface-scene";
import type { Headwear } from "./headwear";
import { drawUpperBody, type GarmentFit, type UpperBody } from "./upper-body";

export type CameraAccessory = {
  id: string;
  prompt: string;
  placement: AccessoryPlacement;
  sheet: Blob;
  views: ImageBitmap[];
  headwear?: Headwear;
  garmentFit?: GarmentFit;
};
export type AccessoryFace = {
  eyes: Shoulder; upperLip?: Shoulder; forehead: Point; yaw: number; height: number; eyewear: EyewearPose;
};
export type AccessoryHands = Partial<Record<"leftHand" | "rightHand", Shoulder>>;
type Hand = { wrist: Point; knuckle: Point };

export function accessoryGrips(left: Hand | undefined, right: Hand | undefined, map: (point: Point) => Point) {
  const grips: AccessoryHands = {};
  for (const [placement, hand] of [["leftHand", left], ["rightHand", right]] as const) {
    if (!hand) continue;
    const wrist = map(hand.wrist), knuckle = map(hand.knuckle);
    const dx = knuckle.x - wrist.x, dy = knuckle.y - wrist.y;
    const width = Math.hypot(dx, dy);
    if (width > 5) grips[placement] = { center: knuckle, angle: Math.atan2(dx, -dy), width };
  }
  return grips;
}

function span(first: Point, second: Point): Shoulder {
  const [left, right] = first.x <= second.x ? [first, second] : [second, first];
  return {
    center: { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 },
    angle: Math.atan2(right.y - left.y, right.x - left.x),
    width: Math.hypot(right.x - left.x, right.y - left.y),
  };
}

export function accessoryFace(points: Point[], matrix: number[], frameHeight: number): AccessoryFace | undefined {
  const leftEye = points[33];
  const rightEye = points[263];
  const forehead = points[10];
  const bridge = points[168], chin = points[152], leftTemple = points[127], rightTemple = points[356];
  if (!leftEye || !rightEye || !forehead || !bridge || !chin || !leftTemple || !rightTemple) return;
  const eyes = span(leftEye, rightEye);
  const temples = span(leftTemple, rightTemple);
  const height = Math.hypot(forehead.x - chin.x, forehead.y - chin.y);
  const measuredYaw = Math.atan2(-matrix[8], matrix[10]) * 180 / Math.PI;
  const direction = bridge.x - temples.center.x;
  const yaw = Math.abs(direction) > height * 0.025 ? Math.sign(direction) * Math.abs(measuredYaw) : measuredYaw;
  const origin = eyes.center;
  if (height > 35 && Number.isFinite(yaw)) {
    const lip = points[0], noseBase = points[2];
    const upperLip = lip && noseBase ? {
      center: { x: (lip.x + noseBase.x) / 2, y: (lip.y + noseBase.y) / 2 },
      angle: eyes.angle,
      width: height * 0.85,
    } : undefined;
    return { eyes, upperLip, forehead, yaw, height, eyewear: { origin, matrix, focal: focalLength(frameHeight) } };
  }
}

export function accessoryView(yaw: number) {
  if (Math.abs(yaw) < 17) return 0;
  if (Math.abs(yaw) < 50) return yaw < 0 ? 1 : 2;
  return yaw < 0 ? 3 : 4;
}

export function drawAccessory(
  ctx: CanvasRenderingContext2D,
  { views, placement, garmentFit }: CameraAccessory,
  face: AccessoryFace | undefined,
  shoulders: Shoulder | undefined,
  hands: AccessoryHands,
  upperBody?: UpperBody,
) {
  if (placement === "shoulders") {
    drawUpperBody(ctx, views[0], garmentFit, upperBody, shoulders);
    return;
  }
  if (placement === "eyes") {
    if (face) drawEyewear(ctx, views[0], face.eyewear);
    return;
  }
  if (placement === "leftHand" || placement === "rightHand") {
    const grip = hands[placement];
    if (!grip) return;
    const image = views[0];
    const height = grip.width * 3.4;
    const width = height * image.width / image.height;
    ctx.save();
    ctx.translate(grip.center.x, grip.center.y);
    ctx.rotate(grip.angle);
    ctx.drawImage(image, -width / 2, -height * 0.68, width, height);
    ctx.restore();
    return;
  }
  if (placement === "head") return;
  if (!face) return;
  const anchor = placement === "upperLip" ? face.upperLip : face.eyes;
  if (!anchor) return;
  const view = accessoryView(face.yaw);
  const image = views[view];
  const center = anchor.center;
  const aspect = image.width / image.height;
  const width = placement === "upperLip"
    ? Math.min(anchor.width * Math.max(0.48, Math.cos(face.yaw * Math.PI / 180)), face.height * 0.42 * aspect)
    : face.height * (view === 0 ? 0.90 : 0.83);
  const height = width / aspect;
  const top = placement === "upperLip" ? -Math.min(height * 0.6, face.height * 0.075) : -height / 2;
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(anchor.angle);
  ctx.drawImage(image, -width / 2, top, width, height);
  ctx.restore();
}

export async function cutOutAccessory(blob: Blob, index?: number) {
  const source = await createImageBitmap(blob);
  const col = (index ?? 0) % 3, row = Math.floor((index ?? 0) / 3);
  const columns = index === undefined ? 1 : 3, rows = index === undefined ? 1 : 2;
  const left = Math.floor(source.width * col / columns), top = Math.floor(source.height * row / rows);
  const width = Math.floor(source.width * (col + 1) / columns) - left;
  const height = Math.floor(source.height * (row + 1) / rows) - top;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  try {
    if (!ctx) throw new Error("Couldn’t open the generated accessory.");
    ctx.drawImage(source, left, top, width, height, 0, 0, width, height);
  } finally {
    source.close();
  }

  const pixels = ctx.getImageData(0, 0, width, height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let transparent = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const red = pixels.data[i];
      const green = pixels.data[i + 1];
      const blue = pixels.data[i + 2];
      const other = Math.max(red, blue);
      const strength = green > 100 ? Math.min(1, Math.max(0, (green - other - 35) / 60)) : 0;
      pixels.data[i + 3] = Math.round(pixels.data[i + 3] * (1 - strength));
      if (strength > 0) pixels.data[i + 1] = Math.round(green + (other - green) * strength);
      if (pixels.data[i + 3] < 24) {
        transparent++;
        continue;
      }
      minX = Math.min(x, minX);
      minY = Math.min(y, minY);
      maxX = Math.max(x, maxX);
      maxY = Math.max(y, maxY);
    }
  }
  if (maxX < minX || maxY < minY) {
    throw new Error("Nano Banana returned an empty cutout. Try another description.");
  }
  if (transparent < width * height * 0.05) {
    throw new Error("Couldn’t remove the accessory background. Try generating it again.");
  }
  ctx.putImageData(pixels, 0, 0);
  return createImageBitmap(canvas, minX, minY, maxX - minX + 1, maxY - minY + 1);
}

export async function decodeAccessory(sheet: Blob) {
  const views: ImageBitmap[] = [];
  try {
    for (const index of accessoryViews.keys()) views.push(await cutOutAccessory(sheet, index));
    return views;
  } catch (error) {
    views.forEach((view) => view.close());
    throw error;
  }
}
