"use client";

import { useEffect, type RefObject } from "react";

export function useFirstOrbisFrame(
  player: RefObject<HTMLDivElement | null>,
  running: boolean,
  onFrame: () => void,
) {
  useEffect(() => {
    const video = running ? player.current?.querySelector("video") : undefined;
    if (!video) return;

    if (typeof video.requestVideoFrameCallback === "function") {
      const id = video.requestVideoFrameCallback(() => onFrame());
      return () => video.cancelVideoFrameCallback(id);
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      onFrame();
      return;
    }

    const onLoadedData = () => { if (video.videoWidth > 0) onFrame(); };
    video.addEventListener("loadeddata", onLoadedData);
    return () => video.removeEventListener("loadeddata", onLoadedData);
  }, [onFrame, player, running]);
}
