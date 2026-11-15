import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Looks at one frame of the live video and says whether a character has
// actually appeared yet. Orbis takes 15–30 seconds to add a second person,
// so the app holds their dialogue until this says they are on screen.

// Gemini does the check by default, with GEMINI_API_KEY. Claude does it
// instead when ANTHROPIC_API_KEY is set.
const CHECK_MODEL = "claude-opus-5-5";
const GEMINI_CHECK_MODEL = "gemini-3.5-flash";
// A check is only useful if it is quick; a slow one is skipped.
const TIMEOUT_MS = 12_000;
const MAX_IMAGE_BASE64_LENGTH = 1_500_000;

const SCHEMA = {
  type: "object",
  properties: { visible: { type: "boolean" } },
  required: ["visible"],
  additionalProperties: false,
};

export const runtime = "nodejs";

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
    image?: unknown;
    look?: unknown;
    change?: unknown;
  } | null;
  const image = typeof body?.image === "string" ? body.image : "";
  const look = typeof body?.look === "string" ? body.look.trim() : "";
  const change = typeof body?.change === "string" ? body.change.trim() : "";
  if (
    (!look && !change) ||
    look.length > 200 ||
    change.length > 900 ||
    !/^[A-Za-z0-9+/]+=*$/.test(image) ||
    image.length > MAX_IMAGE_BASE64_LENGTH
  ) {
    return NextResponse.json(
      { error: "A JPEG frame and a character description are required" },
      { status: 400 },
    );
  }

  try {
    const question = change
      ? `This is one frame from an AI-generated film. The film was just asked to make this change: "${change}" Has the main new thing in that change appeared in the frame yet (the new object, person, weather or light it introduces)? Ignore the parts that only restate who or what was already there. Answer visible true or false.`
      : `This is one frame from an AI-generated film. Is this character clearly visible in the frame, as a recognisable person and not a distant or blurred background figure: ${look}? Small differences in clothing colour or hair are fine. Answer visible true or false.`;
    let text: string;

    if (anthropicKey) {
      const client = new Anthropic({
        apiKey: anthropicKey,
        timeout: TIMEOUT_MS,
        maxRetries: 0,
      });
      // Streamed, then collected, like the director route.
      const stream = client.messages.stream({
        model: CHECK_MODEL,
        max_tokens: 2_000,
        output_config: {
          effort: "low",
          format: { type: "json_schema", schema: SCHEMA },
        },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: image },
              },
              { type: "text", text: question },
            ],
          },
        ],
      });
      const response = await stream.finalMessage();
      text = response.content
        .flatMap((block) => (block.type === "text" ? [block.text] : []))
        .join("");
    } else {
      const ai = new GoogleGenAI({ apiKey: geminiKey! });
      const response = await ai.models.generateContent({
        model: GEMINI_CHECK_MODEL,
        contents: [
          { inlineData: { mimeType: "image/jpeg", data: image } },
          { text: question },
        ],
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: SCHEMA,
          maxOutputTokens: 200,
          thinkingConfig: { thinkingBudget: 0 },
          abortSignal: AbortSignal.timeout(TIMEOUT_MS),
        },
      });
      text = response.text ?? "";
    }
    const result = JSON.parse(text) as { visible?: boolean };
    return NextResponse.json(
      { visible: result.visible === true },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (caught) {
    console.error("Scene check failed", caught);
    return NextResponse.json(
      { error: "The scene check failed" },
      { status: 502 },
    );
  }
}
