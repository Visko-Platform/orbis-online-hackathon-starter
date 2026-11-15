"use client";

import { useEffect, useRef, useState } from "react";

export function Voice({ context, disabled, onTranscript, onError, held = false, gestureOnly = false }: {
  context: number;
  disabled: boolean;
  onTranscript: (text: string) => void;
  onError: (text: string) => void;
  held?: boolean;
  gestureOnly?: boolean;
}) {
  const active = useRef<AbortController | null>(null);
  const stop = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState("");
  const callbacks = useRef({ onTranscript, onError });
  useEffect(() => { callbacks.current = { onTranscript, onError }; }, [onTranscript, onError]);
  useEffect(() => {
    setStatus("");
    return () => { active.current?.abort(); active.current = null; };
  }, [context]);

  async function record() {
    if (active.current || disabled) return;
    const job = new AbortController();
    active.current = job;
    stop.current = () => job.abort();
    setStatus("Starting mic…");
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (job.signal.aborted) return;
      const recording = new MediaRecorder(stream);
      const audio = await new Promise<Blob>((resolve, reject) => {
        const parts: Blob[] = [];
        const finish = () => { if (recording.state !== "inactive") recording.stop(); };
        const timeout = window.setTimeout(finish, 10_000);
        const cleanup = () => {
          clearTimeout(timeout);
          job.signal.removeEventListener("abort", finish);
        };
        stop.current = finish;
        job.signal.addEventListener("abort", finish, { once: true });
        recording.ondataavailable = (event) => parts.push(event.data);
        recording.onerror = () => { cleanup(); reject(new Error("Recording failed.")); };
        recording.onstop = () => { cleanup(); resolve(new Blob(parts, { type: recording.mimeType })); };
        try { recording.start(); } catch (error) { cleanup(); reject(error); }
        setStatus("Listening…");
      });
      stream.getTracks().forEach((track) => track.stop());
      if (job.signal.aborted || !audio.size) return;
      setStatus("Transcribing…");
      const body = new FormData();
      body.append("audio", audio, "instruction");
      const response = await fetch("/api/looks/transcribe", { method: "POST", body, signal: job.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (!job.signal.aborted && result.transcript) callbacks.current.onTranscript(result.transcript);
    } catch (error) {
      if (!job.signal.aborted) callbacks.current.onError(error instanceof Error ? error.message : "Microphone unavailable.");
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
      if (active.current === job) {
        active.current = null;
        stop.current = null;
        setStatus("");
      }
    }
  }

  useEffect(() => { if (held) void record(); else stop.current?.(); }, [held]);

  return <>
    {!gestureOnly && <button type="button" disabled={disabled} aria-label="Hold to talk"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        void record();
      }}
      onPointerUp={() => stop.current?.()}
      onPointerCancel={() => active.current?.abort()}
      onKeyDown={(event) => {
        if (event.key === "Escape") active.current?.abort();
        if (event.key !== " " && event.key !== "Enter") return;
        event.preventDefault();
        if (!event.repeat) void record();
      }}
      onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") stop.current?.(); }}
      onBlur={() => stop.current?.()}>
      {status || "Hold to talk"}
    </button>}
    <span className="looks-sr" role="status">{status}</span>
  </>;
}
