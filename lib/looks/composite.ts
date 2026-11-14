import { canvasBlob } from "@/lib/camera/frame";
import { HEIGHT, WIDTH, type Point } from "@/lib/camera/ink";
import type { AcceptedGarment, Garment, LookDraft } from "./draft";

export const LOOK_BACKGROUND = "#e6e1d6";

export function createLookCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  return canvas;
}

export function traceOutline(context: CanvasRenderingContext2D, points: readonly Point[], close: boolean) {
  context.beginPath();
  points.forEach((point, index) => {
    const x = point.x * WIDTH;
    const y = point.y * HEIGHT;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  if (close) context.closePath();
}

export function closedOutline(points: readonly Point[]) {
  if (points.length < 3) return false;
  const start = points[0];
  const end = points[points.length - 1];
  if (Math.hypot((start.x - end.x) * WIDTH, (start.y - end.y) * HEIGHT) > 28) return false;
  const area = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - point.y * next.x;
  }, 0);
  return Math.abs(area) * WIDTH * HEIGHT / 2 >= 40;
}

export function drawLook(context: CanvasRenderingContext2D, look: LookDraft, replacement?: { id: string; pixels: HTMLCanvasElement }) {
  context.fillStyle = LOOK_BACKGROUND;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  if (look.frame) context.drawImage(look.frame, 0, 0, WIDTH, HEIGHT);
  for (const layer of look.layers) {
    const pixels = replacement?.id === layer.id ? replacement.pixels : layer.accepted?.pixels;
    if (pixels) context.drawImage(pixels, 0, 0);
  }
}

export function compositeLook(look: LookDraft, replacement?: { id: string; pixels: HTMLCanvasElement }) {
  const canvas = createLookCanvas();
  drawLook(canvas.getContext("2d")!, look, replacement);
  return canvas;
}

export async function garmentInputs(look: LookDraft, outline: readonly Point[]) {
  const base = compositeLook({ ...look, layers: [] });
  const guide = createLookCanvas();
  const context = guide.getContext("2d")!;
  context.drawImage(base, 0, 0);
  traceOutline(context, outline, true);
  context.strokeStyle = "#e437be";
  context.lineWidth = 5;
  context.stroke();
  const [baseImage, guideImage] = await Promise.all([canvasBlob(base, "image/jpeg"), canvasBlob(guide)]);
  return { baseImage, guideImage };
}

export async function clipGarment(image: Blob, outline: readonly Point[]) {
  const bitmap = await createImageBitmap(image);
  try {
    const canvas = createLookCanvas();
    const context = canvas.getContext("2d")!;
    traceOutline(context, outline, true);
    context.clip();
    context.drawImage(bitmap, 0, 0, WIDTH, HEIGHT);
    return canvas;
  } finally {
    bitmap.close();
  }
}

export function acceptPixels(pixels: HTMLCanvasElement, layer: Garment, prompt: string): AcceptedGarment {
  return { pixels, outline: layer.outline, prompt };
}
