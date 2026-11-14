// Pre-generate a 16:9 opening frame for every charted world, so launches are
// image-anchored (Orbis holds composition far better from an image than from
// text alone; set_image only works at the start of a run).
//
//   node --no-warnings scripts/generate-openers.mjs [--force] [world-id ...]
//
// Reads GEMINI_API_KEY from .env.local. Writes public/worlds/<id>.jpg and
// skips worlds that already have a frame unless --force is given.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const { DESTINATIONS, ORIGIN, sceneOf } = await import("../lib/starship.ts");

const MODEL = "gemini-3.1-flash-image";
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((arg) => !arg.startsWith("--"));

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const key = env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1]?.trim();
if (!key) throw new Error("GEMINI_API_KEY missing from .env.local");

const outDir = new URL("../public/worlds/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const worlds = [ORIGIN, ...DESTINATIONS].filter(
  (world) => !only.length || only.includes(world.id),
);

async function generate(world) {
  const file = new URL(`${world.id}.jpg`, outDir);
  if (existsSync(file) && !force) return `skip ${world.id} (exists)`;
  const prompt = [
    "A cinematic, photorealistic 16:9 film frame from a camera flying low and straight ahead.",
    sceneOf(world),
    "Wide-angle, rich detail in the foreground, midground and far background, natural atmospheric depth.",
    "No aircraft, spaceships, vehicles, cockpit, window frames, text, logos, or people looking at the camera.",
  ].join(" ");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
      }),
    },
  );
  const json = await response.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!response.ok || !part) {
    return `FAIL ${world.id}: ${response.status} ${JSON.stringify(json).slice(0, 160)}`;
  }
  writeFileSync(file, Buffer.from(part.inlineData.data, "base64"));
  return `ok   ${world.id}`;
}

// Three at a time.
const queue = [...worlds];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (queue.length) console.log(await generate(queue.shift()));
  }),
);
