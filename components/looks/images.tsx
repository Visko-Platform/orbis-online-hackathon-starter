"use client";

import { useEffect, useRef, useState } from "react";
import { canvasBlob } from "@/lib/camera/frame";
import { acceptPixels, clipGarment, compositeLook, garmentInputs } from "@/lib/looks/composite";
import { changeGarment, readLook, type Garment, type LookDraft } from "@/lib/looks/draft";
import { GARMENT_VARIANTS } from "@/lib/looks/intent";
import { responseError } from "@/lib/looks/requests";

type Candidate = { image?: Blob; pixels?: HTMLCanvasElement; error?: string };
const emptyCandidates: Candidate[] = GARMENT_VARIANTS.map(() => ({}));

export function GarmentCandidates({ look, layer, prompt, close }: {
  look: LookDraft;
  layer: Garment;
  prompt: string;
  close: () => void;
}) {
  const [candidates, setCandidates] = useState(emptyCandidates);
  const batch = useRef<{ inputs: ReturnType<typeof garmentInputs>; abort: AbortController } | null>(null);

  async function render(slot: number, job: NonNullable<typeof batch.current>) {
    const signal = job.abort.signal;
    const update = (candidate: Candidate) => {
      if (!signal.aborted) setCandidates((items) => items.map((item, index) => index === slot ? candidate : item));
    };
    update({});
    try {
      const { baseImage, guideImage } = await job.inputs;
      const body = new FormData();
      body.append("base", baseImage, "base.jpg");
      body.append("guide", guideImage, "guide.png");
      body.append("prompt", prompt);
      body.append("slot", String(slot));
      const response = await fetch("/api/looks/image", { method: "POST", body, signal });
      if (!response.ok) throw await responseError(response);
      const pixels = await clipGarment(await response.blob(), layer.outline);
      const preview = compositeLook(look, { id: layer.id, pixels });
      update({ pixels, image: await canvasBlob(preview, "image/jpeg") });
    } catch (error) {
      update({ error: error instanceof Error ? error.message : "Couldn’t generate this garment." });
    }
  }

  useEffect(() => {
    const job = { inputs: garmentInputs(look, layer.outline), abort: new AbortController() };
    batch.current = job;
    // Give development Strict Mode cleanup a chance to cancel before sending requests.
    queueMicrotask(() => {
      if (!job.abort.signal.aborted) GARMENT_VARIANTS.forEach((_, slot) => void render(slot, job));
      else void job.inputs.catch(() => {});
    });
    return () => job.abort.abort();
  }, [look, layer, prompt]);

  return <section className="looks-prompt" aria-label={`${layer.name} candidates`}>
    <div className="looks-options">
      {candidates.map((candidate, index) => <div key={index}>
        {candidate.image && candidate.pixels ? <button type="button" aria-label={`Use ${layer.name} option ${index + 1}`}
          onClick={() => {
            const current = readLook();
            if (current.frame === look.frame && current.source === look.source && current.layers.find((item) => item.id === layer.id) === layer) {
              changeGarment(layer.id, { accepted: acceptPixels(candidate.pixels!, layer, prompt) });
            }
            close();
          }}><LookImage image={candidate.image} alt={`${layer.name} option ${index + 1}`} /></button> :
          candidate.error ? <button type="button" title={candidate.error} onClick={() => { if (batch.current) void render(index, batch.current); }}>Retry option {index + 1}</button> :
            <span role="status">Creating option {index + 1}…</span>}
      </div>)}
    </div>
    <button type="button" onClick={close}>Cancel</button>
  </section>;
}

export function LookImage({ image, alt }: { image: Blob; alt: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(image);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [image]);
  return url ? <img src={url} alt={alt} /> : null;
}
