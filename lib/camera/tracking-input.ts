export function sendTrackingFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement,
  worker: Worker, size: number, time: number, options: Record<string, unknown>, fail: () => void) {
  const scale = Math.min(1, size / Math.max(video.videoWidth, video.videoHeight));
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const context = canvas.getContext("2d");
  if (!context) { fail(); return; }
  context.drawImage(video, 0, 0, width, height);
  void createImageBitmap(canvas).then((image) => {
    try {
      worker.postMessage({ image, time, ...options }, [image]);
    } catch {
      image.close();
      fail();
    }
  }).catch(fail);
}
