"use client";

import { ReactorView } from "@reactor-team/js-sdk";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HEIGHT, WIDTH } from "@/lib/camera/ink";
import type { LockedHat } from "@/lib/camera/locked-hat";
import type { SketchLayer } from "@/lib/camera/sketch-layer";
import { SketchOutput } from "./sketch-images";
import { LockedHatOverlay } from "./locked-hat-overlay";
import { useFirstOrbisFrame } from "@/hooks/use-first-orbis-frame";
import type { OrbisTimeline } from "@/hooks/use-orbis-timeline";
import { OrbisRenderTimeline } from "@/components/orbis-render-timeline";

export function useOBSWindow() {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const popup = useRef<Window | null>(null);
  useEffect(() => () => { popup.current?.close(); }, []);

  function open() {
    if (popup.current && !popup.current.closed) {
      popup.current.focus();
      return true;
    }
    const win = window.open("", "_blank", "popup,width=960,height=540");
    if (!win) return false;
    popup.current = win;
    win.document.title = "Live Studio Render";
    win.document.documentElement.style.background = "#000";
    win.document.body.style.cssText = "margin:0;overflow:hidden;background:#000";
    const target = win.document.createElement("main");
    target.style.cssText = "width:100vw;height:100vh;position:relative;display:grid;place-items:center;background:#000";
    win.document.body.replaceChildren(target);
    win.addEventListener("pagehide", () => {
      if (popup.current === win) {
        popup.current = null;
        setContainer(null);
      }
    }, { once: true });
    setContainer(target);
    return true;
  }

  return { open, container };
}

const fill = { position: "absolute", inset: 0, width: "100%", height: "100%" } as const;

export function RenderOutput({ running, muted, container, hat, status, layers, timeline, onFirstFrame }: {
  running: boolean;
  muted: boolean;
  container: HTMLElement | null;
  hat?: LockedHat;
  status: string;
  layers: SketchLayer[];
  timeline?: OrbisTimeline;
  onFirstFrame: () => void;
}) {
  const player = useRef<HTMLDivElement>(null);
  useFirstOrbisFrame(player, running, onFirstFrame);
  const [mirror, setMirror] = useState<HTMLCanvasElement | null>(null);
  const [sketchMirror, setSketchMirror] = useState<HTMLCanvasElement | null>(null);
  const images = layers.some(({ selected }) => selected);
  return <>
    <div className="live-frame" ref={player}>
      {running ? <ReactorView track="main_video" audioTrack="main_audio" muted={muted}
        style={fill} videoObjectFit="contain" /> : (!timeline || timeline.endedAt !== undefined) &&
        <span role="status" className="live-placeholder">{status}</span>}
      {running && hat && <LockedHatOverlay hat={hat} player={player} mirror={mirror} />}
      {running && images && <SketchOutput player={player} layers={layers} mirror={sketchMirror} inset={!!hat} />}
    </div>
    {timeline && <OrbisRenderTimeline timeline={timeline} />}
    {container && running && createPortal(
      <>
        <ReactorView track="main_video" muted style={fill} videoObjectFit="contain" />
        {hat && <canvas ref={setMirror} width={WIDTH} height={HEIGHT}
          style={{ ...fill, objectFit: "contain", pointerEvents: "none" }} />}
        {images && <canvas ref={setSketchMirror} width={WIDTH} height={HEIGHT} aria-hidden="true"
          style={{ ...fill, objectFit: "contain", pointerEvents: "none" }} />}
      </>,
      container,
    )}
  </>;
}
