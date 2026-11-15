"use client";

import { useCallback, useRef, useState } from "react";

type Phase = "connecting" | "preparing" | "rendering" | "live" | "stopped";

export type OrbisTimeline = {
  phase: Phase;
  startedAt: number;
  endedAt?: number;
  estimateMs?: number;
  storageKey?: string;
};

function readEstimate(key: string) {
  try {
    const estimate = Number(sessionStorage.getItem(key));
    if (Number.isFinite(estimate) && estimate > 0) return estimate;
  } catch {
    // Elapsed time works even when browser storage is unavailable.
  }
}

export function useOrbisTimeline() {
  const [timeline, setTimeline] = useState<OrbisTimeline>();
  const current = useRef<OrbisTimeline>(undefined);

  const update = useCallback((next: OrbisTimeline) => {
    current.current = next;
    setTimeline(next);
  }, []);

  const firstFrame = useCallback(() => {
    const run = current.current;
    if (!run || run.phase !== "rendering") return;
    const endedAt = performance.now();
    update({ ...run, phase: "live", endedAt });
    if (!run.storageKey) return;
    try {
      sessionStorage.setItem(run.storageKey, String(endedAt - run.startedAt));
    } catch {
      // The frame and measured time are already displayed.
    }
  }, [update]);

  const stop = useCallback(() => {
    const run = current.current;
    if (run && run.endedAt === undefined) update({ ...run, phase: "stopped", endedAt: performance.now() });
  }, [update]);

  return {
    timeline,
    firstFrame,
    stop,
    begin: (connecting: boolean) => {
      update({ startedAt: performance.now(), phase: connecting ? "connecting" : "preparing" });
    },
    prepare: (resolution: string, hasImage: boolean) => {
      const run = current.current;
      if (!run || run.endedAt !== undefined) return;
      const storageKey = `orbis:first-frame:${resolution}:${hasImage ? "image" : "text"}:${run.phase}`;
      update({ ...run, phase: "preparing", storageKey, estimateMs: readEstimate(storageKey) });
    },
    render: () => {
      const run = current.current;
      if (run?.phase === "preparing") update({ ...run, phase: "rendering" });
    },
    stopEstimating: () => {
      const run = current.current;
      if (run?.phase === "rendering") update({ ...run, storageKey: undefined, estimateMs: undefined });
    },
  };
}
