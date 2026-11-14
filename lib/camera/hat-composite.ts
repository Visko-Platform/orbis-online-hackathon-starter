import { HEIGHT, WIDTH } from "./ink";
import { matchHatViews, sampleHeight, sampleWidth } from "./hat-match";
import type { LockedHat } from "./locked-hat";
import { createSurfaceRenderer } from "./surface-renderer";
import { surfaceScene } from "./surface-scene";
import { rigidPose } from "./surface-pose";

export function compositeHat(video: HTMLVideoElement, target: HTMLCanvasElement, hat: LockedHat,
  report: (state: "tracking" | "lost" | "unavailable") => void, mirror?: HTMLCanvasElement | null) {
  let previousState = "";
  function status(state: "tracking" | "lost" | "unavailable") {
    if (previousState !== state) { previousState = state; report(state); }
  }
  const surface = createSurfaceRenderer(WIDTH, HEIGHT, () => status("unavailable"));
  if (!surface) return;
  const renderer = surface;
  const ctx = target.getContext("2d")!;
  const output = mirror?.getContext("2d");
  const sample = document.createElement("canvas");
  sample.width = sampleWidth;
  sample.height = sampleHeight;
  const input = sample.getContext("2d", { willReadFrequently: true })!;
  const match = matchHatViews(hat.views);
  let frame = 0;
  let time = -1;
  let pose: number[] | undefined;
  let x = 0, y = 0, scale = 1;
  let closed = false;
  // Reserve room above the generated picture for the fitted crown.
  const inset = 0.82;
  const pictureCenter = { x: WIDTH / 2, y: HEIGHT / 2 + 15 };

  function render() {
    if (closed) return;
    frame = video.requestVideoFrameCallback(render);
    if (video.readyState < 2 || !video.videoWidth || time === video.currentTime) return;
    time = video.currentTime;
    const ratio = Math.min(WIDTH / video.videoWidth, HEIGHT / video.videoHeight);
    const width = video.videoWidth * ratio, height = video.videoHeight * ratio;
    input.fillStyle = "#000";
    input.fillRect(0, 0, sampleWidth, sampleHeight);
    input.drawImage(video, (WIDTH - width) / 20, (HEIGHT - height) / 20, width / 10, height / 10);
    const thumbnail = input.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const aligned = match(thumbnail);
    const corner = (sampleWidth + 1) * 4;
    ctx.fillStyle = `rgb(${thumbnail[corner]} ${thumbnail[corner + 1]} ${thumbnail[corner + 2]})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(video, pictureCenter.x - width * inset / 2, pictureCenter.y - height * inset / 2,
      width * inset, height * inset);
    if (aligned && previousState !== "unavailable") {
      const weight = pose ? 0.42 : 1;
      x += (aligned.x - x) * weight;
      y += (aligned.y - y) * weight;
      scale += (aligned.scale - scale) * weight;
      pose = pose ? rigidPose(aligned.view.pose.map((value, i) => pose![i] + (value - pose![i]) * weight))
        : [...aligned.view.pose];
      const scene = surfaceScene({ hat: pose }, { x: WIDTH - pictureCenter.x - x * inset * WIDTH / sampleWidth,
        y: pictureCenter.y + y * inset * HEIGHT / sampleHeight }, aligned.view.focal * scale * inset);
      ctx.save();
      ctx.translate(WIDTH, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(renderer.draw(scene, hat.strokes), 0, 0);
      ctx.restore();
      status("tracking");
    } else if (previousState !== "unavailable") {
      pose = undefined;
      status("lost");
    }
    if (output) {
      output.clearRect(0, 0, WIDTH, HEIGHT);
      output.drawImage(target, 0, 0);
    }
  }

  if (!video.requestVideoFrameCallback) {
    status("unavailable");
    renderer.dispose();
    return;
  }
  render();
  return () => {
    closed = true;
    video.cancelVideoFrameCallback(frame);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    output?.clearRect(0, 0, WIDTH, HEIGHT);
    renderer.dispose();
  };
}
