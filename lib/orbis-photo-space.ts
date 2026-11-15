import {
  BufferGeometry, CanvasTexture, Float32BufferAttribute, Mesh, MeshBasicMaterial,
  PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer,
} from "three";
import { prepareOrbisReference, referenceFile, REFERENCE_HEIGHT, REFERENCE_WIDTH } from "./orbis-reference";

const COLUMNS = 160;
const ROWS = 90;
const FOV = 52;
const ASPECT = REFERENCE_WIDTH / REFERENCE_HEIGHT;

type Depth = { width: number; height: number; values: Float32Array };
const estimatedDepths = new WeakMap<File, Depth>();

async function estimateDepth(photo: File, input: ImageData, signal: AbortSignal): Promise<Depth> {
  const cached = estimatedDepths.get(photo);
  if (cached) return cached;

  signal.throwIfAborted();
  const worker = new Worker(new URL("./orbis-depth.worker.ts", import.meta.url), { type: "module" });
  let onAbort: () => void = () => {};
  try {
    const depth = await new Promise<Depth>((resolve, reject) => {
      worker.onmessage = ({ data }: MessageEvent<Depth | { error: string }>) => {
        if ("error" in data) reject(new Error(data.error));
        else resolve(data);
      };
      worker.onerror = () => reject(new Error("Couldn’t load the photo depth estimator."));
      onAbort = () => reject(signal.reason);
      signal.addEventListener("abort", onAbort, { once: true });
      worker.postMessage(input, [input.data.buffer]);
    });
    estimatedDepths.set(photo, depth);
    return depth;
  } finally {
    signal.removeEventListener("abort", onAbort);
    worker.terminate();
  }
}

function photoGeometry(depth: number[]) {
  const sorted = depth.filter(Number.isFinite).sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.03)];
  const high = sorted[Math.floor(sorted.length * 0.97)];
  if (!(high > low)) throw new Error("Couldn’t estimate depth in this photo.");

  const positions: number[] = [];
  const uv: number[] = [];
  const indices: number[] = [];
  const halfHeight = Math.tan(FOV * Math.PI / 360);
  for (let row = 0; row < ROWS; row++) {
    const v = 1 - row / (ROWS - 1);
    for (let col = 0; col < COLUMNS; col++) {
      const u = col / (COLUMNS - 1);
      const index = row * COLUMNS + col;
      const value = depth[index];
      const proximity = Number.isFinite(value) ? Math.min(1, Math.max(0, (value - low) / (high - low))) : 0;
      // The model predicts relative inverse depth. Reproject along each pixel's camera ray.
      const distance = 1 / (0.25 + 0.75 * proximity);
      positions.push((u * 2 - 1) * halfHeight * ASPECT * distance, (v * 2 - 1) * halfHeight * distance, -distance);
      uv.push(u, v);
      if (row < ROWS - 1 && col < COLUMNS - 1) {
        const below = index + COLUMNS;
        indices.push(index, below, index + 1, index + 1, below, below + 1);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  return geometry;
}

export async function createPhotoSpace(canvas: HTMLCanvasElement, file: File, signal: AbortSignal) {
  const photo = await prepareOrbisReference(file);
  signal.throwIfAborted();
  const bitmap = await createImageBitmap(photo);
  const image = document.createElement("canvas");
  image.width = bitmap.width;
  image.height = bitmap.height;
  try {
    const ctx = image.getContext("2d");
    if (!ctx) throw new Error("Couldn’t read the reference photo.");
    ctx.drawImage(bitmap, 0, 0);
  } finally {
    bitmap.close();
  }

  const input = document.createElement("canvas");
  input.width = 448;
  input.height = 252;
  const ctx = input.getContext("2d");
  if (!ctx) throw new Error("Couldn’t prepare the photo for depth estimation.");
  ctx.drawImage(image, 0, 0, input.width, input.height);
  signal.throwIfAborted();
  const { width, height, values } = await estimateDepth(photo, ctx.getImageData(0, 0, input.width, input.height), signal);
  signal.throwIfAborted();
  const depths = Array.from({ length: COLUMNS * ROWS }, (_, index) => {
    const x = Math.round((index % COLUMNS) * (width - 1) / (COLUMNS - 1));
    const y = Math.round(Math.floor(index / COLUMNS) * (height - 1) / (ROWS - 1));
    return values[y * width + x];
  });
  const geometry = photoGeometry(depths);
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  } catch (error) {
    geometry.dispose();
    throw error;
  }
  renderer.setSize(REFERENCE_WIDTH, REFERENCE_HEIGHT, false);
  const texture = new CanvasTexture(image);
  texture.colorSpace = SRGBColorSpace;
  const material = new MeshBasicMaterial({ map: texture });
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));
  const camera = new PerspectiveCamera(FOV, ASPECT, 0.1, 10);

  function draw(amount: number) {
    // A short camera move stays close to pixels visible in the original photo.
    camera.zoom = 1 + Math.abs(amount) * 0.12;
    camera.updateProjectionMatrix();
    camera.position.set(amount * 0.075, 0, 0);
    camera.lookAt(0, 0, -2);
    renderer.render(scene, camera);
  }

  return {
    draw,
    capture(amount: number) {
      draw(amount);
      return referenceFile(canvas, "3D reference view.jpg");
    },
    dispose() {
      geometry.dispose();
      texture.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
