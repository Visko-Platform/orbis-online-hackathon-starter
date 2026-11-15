"use client";

import { useEffect, useState } from "react";
import type { OrbisTimeline } from "@/hooks/use-orbis-timeline";
import styles from "./orbis-render-timeline.module.css";

const phaseLabels = {
  connecting: "Connecting to Orbis",
  preparing: "Preparing scene",
  rendering: "Rendering first frame",
  live: "First frame",
  stopped: "Render stopped",
};

export function OrbisRenderTimeline({ timeline }: { timeline: OrbisTimeline }) {
  const { startedAt, endedAt, phase, estimateMs } = timeline;
  const [now, setNow] = useState(startedAt);
  const pending = endedAt === undefined;

  useEffect(() => {
    if (endedAt !== undefined) return;
    const timer = window.setInterval(() => setNow(performance.now()), 200);
    return () => window.clearInterval(timer);
  }, [endedAt, startedAt]);

  const elapsedMs = Math.max(0, (endedAt ?? now) - startedAt);
  const percent = estimateMs !== undefined ? Math.min(99, Math.floor(elapsedMs / estimateMs * 100)) : undefined;
  const estimateText = estimateMs === undefined ? undefined
    : elapsedMs >= estimateMs ? "Taking longer than estimated"
    : `~${Math.ceil((estimateMs - elapsedMs) / 1_000)}s left`;

  return (
    <div className={styles.timeline}>
      <div className={styles.row}>
        <span role="status">{phaseLabels[phase]}</span>
        <span>{(elapsedMs / 1_000).toFixed(1)}s{pending ? " elapsed" : ""}</span>
      </div>
      {pending && <>
        <progress aria-label="Estimated progress to first frame" max={100} value={percent} />
        {estimateText && <div className={styles.row}>
          <span>{estimateText}</span>
          <span>~{percent}%</span>
        </div>}
      </>}
    </div>
  );
}
