"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { canvasBlob } from "@/lib/camera/frame";
import { headViews, type HeadPhotos } from "@/lib/camera/head-views";
import type { Ink } from "@/lib/camera/ink";
import type { CameraAccessory } from "@/lib/camera/accessory-overlay";
import { prepareWardrobeReference } from "./wardrobe-reference";
import { CameraIcon } from "./camera-icon";

function captureHat(ink: Ink) {
  if (!ink.hasHatDrawing) return;
  const tile = 224;
  const sheet = document.createElement("canvas");
  sheet.width = headViews.length * tile;
  sheet.height = tile;
  const context = sheet.getContext("2d")!;
  context.fillStyle = "#cccccc";
  context.fillRect(0, 0, sheet.width, sheet.height);
  return ink.drawHatReference(context, tile) ? canvasBlob(sheet, "image/jpeg") : undefined;
}

export function CaptureReference({ canvas, worn, ink, headPhotos, hasPieces, environment, background, designDirection, disabled, onCapture, onError, onBusy, actionRef, hideButton }: {
  canvas: RefObject<HTMLCanvasElement | null>;
  worn: RefObject<CameraAccessory[]>;
  ink: Ink;
  headPhotos: HeadPhotos;
  hasPieces: boolean;
  environment?: string;
  background?: File;
  designDirection?: string;
  disabled?: boolean;
  actionRef?: RefObject<((notify?: boolean) => Promise<{ image: File; direction: string } | null>) | null>;
  hideButton?: boolean;
  onCapture: (image: File, direction: string) => void;
  onError: (message: string) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const active = useRef<AbortController>(null);
  const [busy, setBusy] = useState(false);
  useSyncExternalStore(ink.subscribeDrawing, ink.drawingRevision, () => 0);
  useEffect(() => () => {
    active.current?.abort();
    if (active.current) onBusy?.(false);
  }, [onBusy]);

  async function capture(notify = true) {
    if (!canvas.current || active.current) return null;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    onBusy?.(true);
    onError("");
    try {
      const pieces = [...worn.current];
      const [frame, hat] = await Promise.all([
        canvasBlob(canvas.current, "image/jpeg"), captureHat(ink),
      ]);
      const result = await prepareWardrobeReference(frame, pieces, controller.signal, { headPhotos, hat, environment, background, designDirection });
      if (!controller.signal.aborted) {
        if (notify) onCapture(result.image, result.direction);
        return result;
      }
    } catch (error) {
      if (!controller.signal.aborted) onError(error instanceof Error ? error.message : "Couldn’t capture the camera.");
    } finally {
      if (!controller.signal.aborted) {
        active.current = null;
        setBusy(false);
        onBusy?.(false);
      }
    }
    return null;
  }

  useEffect(() => { if (actionRef) actionRef.current = (notify) => disabled ? Promise.resolve(null) : capture(notify); });
  useEffect(() => () => { if (actionRef) actionRef.current = null; }, [actionRef]);

  const enhanced = !!background || hasPieces || ink.hasHatDrawing || Object.keys(headPhotos).length > 0;
  if (hideButton) return null;
  return <button disabled={disabled || busy} aria-label={busy ? "Preparing reference" : enhanced ? "Prepare Orbis look" : "Capture camera"}
    title="Prepare a starting image. Saved head angles and design references are processed by Gemini."
    onClick={() => void capture()}>
    {busy ? "…" : <CameraIcon />}
  </button>;
}
