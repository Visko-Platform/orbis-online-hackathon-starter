import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";

// Gemini spend ledger. Every call appends one JSON line to .gemini-usage.jsonl
// (gitignored) with its token counts and an estimated cost at PAID-tier rates.
// On the free tier Google charges nothing, but the estimate shows what the same
// traffic will cost once billing is on. Rates are USD per 1M tokens, from
// https://ai.google.dev/gemini-api/docs/pricing (checked 2026-11-14).
const RATES: Record<string, { input: number; audioInput?: number; output: number }> = {
  "gemini-3.5-flash-lite": { input: 0.3, output: 2.5 },
  "gemini-3.1-flash-lite": { input: 0.25, audioInput: 0.5, output: 1.5 },
  "gemini-flash-lite-latest": { input: 0.3, output: 2.5 },
  "gemini-3.8-flash-tts": { input: 0.5, output: 9 },
  "gemini-3.8-flash-lite-tts": { input: 0.5, output: 6 },
  "gemini-3.1-flash-tts-preview": { input: 1, output: 20 },
  "gemini-2.5-flash-preview-tts": { input: 0.5, output: 10 },
  "gemini-3.1-flash-image": { input: 0.5, output: 60 },
  "gemini-2.5-flash-image": { input: 0.3, output: 30 },
};
const FALLBACK_RATE = { input: 1, output: 20 }; // deliberately high for unknown models

const LEDGER = path.join(process.cwd(), ".gemini-usage.jsonl");

export const DAILY_BUDGET_USD = Number(process.env.GEMINI_DAILY_BUDGET_USD || 5);

type UsageMetadata = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
  promptTokensDetails?: { modality?: string; tokenCount?: number }[];
};

export type UsageEntry = {
  at: string;
  route: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  usd: number;
  ok: boolean;
};

export function estimateUsd(model: string, usage: UsageMetadata | undefined) {
  const rate = RATES[model] ?? FALLBACK_RATE;
  const audioIn =
    usage?.promptTokensDetails?.find((d) => d.modality === "AUDIO")?.tokenCount ?? 0;
  const input = usage?.promptTokenCount ?? 0;
  const output = (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0);
  const usd =
    ((input - audioIn) * rate.input +
      audioIn * (rate.audioInput ?? rate.input) +
      output * rate.output) /
    1_000_000;
  return { input, output, usd };
}

export async function recordUsage(
  route: string,
  model: string,
  usage: UsageMetadata | undefined,
  ok = true,
) {
  const { input, output, usd } = estimateUsd(model, usage);
  const entry: UsageEntry = {
    at: new Date().toISOString(),
    route,
    model,
    inputTokens: input,
    outputTokens: output,
    usd,
    ok,
  };
  try {
    await appendFile(LEDGER, `${JSON.stringify(entry)}\n`);
  } catch (caught) {
    console.warn("Could not write Gemini usage ledger", caught);
  }
  return entry;
}

// Rate-limit errors also count as requests (they burn quota, not money).
export async function recordFailure(route: string, model: string) {
  return recordUsage(route, model, undefined, false);
}

export async function readUsage() {
  let lines: string[] = [];
  try {
    lines = (await readFile(LEDGER, "utf8")).split("\n").filter(Boolean);
  } catch {
    // No ledger yet.
  }
  const entries = lines.flatMap((line) => {
    try {
      return [JSON.parse(line) as UsageEntry];
    } catch {
      return [];
    }
  });
  const today = new Date().toLocaleDateString("en-CA");
  const isToday = (entry: UsageEntry) =>
    new Date(entry.at).toLocaleDateString("en-CA") === today;

  const summarize = (list: UsageEntry[]) => {
    const byModel: Record<string, { calls: number; failed: number; usd: number }> = {};
    for (const entry of list) {
      const row = (byModel[entry.model] ??= { calls: 0, failed: 0, usd: 0 });
      row.calls += 1;
      if (!entry.ok) row.failed += 1;
      row.usd += entry.usd;
    }
    return {
      usd: list.reduce((sum, entry) => sum + entry.usd, 0),
      calls: list.filter((entry) => entry.ok).length,
      failed: list.filter((entry) => !entry.ok).length,
      byModel,
    };
  };

  return {
    today: summarize(entries.filter(isToday)),
    allTime: summarize(entries),
    dailyBudgetUsd: DAILY_BUDGET_USD,
  };
}

export async function overDailyBudget() {
  const { today } = await readUsage();
  return today.usd >= DAILY_BUDGET_USD;
}
