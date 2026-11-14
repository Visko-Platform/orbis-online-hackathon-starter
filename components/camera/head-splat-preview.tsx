import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { canvasBlob } from "@/lib/camera/frame";
import { HEIGHT, WIDTH, type Ink } from "@/lib/camera/ink";
import { createHeadSplat, defaultHeadFit, type HeadFit } from "@/lib/camera/head-splat";
import type { CameraReference } from "@/lib/camera/locked-hat";
import { bindPointer } from "./pointer";
import styles from "./studio.module.css";

const fitControls: { key: keyof HeadFit; label: string; min: number; max: number; step?: number }[] = [
  { key: "yaw", label: "Head rotation", min: -180, max: 180 },
  { key: "pitch", label: "Head tilt", min: -180, max: 180 },
  { key: "roll", label: "Head roll", min: -180, max: 180 },
  { key: "size", label: "Head scale", min: 0.25, max: 10, step: 0.01 },
  { key: "headX", label: "Head left/right", min: -80, max: 80, step: 0.1 },
  { key: "headY", label: "Head up/down", min: -80, max: 80, step: 0.1 },
  { key: "headZ", label: "Head forward/back", min: -80, max: 80, step: 0.1 },
  { key: "crop", label: "Keep radius", min: 7, max: 32, step: 0.1 },
  { key: "hatHeight", label: "Hat height", min: -12, max: 12, step: 0.1 },
  { key: "hatDepth", label: "Hat depth", min: -12, max: 12, step: 0.1 },
  { key: "hatSize", label: "Hat scale", min: 0.5, max: 2, step: 0.01 },
];

export function HeadSplatPreview({ file, ink, disabled, onCapture }: {
  file: File;
  ink: Ink;
  disabled?: boolean;
  onCapture?: CameraReference;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<Awaited<ReturnType<typeof createHeadSplat>>>();
  const [fit, setFit] = useState(defaultHeadFit);
  const [azimuth, setAzimuth] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [showHat, setShowHat] = useState(true);
  const [drawingHat, setDrawingHat] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const captureId = useRef(0);
  useEffect(() => () => { captureId.current++; }, []);
  const drawing = useSyncExternalStore(ink.subscribeDrawing, ink.drawingRevision, () => 0);
  const includeHat = drawingHat || (showHat && ink.hatStrokes.length > 0);

  useEffect(() => {
    if (!drawingHat || !viewer || !canvas.current) return;
    return bindPointer(canvas.current, (action, point) => {
      const scene = viewer.drawingScene;
      if (point && !scene) return;
      ink.apply("head-scan", action, point && { x: 1 - point.x, y: point.y }, scene);
    });
  }, [drawingHat, ink, viewer]);

  useEffect(() => {
    let closed = false;
    let resource: typeof viewer;
    const element = document.createElement("canvas");
    void createHeadSplat(element, file, ink).then((loaded) => {
      if (closed) { loaded.dispose(); return; }
      resource = loaded;
      setViewer(loaded);
    }).catch((error: unknown) => {
      if (!closed) setError(error instanceof Error ? error.message : "Couldn’t open the head splat.");
    });
    return () => { closed = true; resource?.dispose(); };
  }, [file, ink]);

  const queue = useRef(Promise.resolve());
  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    setBusy(true);
    queue.current = queue.current.catch(() => {}).then(async () => {
      const target = canvas.current;
      if (cancelled || !target) return;
      await viewer.draw(fit, { azimuth, elevation }, includeHat, target);
    }).then(() => {
      if (!cancelled) { setBusy(false); setError(""); }
    }).catch(() => {
      if (!cancelled) { setBusy(false); setError("Couldn’t render this head angle."); }
    });
    return () => { cancelled = true; };
  }, [viewer, fit, azimuth, elevation, includeHat, drawing]);

  async function useFrame() {
    if (!canvas.current || !onCapture || !viewer || busy || capturing) return;
    const id = ++captureId.current;
    setCapturing(true);
    try {
      const strokes = includeHat ? ink.hatStrokes : [];
      if (strokes.length) {
        const pending = queue.current.then(() => viewer.captureLocked(fit, { azimuth, elevation }));
        queue.current = pending.then(() => {}, () => {});
        const { still, views } = await pending;
        const blob = await canvasBlob(still, "image/jpeg");
        if (id !== captureId.current) return;
        onCapture(new File([blob], "Head scan.jpg", { type: "image/jpeg" }),
          "Keep the head bare, with no hat, headwear, or artwork. Preserve the hair silhouette. Keep the framing steady and the head fully in view.",
          { strokes, views });
      } else {
        const blob = await canvasBlob(canvas.current, "image/jpeg");
        if (id === captureId.current) onCapture(new File([blob], "Head scan.jpg", { type: "image/jpeg" }), "");
      }
    } catch {
      if (id === captureId.current) setError("Couldn’t save the rendered head frame.");
    } finally {
      if (id === captureId.current) setCapturing(false);
    }
  }

  return <>
    <canvas ref={canvas} className={styles.splatPreview} width={WIDTH} height={HEIGHT}
      style={drawingHat ? { touchAction: "none", cursor: "crosshair" } : undefined} aria-label="Rendered head scan" />
    {error && <p role="alert">{error}</p>}
    {!viewer && !error && <p role="status">Opening local scan…</p>}
    {viewer && <>
      <div className={styles.controls}>
        <label>Orbit <input type="range" min="-180" max="180" value={azimuth}
          onChange={(event) => setAzimuth(Number(event.target.value))} /></label>
        <label>Elevation <input type="range" min="-80" max="80" value={elevation}
          onChange={(event) => setElevation(Number(event.target.value))} /></label>
        <label><input type="checkbox" checked={includeHat} disabled={!ink.hatStrokes.length}
          onChange={(event) => setShowHat(event.target.checked)} /> Drawn hat</label>
        <button type="button" aria-pressed={drawingHat} onClick={() => {
          setDrawingHat(!drawingHat);
          if (!drawingHat) setShowHat(true);
        }}>{drawingHat ? "Finish drawing" : "Draw on hat"}</button>
        {onCapture && <button type="button" disabled={disabled || busy || capturing || !!error} onClick={() => void useFrame()}>
          {capturing ? "Preparing reference…" : includeHat && ink.hatStrokes.length ? "Use for Orbis with locked hat" : "Use for Orbis"}
        </button>}
      </div>
      <details>
        <summary>Fit head and hat</summary>
        <div className={styles.controls}>
          {fitControls.map(({ key, label, min, max, step }) => <label key={key}>{label}
            <input type="range" min={min} max={max} step={step} value={fit[key]}
              onChange={(event) => setFit({ ...fit, [key]: Number(event.target.value) })} />
          </label>)}
          <button type="button" onClick={() => setFit(defaultHeadFit)}>Reset fit</button>
        </div>
      </details>
    </>}
  </>;
}
