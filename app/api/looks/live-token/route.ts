import { GoogleGenAI, Modality } from "@google/genai";
import { requireLocalRequest } from "@/lib/server/local-request";

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "looks-live-token", 20);
  if (blocked) return blocked;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Configure GEMINI_API_KEY to use Gemini Live." }, { status: 503 });
  const transcribe = new URL(request.url).searchParams.get("mode") === "transcribe";
  const model = transcribe ? "gemini-3.5-transcribe-live" : process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live";
  try {
    const ai = new GoogleGenAI({ apiKey: key, apiVersion: "v1alpha", httpOptions: { timeout: 12_000 } });
    const token = await ai.authTokens.create({ config: {
      uses: 1,
      newSessionExpireTime: new Date(Date.now() + 60_000).toISOString(),
      expireTime: new Date(Date.now() + 5 * 60_000).toISOString(),
      liveConnectConstraints: { model, config: transcribe ? {
        responseModalities: [Modality.TEXT], inputAudioTranscription: {},
        realtimeInputConfig: { automaticActivityDetection: { disabled: true } },
      } : { responseModalities: [Modality.AUDIO] } },
      abortSignal: request.signal,
    } });
    if (token.name) return Response.json({ token: token.name, model }, { headers: { "Cache-Control": "no-store" } });
  } catch { /* The composer remains available if Live is unavailable. */ }
  return Response.json({ error: "Couldn’t connect to Gemini Live. You can continue by typing." }, { status: 502 });
}
