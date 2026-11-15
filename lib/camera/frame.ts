import { cover, HEIGHT, WIDTH, type Ink } from "./ink";

export function drawCamera(ctx: CanvasRenderingContext2D, video: HTMLVideoElement) {
  const crop = cover(video.videoWidth, video.videoHeight);
  ctx.save();
  ctx.translate(WIDTH, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, crop.x, crop.y, crop.width, crop.height);
  ctx.restore();
}

type Draft = { frame: HTMLCanvasElement; ink: Ink };
let draft: Draft | undefined;

export function sendLookDraft(value: Draft) {
  draft = value;
}

export function takeLookDraft() {
  const value = draft;
  draft = undefined;
  return value;
}

export function canvasBlob(canvas: HTMLCanvasElement, mime = "image/png") {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error("Couldn’t capture the sketch."));
  }, mime, 0.9));
}

export async function captureAccessoryPhoto(video: HTMLVideoElement | null | undefined) {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    throw new Error("Start the camera before taking a reference photo.");
  }
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Couldn’t take a reference photo.");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await canvasBlob(canvas, "image/jpeg");
  return new File([blob], "Camera photo.jpg", { type: blob.type });
}

export async function captureSource(ink: Ink, camera?: HTMLCanvasElement | null) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#e6e1d6";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  if (camera) context.drawImage(camera, 0, 0);
  ink.snapshot().draw(context);
  return new File([await canvasBlob(canvas, "image/jpeg")], camera ? "Camera drawing.jpg" : "Sketch.jpg", { type: "image/jpeg" });
}
