import { GoogleGenAI } from "@google/genai";
import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "looks-transcribe", 20);
  if (blocked) return blocked;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Configure GEMINI_API_KEY to use voice." }, { status: 503 });
  const limit = 2 * 1024 * 1024;
  const payload = await readBoundedBody(request, limit + 8192);
  if ("error" in payload) return payload.error;
  const data = await payload.body.formData().catch(() => null);
  const audio = data?.get("audio");
  const mime = audio instanceof File ? audio.type.split(";")[0].trim().toLowerCase() : "";
  if (!(audio instanceof File) || !audio.size || audio.size > limit ||
      !["audio/webm", "audio/ogg", "audio/mp4", "audio/m4a", "audio/wav"].includes(mime)) {
    return Response.json({ error: "Record a short audio clip." }, { status: 400 });
  }
  const timeout = AbortSignal.timeout(18_000);
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const result = await ai.interactions.create({
      model: "gemini-3.5-transcribe",
      input: [{ type: "audio", mime_type: mime === "audio/mp4" ? "audio/m4a" : mime,
        data: Buffer.from(await audio.arrayBuffer()).toString("base64") }],
      store: false,
    }, {
      signal: AbortSignal.any([request.signal, timeout]),
      retries: { strategy: "attempt-count-backoff", maxRetries: 1, retryConnectionErrors: true },
      retry_codes: ["500", "502", "503", "504"],
    });
    if (result.status !== "completed") throw new Error("Transcription did not complete.");
    return Response.json({ transcript: result.output_text?.trim() ?? "" }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    if (timeout.aborted) {
      return Response.json({ error: "Transcription took too long. Try again." }, { status: 504 });
    }
    return Response.json({ error: "Couldn’t transcribe this recording." }, { status: 502 });
  }
}
