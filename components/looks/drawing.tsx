"use client";

import { useEffect, useRef, useState } from "react";
import { drawCamera } from "@/lib/camera/frame";
import { HEIGHT, WIDTH, type Point } from "@/lib/camera/ink";
import { bindPointer } from "@/components/camera/pointer";
import { closedOutline, createLookCanvas, drawLook, traceOutline } from "@/lib/looks/composite";
import { changeGarment, type Garment, type LookDraft } from "@/lib/looks/draft";

export function Drawing({ look, layer, isEnvironment, onFreeze, onError }: {
  look: LookDraft;
  layer?: Garment;
  isEnvironment?: boolean;
  onFreeze: (frame: HTMLCanvasElement) => void;
  onError: (error: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const capturing = look.source === "webcam" && !look.frame;

  useEffect(() => {
    if (!capturing) return;
    let stopped = false;
    let stream: MediaStream | undefined;
    setReady(false);
    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        if (stopped) { stream.getTracks().forEach((track) => track.stop()); return; }
        const player = video.current!;
        player.srcObject = stream;
        await player.play();
        if (!stopped) setReady(true);
      } catch {
        stream?.getTracks().forEach((track) => track.stop());
        if (!stopped) onError("Camera unavailable. You can still use Blank canvas.");
      }
    })();
    return () => { stopped = true; stream?.getTracks().forEach((track) => track.stop()); };
  }, [capturing, onError]);

  useEffect(() => {
    if (capturing) return;
    const target = canvas.current!;
    const context = target.getContext("2d")!;
    let points: Point[] = [];
    const redraw = () => {
      drawLook(context, look);
      if (!look.layers.some((item) => item.accepted)) look.reference?.draw(context);
      if (!layer || isEnvironment) return;
      traceOutline(context, points.length ? points : layer.outline, !points.length);
      context.strokeStyle = "#e437be";
      context.lineWidth = 4;
      context.stroke();
    };
    redraw();
    if (isEnvironment && look.reference) {
      return bindPointer(target, (action, point) => {
        look.reference!.apply("environment", action, point);
        redraw();
      });
    }
    if (!layer) return;
    return bindPointer(target, (action, point) => {
      if (action === "start") points = [];
      if (point && points.length < 4096) points.push(point);
      if (action === "end") {
        if (closedOutline(points)) {
          changeGarment(layer.id, { outline: points });
          onError("");
        } else onError("Draw around the garment and end near where you started.");
      }
      if (action === "end" || action === "cancel") points = [];
      redraw();
    });
  }, [capturing, layer, look, isEnvironment, onError]);

  return <>
    <div className="looks-stage">
      {capturing ? <video className="looks-mirror" ref={video} muted playsInline aria-label="Webcam preview" /> :
        <canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label={layer ? `${layer.name} outline` : "Assembled look"} />}
    </div>
    {capturing && <button disabled={!ready} onClick={() => {
      const player = video.current;
      if (!player?.videoWidth) return;
      const captured = createLookCanvas();
      drawCamera(captured.getContext("2d")!, player);
      onFreeze(captured);
    }}>Freeze frame</button>}
  </>;
}
