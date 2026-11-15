import { fromAnchor, toAnchor } from "./anchor-transform";
import { HEIGHT, WIDTH, type Ink, type Point, type Shoulder, type StrokeEvent } from "./ink";
import type { JointId } from "./joints";

export type Bounds = { x: number; y: number; width: number; height: number };
export type Target = JointId | "Shoulders";
export type Attachment = { center: Point; width: number; height: number; angle: number };
export type SketchLayer = {
  id: number;
  target: Target;
  bounds: Bounds;
  transcript: string;
  attachment?: Attachment;
  image?: ImageBitmap;
  selected?: boolean;
  preview?: string;
  generating?: boolean;
  error?: string;
};

export function sketchTarget(event: StrokeEvent): Target {
  if (event.follow === "joint" && event.joint) return event.joint;
  return event.follow === "shoulders" || event.follow === "garment" ? "Shoulders" : "Nose bridge";
}

function anchor(ink: Ink, target: Target): Shoulder | undefined {
  const value = target === "Shoulders" ? ink.shoulder : ink.jointAnchor(target);
  if (!value) return;
  // Keep the image upright when the same landmark is viewed in a mirrored feed.
  const { angle } = value;
  return { ...value, angle: Math.atan(Math.tan(angle)) };
}

export function attachSketch(ink: Ink, target: Target, bounds: Bounds): Attachment | undefined {
  const point = anchor(ink, target);
  if (!point) return;
  return {
    center: toAnchor({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }, point),
    width: bounds.width / point.width, height: bounds.height / point.width, angle: point.angle,
  };
}

export function drawSketchLayers(context: CanvasRenderingContext2D, ink: Ink, layers: Iterable<SketchLayer>) {
  for (const { image, attachment, target, selected } of layers) {
    if (!selected || !image || !attachment) continue;
    const point = anchor(ink, target);
    if (!point) continue;
    const center = fromAnchor(attachment.center, point);
    const scale = Math.min(attachment.width / image.width, attachment.height / image.height) * point.width;
    const width = image.width * scale, height = image.height * scale;
    context.save();
    context.translate(center.x, center.y);
    context.rotate(point.angle - attachment.angle);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.restore();
  }
}

export function captureStroke(ink: Ink, id: number) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  ink.draw(context, id);
  const pixels = context.getImageData(0, 0, WIDTH, HEIGHT).data;
  let left = WIDTH, top = HEIGHT, right = -1, bottom = -1;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (!pixels[(y * WIDTH + x) * 4 + 3]) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left) return;
  const width = right - left + 1, height = bottom - top + 1;
  const padding = Math.max(6, Math.ceil(Math.max(width, height) * 0.08));
  const crop = document.createElement("canvas");
  crop.width = width + padding * 2;
  crop.height = height + padding * 2;
  const cropped = crop.getContext("2d")!;
  cropped.fillStyle = "#808080";
  cropped.fillRect(0, 0, crop.width, crop.height);
  cropped.drawImage(canvas, left, top, width, height, padding, padding, width, height);
  return { crop, bounds: { x: left, y: top, width, height } };
}
