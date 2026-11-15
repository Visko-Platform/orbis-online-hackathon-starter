"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { canvasBlob } from "@/lib/camera/frame";
import { HEIGHT, WIDTH, type Ink } from "@/lib/camera/ink";
import { CAMERA_SCENE_LIMIT } from "@/lib/orbis-camera-motion";

import type { SketchLayer } from "@/lib/camera/sketch-layer";

function capture(source: HTMLCanvasElement, ink: Ink) {
  const frame = document.createElement("canvas");
  frame.width = 640;
  frame.height = 360;
  frame.getContext("2d")!.drawImage(source, 0, 0, frame.width, frame.height);
  if (!ink.hasVisibleDrawing) return Promise.all([canvasBlob(frame, "image/jpeg"), null]);

  const sketch = document.createElement("canvas");
  sketch.width = frame.width;
  sketch.height = frame.height;
  const ctx = sketch.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, sketch.width, sketch.height);
  ctx.scale(sketch.width / WIDTH, sketch.height / HEIGHT);
  ink.draw(ctx, undefined, false);
  return Promise.all([canvasBlob(frame, "image/jpeg"), canvasBlob(sketch)]);
}

export function useLiveSketch({ ink, openingScene, canSend, setDirection, layers, pendingPinch }: {
  ink: Ink;
  openingScene?: string;
  canSend: boolean;
  layers: SketchLayer[];
  pendingPinch: boolean;
  setDirection: (direction: string) => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const revision = useSyncExternalStore(ink.subscribeDrawing, ink.drawingRevision, () => 0);
  const layerContext = useMemo(() => JSON.stringify(layers.map(({ id, bounds, transcript, selected }) => ({
    id, bounds, transcript, composited: !!selected,
  }))), [layers]);
  const previous = useRef("");
  const applied = useRef<{ revision: number; layerContext: string }>(null);

  useEffect(() => {
    previous.current = "";
    applied.current = null;
    setError("");
  }, [openingScene]);

  useEffect(() => {
    setWorking(false);
    if (pendingPinch || !enabled || !source || !canSend || !openingScene ||
        (revision === applied.current?.revision && layerContext === applied.current.layerContext)) return;
    const changed = revision !== applied.current?.revision;

    function apply(direction: string, remove = "") {
      const prior = previous.current;
      previous.current = direction;
      applied.current = { revision, layerContext };
      const disappearing = prior && (remove || (!direction ? prior : ""));
      if (direction || disappearing) {
        setDirection([direction, disappearing && `These effects disappear: ${disappearing}`].filter(Boolean).join(" "));
      }
    }

    if (!ink.hasVisibleDrawing) {
      apply("");
      setError("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setWorking(true);
      setError("");
      try {
        const [frame, sketch] = await capture(source, ink);
        controller.signal.throwIfAborted();
        const body = new FormData();
        body.set("frame", frame, "frame.jpg");
        if (sketch) body.set("ink", sketch, "ink.png");
        body.set("speech", "");
        body.set("layers", layerContext);
        body.set("previous", previous.current);
        body.set("changed", String(changed));
        body.set("scene", openingScene.slice(0, CAMERA_SCENE_LIMIT));
        const response = await fetch("/api/live-sketch", {
          method: "POST", body, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]),
        });
        const result = await response.json();
        if (!response.ok || typeof result.direction !== "string" || typeof result.remove !== "string") {
          throw new Error(result.error || "Couldn’t interpret the live update.");
        }
        if (!controller.signal.aborted) apply(result.direction, result.remove);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error && caught.name !== "TimeoutError"
            ? caught.message : "Live sketch timed out. Try drawing or speaking again.");
        }
      } finally {
        if (!controller.signal.aborted) setWorking(false);
      }
    }, 320);

    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [canSend, enabled, ink, layerContext, openingScene, pendingPinch, revision, setDirection, source]);

  function toggle() {
    setError("");
    setEnabled(!enabled);
  }

  return { enabled, toggle, setSource, working, error };
}
