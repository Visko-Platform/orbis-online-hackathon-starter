import { GoogleGenAI, type Part, ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";

import { overDailyBudget, recordFailure, recordUsage } from "@/lib/gemini-usage";

import {
  DIRECTOR_RESPONSE_SCHEMA,
  DIRECTOR_SYSTEM_INSTRUCTION,
  type DirectorBeat,
  type DirectorRequest,
  describeTurn,
  openThreads,
} from "@/lib/drama/director";

export const runtime = "nodejs";

// Tried in order: Gemini flash models get 503 "high demand" spikes, and a
// stalled call kills the scene, so each gets a deadline before we fall back.
const DIRECTOR_MODELS = (
  process.env.DIRECTOR_MODELS ||
  "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-lite-latest"
)
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const MODEL_DEADLINE_MS = 9_000;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

// Accepts multipart form data: "state" (DirectorRequest JSON) plus an optional
// "audio" blob of the player's spoken line. One Gemini call both transcribes
// the line and writes the next beat, which saves a round trip.
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  const form = await request.formData();
  const rawState = form.get("state");
  if (typeof rawState !== "string") {
    return NextResponse.json({ error: "state is required" }, { status: 400 });
  }
  const state = JSON.parse(rawState) as DirectorRequest;
  const audio = form.get("audio");

  const parts: Part[] = [{ text: describeTurn(state) }];
  if (audio instanceof File && audio.size > 0) {
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audio clip is too long" }, { status: 413 });
    }
    parts.push({
      inlineData: {
        mimeType: (audio.type || "audio/webm").split(";")[0],
        data: Buffer.from(await audio.arrayBuffer()).toString("base64"),
      },
    });
  } else if (!state.playerText && !state.silence) {
    return NextResponse.json({ error: "Say something first" }, { status: 400 });
  }

  if (await overDailyBudget()) {
    return NextResponse.json(
      { error: "Gemini daily budget reached (GEMINI_DAILY_BUDGET_USD)." },
      { status: 429 },
    );
  }
  const ai = new GoogleGenAI({ apiKey });
  const override =
    process.env.NODE_ENV === "development"
      ? request.headers.get("x-director-model")
      : null;
  const models = override ? [override] : DIRECTOR_MODELS;
  let lastError: unknown;
  for (const model of models) {
    const started = Date.now();
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: DIRECTOR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: DIRECTOR_RESPONSE_SCHEMA,
          temperature: 0.9,
          maxOutputTokens: 2_048,
          thinkingConfig: model.startsWith("gemini-2.5")
            ? { thinkingBudget: 0 }
            : {
                thinkingLevel: model.includes("lite")
                  ? ThinkingLevel.MINIMAL
                  : ThinkingLevel.LOW,
              },
          abortSignal: AbortSignal.timeout(MODEL_DEADLINE_MS),
        },
      });
      void recordUsage("director", model, response.usageMetadata);
      const beat = JSON.parse(response.text ?? "") as DirectorBeat;
      if (!beat.orbisPrompt || !Array.isArray(beat.lines)) {
        throw new Error("Director returned an incomplete beat");
      }
      beat.ending ??= null;
      // Never end while the queen is chasing a truth that hasn't paid off:
      // the reveal is the reward for playing well. The client's turn limit
      // still ends the story eventually.
      const stillHidden = openThreads(
        state,
        beat.lines.filter((line) => line.speaker !== "queen").map((line) => line.text),
      );
      // Past the queen's 6th line the story ends regardless.
      // Taking off the crown is the player's own choice to end it.
      const walksOut = /takes off her crown/i.test(state.playerText ?? "");
      if (beat.ending && stillHidden.length && state.turn < 6 && !walksOut) {
        console.log(`director: holding the ending, still hidden: ${stillHidden.join(", ")}`);
        beat.ending = null;
      }
      console.log(`director ${model} ${Date.now() - started}ms heard="${beat.heard}"`);
      return NextResponse.json(beat, { headers: { "Cache-Control": "no-store" } });
    } catch (caught) {
      void recordFailure("director", model);
      lastError = caught;
      console.warn(
        `director ${model} failed after ${Date.now() - started}ms:`,
        caught instanceof Error ? caught.message.slice(0, 160) : caught,
      );
    }
  }
  console.error("Director failed on every model", lastError);
  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  if (reason.includes('"code":402')) {
    return NextResponse.json(
      { error: "Gemini prepaid credits are used up. Top up the project in AI Studio." },
      { status: 402 },
    );
  }
  return NextResponse.json(
    { error: "The director lost the thread. Say it again." },
    { status: 502 },
  );
}
