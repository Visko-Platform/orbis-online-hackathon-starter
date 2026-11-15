import { useState, type RefObject } from "react";
import { canvasBlob } from "@/lib/camera/frame";
import { headViews, type HeadPhotos, type HeadView } from "@/lib/camera/head-views";
import styles from "./studio.module.css";

export function HeadReference({ camera, photos, onChange, onError, disabled }: {
  camera: RefObject<HTMLCanvasElement | null>;
  photos: HeadPhotos;
  onChange: (photos: HeadPhotos) => void;
  onError: (message: string) => void;
  disabled: boolean;
}) {
  const [view, setView] = useState<HeadView>("front");
  const [saving, setSaving] = useState(false);
  const count = headViews.filter(({ id }) => photos[id]).length;

  async function save() {
    const source = camera.current;
    if (!source) return;
    setSaving(true);
    onError("");
    try {
      const photo = document.createElement("canvas");
      photo.width = 640;
      photo.height = 360;
      photo.getContext("2d")!.drawImage(source, 0, 0, photo.width, photo.height);
      const image = await canvasBlob(photo, "image/jpeg");
      const next = { ...photos, [view]: image };
      onChange(next);
      setView(headViews.find(({ id }) => !next[id])?.id ?? view);
    } catch {
      onError("Couldn’t save the head angle.");
    } finally {
      setSaving(false);
    }
  }

  return <details>
    <summary>Head reference · {count}/{headViews.length}</summary>
    <div className={styles.controls}>
      <select aria-label="Head angle" value={view} disabled={disabled || saving}
        onChange={(event) => setView(event.target.value as HeadView)}>
        {headViews.map(({ id, label }) =>
          <option key={id} value={id}>{label}{photos[id] ? " · saved" : ""}</option>)}
      </select>
      <button disabled={disabled || saving} onClick={() => void save()}>{photos[view] ? "Replace angle" : "Save angle"}</button>
      {photos[view] && <button disabled={disabled || saving} onClick={() => {
        const next = { ...photos };
        delete next[view];
        onChange(next);
      }}>Delete angle</button>}
      {!!count && <button disabled={disabled || saving} onClick={() => { onChange({}); setView("front"); }}>Clear angles</button>}
    </div>
    <p>Center your head and show the selected angle. Preparing an Orbis look sends saved photos to Gemini.</p>
  </details>;
}
