// A cue is one image in the progression. The first cue opens the run with
// Orbis's image-to-video start. Every later cue is reached by its transition:
//   - "morph": Gemini turns the cued image into a prompt that the running shot
//     transforms toward (set_prompt mid-run, no cut).
//   - "cut":   reset, then start again anchored on the exact image.

export type Transition = "morph" | "cut";

export type PromptState = "idle" | "writing" | "ready" | "error";

export type Cue = {
  id: string;
  /** 16:9 JPEG made from the upload. This exact file is what Orbis receives. */
  file: File;
  url: string;
  name: string;
  direction: string;
  /** How the progression arrives at this cue. Ignored for the opening cue. */
  transition: Transition;
  prompt: string;
  promptState: PromptState;
  promptError: string;
  /** Inputs the current prompt was written from; a mismatch means it's stale. */
  promptKey: string;
  /** True once the user edits the prompt by hand: never overwrite it. */
  edited: boolean;
};

export const DEFAULT_OPENING_MOTION =
  "Subtle, natural motion in the scene. The camera holds steady. One continuous shot, no cuts.";

/** Orbis renders at 832×480 and squashes anything that isn't 16:9. */
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;

/**
 * Center-crop any browser-decodable image to a 16:9 JPEG so Orbis never
 * squashes it, and so formats Orbis can't decode fail here with a clear
 * message instead of silently.
 */
export async function normalizeImage(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      `Can't read ${file.name}. Use a JPG, PNG or WebP (iPhone HEIC photos often fail in Chrome).`,
    );
  }

  const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;
  const sourceRatio = bitmap.width / bitmap.height;
  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;
  if (sourceRatio > targetRatio) {
    sw = Math.round(bitmap.height * targetRatio);
    sx = Math.round((bitmap.width - sw) / 2);
  } else if (sourceRatio < targetRatio) {
    sh = Math.round(bitmap.width / targetRatio);
    sy = Math.round((bitmap.height - sh) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't prepare images.");
  context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9),
  );
  if (!blob) throw new Error(`Couldn't prepare ${file.name}.`);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "cue";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

/** Whether this cue's prompt is an opening (image-to-video start) prompt. */
export function opensRun(index: number, cue: Cue) {
  return index === 0 || cue.transition === "cut";
}

/**
 * The inputs a cue's prompt depends on. A morph prompt is written relative to
 * the cue before it, so it goes stale when that cue's prompt or the order
 * changes.
 */
export function wantedPromptKey(cues: Cue[], index: number): string {
  const cue = cues[index];
  if (opensRun(index, cue)) return `open|${cue.direction}`;
  const previous = cues[index - 1];
  return `morph|${previous.id}|${previous.prompt}|${cue.direction}`;
}

async function postForPrompt(url: string, form: FormData) {
  const response = await fetch(url, { method: "POST", body: form });
  const result = (await response.json().catch(() => ({}))) as {
    prompt?: string;
    error?: string;
  };
  if (!response.ok || !result.prompt?.trim()) {
    throw new Error(result.error || `Prompt request failed (${response.status})`);
  }
  return result.prompt.trim();
}

/** Grounded opening prompt for starting a run on this exact image. */
export function requestOpeningPrompt(image: File, direction: string) {
  const form = new FormData();
  form.append("image", image);
  form.append("prompt", direction.trim() || DEFAULT_OPENING_MOTION);
  return postForPrompt("/api/orbis-prompt", form);
}

/** Prompt that morphs the shot playing `currentPrompt` toward `image`. */
export function requestMorphPrompt(
  image: File,
  currentPrompt: string,
  direction: string,
) {
  const form = new FormData();
  form.append("image", image);
  form.append("currentPrompt", currentPrompt);
  form.append("direction", direction);
  return postForPrompt("/api/cue-prompt", form);
}
