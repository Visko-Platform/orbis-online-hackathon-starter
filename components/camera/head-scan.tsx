import { lazy, Suspense, useState, type RefObject } from "react";
import type { Ink } from "@/lib/camera/ink";
import type { CameraReference } from "@/lib/camera/locked-hat";
import { ScanRecording } from "./scan-recording";
import styles from "./studio.module.css";

const Preview = lazy(() => import("./head-splat-preview").then(({ HeadSplatPreview }) => ({ default: HeadSplatPreview })));

export function HeadScan({ camera, running, ink, disabled, onCapture }: {
  camera: RefObject<HTMLVideoElement | null>;
  running: boolean;
  ink: Ink;
  disabled?: boolean;
  onCapture?: CameraReference;
}) {
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const [load, setLoad] = useState(0);
  return <details>
    <summary>Head scan</summary>
    <ScanRecording camera={camera} running={running} />
    <div className={styles.controls}>
      <label>Import head splat <input type="file" accept=".ply,.spz,.splat" onChange={(event) => {
        const input = event.currentTarget;
        const next = input.files?.[0];
        input.value = "";
        if (!next) return;
        if (!/\.(ply|spz|splat)$/i.test(next.name) || !next.size || next.size > 160 * 1024 * 1024) {
          setError("Choose a Gaussian splat file under 160 MB.");
          return;
        }
        setError("");
        setFile(next);
        setLoad((id) => id + 1);
      }} /></label>
      {file && <button type="button" onClick={() => setFile(undefined)}>Delete scan</button>}
    </div>
    {error && <p role="alert">{error}</p>}
    {file && <Suspense fallback={<p role="status">Loading splat renderer…</p>}>
      <Preview key={load} file={file} ink={ink} disabled={disabled} onCapture={onCapture} />
    </Suspense>}
  </details>;
}
