import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import {
  ORBIS_MORPH_SYSTEM_INSTRUCTION,
  ORBIS_PROMPT_MODEL,
} from "@/lib/orbis-prompt";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 4_000;

export const runtime = "nodejs";

// Writes the prompt that morphs the running Orbis shot toward a cued image.
// Form fields: image (the cued image), currentPrompt (what is playing now),
// direction (optional: how the change should happen).
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const currentPrompt = formData.get("currentPrompt");
  const direction = formData.get("direction");

  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "A valid cue image is required" },
      { status: 400 },
    );
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "The image must be 10 MB or smaller" },
      { status: 413 },
    );
  }
  if (
    typeof currentPrompt !== "string" ||
    !currentPrompt.trim() ||
    currentPrompt.length > MAX_TEXT_CHARS
  ) {
    return NextResponse.json(
      { error: "The prompt that is currently playing is required" },
      { status: 400 },
    );
  }
  const directionText =
    typeof direction === "string" ? direction.trim().slice(0, MAX_TEXT_CHARS) : "";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: ORBIS_PROMPT_MODEL,
      contents: [
        { text: `Prompt playing now:\n${currentPrompt.trim()}` },
        {
          text: `Direction for the change:\n${
            directionText || "(none; transform gradually and naturally)"
          }`,
        },
        { text: "Target image:" },
        {
          inlineData: {
            mimeType: image.type,
            data: Buffer.from(await image.arrayBuffer()).toString("base64"),
          },
        },
      ],
      config: {
        systemInstruction: ORBIS_MORPH_SYSTEM_INSTRUCTION,
        temperature: 0.2,
        maxOutputTokens: 1_024,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    if (response.candidates?.[0]?.finishReason === "MAX_TOKENS") {
      return NextResponse.json(
        { error: "Gemini reached its output limit before finishing the prompt" },
        { status: 502 },
      );
    }

    let morphPrompt = "";
    try {
      morphPrompt = response.text?.trim() || "";
    } catch {
      // Gemini can reject text access when it returns no usable candidate.
    }
    if (!morphPrompt) {
      return NextResponse.json(
        { error: "Gemini returned no morph prompt" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { prompt: morphPrompt },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (caught) {
    console.error("Cue morph prompt failed", caught);
    return NextResponse.json(
      { error: "Gemini could not write a morph prompt for this image" },
      { status: 502 },
    );
  }
}
