import type { Point } from "./ink";

export type TexturePatch = {
  corners: [Point, Point, Point, Point]; // Top left, top right, bottom right, bottom left.
  source: [number, number, number, number];
};

let scratch: CanvasRenderingContext2D | null | undefined;

function drawTriangle(ctx: CanvasRenderingContext2D, image: ImageBitmap, [x, y, width, height]: TexturePatch["source"],
  [a, b, c, d]: TexturePatch["corners"], lower: boolean) {
  const across = lower ? { x: c.x - d.x, y: c.y - d.y } : { x: b.x - a.x, y: b.y - a.y };
  const down = lower ? { x: d.x - a.x, y: d.y - a.y } : { x: c.x - b.x, y: c.y - b.y };
  if (Math.abs(across.x * down.y - across.y * down.x) < 0.1) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  if (lower) {
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
  } else {
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
  }
  ctx.closePath();
  ctx.clip();
  ctx.transform(across.x, across.y, down.x, down.y, a.x, a.y);
  // The clip supplies the shared edge coverage. Sample the original texture
  // past internal patch edges so drawImage doesn't antialias them a second time.
  ctx.drawImage(image, -x / width, -y / height, image.width / width, image.height / height);
  ctx.restore();
}

export function drawTextureMesh(ctx: CanvasRenderingContext2D, image: ImageBitmap, patches: TexturePatch[]) {
  const corners = patches.flatMap((patch) => patch.corners);
  const left = Math.floor(Math.min(...corners.map(({ x }) => x)));
  const top = Math.floor(Math.min(...corners.map(({ y }) => y)));
  const width = Math.ceil(Math.max(...corners.map(({ x }) => x))) - left;
  const height = Math.ceil(Math.max(...corners.map(({ y }) => y))) - top;
  if (!Number.isFinite(width + height) || width <= 0 || height <= 0) return;

  scratch ??= document.createElement("canvas").getContext("2d");
  if (!scratch) return;
  const { canvas } = scratch;
  if (width > canvas.width) canvas.width = width;
  if (height > canvas.height) canvas.height = height;

  // Add complementary antialiased coverage on a transparent layer. Drawing the
  // individual triangles over the video leaves translucent seams at shared edges.
  scratch.clearRect(0, 0, width, height);
  scratch.save();
  scratch.globalCompositeOperation = "lighter";
  scratch.translate(-left, -top);
  for (const { corners, source } of patches) {
    drawTriangle(scratch, image, source, corners, false);
    drawTriangle(scratch, image, source, corners, true);
  }
  scratch.restore();
  ctx.drawImage(canvas, 0, 0, width, height, left, top, width, height);
}
