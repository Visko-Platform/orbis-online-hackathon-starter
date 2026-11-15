import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { CACHE_DIR } from "@/lib/server/cache";
import { generateJson } from "@/lib/server/gemini";

// Context-aware realtime controls: for the scene currently on screen, an LLM writes the five
// game-style inputs (up / left / right / down / action) as short steering prompts. Cached on disk by scene.

export type SceneControl = { key: "w" | "a" | "d" | "s" | " "; arrow: string; label: string; prompt: string };

const SYSTEM = `You design realtime game controls for a LIVE video that is playing right now. Given the current scene, write the five inputs a player
would use to drive THIS scene: up (forward/more), left, right, down (slow/stop/back), and action (the most fun signature move of this scene).
Each input has:
- "label": 1-2 words, max 12 characters, imperative (e.g. "Carve left", "Duck dive", "Look out", "Sit down", "Headlights").
- "prompt": ONE visible change the video model can show within a couple of seconds, present tense, 8-18 words, referring to the main subject the same way
  as the scene does ("the person", "the vehicle", "the camera" for walkthroughs). Small, continuous changes only: no location jumps, no cuts, no negation.
Return JSON: {"up":{"label":"","prompt":""},"left":{...},"right":{...},"down":{...},"action":{...}}`;

const ORDER: [string, SceneControl["key"], string][] = [
  ["up", "w", "↑"],
  ["left", "a", "←"],
  ["right", "d", "→"],
  ["down", "s", "↓"],
  ["action", " ", "␣"],
];

const memo = new Map<string, SceneControl[]>();
// Bulk pre-generation shares Gemini with live users: cap concurrent generations.
let active = 0;
const waiters: (() => void)[] = [];
async function slot<T>(fn: () => Promise<T>) {
  if (active >= 6) await new Promise<void>((r) => waiters.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiters.shift()?.();
  }
}
const file = (h: string) => path.join(CACHE_DIR, "controls", `${h}.json`);

export async function sceneControls(scene: string, hint = ""): Promise<SceneControl[]> {
  const h = createHash("sha256").update(`${hint}|${scene.trim()}`).digest("hex").slice(0, 16);
  const hit = memo.get(h);
  if (hit) return hit;
  try {
    const c = JSON.parse(await readFile(file(h), "utf8")) as SceneControl[];
    memo.set(h, c);
    return c;
  } catch {
    /* generate */
  }
  const out = await slot(() => generateJson<Record<string, { label?: string; prompt?: string }>>(
    SYSTEM,
    [{ text: `Scene type: ${hint || "unknown"}\nCurrent scene: ${scene.slice(0, 900)}` }],
    900,
  ));
  const controls = ORDER.map(([k, key, arrow]) => ({
    key,
    arrow,
    label: String(out[k]?.label ?? "").slice(0, 14) || k,
    prompt: String(out[k]?.prompt ?? "").slice(0, 220),
  })).filter((c) => c.prompt);
  if (controls.length < 5) throw new Error("incomplete controls");
  memo.set(h, controls);
  await mkdir(path.dirname(file(h)), { recursive: true });
  await writeFile(file(h), JSON.stringify(controls)).catch(() => undefined);
  return controls;
}
