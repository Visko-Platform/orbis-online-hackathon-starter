import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { ORBIS_PROMPT_MODEL } from "@/lib/orbis-prompt";

// Writes an Orbis prompt from a short idea and, optionally, the start image.
// Gemini writes it by default, with the GEMINI_API_KEY the Studio already
// needs. Claude writes it instead when ANTHROPIC_API_KEY is set.

const CLAUDE_PROMPT_MODEL = "claude-opus-5-5";
const MAX_IDEA_LENGTH = 2_000;
// Base64 length cap for the optional start image (about 3 MB of JPEG).
const MAX_IMAGE_BASE64_LENGTH = 4_000_000;

const SYSTEM_PROMPT = `You write prompts for Orbis, a real-time text-to-video
model that generates one continuous live shot and can be steered mid-run.

The user gives you a rough idea, sometimes only a few words. Expand it into one
production-ready video prompt of 50 to 100 words.

Describe concrete visual content in present tense: the subject and its
appearance, what it is doing, the setting, lighting, atmosphere, and how things
move. Keep it to a single continuous scene with no cuts, and a steady camera
unless the idea asks for camera movement. Stay faithful to the idea; add
detail that makes it vivid, not new plot. Prefer specific visual language over
vague adjectives. Do not mention on-screen text, logos, or audio.

Return only the prompt as plain text in one paragraph: no preamble, quotes,
Markdown, labels, or commentary.`;

// Orbis drifts away from its start image when the prompt describes a
// different-looking scene, so the prompt has to restate what the image shows.
const IMAGE_GROUNDING_PROMPT = `

A reference image is attached. Orbis starts the video from this exact frame.
Treat the image as authoritative for every visible subject's identity and
appearance, the environment, colors, lighting, weather, spatial layout, and
camera framing: describe them as they appear, and do not invent details that
contradict the image. Treat the idea as authoritative for what happens next.
Do not use meta-language such as "the image shows".`;

export const runtime = "nodejs";

const promptResponse = (prompt: string) =>
  NextResponse.json(
    { prompt },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );

async function writeWithGemini(apiKey: string, idea: string, image: string | null) {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: ORBIS_PROMPT_MODEL,
      contents: [
        { text: `Idea:\n${idea}` },
        ...(image
          ? [{ inlineData: { mimeType: "image/jpeg", data: image } }]
          : []),
      ],
      config: {
        systemInstruction: image
          ? SYSTEM_PROMPT + IMAGE_GROUNDING_PROMPT
          : SYSTEM_PROMPT,
        temperature: 0.4,
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
    const prompt = (response.text ?? "").trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "Gemini returned no prompt" },
        { status: 502 },
      );
    }
    return promptResponse(prompt);
  } catch (caught) {
    console.error("Gemini prompt generation failed", caught);
    const status = Number((caught as { status?: unknown })?.status) || 0;
    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "Google rejected GEMINI_API_KEY" },
        { status: 502 },
      );
    }
    if (status === 429) {
      return NextResponse.json(
        { error: "Gemini is rate limited; try again in a moment" },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: `Gemini request failed (${status || "network"})` },
      { status: 502 },
    );
  }
}

async function writeWithClaude(apiKey: string, idea: string, image: string | null) {
  try {
    const client = new Anthropic({ apiKey, timeout: 40_000, maxRetries: 1 });
    // Streamed, then collected, like the director route.
    const stream = client.messages.stream({
      model: CLAUDE_PROMPT_MODEL,
      max_tokens: 4_000,
      output_config: { effort: "low" },
      system: image ? SYSTEM_PROMPT + IMAGE_GROUNDING_PROMPT : SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...(image
              ? [
                  {
                    type: "image" as const,
                    source: {
                      type: "base64" as const,
                      media_type: "image/jpeg" as const,
                      data: image,
                    },
                  },
                ]
              : []),
            { type: "text" as const, text: `Idea:\n${idea}` },
          ],
        },
      ],
    });
    const response = await stream.finalMessage();

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "Claude declined to write a prompt for that idea" },
        { status: 422 },
      );
    }
    if (response.stop_reason === "max_tokens") {
      return NextResponse.json(
        { error: "Claude reached its output limit before finishing the prompt" },
        { status: 502 },
      );
    }

    const prompt = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "Claude returned no prompt" },
        { status: 502 },
      );
    }
    return promptResponse(prompt);
  } catch (caught) {
    console.error("Claude prompt generation failed", caught);
    if (caught instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Anthropic rejected ANTHROPIC_API_KEY" },
        { status: 502 },
      );
    }
    if (caught instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Claude is rate limited; try again in a moment" },
        { status: 429 },
      );
    }
    if (caught instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude request failed (${caught.status ?? "network"})` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Claude could not write a prompt" },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!anthropicKey && !geminiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    idea?: unknown;
    image?: unknown;
  } | null;
  const idea = typeof body?.idea === "string" ? body.idea.trim() : "";
  if (!idea) {
    return NextResponse.json(
      { error: "Describe an idea first" },
      { status: 400 },
    );
  }
  if (idea.length > MAX_IDEA_LENGTH) {
    return NextResponse.json(
      { error: `Keep the idea under ${MAX_IDEA_LENGTH} characters` },
      { status: 413 },
    );
  }

  let image: string | null = null;
  if (body?.image != null) {
    if (
      typeof body.image !== "string" ||
      !/^[A-Za-z0-9+/]+=*$/.test(body.image)
    ) {
      return NextResponse.json(
        { error: "The start image must be base64 JPEG data" },
        { status: 400 },
      );
    }
    if (body.image.length > MAX_IMAGE_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "The start image is too large" },
        { status: 413 },
      );
    }
    image = body.image;
  }

  return anthropicKey
    ? writeWithClaude(anthropicKey, idea, image)
    : writeWithGemini(geminiKey!, idea, image);
}
