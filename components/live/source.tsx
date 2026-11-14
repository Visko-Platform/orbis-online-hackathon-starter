"use client";

import { useEffect, useRef } from "react";
import { bindPointer } from "@/components/camera/pointer";
import { HEIGHT, Ink, WIDTH } from "@/lib/camera/ink";

export function Source({ ink, revision, update, label }: {
  ink: Ink;
  revision: number;
  update: () => void;
  label: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current!;
    return bindPointer(element, (action, point) => {
      ink.apply(label, action, point);
      update();
    });
  }, [ink, label, update]);
  useEffect(() => {
    const context = canvas.current!.getContext("2d")!;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    ink.draw(context);
  }, [ink, revision]);

  return <div className="live-frame live-paper">
    <canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label={label} />
  </div>;
}

