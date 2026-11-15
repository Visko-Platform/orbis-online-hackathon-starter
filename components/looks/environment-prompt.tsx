"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { captureSource } from "@/lib/camera/frame";
import type { Ink } from "@/lib/camera/ink";
import { changeEnvironment, readLook, setEnvironmentImage, type LookDraft } from "@/lib/looks/draft";
import { PROMPT_LIMIT } from "@/lib/looks/intent";
import { generateEnvironment } from "@/lib/looks/requests";
import { LookImage } from "./images";
import { Voice } from "./voice";

export function EnvironmentPrompt({ look, sketch, referenceAction, children }: {
  look: LookDraft;
  sketch?: Ink;
  referenceAction?: ReactNode;
  children: ReactNode;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController>(null);
  const { environment, environmentImage } = look;
  const description = environment.description.trim();
  useEffect(() => () => request.current?.abort(), []);

  async function generate() {
    if (!description || request.current) return;
    const job = new AbortController();
    request.current = job;
    setBusy(true);
    setError("");
    try {
      const guide = sketch?.hasDrawing ? await captureSource(sketch) : undefined;
      const image = await generateEnvironment(description, environment.is360, job.signal, guide);
      if (!job.signal.aborted && readLook().environment === environment) setEnvironmentImage(image);
    } catch (caught) {
      if (!job.signal.aborted) setError(caught instanceof Error ? caught.message : "Couldn’t generate the background.");
    } finally {
      if (!job.signal.aborted) {
        request.current = null;
        setBusy(false);
      }
    }
  }

  return <section className="looks-prompt" aria-label="Environment">
    {environmentImage ? <div className="looks-stage">
      <LookImage image={environmentImage} alt="Generated environment background" />
    </div> : children}
    <div className="looks-row">
      <label style={{ flex: 1 }}>Environment description
        <textarea
          placeholder="e.g., An undersea world with vibrant coral reefs and sunlight filtering through the water."
          value={environment.description}
          disabled={busy}
          onChange={(event) => changeEnvironment({ description: event.target.value })}
          maxLength={PROMPT_LIMIT}
          rows={2}
        />
      </label>
    </div>
    <div className="looks-row">
      <label style={{ flex: 1 }}>Environment motion
        <textarea
          placeholder="e.g., Bubbles rising slowly, schools of tropical fish swimming across the background."
          value={environment.motion}
          disabled={busy}
          onChange={(event) => changeEnvironment({ motion: event.target.value })}
          maxLength={PROMPT_LIMIT}
          rows={2}
        />
      </label>
    </div>
    <div className="looks-row">
      <label className="looks-toggle">
        <input
          type="checkbox"
          checked={environment.is360}
          disabled={busy}
          onChange={(event) => changeEnvironment({ is360: event.target.checked })}
        />
        Panoramic / 360 mode
      </label>
      <div style={{ flex: 1 }} />
      <Voice context={0} disabled={busy} onError={setError} onTranscript={(text) => {
        if (request.current) return;
        setError("");
        if (!environment.description) changeEnvironment({ description: text });
        else changeEnvironment({ motion: text });
      }} />
    </div>
    <div className="looks-row">
      <button type="button" disabled={!description || busy} onClick={() => void generate()}>
        {environmentImage ? "Regenerate environment" : "Generate environment"}
      </button>
      {environmentImage && !busy && <>
        {referenceAction}
        <button type="button" onClick={() => { setEnvironmentImage(undefined); setError(""); }}>Remove background</button>
      </>}
      {busy && <span role="status">Generating environment…</span>}
    </div>
    {error && <p role="alert">{error}</p>}
  </section>;
}
