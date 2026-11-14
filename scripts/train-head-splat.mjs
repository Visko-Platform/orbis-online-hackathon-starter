import { execFileSync, spawnSync } from "node:child_process";
import { closeSync, mkdirSync, openSync, readSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const [video, output] = process.argv.slice(2);
if (!video || !output) {
  console.error("Usage: node scripts/train-head-splat.mjs <orbit video> <new output directory>");
  process.exit(2);
}

const source = resolve(video);
const root = resolve(output);
const brush = process.env.HEAD_SPLAT_BRUSH || "brush";

function probe(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error?.code === "ENOENT") throw new Error(`Install ${command} before training. Use HEAD_SPLAT_BRUSH for the Brush executable path.`);
  if (result.error) throw result.error;
  return result.stdout + result.stderr;
}

function run(command, args) { execFileSync(command, args, { stdio: "inherit" }); }

function registeredImages(path) {
  const fd = openSync(path, "r");
  try {
    const header = Buffer.alloc(8);
    if (readSync(fd, header, 0, header.length, 0) !== header.length) throw new Error("Invalid COLMAP image model.");
    return Number(header.readBigUInt64LE());
  } finally {
    closeSync(fd);
  }
}

try {
  if (!existsSync(source) || !statSync(source).isFile()) throw new Error("Choose a recorded orbit video.");
  if (existsSync(root)) throw new Error("Choose a new output directory.");
  probe("ffmpeg", ["-version"]);
  const features = probe("colmap", ["feature_extractor", "-h"]);
  const matches = probe("colmap", ["sequential_matcher", "-h"]);
  const training = probe(brush, ["--help"]);
  const steps = training.includes("--total-train-iters") ? "--total-train-iters" :
    training.includes("--total-steps") ? "--total-steps" : undefined;
  if (!steps || !training.includes("--export-path")) throw new Error("Use a Brush CLI release that supports training and PLY export.");
  const images = join(root, "images");
  const sparse = join(root, "sparse");
  const database = join(root, "database.db");
  const exports = join(root, "exports");
  mkdirSync(images, { recursive: true });
  mkdirSync(sparse);
  mkdirSync(exports);
  run("ffmpeg", ["-nostdin", "-i", source, "-vf", "fps=4,scale=1280:1280:force_original_aspect_ratio=decrease", "-frames:v", "180", "-q:v", "2", join(images, "%05d.jpg")]);
  const frames = readdirSync(images).length;
  if (frames < 20) throw new Error("Record a longer orbit with overlapping angles.");
  run("colmap", ["feature_extractor", "--database_path", database, "--image_path", images,
    "--ImageReader.single_camera", "1", features.includes("--FeatureExtraction.use_gpu") ? "--FeatureExtraction.use_gpu" : "--SiftExtraction.use_gpu", "0"]);
  run("colmap", ["sequential_matcher", "--database_path", database,
    matches.includes("--FeatureMatching.use_gpu") ? "--FeatureMatching.use_gpu" : "--SiftMatching.use_gpu", "0"]);
  run("colmap", ["mapper", "--database_path", database, "--image_path", images, "--output_path", sparse]);
  const models = readdirSync(sparse).filter((name) => existsSync(join(sparse, name, "images.bin")));
  if (models.length !== 1) throw new Error("COLMAP could not join the orbit into one reconstruction. Check coverage, lighting, and motion.");
  const model = join(sparse, models[0]);
  const registered = registeredImages(join(model, "images.bin"));
  if (registered < 20 || registered < frames * 0.75) {
    throw new Error(`COLMAP registered ${registered} of ${frames} frames. Try a slower orbit with more overlap.`);
  }
  const dataset = join(root, "dataset");
  mkdirSync(dataset);
  run("colmap", ["image_undistorter", "--image_path", images, "--input_path", model,
    "--output_path", dataset, "--output_type", "COLMAP"]);
  run(brush, [dataset, steps, "10000", "--export-path", exports]);
  const assets = readdirSync(exports).filter((name) => name.endsWith(".ply"));
  if (!assets.length) throw new Error("Brush did not export a Gaussian PLY.");
  console.log("Import a trained Gaussian PLY from the output directory’s exports folder.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
