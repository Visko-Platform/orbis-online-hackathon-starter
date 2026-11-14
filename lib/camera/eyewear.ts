import type { Point } from "./ink";
import { rigidPose } from "./surface-pose";
import { transform, type Vec3 } from "./surface-mesh";
import { drawTextureMesh, type TexturePatch } from "./texture-mesh";

export type EyewearPose = { origin: Point; matrix: number[]; focal: number };
type Projected = Point & { depth: number };
type Finish = { hingeY: number; color: string };
const finishes = new WeakMap<ImageBitmap, Finish>();
const halfWidth = 7.1;
const frontDepth = 6.8;
const hingeDepth = 5.5;
const strips = 20;

export function eyewearProjector({ origin, matrix, focal }: EyewearPose) {
  const pose = rigidPose(matrix);
  function cameraPoint(point: Vec3): Projected {
    const [x, y, z] = transform(pose, point);
    const depth = Math.max(1, -z);
    return { x: -focal * x / depth, y: -focal * y / depth, depth };
  }
  const center = cameraPoint([0, 0, frontDepth]);
  return (point: Vec3): Projected => {
    const pixel = cameraPoint(point);
    return { x: pixel.x + origin.x - center.x, y: pixel.y + origin.y - center.y, depth: pixel.depth };
  };
}

export function eyewearTemples(project: ReturnType<typeof eyewearProjector>, hingeHeight: number) {
  const left = project([halfWidth, hingeHeight, hingeDepth]);
  const right = project([-halfWidth, hingeHeight, hingeDepth]);
  const near = left.depth <= right.depth ? 1 : -1;
  const turn = Math.abs((left.depth - right.depth) / (2 * halfWidth));
  if (turn <= 0.13) return;
  const arm: Vec3[] = [[near * halfWidth, hingeHeight, hingeDepth], [near * 7.7, hingeHeight - 0.25, -3.6],
    [near * 7.55, hingeHeight - 0.45, -5.5], [near * 7.25, hingeHeight - 1.95, -7.0]];
  return { points: arm.map(project), opacity: Math.min(1, (turn - 0.13) / 0.22) };
}

function finish(image: ImageBitmap): Finish {
  const cached = finishes.get(image);
  if (cached) return cached;
  // The outermost painted pixels belong to the frame at each hinge.
  const sample = document.createElement("canvas");
  sample.width = 96;
  sample.height = 64;
  const context = sample.getContext("2d")!;
  context.drawImage(image, 0, 0, sample.width, sample.height);
  const { data } = context.getImageData(0, 0, sample.width, sample.height);
  let weight = 0, vertical = 0, red = 0, green = 0, blue = 0;
  for (let y = 0; y < sample.height; y++) {
    for (const x of [1, 2, 3, 92, 93, 94]) {
      const i = (y * sample.width + x) * 4;
      const alpha = data[i + 3] / 255;
      weight += alpha;
      vertical += alpha * (y + 0.5);
      red += alpha * data[i];
      green += alpha * data[i + 1];
      blue += alpha * data[i + 2];
    }
  }
  const result = weight ? {
    hingeY: Math.max(0.13, Math.min(0.65, vertical / (sample.height * weight))),
    color: `rgb(${Math.round(red / weight)}, ${Math.round(green / weight)}, ${Math.round(blue / weight)})`,
  } : { hingeY: 0.35, color: "#7f7764" };
  finishes.set(image, result);
  return result;
}

export function drawEyewear(ctx: CanvasRenderingContext2D, image: ImageBitmap, fit: EyewearPose) {
  const project = eyewearProjector(fit);
  const { hingeY, color } = finish(image);
  const height = 2 * halfWidth * image.height / image.width;
  const top = height * 0.47;
  const hingeHeight = top - height * hingeY;
  const forward = (project([0, 0, 0]).depth - project([0, 0, frontDepth]).depth) / frontDepth;
  // Behind the frame, draw only the visible temple. The opposite temple
  // runs behind the face. Fade it in from straight on as the side is revealed.
  const temple = eyewearTemples(project, hingeHeight);
  if (temple) {
    const [start, shoulder, bend, end] = temple.points;
    ctx.save();
    ctx.globalAlpha *= temple.opacity;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, fit.focal / start.depth * 0.18);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(shoulder.x, shoulder.y);
    ctx.quadraticCurveTo(bend.x, bend.y, end.x, end.y);
    ctx.stroke();
    ctx.restore();
  }

  // The front frame becomes edge-on at profile. Fade it into the side
  // silhouette while keeping the visible temple attached to the head.
  if (forward <= 0.03) return;
  const patches: TexturePatch[] = [];
  function edge(u: number) {
    const x = (1 - 2 * u) * halfWidth;
    const z = frontDepth - (frontDepth - hingeDepth) * (x / halfWidth) ** 2;
    return { top: project([x, top, z]), bottom: project([x, top - height, z]) };
  }
  let left = edge(0);
  const sourceWidth = image.width / strips;
  for (let i = 0; i < strips; i++) {
    const right = edge((i + 1) / strips);
    patches.push({
      corners: [left.top, right.top, right.bottom, left.bottom],
      source: [i * sourceWidth, 0, sourceWidth, image.height],
    });
    left = right;
  }
  ctx.save();
  ctx.globalAlpha *= Math.min(1, (forward - 0.03) / 0.19);
  drawTextureMesh(ctx, image, patches);
  ctx.restore();
}
