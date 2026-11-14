"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { canvasBlob } from "@/lib/camera/frame";
import { compositeLook } from "@/lib/looks/composite";
import { readLook, sameComposition, type LookDraft, type MotionReview } from "@/lib/looks/draft";
import { DEFAULT_MOTION, PROMPT_LIMIT } from "@/lib/looks/intent";
import { groundMotion } from "@/lib/looks/requests";
import { Voice } from "./voice";

export function useMotionPrompt() {
  const [draft, setDraft] = useState<MotionReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function prepare(look: LookDraft, motion: string) {
    request.current?.abort();
    const job = new AbortController();
    request.current = job;
    setDraft(null);
    setError("");
    setBusy(true);
    let image: File | undefined;
    const description = motion.trim() || DEFAULT_MOTION;
    try {
      const blob = await canvasBlob(compositeLook(look), "image/png");
      image = new File([blob], "Assembled look.png", { type: "image/png" });
      const prompt = await groundMotion(image, description, look.environment, job.signal);
      if (!job.signal.aborted && sameComposition(look, readLook())) setDraft({ image, prompt, look });
    } catch (caught) {
      if (!job.signal.aborted && sameComposition(look, readLook())) {
        if (image) setDraft({ image, prompt: description, look });
        setError(caught instanceof Error ? caught.message : "Couldn’t prepare the motion prompt.");
      }
    } finally {
      if (request.current === job) { request.current = null; setBusy(false); }
    }
  }

  return { draft, busy, error, prepare, setDraft, clear() {
    request.current?.abort();
    request.current = null;
    setDraft(null);
    setBusy(false);
    setError("");
  } };
}

export function MotionPrompt({ prompt, setPrompt, actions, review, busy, disabled, label, placeholder }: {
  prompt: string;
  setPrompt: (text: string) => void;
  actions: ReactNode;
  review?: boolean;
  busy?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const [error, setError] = useState("");
  const fieldLabel = label ?? (review ? "Orbis motion prompt" : "Describe motion");
  return <section className="looks-prompt" aria-label={fieldLabel}>
    <label>{fieldLabel}
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={PROMPT_LIMIT}
        rows={review ? 4 : 2} placeholder={placeholder} disabled={disabled} />
    </label>
    <div className="looks-row">
      <Voice context={0} disabled={!!(busy || disabled)} onError={setError} onTranscript={(text) => { setError(""); setPrompt(text); }} />
      {actions}
      {busy && <span role="status">Preparing motion…</span>}
    </div>
    {error && <p role="alert">{error}</p>}
  </section>;
}
