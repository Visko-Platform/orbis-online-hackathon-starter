import { GoogleGenAI } from "@google/genai";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { voiceFor } from "@/lib/drama/voices";
import { overDailyBudget, recordFailure, recordUsage } from "@/lib/gemini-usage";

export const runtime = "nodejs";

// Gemini TTS models, tried in order (each has its own quota).
const TTS_MODELS = (
  process.env.TTS_MODELS ||
  "gemini-3.8-flash-tts,gemini-3.8-flash-lite-tts,gemini-3.1-flash-tts-preview,gemini-2.5-flash-preview-tts"
)
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

// Voice cache: each (speaker, delivery, text) is synthesized once and served
// from disk after that. Gemini TTS has a daily request cap per project (it ran
// out after ~400 lines of testing), and scripted lines repeat on every run, so
// a full run's openings, clues and hooks cost nothing the second time.
const CACHE_DIR = path.join(process.cwd(), ".tts-cache");
const cacheKey = (speaker: string, delivery: string, text: string) =>
  createHash("sha256").update(`gemini|${speaker}|${delivery}|${text}`).digest("hex").slice(0, 32);

// Once a model says its DAILY quota is gone, skip it until local midnight
// instead of paying a round trip per line to hear "429" again.
const exhaustedUntil = new Map<string, number>();
const nextMidnight = () => {
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  return date.getTime();
};

// Google lists every quota in a 429, daily ones included, even when only the
// per-minute limit was hit, so the metric names can't be trusted. The retry
// delay can: a daily limit asks for hours, a per-minute one for seconds.
const isDailyQuotaError = (caught: unknown) => {
  const message = caught instanceof Error ? caught.message : String(caught);
  if (!message.includes("429")) return false;
  const delay = message.match(/"retryDelay"\s*:\s*"(\d+)s"/) ?? message.match(/retry in (\d+)h/i);
  if (!delay) return false;
  const seconds = delay[0].includes("h") ? Number(delay[1]) * 3600 : Number(delay[1]);
  return seconds >= 600;
};

// Gemini TTS returns raw 16-bit mono PCM at 24 kHz; wrap it in a WAV header.
function pcmToWav(pcm: Buffer, sampleRate = 24_000) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

const wavResponse = (bytes: Buffer, model: string) =>
  new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store", "X-TTS-Model": model },
  });

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }
  const body = (await request.json()) as { text?: string; speaker?: string; delivery?: string };
  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });
  const speaker = body.speaker || "narrator";
  const delivery = body.delivery?.trim() || "";

  const key = cacheKey(speaker, delivery, text);
  const cached = await readFile(path.join(CACHE_DIR, `${key}.wav`)).catch(() => null);
  if (cached) return wavResponse(cached, "cache");

  if (await overDailyBudget()) {
    return NextResponse.json(
      { error: "Gemini daily budget reached (GEMINI_DAILY_BUDGET_USD)." },
      { status: 429 },
    );
  }

  const available = TTS_MODELS.filter((model) => (exhaustedUntil.get(model) ?? 0) < Date.now());
  if (!available.length) {
    // The client falls back to the browser's own voice.
    return NextResponse.json(
      { error: "Every Gemini TTS model is out of daily quota", fallback: "browser" },
      { status: 503 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const direction = delivery ? `Say it ${delivery}: ` : "";
  for (const model of available) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: `${direction}${text}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceFor(speaker) } },
          },
          abortSignal: AbortSignal.timeout(8_000),
        },
      });
      void recordUsage("tts", model, response.usageMetadata);
      const data = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)
        ?.inlineData?.data;
      if (!data) throw new Error("no audio in response");
      const wav = pcmToWav(Buffer.from(data, "base64"));
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(path.join(CACHE_DIR, `${key}.wav`), wav).catch(() => undefined);
      return wavResponse(wav, model);
    } catch (caught) {
      void recordFailure("tts", model);
      if (isDailyQuotaError(caught)) exhaustedUntil.set(model, nextMidnight());
      console.warn(`tts ${model} failed:`, caught instanceof Error ? caught.message.slice(0, 120) : caught);
    }
  }
  return NextResponse.json({ error: "TTS failed on every model", fallback: "browser" }, { status: 502 });
}
