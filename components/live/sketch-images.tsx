"use client";

import { useEffect, useRef, type RefObject } from "react";
import { HEIGHT, Ink, WIDTH } from "@/lib/camera/ink";
import { drawSketchLayers, type SketchLayer } from "@/lib/camera/sketch-layer";
import { track } from "@/lib/camera/tracking";

const canvasStyle = { position: "absolute", inset: 0, width: "100%", height: "100%",
  objectFit: "contain", pointerEvents: "none" } as const;

export function SketchOutput({ player, layers, mirror, inset }: {
  player: RefObject<HTMLDivElement | null>;
  layers: SketchLayer[];
  mirror: HTMLCanvasElement | null;
  inset: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef(layers);
  useEffect(() => { latest.current = layers; }, [layers]);

  useEffect(() => {
    const host = player.current, target = canvas.current;
    if (!host || !target) return;
    const context = target.getContext("2d")!;
    const obs = mirror?.getContext("2d");
    const anchors = new Ink();
    anchors.overlayJoints = () => latest.current.flatMap((layer) =>
      layer.selected && layer.target !== "Shoulders" ? [layer.target] : []);
    let video: HTMLVideoElement | null = null;
    let stop: (() => void) | undefined;

    function bind() {
      const next = host!.querySelector("video");
      if (video === next) return;
      stop?.();
      video = next;
      if (!next) return;
      stop = track(next, anchors, () => {}, undefined, undefined, {
        geometry() {
          const scale = Math.min(WIDTH / next.videoWidth, HEIGHT / next.videoHeight) * (inset ? 0.82 : 1);
          const width = next.videoWidth * scale, height = next.videoHeight * scale;
          return { width, height, x: (WIDTH - width) / 2, y: (HEIGHT - height) / 2 + (inset ? 15 : 0) };
        },
        shoulders: () => latest.current.some(({ selected, target }) => selected && target === "Shoulders"),
      });
    }

    let frame: number;
    function draw() {
      context.clearRect(0, 0, WIDTH, HEIGHT);
      drawSketchLayers(context, anchors, latest.current);
      if (obs) {
        obs.clearRect(0, 0, WIDTH, HEIGHT);
        obs.drawImage(target!, 0, 0);
      }
      frame = requestAnimationFrame(draw);
    }
    const observer = new MutationObserver(bind);
    observer.observe(host, { childList: true, subtree: true });
    bind();
    draw();
    return () => {
      observer.disconnect();
      stop?.();
      cancelAnimationFrame(frame);
      obs?.clearRect(0, 0, WIDTH, HEIGHT);
    };
  }, [player, mirror, inset]);

  return <canvas ref={canvas} width={WIDTH} height={HEIGHT} style={canvasStyle} aria-hidden="true" />;
}

export function SketchImageChoices({ layers, select }: {
  layers: SketchLayer[];
  select: (id: number, selected: boolean) => void;
}) {
  const images = layers.filter(({ generating, image, error }) => generating || image || error);
  if (!images.length) return null;
  return <ul className="live-sketch-images" aria-label="Sketch images">
    {images.map((layer) => <li key={layer.id}>
      {layer.preview && <img src={layer.preview} alt={layer.transcript} />}
      {layer.generating && <span role="status">Generating image…</span>}
      {layer.error && <span role="status">{layer.error}</span>}
      {layer.image && <button type="button" onClick={() => select(layer.id, !layer.selected)}>
        {layer.selected ? "Use sketch" : "Use image"}
      </button>}
    </li>)}
  </ul>;
}
