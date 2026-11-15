import { GoogleGenAI, type Part } from "@google/genai";

import { profile } from "@/lib/server/profile";

// Hero stills and shots: frontier image model first, faster fallbacks after.
export const IMAGE_MODELS = {
  hero: ["gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"],
  shot: ["gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"],
  fast: ["gemini-3.1-flash-image", "gemini-2.5-flash-image"],
} as const;

export const TEXT_MODELS = ["gemini-3.5-flash", "gemini-2.5-flash"] as const;

let client: GoogleGenAI | null = null;
function ai() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return (client ??= new GoogleGenAI({ apiKey }));
}

export async function fileToPart(file: File): Promise<Part> {
  return {
    inlineData: {
      mimeType: file.type || "image/jpeg",
      data: Buffer.from(await file.arrayBuffer()).toString("base64"),
    },
  };
}

export type GeneratedImage = { data: Buffer; mimeType: string; model: string };

// Cap concurrent image generations (bulk pre-rendering + live users) to stay under rate limits.
const MAX_IMAGE_JOBS = Number(process.env.MAX_IMAGE_JOBS ?? 6);
let activeImageJobs = 0;
const imageQueue: (() => void)[] = [];
async function withImageSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeImageJobs >= MAX_IMAGE_JOBS) await new Promise<void>((r) => imageQueue.push(r));
  activeImageJobs++;
  try {
    return await fn();
  } finally {
    activeImageJobs--;
    imageQueue.shift()?.();
  }
}

export function generateImage(parts: Part[], models: readonly string[], imageSize: "1K" | "2K" | "4K" = "2K") {
  return withImageSlot(() => generateImageNow(parts, models, imageSize));
}

async function generateImageNow(
  parts: Part[],
  models: readonly string[],
  imageSize: "1K" | "2K" | "4K" = "2K",
): Promise<GeneratedImage> {
  const errors: string[] = [];
  for (const model of models) {
    const done = profile("gemini.image", { model, imageSize });
    try {
      const response = await ai().models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          responseModalities: ["IMAGE"],
          // imageSize is only honored by the Pro image model.
          imageConfig: model.includes("pro")
            ? { aspectRatio: "16:9", imageSize }
            : { aspectRatio: "16:9" },
        },
      });
      const out = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData?.data,
      )?.inlineData;
      if (out?.data) {
        done({ bytes: Math.round((out.data.length * 3) / 4) });
        return {
          data: Buffer.from(out.data, "base64"),
          mimeType: out.mimeType || "image/png",
          model,
        };
      }
      errors.push(`${model}: no image (${response.candidates?.[0]?.finishReason ?? "unknown"})`);
      done({ ok: false, error: "no image", finishReason: response.candidates?.[0]?.finishReason });
    } catch (caught) {
      errors.push(`${model}: ${caught instanceof Error ? caught.message.slice(0, 200) : String(caught)}`);
      done({ ok: false, error: caught instanceof Error ? caught.message.slice(0, 160) : String(caught) });
    }
  }
  throw new Error(`Image generation failed. ${errors.join(" | ")}`);
}

export async function generateText(
  systemInstruction: string,
  parts: Part[],
  maxOutputTokens = 600,
): Promise<string> {
  const errors: string[] = [];
  for (const model of TEXT_MODELS) {
    const done = profile("gemini.text", { model });
    try {
      const response = await ai().models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      const text = response.text?.trim();
      if (text) done({ chars: text.length });
      if (text) return text.replace(/^["'`]+|["'`]+$/g, "").trim();
      errors.push(`${model}: empty (${response.candidates?.[0]?.finishReason ?? "unknown"})`);
      done({ ok: false, error: "empty" });
    } catch (caught) {
      errors.push(`${model}: ${caught instanceof Error ? caught.message.slice(0, 200) : String(caught)}`);
      done({ ok: false, error: caught instanceof Error ? caught.message.slice(0, 160) : String(caught) });
    }
  }
  throw new Error(`Text generation failed. ${errors.join(" | ")}`);
}

/** JSON-mode text generation. Returns the parsed object (throws if no model produced valid JSON). */
export async function generateJson<T>(systemInstruction: string, parts: Part[], maxOutputTokens = 6000): Promise<T> {
  const errors: string[] = [];
  for (const model of TEXT_MODELS) {
    const done = profile("gemini.json", { model });
    try {
      const response = await ai().models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction,
          temperature: 0.5,
          maxOutputTokens,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      const text = (response.text ?? "").trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
      const parsed = JSON.parse(text) as T;
      done({ chars: text.length });
      return parsed;
    } catch (caught) {
      errors.push(`${model}: ${caught instanceof Error ? caught.message.slice(0, 200) : String(caught)}`);
      done({ ok: false, error: caught instanceof Error ? caught.message.slice(0, 160) : String(caught) });
    }
  }
  throw new Error(`JSON generation failed. ${errors.join(" | ")}`);
}

// ---- Prompt-writing instructions (from the Orbis prompt guide) ----

const RULES = `Rules for the live video model:
- Describe only what the camera sees, concretely, in present tense.
- No negation (never write "no X" or "without X"); state the positive.
- No vague intent words like "cinematic", "epic", "dynamic", "stunning"; describe light, motion, and camera instead.
- Photorealistic is the default; do not name a style unless asked.
- Return only the prompt as plain text: no labels, quotes, markdown, or commentary.`;

export const OPENING_SYSTEM = `You write the OPENING prompt for a real-time image-to-video model that animates a reference image.
Treat the image as authoritative for the subject's identity, clothing, colors, products, setting, and lighting.
Write 2-3 sentences, under 90 words: WHO (one concrete main subject) + WHAT they do + WHERE + camera (motion, angle, framing).
Use the requested motion for what happens next.
${RULES}`;

export const CHANGE_SYSTEM = `You write a FOLLOW-UP prompt that steers a live video already playing.
Express exactly ONE visible change as a state transition, in 1-2 sentences, under 45 words.
Refer to the subject the same way the current scene does. Keep everything else implied; do not restate the whole scene.
Bring new things in through an action, and move between places by travelling, never by jumping.
${RULES}`;

export const SHOT_STEER_SYSTEM = `A live video is playing. The attached image is the next SHOT the director wants: a new camera angle or scenario of the same subject.
Write ONE follow-up prompt (2 sentences, under 60 words) that transitions the live video into this shot: describe the camera move and the subject's new position, action, setting, and light as they appear in the image, as a smooth continuous transition.
Refer to the subject the same way the current scene does.
${RULES}`;
