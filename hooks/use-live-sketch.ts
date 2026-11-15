"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { canvasBlob } from "@/lib/camera/frame";
import { HEIGHT, WIDTH, type Ink } from "@/lib/camera/ink";
import { CAMERA_SCENE_LIMIT } from "@/lib/orbis-camera-motion";

import type { SketchLayer } from "@/lib/camera/sketch-layer";

export type OpeningSketch = { revision: number; layerContext: string; direction: string };

function capture(source: HTMLCanvasElement, ink: Ink) {
  const frame = document.createElement("canvas");
  frame.width = 640;
  frame.height = 360;
  frame.getContext("2d")!.drawImage(source, 0, 0, frame.width, frame.height);
  const sketch = document.createElement("canvas");
  sketch.width = frame.width;
  sketch.height = frame.height;
  const ctx = sketch.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, sketch.width, sketch.height);
  ctx.scale(sketch.width / WIDTH, sketch.height / HEIGHT);
  ink.draw(ctx, undefined, false);
  return { frame, sketch };
}

async function interpret(images: ReturnType<typeof capture>, layerContext: string, scene: string,
  previous: string, changed: boolean, phase: "opening" | "live", signal: AbortSignal) {
  const [frame, sketch] = await Promise.all([canvasBlob(images.frame, "image/jpeg"), canvasBlob(images.sketch)]);
  signal.throwIfAborted();
  const body = new FormData();
  body.set("frame", frame, "frame.jpg");
  body.set("ink", sketch, "ink.png");
  body.set("speech", "");
  body.set("layers", layerContext);
  body.set("previous", previous);
  body.set("changed", String(changed));
  body.set("scene", scene.slice(0, CAMERA_SCENE_LIMIT));
  body.set("phase", phase);
  const response = await fetch("/api/live-sketch", { method: "POST", body, signal });
  const result = await response.json().catch(() => null) as { direction?: string; remove?: string; error?: string } | null;
  if (!response.ok || typeof result?.direction !== "string" || typeof result.remove !== "string") {
    throw new Error(result?.error || "Couldn’t interpret the sketch.");
  }
  return { direction: result.direction, remove: result.remove };
}

export function useLiveSketch({ ink, openingScene, openingSketch, runId, canSend, setDirection, layers, pendingSpeech }: {
  ink: Ink;
  openingScene?: string;
  openingSketch?: OpeningSketch;
  runId?: number;
  canSend: boolean;
  layers: SketchLayer[];
  pendingSpeech: boolean;
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
  const snapshot = useRef<{ revision: number; images: ReturnType<typeof capture> }>(null);

  useEffect(() => {
    previous.current = openingSketch?.direction ?? "";
    applied.current = openingSketch ?? null;
    setError("");
  }, [openingScene, openingSketch, runId]);

  useEffect(() => {
    if (!enabled || !source) return;
    // Freeze the frame and its aligned drawing together, before speech finishes transcribing.
    function record() {
      snapshot.current = source && ink.hasVisibleDrawing
        ? { revision: ink.drawingRevision(), images: capture(source, ink) } : null;
    }
    record();
    const unsubscribe = ink.subscribeDrawing(record);
    return unsubscribe;
  }, [enabled, ink, source]);

  async function prepareOpening(scene: string, signal: AbortSignal): Promise<OpeningSketch | undefined> {
    if (!enabled || !ink.hasVisibleDrawing) return;
    const revision = ink.drawingRevision();
    const images = snapshot.current?.revision === revision ? snapshot.current.images : source && capture(source, ink);
    if (!images) return;
    const { direction } = await interpret(images, layerContext, scene, "", true, "opening",
      AbortSignal.any([signal, AbortSignal.timeout(12_000)]));
    return { revision, layerContext, direction };
  }

  useEffect(() => {
    setWorking(false);
    if (pendingSpeech || !enabled || !source || !canSend || !openingScene ||
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
        const images = snapshot.current?.revision === revision ? snapshot.current.images : capture(source, ink);
        const { direction, remove } = await interpret(images, layerContext, openingScene, previous.current, changed,
          "live", AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]));
        if (!controller.signal.aborted) apply(direction, remove);
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
  }, [canSend, enabled, ink, layerContext, openingScene, openingSketch, pendingSpeech, revision, runId, setDirection, source]);

  function toggle() {
    setError("");
    setEnabled(!enabled);
  }

  return { enabled, toggle, setSource, working, error, prepareOpening };
}
