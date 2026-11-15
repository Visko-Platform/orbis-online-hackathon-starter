"use client";

import { useEffect, useRef } from "react";

/** A one-shot visual effect on the warp canvas. */
export type Pulse = { kind: "jump" | "arrive"; id: number };

/** How long the jump burst lasts. */
export const JUMP_BURST_MS = 2_400;

/**
 * One-shot effects on a canvas over the world.
 *  - "jump" (≈2.4 s): a glow blooms at the vanishing point, tinted streaks
 *    stretch past with a soft glow, quantum sparkles twinkle in, a light ring
 *    races outward, and it all clears with a brief flash.
 *  - "arrive" (≈1 s): a single expanding ring and a scatter of sparkles.
 * Nothing is drawn between pulses.
 */
export function WarpCanvas({
  pulse,
  sustain = false,
}: {
  pulse: Pulse | null;
  /** While true (in transit between worlds), the streak tunnel keeps flowing
   *  at a lower intensity after the jump burst, until arrival. */
  sustain?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const started = useRef<{ kind: Pulse["kind"]; at: number } | null>(null);
  const sustainRef = useRef(sustain);
  sustainRef.current = sustain;

  useEffect(() => {
    if (pulse) started.current = { kind: pulse.kind, at: performance.now() };
  }, [pulse]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;

    const tints = ["215,238,255", "170,215,255", "205,190,255", "255,255,255"];
    const streaks = Array.from({ length: 360 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.25,
      speed: 0.5 + Math.random() * 1.1,
      tint: tints[Math.floor(Math.random() * tints.length)],
    }));
    const sparkles = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      size: 0.6 + Math.random() * 1.8,
      delay: Math.random() * 0.5,
    }));

    let frame = 0;
    let cruise = 0; // the sustained tunnel's level, eased
    let width = 0;
    let height = 0;
    let last = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio, 2);
      width = element.clientWidth;
      height = element.clientHeight;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();

    // Smooth 0→1→0 envelope over [0, 1] with given attack/release fractions.
    const envelope = (t: number, attack: number, release: number) => {
      if (t <= 0 || t >= 1) return 0;
      const smooth = (x: number) => x * x * (3 - 2 * x);
      if (t < attack) return smooth(t / attack);
      if (t > 1 - release) return smooth((1 - t) / release);
      return 1;
    };

    const sparkle = (x: number, y: number, size: number, alpha: number) => {
      const glow = context.createRadialGradient(x, y, 0, x, y, size * 4);
      glow.addColorStop(0, `rgba(235,245,255,${alpha})`);
      glow.addColorStop(1, "rgba(235,245,255,0)");
      context.fillStyle = glow;
      context.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
      // A thin four-point glint.
      context.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
      context.lineWidth = 0.7;
      context.beginPath();
      context.moveTo(x - size * 3, y);
      context.lineTo(x + size * 3, y);
      context.moveTo(x, y - size * 3);
      context.lineTo(x, y + size * 3);
      context.stroke();
    };

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      context.clearRect(0, 0, width, height);
      cruise += ((sustainRef.current ? 0.42 : 0) - cruise) * (1 - Math.exp(-dt * 2.2));
      let effect = started.current;
      let t = 0;
      if (effect) {
        const duration = effect.kind === "jump" ? JUMP_BURST_MS : 1_000;
        t = (time - effect.at) / duration;
        if (t >= 1) {
          started.current = null;
          effect = null;
        }
      }
      if (!effect && cruise < 0.01) return;

      const cx = width * 0.5;
      const cy = height * 0.45; // middle of the windshield
      const reach = Math.hypot(width, height) * 0.62;
      context.globalCompositeOperation = "lighter";

      if (!effect || effect.kind === "jump") {
        // The burst rides on top of the sustained transit tunnel.
        const burst = effect ? envelope(t, 0.22, 0.38) : 0;
        const level = Math.max(burst, cruise);

        // Bloom at the vanishing point.
        const bloom = context.createRadialGradient(cx, cy, 0, cx, cy, reach * 0.45);
        bloom.addColorStop(0, `rgba(205,232,255,${0.7 * level})`);
        bloom.addColorStop(0.35, `rgba(140,165,255,${0.22 * level})`);
        bloom.addColorStop(1, "rgba(140,160,255,0)");
        context.fillStyle = bloom;
        context.fillRect(0, 0, width, height);

        // Streaks: a wide soft stroke under a thin bright core.
        context.lineCap = "round";
        for (const streak of streaks) {
          streak.dist += dt * streak.speed * (0.25 + level * 2.2) * (streak.dist + 0.06);
          if (streak.dist > 1.1) {
            streak.dist = Math.random() * 0.06;
            streak.angle = Math.random() * Math.PI * 2;
          }
          const outer = streak.dist * reach;
          const inner = outer * (1 - 0.5 * level);
          const cos = Math.cos(streak.angle);
          const sin = Math.sin(streak.angle);
          const alpha = Math.min(1, streak.dist * 1.8) * level;
          const x1 = cx + cos * inner;
          const y1 = cy + sin * inner;
          const x2 = cx + cos * outer;
          const y2 = cy + sin * outer;
          context.strokeStyle = `rgba(${streak.tint},${alpha * 0.3})`;
          context.lineWidth = 3 + streak.dist * 9;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.stroke();
          context.strokeStyle = `rgba(${streak.tint},${Math.min(1, alpha * 1.1)})`;
          context.lineWidth = 0.8 + streak.dist * 2.2;
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.stroke();
        }

        // Quantum sparkles twinkle in during the charge (burst only).
        if (effect) for (const spark of sparkles) {
          const local = envelope((t - spark.delay * 0.4) / 0.75, 0.3, 0.5);
          if (local <= 0) continue;
          const twinkle = 0.5 + 0.5 * Math.sin(time / 90 + spark.phase);
          sparkle(spark.x * width, spark.y * height, spark.size * 1.4, Math.min(1, local * twinkle * 1.1));
        }

        // A light ring racing outward at the moment of the jump.
        const ringT = (t - 0.42) / 0.3;
        if (effect && ringT > 0 && ringT < 1) {
          context.strokeStyle = `rgba(220,240,255,${(1 - ringT) * 0.55})`;
          context.lineWidth = 3 + (1 - ringT) * 10;
          context.beginPath();
          context.ellipse(cx, cy, reach * ringT, reach * ringT * 0.62, 0, 0, Math.PI * 2);
          context.stroke();
        }

        // Clear with a brief flash.
        // A soft flash only when nothing sustains the tunnel after the burst.
        const flash = sustainRef.current ? 0 : envelope((t - 0.6) / 0.25, 0.3, 0.7);
        if (effect && flash > 0) {
          context.globalCompositeOperation = "source-over";
          context.fillStyle = `rgba(235,245,255,${flash * 0.35})`;
          context.fillRect(0, 0, width, height);
        }
      } else {
        // Arrival: one ring and a scatter of sparkles.
        const ringT = t / 0.7;
        if (ringT < 1) {
          // A wide faint halo under a thin bright edge.
          for (const [width, alpha] of [[18, 0.12], [2.5, 0.5]] as const) {
            context.strokeStyle = `rgba(200,245,240,${(1 - ringT) * alpha})`;
            context.lineWidth = width * (1 - ringT * 0.5);
            context.beginPath();
            context.ellipse(cx, cy, reach * 0.8 * ringT, reach * 0.5 * ringT, 0, 0, Math.PI * 2);
            context.stroke();
          }
        }
        const fade = envelope(t, 0.15, 0.6);
        sparkles.slice(0, 50).forEach((spark) => {
          const twinkle = 0.5 + 0.5 * Math.sin(time / 70 + spark.phase);
          sparkle(spark.x * width, spark.y * height, spark.size * 0.8, fade * twinkle * 0.6);
        });
      }
      context.globalCompositeOperation = "source-over";
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas className="sw-warp" ref={canvas} aria-hidden />;
}
