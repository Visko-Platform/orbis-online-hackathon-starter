import { GoogleGenAI } from "@google/genai";
import { INTENT_INSTRUCTION, PROMPT_LIMIT, intentSchema, readIntentResult, type DesignIntent } from "@/lib/looks/intent";
import { ORBIS_PROMPT_MODEL } from "@/lib/orbis-prompt";
import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

function isText(value: unknown, limit = PROMPT_LIMIT): value is string {
  return typeof value === "string" && value.length <= limit;
}

function isIntent(value: unknown): value is DesignIntent {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<DesignIntent>;
  return (input.mode === "prepare" || input.mode === "plan" || input.mode === "steer") &&
    isText(input.text) && !!input.text.trim() &&
    (input.garment === undefined || isText(input.garment, 64)) &&
    (input.previous === undefined || isText(input.previous)) &&
    (input.sceneContext === undefined || input.mode === "steer" && isText(input.sceneContext)) &&
    (input.turns === undefined || Array.isArray(input.turns) && input.turns.length <= 3 &&
      input.turns.every((turn) => turn && isText(turn.question) && isText(turn.answer))) &&
    (input.garments === undefined || Array.isArray(input.garments) && input.garments.length <= 24 &&
      input.garments.every((garment) => garment && isText(garment.id, 64) && isText(garment.name, 64) && isText(garment.prompt)));
}

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "looks-plan", 30);
  if (blocked) return blocked;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Configure GEMINI_API_KEY to use the planner." }, { status: 503 });
  const payload = await readBoundedBody(request, 192 * 1024);
  if ("error" in payload) return payload.error;
  const input: unknown = await payload.body.json().catch(() => null);
  if (!isIntent(input)) return Response.json({ error: "Enter a design or steering instruction." }, { status: 400 });
  try {
    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { timeout: 20_000 } });
    const response = await ai.models.generateContent({ model: ORBIS_PROMPT_MODEL, contents: JSON.stringify(input),
      config: { systemInstruction: INTENT_INSTRUCTION, responseMimeType: "application/json", responseJsonSchema: intentSchema,
        abortSignal: request.signal } });
    const result = readIntentResult(JSON.parse(response.text || "null"), input);
    if (result) return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch { /* Use a reviewable manual draft when planning is unavailable. */ }
  return Response.json({ error: "The planner couldn’t resolve this request. You can edit it directly." }, { status: 502 });
}
