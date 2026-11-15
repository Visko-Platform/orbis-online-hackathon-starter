import { useEffect, useRef, useState, type RefObject } from "react";
import type { LockedHat } from "@/lib/camera/locked-hat";
import { HEIGHT, WIDTH } from "@/lib/camera/ink";

export function LockedHatOverlay({ hat, player, mirror }: {
  hat: LockedHat;
  player: RefObject<HTMLDivElement | null>;
  mirror: HTMLCanvasElement | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Preparing hat tracking…");

  useEffect(() => {
    const host = player.current;
    const target = canvas.current;
    if (!host || !target) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    let video: HTMLVideoElement | null = null;

    function bind() {
      const next = host!.querySelector("video");
      if (next === video) return;
      stop?.();
      video = next;
      if (!next) return;
      void import("@/lib/camera/hat-composite").then(({ compositeHat }) => {
        if (cancelled || video !== next) return;
        stop = compositeHat(next, target!, hat, (state) => setStatus(
          state === "tracking" ? "Hat locked" : state === "lost" ? "Finding head pose…" : "Hat tracking unavailable",
        ), mirror);
      }).catch(() => { if (!cancelled) setStatus("Hat tracking unavailable"); });
    }

    const observer = new MutationObserver(bind);
    observer.observe(host, { childList: true, subtree: true });
    bind();
    return () => { cancelled = true; observer.disconnect(); stop?.(); };
  }, [hat, player, mirror]);

  return <>
    <canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label="Locked 3D hat" style={{ pointerEvents: "none" }} />
    <span className="live-hat-status" role="status">{status}</span>
  </>;
}
