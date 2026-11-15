"use client";

import { useEffect, useRef, useState } from "react";
import type { Ink, StrokeEvent } from "@/lib/camera/ink";
import { attachSketch, captureStroke, drawSketchLayers, sketchTarget, type Attachment, type SketchLayer } from "@/lib/camera/sketch-layer";
import { cutOutAccessory } from "@/lib/camera/accessory-overlay";
import { canvasBlob } from "@/lib/camera/frame";
import { preparePinchAudio } from "@/lib/looks/pinch-audio";
import { responseError } from "@/lib/looks/requests";
import { CAMERA_EDIT_LIMIT } from "@/lib/orbis-camera-motion";
import { PROMPT_LIMIT } from "@/lib/looks/intent";

type Audio = ReturnType<typeof preparePinchAudio>;
type Captured = ReturnType<typeof captureStroke>;
type Turn = { id: number; audio?: ReturnType<Audio["begin"]>; capture?: Captured; attachment?: Attachment; text?: string; ended: boolean; manual?: boolean };

export function usePinchLayers(ink: Ink) {
  const [layers, setLayers] = useState<SketchLayer[]>([]);
  const [micAccess, setMicAccess] = useState<"idle" | "requesting" | "ready">("idle");
  const [micStatus, setMicStatus] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [lastStroke, setLastStroke] = useState<StrokeEvent>();
  const lastCapture = useRef<Captured>(undefined);
  const [manual, setManual] = useState(false);
  const captionStroke = useRef<(event: StrokeEvent) => void>(null);
  const [generate, setGenerate] = useState(false);
  const auto = useRef(false);
  const armed = useRef(false);
  const audio = useRef<Audio>(null);
  const current = useRef<Turn>(null);
  const latest = useRef<number>(0);
  const turns = useRef(new Map<number, Turn>());
  const entries = useRef(new Map<number, SketchLayer>());
  const jobs = useRef(new Map<number, AbortController>());
  const publish = () => setLayers([...entries.current.values()].map((layer) => ({ ...layer })));

  function stop() {
    armed.current = false;
    audio.current?.close();
    audio.current = null;
    turns.current.clear();
    current.current = null;
    for (const job of jobs.current.values()) job.abort();
    jobs.current.clear();
    for (const layer of entries.current.values()) layer.generating = false;
    setPending(false);
    setManual(false);
    setCaption("");
    setMicStatus("");
    setMicAccess("idle");
    publish();
  }

  async function enableMicrophone() {
    if (audio.current) return;
    setError("");
    setMicAccess("requesting");
    setMicStatus("Allow microphone access in your browser.");
    let preparation: Audio | undefined;
    try {
      preparation = preparePinchAudio();
      audio.current = preparation;
      await preparation.ready;
      if (audio.current !== preparation) return;
      armed.current = true;
      setMicAccess("ready");
      setMicStatus("");
    } catch (caught) {
      if (preparation && audio.current !== preparation) return;
      preparation?.close();
      audio.current = null;
      setMicAccess("idle");
      setMicStatus("");
      setError(caught instanceof DOMException && caught.name === "NotAllowedError"
        ? "Microphone access denied. Allow access in your browser, then try again."
        : "Can’t enable the microphone. Check your browser and selected input.");
    }
  }

  async function generateImage(layer: SketchLayer, crop: HTMLCanvasElement) {
    const job = new AbortController();
    jobs.current.set(layer.id, job);
    layer.generating = true;
    publish();
    let image: ImageBitmap | undefined;
    try {
      const body = new FormData();
      body.set("kind", "overlay");
      body.set("prompt", layer.transcript.slice(0, PROMPT_LIMIT));
      body.set("sketch", await canvasBlob(crop), "sketch.png");
      const signal = AbortSignal.any([job.signal, AbortSignal.timeout(65_000)]);
      const response = await fetch("/api/looks/image", { method: "POST", body, signal });
      if (!response.ok) throw await responseError(response);
      image = await cutOutAccessory(await response.blob());
      job.signal.throwIfAborted();
      const preview = document.createElement("canvas");
      const scale = Math.min(1, 160 / Math.max(image.width, image.height));
      preview.width = Math.ceil(image.width * scale);
      preview.height = Math.ceil(image.height * scale);
      preview.getContext("2d")!.drawImage(image, 0, 0, preview.width, preview.height);
      layer.preview = preview.toDataURL();
      layer.image = image;
      image = undefined;
    } catch (caught) {
      if (!job.signal.aborted) layer.error = caught instanceof Error ? caught.message : "Image generation failed.";
    } finally {
      image?.close();
      if (jobs.current.get(layer.id) === job) {
        jobs.current.delete(layer.id);
        layer.generating = false;
        publish();
      }
    }
  }

  useEffect(() => {
    function finish(turn: Turn, event: StrokeEvent) {
      if (!turn.ended || turn.text === undefined || !turns.current.delete(turn.id)) return;
      setPending(turns.current.size > 0);
      if (!ink.hasStroke(turn.id) || !turn.capture || !turn.text) return;
      const { bounds, crop } = turn.capture;
      const target = sketchTarget(event);
      const layer: SketchLayer = { id: turn.id, target, bounds, transcript: turn.text,
        attachment: turn.attachment ?? attachSketch(ink, target, bounds) };
      entries.current.set(layer.id, layer);
      if (auto.current) void generateImage(layer, crop);
      else publish();
    }

    function begin(event: StrokeEvent, capture?: Captured) {
      if (!armed.current) return;
      if (current.current?.ended) current.current.audio?.finish();
      if (current.current || !audio.current) return;
      const turn: Turn = { id: event.id, ended: !!capture, capture, manual: !!capture };
      turns.current.set(event.id, turn);
      current.current = turn;
      latest.current = event.id;
      setCaption("");
      setError("");
      setPending(true);
      try {
        turn.audio = audio.current.begin((text) => {
          if (latest.current === turn.id) setCaption(text);
        }, (status) => {
          if (latest.current === turn.id) setMicStatus(status);
        }, (text, failure) => {
          if (!turns.current.has(turn.id)) return;
          if (capture) {
            setManual(false);
            if (current.current === turn) current.current = null;
          }
          turn.text = text.trim().slice(0, CAMERA_EDIT_LIMIT);
          if (latest.current === turn.id) {
            if (turn.text) setCaption(turn.text);
            setMicStatus("");
            if (failure) setError(failure);
          }
          finish(turn, event);
        });
      } catch {
        turn.text = "";
        setError("Microphone transcription unavailable.");
        if (capture) {
          current.current = null;
          finish(turn, event);
        }
      }
      return turn.audio;
    }

    captionStroke.current = (event) => {
      if (turns.current.size || !ink.hasStroke(event.id)) return;
      const capture = lastCapture.current ?? captureStroke(ink, event.id);
      if (!capture) setError("Bring the last stroke into view to caption it.");
      else if (begin(event, capture)) setManual(true);
    };

    ink.onStroke = (event) => {
      if (event.phase === "start") {
        if (!current.current?.manual) begin(event);
        return;
      }
      if (event.phase === "end") {
        setLastStroke(event);
        lastCapture.current = captureStroke(ink, event.id);
      }
      const turn = turns.current.get(event.id);
      if (!turn) return;
      const clearCurrent = () => { if (current.current === turn) current.current = null; };
      if (event.phase === "cancel") {
        clearCurrent();
        turn.audio?.cancel();
        turns.current.delete(event.id);
        setPending(turns.current.size > 0);
        setMicStatus("");
        setCaption("");
        return;
      }
      turn.ended = true;
      turn.capture = lastCapture.current;
      if (turn.capture) turn.attachment = attachSketch(ink, sketchTarget(event), turn.capture.bounds);
      if (turn.audio) turn.audio.end(clearCurrent);
      else clearCurrent();
      finish(turn, event);
    };

    // Face and joint tracking must already be running when the stroke is released.
    ink.overlayJoints = () => {
      const joint = ink.follow === "joint" ? ink.joint : "Nose bridge";
      return [...(armed.current ? [joint] : []), ...Array.from(entries.current.values())
        .flatMap(({ target }) => target === "Shoulders" ? [] : [target])];
    };
    ink.overlayShoulders = () => armed.current && ink.follow === "garment" ||
      Array.from(entries.current.values()).some(({ target }) => target === "Shoulders");
    ink.drawOverlays = (context) => {
      for (const layer of entries.current.values()) {
        if (!layer.attachment) layer.attachment = attachSketch(ink, layer.target, layer.bounds);
      }
      drawSketchLayers(context, ink, entries.current.values());
    };

    const unsubscribe = ink.subscribeDrawing(() => {
      let changed = false;
      for (const [id, layer] of entries.current) {
        if (ink.hasStroke(id)) continue;
        jobs.current.get(id)?.abort();
        jobs.current.delete(id);
        layer.image?.close();
        entries.current.delete(id);
        if (latest.current === id) setCaption("");
        changed = true;
      }
      for (const [id, turn] of turns.current) {
        if (!turn.ended || ink.hasStroke(id)) continue;
        turn.audio?.cancel();
        turns.current.delete(id);
        if (current.current === turn) { current.current = null; setManual(false); setMicStatus(""); }
        if (latest.current === id) setCaption("");
        changed = true;
      }
      if (changed) { setPending(turns.current.size > 0); publish(); }
    });
    return () => {
      unsubscribe();
      captionStroke.current = null;
      ink.onStroke = ink.overlayJoints = ink.overlayShoulders = ink.drawOverlays = undefined;
      audio.current?.close();
      audio.current = null;
      for (const job of jobs.current.values()) job.abort();
      for (const layer of entries.current.values()) layer.image?.close();
    };
  }, [ink]);

  const canCaptionStroke = !!lastStroke && ink.hasStroke(lastStroke.id) && !entries.current.has(lastStroke.id);
  return { layers, pending, caption, micAccess, micStatus, error, generate, enableMicrophone, stop,
    manual, canCaptionStroke, captionLastStroke() {
      if (manual) current.current?.audio?.finish();
      else if (lastStroke) captionStroke.current?.(lastStroke);
    }, toggleGeneration() {
    auto.current = !auto.current;
    setGenerate(auto.current);
  }, select(id: number, selected: boolean) {
    const layer = entries.current.get(id);
    if (!layer?.image) return;
    layer.attachment ??= attachSketch(ink, layer.target, layer.bounds);
    if (selected && !layer.attachment) {
      setError("Bring the Follow target into view to place the image.");
      return;
    }
    setError("");
    layer.selected = selected;
    ink.showStroke(id, !selected);
    publish();
  } };
}
