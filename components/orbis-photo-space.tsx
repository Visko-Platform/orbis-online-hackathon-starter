"use client";

import { useEffect, useRef, useState } from "react";
import type { createPhotoSpace } from "@/lib/orbis-photo-space";

type PhotoSpaceProps = {
  image: File;
  disabled?: boolean;
  onUse: (image: File) => void;
};

export function OrbisPhotoSpace(props: PhotoSpaceProps) {
  const [openImage, setOpenImage] = useState<File | null>(null);
  if (openImage !== props.image) {
    return <button type="button" disabled={props.disabled} onClick={() => setOpenImage(props.image)}>Explore in 3D</button>;
  }
  return <PhotoSpaceEditor {...props} onClose={() => setOpenImage(null)}
    onUse={(image) => { setOpenImage(null); props.onUse(image); }} />;
}

function PhotoSpaceEditor({ image, disabled, onUse, onClose }: PhotoSpaceProps & { onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [space, setSpace] = useState<Awaited<ReturnType<typeof createPhotoSpace>>>();
  const [position, setPosition] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const job = useRef<AbortController>(null);

  useEffect(() => {
    const controller = new AbortController();
    job.current = controller;
    let dispose: (() => void) | undefined;
    const target = canvas.current!;
    void import("@/lib/orbis-photo-space").then(async ({ createPhotoSpace }) => {
      const created = await createPhotoSpace(target, image, controller.signal);
      if (controller.signal.aborted) {
        created.dispose();
        return;
      }
      dispose = created.dispose;
      created.draw(0);
      setSpace(created);
    }).catch((caught) => {
      if (!controller.signal.aborted) {
        setError(caught instanceof Error ? caught.message : "Couldn’t build the photo preview.");
      }
    });
    return () => {
      controller.abort();
      dispose?.();
    };
  }, [image]);

  async function useView() {
    if (!space || disabled || saving) return;
    const signal = job.current?.signal;
    setSaving(true);
    setError("");
    try {
      const view = await space.capture(position);
      if (!signal?.aborted) onUse(view);
    } catch (caught) {
      if (!signal?.aborted) setError(caught instanceof Error ? caught.message : "Couldn’t save this view.");
    } finally {
      if (!signal?.aborted) setSaving(false);
    }
  }

  return <div className="orbis-photo-space">
    <canvas ref={canvas} hidden={!space} aria-label="3D preview of the reference photo" />
    {!space && !error && <span role="status">Estimating photo depth…</span>}
    {space && <label>Camera angle
      <input type="range" min={-100} max={100} value={position * 100} disabled={saving || disabled}
        onChange={(event) => {
          const next = Number(event.target.value) / 100;
          setPosition(next);
          space.draw(next);
        }} />
    </label>}
    <div className="button-row">
      {space && <button type="button" disabled={!position || saving || disabled} onClick={() => void useView()}>Use this view</button>}
      <button type="button" onClick={onClose}>Close preview</button>
    </div>
    {error && <p role="alert">{error}</p>}
  </div>;
}
