"use client";

import { timed } from "@/lib/telemetry";

/** Center-crop any image to 16:9 and re-encode as JPEG (Orbis resizes non-16:9 without cropping). */
export async function cropTo169(source: Blob, width = 1280, name = "frame.jpg"): Promise<File> {
  const bitmap = await createImageBitmap(source);
  const target = 16 / 9;
  let sw = bitmap.width;
  let sh = bitmap.height;
  if (sw / sh > target) sw = Math.round(sh * target);
  else sh = Math.round(sw / target);
  const sx = Math.round((bitmap.width - sw) / 2);
  const sy = Math.round((bitmap.height - sh) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round(width / target);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), "image/jpeg", 0.92),
  );
  return new File([blob], name, { type: "image/jpeg" });
}

export async function urlToFile(url: string, name?: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  const blob = await response.blob();
  return new File([blob], name ?? url.split("/").pop() ?? "image.jpg", {
    type: blob.type || "image/jpeg",
  });
}

export async function postForImage(url: string, form: FormData): Promise<{ file: File; model: string }> {
  return timed(`client${url.replace("/api", "")}`, () => postForImageInner(url, form), {
    demo: form.get("demoId"),
    shot: form.get("shotId") ?? undefined,
  });
}

async function postForImageInner(url: string, form: FormData): Promise<{ file: File; model: string }> {
  const response = await fetch(url, { method: "POST", body: form });
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(result?.error ?? `${url} failed (${response.status})`);
  }
  const blob = await response.blob();
  const ext = blob.type.includes("png") ? "png" : "jpg";
  return {
    file: new File([blob], `generated-${Date.now()}.${ext}`, { type: blob.type || "image/jpeg" }),
    model: response.headers.get("X-Image-Model") ?? "",
  };
}

export async function postForPrompt(form: FormData): Promise<string> {
  return timed("client.prompt", () => postForPromptInner(form), { demo: form.get("demoId"), mode: form.get("mode") });
}

async function postForPromptInner(form: FormData): Promise<string> {
  const response = await fetch("/api/prompt", { method: "POST", body: form });
  const result = (await response.json().catch(() => null)) as { prompt?: string; error?: string } | null;
  if (!response.ok || !result?.prompt) throw new Error(result?.error ?? "Prompt writer failed");
  return result.prompt;
}
