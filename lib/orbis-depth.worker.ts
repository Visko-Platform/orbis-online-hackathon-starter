import { env, pipeline, RawImage } from "@huggingface/transformers";

env.allowLocalModels = false;
if (env.backends.onnx.wasm) env.backends.onnx.wasm.numThreads = 1;

self.addEventListener("message", async ({ data: image }: MessageEvent<ImageData>) => {
  try {
    const estimate = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small",
      { device: "wasm", dtype: "q8" });
    const output = await estimate(new RawImage(image.data, image.width, image.height, 4));
    const { predicted_depth: depth } = Array.isArray(output) ? output[0] : output;
    const [height, width] = depth.dims;
    const values = Float32Array.from(depth.data, Number);
    self.postMessage({ width, height, values }, { transfer: [values.buffer] });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : "Couldn’t estimate photo depth." });
  }
});
