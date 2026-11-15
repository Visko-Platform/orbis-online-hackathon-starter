"use client";

import { ReactorView } from "@reactor-team/js-sdk";
import type { ReactNode } from "react";

type OrbisPlayerProps = {
  children?: ReactNode;
  connected: boolean;
  muted: boolean;
  paused: boolean;
  runStarted: boolean;
  status: string;
};

export function OrbisPlayer({
  children,
  connected,
  muted,
  paused,
  runStarted,
  status,
}: OrbisPlayerProps) {
  return (
    <div className="player">
      {runStarted ? (
        <ReactorView
          track="main_video"
          audioTrack="main_audio"
          muted={muted}
          videoObjectFit="contain"
        />
      ) : (
        <div className="player-placeholder">
          {connected ? "Set the scene, then call action" : "Connect to begin"}
        </div>
      )}
      <span className={`status status-${status}`}>{status}</span>
      {runStarted && (
        <span className={paused ? "live-badge live-badge-paused" : "live-badge"}>
          {paused ? "Paused" : "● Rolling"}
        </span>
      )}
      {children}
    </div>
  );
}
