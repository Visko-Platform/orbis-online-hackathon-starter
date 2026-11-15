"use client";

import { ReactorView } from "@reactor-team/js-sdk";
import { useRef } from "react";
import { useFirstOrbisFrame } from "@/hooks/use-first-orbis-frame";
import type { OrbisTimeline } from "@/hooks/use-orbis-timeline";
import { OrbisRenderTimeline } from "./orbis-render-timeline";

type OrbisPlayerProps = {
  connected: boolean;
  muted: boolean;
  runStarted: boolean;
  status: string;
  timeline?: OrbisTimeline;
  onFirstFrame: () => void;
};

export function OrbisPlayer({
  connected,
  muted,
  runStarted,
  status,
  timeline,
  onFirstFrame,
}: OrbisPlayerProps) {
  const player = useRef<HTMLDivElement>(null);
  useFirstOrbisFrame(player, runStarted, onFirstFrame);

  return (
    <div>
      <div className="player" ref={player}>
        {runStarted ? (
          <ReactorView
            track="main_video"
            audioTrack="main_audio"
            muted={muted}
            videoObjectFit="contain"
          />
        ) : (!timeline || timeline.endedAt !== undefined) && (
          <div className="player-placeholder">
            {connected ? "Configure and start a run" : "Connect to Orbis Stable"}
          </div>
        )}
        <span className={`status status-${status}`}>{status}</span>
      </div>
      {timeline && <OrbisRenderTimeline timeline={timeline} />}
    </div>
  );
}
