import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

import {
  ORBIS_PROMPT_MODEL,
  ORBIS_PROMPT_SYSTEM_INSTRUCTION,
} from "@/lib/orbis-prompt";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "orbis-prompt", 6);
  if (blocked) return blocked;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const payload = await readBoundedBody(request, MAX_IMAGE_BYTES + 64 * 1024);
  if ("error" in payload) return payload.error;
  const formData = await payload.body.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }
  const image = formData.get("image");
  const prompt = formData.get("prompt");
  const environmentJson = formData.get("environment");
  const environment = typeof environmentJson === "string" ? JSON.parse(environmentJson) : null;

  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "A valid reference image is required" },
      { status: 400 },
    );
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "The image must be 10 MB or smaller" },
      { status: 413 },
    );
  }
  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json(
      { error: "A user prompt is required" },
      { status: 400 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const environmentText = environment ? `
Target environment: ${environment.description}
Environment motion: ${environment.motion}
Panoramic/360 mode: ${environment.is360 ? "Enabled (allow camera panning/wide views)" : "Disabled (steady camera)"}
` : "";

    const response = await ai.models.generateContent({
      model: ORBIS_PROMPT_MODEL,
      contents: [
        {
          text: `Requested motion:\n${prompt.trim()}\n${environmentText}`,
        },
        {
          inlineData: {
            mimeType: image.type,
            data: Buffer.from(await image.arrayBuffer()).toString("base64"),
          },
        },
      ],
      config: {
        systemInstruction: ORBIS_PROMPT_SYSTEM_INSTRUCTION,
        temperature: 0.2,
        maxOutputTokens: 1_024,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS") {
      return NextResponse.json(
        {
          error: "Gemini reached its output limit before finishing the prompt",
        },
        { status: 502 },
      );
    }

    let groundedPrompt = "";
    try {
      groundedPrompt = response.text?.trim() || "";
    } catch {
      // Gemini can reject text access when it returns no usable candidate.
    }
    if (!groundedPrompt) {
      return NextResponse.json(
        { error: "Gemini returned no grounded prompt" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { prompt: groundedPrompt },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (caught) {
    console.error("Orbis prompt analysis failed", caught);
    return NextResponse.json(
      { error: "Gemini could not analyze the image and user prompt" },
      { status: 502 },
    );
  }
}
