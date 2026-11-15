// Render the scenes' opening frames with Nano Banana into public/scenes.
// Usage: node --experimental-strip-types scripts/generate-scenes.mjs [dinner|hunt|chamber]
import { GoogleGenAI } from "@google/genai";
import nextEnv from "@next/env";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

import { OPENING_IMAGE_PROMPTS } from "../lib/drama/cast.ts";

nextEnv.loadEnvConfig(process.cwd());
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.SCENE_IMAGE_MODEL || "gemini-3.1-flash-image";
const only = process.argv[2];

mkdirSync("public/scenes", { recursive: true });
for (const [act, prompt] of Object.entries(OPENING_IMAGE_PROMPTS)) {
  if (only && only !== act) continue;
  const t0 = Date.now();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ text: prompt }],
    config: { imageConfig: { aspectRatio: "16:9" } },
  });
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((p) => p.inlineData?.data)?.inlineData;
  if (!image) {
    console.error(act, "no image:", parts.map((p) => p.text).join(" "), response.candidates?.[0]?.finishReason);
    continue;
  }
  const ext = image.mimeType?.includes("jpeg") ? "jpg" : "png";
  writeFileSync(`public/scenes/${act}.${ext}`, Buffer.from(image.data, "base64"));
  // Orbis wants ~854x480. Full-size frames (~800 KB) upload slowly enough over
  // the session's data channel that the start command can time out.
  execFileSync("sips", ["-z", "480", "854", "-s", "format", "jpeg", "-s", "formatOptions", "82", `public/scenes/${act}.${ext}`]);
  console.log(act, `public/scenes/${act}.${ext}`, `${Date.now() - t0}ms`);
}
