import type { LookDraft } from "./draft";
import type { DesignIntent, IntentResult } from "./intent";

export async function responseError(response: Response) {
  const body = await response.json().catch(() => null);
  return new Error(body?.error || `Request failed (${response.status}).`);
}

export async function generateEnvironment(description: string, panoramic: boolean, signal: AbortSignal, sketch?: Blob) {
  const body = new FormData();
  body.append("kind", "environment");
  body.append("prompt", description);
  body.append("panoramic", String(panoramic));
  if (sketch) body.append("sketch", sketch, "environment-sketch.jpg");
  const response = await fetch("/api/looks/image", { method: "POST", body, signal });
  if (!response.ok) throw await responseError(response);
  const blob = await response.blob();
  if (!blob.size || !blob.type.startsWith("image/")) throw new Error("Gemini returned no background image.");
  const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `Environment.${extension}`, { type: blob.type });
}

export async function requestIntent(input: DesignIntent, signal: AbortSignal): Promise<IntentResult> {
  const response = await fetch("/api/looks/plan", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input), signal });
  if (!response.ok) throw await responseError(response);
  return response.json();
}

export async function groundMotion(image: Blob, prompt: string, environment?: LookDraft["environment"], signal?: AbortSignal): Promise<string> {
  const body = new FormData();
  body.append("image", image, "look.png");
  body.append("prompt", prompt);
  if (environment) body.append("environment", JSON.stringify(environment));
  const response = await fetch("/api/orbis-prompt", { method: "POST", body, signal });
  if (!response.ok) throw await responseError(response);
  return (await response.json()).prompt;
}

export async function transcribeAudio(audio: Blob, signal?: AbortSignal): Promise<string> {
  const body = new FormData();
  body.append("audio", audio);
  const response = await fetch("/api/looks/transcribe", { method: "POST", body, signal });
  if (!response.ok) throw await responseError(response);
  return (await response.json()).transcript;
}
