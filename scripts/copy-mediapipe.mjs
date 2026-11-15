// postinstall: copy MediaPipe's wasm runtime into public/ so the browser can
// load it. (Kept out of git: it's 30 MB and comes from node_modules anyway.)
import { cpSync, existsSync, mkdirSync } from "node:fs";

const from = "node_modules/@mediapipe/tasks-vision/wasm";
if (existsSync(from)) {
  mkdirSync("public/mediapipe", { recursive: true });
  cpSync(from, "public/mediapipe/wasm", { recursive: true });
}
