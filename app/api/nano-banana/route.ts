import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

import {
  NANO_BANANA_MODEL,
  NANO_BANANA_PROMPT,
} from "@/lib/nano-banana";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "nano-banana", 6);
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
  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    return NextResponse.json({ error: "Choose a valid image file" }, { status: 400 });
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "The image must be 10 MB or smaller" },
      { status: 413 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: NANO_BANANA_MODEL,
      contents: [
        { text: NANO_BANANA_PROMPT },
        {
          inlineData: {
            mimeType: image.type,
            data: Buffer.from(await image.arrayBuffer()).toString("base64"),
          },
        },
      ],
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const output = parts.find((part) => part.inlineData?.data)?.inlineData;
    if (!output?.data) {
      return NextResponse.json(
        { error: "Nano Banana returned no edited image" },
        { status: 502 },
      );
    }

    return new Response(Buffer.from(output.data, "base64"), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": output.mimeType || "image/png",
      },
    });
  } catch (caught) {
    console.error("Nano Banana image edit failed", caught);
    return NextResponse.json(
      { error: "Nano Banana could not edit the image" },
      { status: 502 },
    );
  }
}
