import { SparkRenderer, SplatEdit, SplatEditSdf, SplatEditSdfType, SplatMesh } from "@sparkjsdev/spark";
import {
  BufferGeometry, CanvasTexture, Color, DoubleSide, Float32BufferAttribute, Group,
  Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
} from "three";
import { HEIGHT, WIDTH, type Ink } from "./ink";
import { surfaces } from "./surface-mesh";
import { atlasStroke, inkTextureSize } from "./surface-renderer";
import { surfaceScene, type SurfaceScene } from "./surface-scene";
import { sampleHeight, sampleWidth } from "./hat-match";
import type { HatView } from "./locked-hat";

export type HeadFit = {
  yaw: number; pitch: number; roll: number;
  size: number; hatHeight: number; hatDepth: number; hatSize: number;
  headX: number; headY: number; headZ: number; crop: number;
};
export const defaultHeadFit: HeadFit = {
  yaw: 0, pitch: 0, roll: 0, size: 1, headX: 0, headY: 0, headZ: 0,
  hatHeight: 0, hatDepth: 0, hatSize: 1, crop: 32,
};
export type HeadOrbit = { azimuth: number; elevation: number };

function hatMesh(ink: Ink, index: number) {
  const source = surfaces.hat[index];
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(source.vertices.flatMap(({ position }) => position), 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(source.vertices.flatMap(({ u, v }) => [u, 1 - v]), 2));
  geometry.setIndex(source.indices);
  const atlas = document.createElement("canvas");
  atlas.width = atlas.height = inkTextureSize;
  const ctx = atlas.getContext("2d")!;
  const background = index === 0 ? "#41485c" : "#2e3342";
  const texture = new CanvasTexture(atlas);
  texture.colorSpace = SRGBColorSpace;
  const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
  const mesh = new Mesh(geometry, material);

  return {
    mesh,
    update() {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, atlas.width, atlas.height);
      for (const { color, points } of ink.hatStrokes) {
        points.forEach((point, i) => {
          if (point?.mesh === index) atlasStroke(ctx, color, source, point, points[i - 1]);
        });
      }
      texture.needsUpdate = true;
    },
    dispose() { geometry.dispose(); texture.dispose(); material.dispose(); },
  };
}

export async function createHeadSplat(canvas: HTMLCanvasElement, file: File, ink: Ink) {
  const renderer = new WebGLRenderer({ canvas, antialias: false });
  renderer.setSize(WIDTH, HEIGHT, false);
  const scene = new Scene();
  scene.background = new Color("#55585d");
  const camera = new PerspectiveCamera(38, WIDTH / HEIGHT, 0.5, 500);
  const head = new Group();
  const hat = new Group();
  const spark = new SparkRenderer({ renderer, autoUpdate: false });
  const hats = surfaces.hat.map((_, i) => hatMesh(ink, i));
  for (const piece of hats) hat.add(piece.mesh);
  scene.add(spark, head, hat);
  let splat: SplatMesh | undefined;

  function dispose() {
    splat?.dispose();
    spark.dispose();
    hats.forEach((item) => item.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
  }

  try {
    splat = new SplatMesh({ fileBytes: await file.arrayBuffer(), fileName: file.name, lod: false });
    await splat.initialized;
    const bounds = splat.getBoundingBox(true);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const extent = Math.max(size.x, size.y, size.z);
    if (bounds.isEmpty() || !Number.isFinite(extent) || extent <= 0) throw new Error("The file contains no usable Gaussian splats.");
    const scale = 20 / extent;
    head.add(splat);
    splat.position.copy(center).negate();
    const crop = new SplatEditSdf({ type: SplatEditSdfType.SPHERE, invert: true, opacity: 0, radius: 32 });
    const edit = new SplatEdit({ sdfs: [crop], softEdge: 0.15 });
    scene.add(edit);
    let drawingScene: SurfaceScene | undefined;

    async function draw(fit: HeadFit, { azimuth, elevation }: HeadOrbit, showHat: boolean, target: HTMLCanvasElement) {
        const radians = Math.PI / 180;
        const yaw = azimuth * radians, tilt = elevation * radians;
        camera.position.set(55 * Math.sin(yaw) * Math.cos(tilt), 55 * Math.sin(tilt) + 5, 55 * Math.cos(yaw) * Math.cos(tilt));
        camera.lookAt(0, 5, 0);
        head.rotation.set(fit.pitch * radians, fit.yaw * radians, fit.roll * radians, "YXZ");
        head.scale.setScalar(scale * fit.size);
        hat.position.set(0, fit.hatHeight, fit.hatDepth);
        hat.scale.setScalar(fit.hatSize);
        hat.visible = showHat;
        if (showHat) hats.forEach((piece) => piece.update());
        head.position.set(fit.headX, fit.headY - 1.5, fit.headZ - 1.5);
        crop.radius = fit.crop;
        await spark.update({ scene, camera });
        renderer.render(scene, camera);
        const cameraHat = new Matrix4().multiplyMatrices(camera.matrixWorldInverse, hat.matrixWorld);
        const focal = HEIGHT / (2 * Math.tan(camera.fov * radians / 2));
        drawingScene = showHat ? surfaceScene({ hat: cameraHat.elements }, { x: WIDTH / 2, y: HEIGHT / 2 }, focal) : undefined;
        target.getContext("2d")!.drawImage(canvas, 0, 0);
        return { pose: cameraHat.elements, focal };
    }

    return {
      get drawingScene() { return drawingScene; },
      draw,
      async captureLocked(fit: HeadFit, orbit: HeadOrbit) {
        const still = document.createElement("canvas");
        still.width = WIDTH;
        still.height = HEIGHT;
        const sample = document.createElement("canvas");
        sample.width = sampleWidth;
        sample.height = sampleHeight;
        const ctx = sample.getContext("2d", { willReadFrequently: true })!;
        const views: HatView[] = [];
        const preview = drawingScene;
        try {
          for (const angle of [-36, -30, -24, -18, -12, -6, 6, 12, 18, 24, 30, 36, 0]) {
            const view = await draw(fit, { azimuth: orbit.azimuth + angle, elevation: orbit.elevation }, false, still);
            ctx.drawImage(still, 0, 0, sampleWidth, sampleHeight);
            views.push({ ...view, angle, pixels: ctx.getImageData(0, 0, sampleWidth, sampleHeight).data });
          }
          return { still, views };
        } finally {
          drawingScene = preview;
        }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
