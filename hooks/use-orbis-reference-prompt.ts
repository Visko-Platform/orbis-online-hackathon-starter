"use client";

import { useEffect, useRef, useState, type SetStateAction } from "react";
import { groundMotion } from "@/lib/looks/requests";
import { prepareOrbisReference } from "@/lib/orbis-reference";

export function useOrbisReferencePrompt() {
  const [image, setImage] = useState<File | null>(null);
  const [draft, setDraft] = useState<{ text: string; fromImage: boolean }>({ text: "", fromImage: false });
  const [describingImage, setDescribingImage] = useState(false);
  const [promptError, setPromptError] = useState("");
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  function cancelDescription() {
    request.current?.abort();
    request.current = null;
    setDescribingImage(false);
    setPromptError("");
  }

  async function describeImage(file: File, direction: string) {
    const job = new AbortController();
    request.current = job;
    setDescribingImage(true);
    try {
      const reference = await prepareOrbisReference(file);
      job.signal.throwIfAborted();
      const signal = AbortSignal.any([job.signal, AbortSignal.timeout(25_000)]);
      const prompt = (await groundMotion(reference, direction, undefined, signal))?.trim();
      if (!prompt) throw new Error("Gemini returned an empty starting prompt.");
      if (request.current === job && !job.signal.aborted) setDraft({ text: prompt, fromImage: true });
    } catch (error) {
      if (!job.signal.aborted) {
        setPromptError(error instanceof Error ? error.message : "Couldn’t describe the starting image.");
      }
    } finally {
      if (request.current === job && !job.signal.aborted) {
        request.current = null;
        setDescribingImage(false);
      }
    }
  }

  function selectImage(file: File | null) {
    cancelDescription();
    setImage(file);
    const direction = draft.fromImage ? "" : draft.text;
    setDraft({ text: direction, fromImage: false });
    if (file) void describeImage(file, direction);
  }

  function setPrompt(update: SetStateAction<string>) {
    cancelDescription();
    setDraft((current) => ({ ...current, text: typeof update === "function" ? update(current.text) : update }));
  }

  function loadPreparedImage(file: File, prompt: string) {
    cancelDescription();
    setImage(file);
    setDraft({ text: prompt, fromImage: true });
  }

  return { image, prompt: draft.text, describingImage, promptError, selectImage, setPrompt, loadPreparedImage };
}
