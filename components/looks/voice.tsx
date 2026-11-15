"use client";

import { useEffect, useRef, useState } from "react";
import { transcribeAudio } from "@/lib/looks/requests";

const recorderTypes = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"];

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
    return () => { active.current?.abort(); active.current = null; stop.current = null; };
  }, [context]);

  async function record() {
    if (active.current || disabled) return;
    const job = new AbortController();
    active.current = job;
    stop.current = () => {
      job.abort();
      if (active.current === job) {
        active.current = null;
        stop.current = null;
        setStatus("");
        callbacks.current.onError("The microphone was still starting. Hold until Listening appears.");
      }
    };
    setStatus("Starting mic…");
    let stream: MediaStream | undefined;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Microphone recording is unavailable in this browser.");
      }
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (job.signal.aborted) return;
      const mimeType = recorderTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recording = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
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
        recording.ondataavailable = (event) => { if (event.data.size) parts.push(event.data); };
        recording.onerror = () => { cleanup(); reject(new Error("Recording failed.")); };
        recording.onstop = () => {
          cleanup();
          resolve(new Blob(parts, { type: parts[0]?.type || recording.mimeType || mimeType }));
        };
        try { recording.start(); setStatus("Listening…"); } catch (error) { cleanup(); reject(error); }
      });
      stream.getTracks().forEach((track) => track.stop());
      if (job.signal.aborted) return;
      setStatus("Transcribing…");
      const text = await transcribeAudio(audio, job.signal);
      if (job.signal.aborted) return;
      if (text) callbacks.current.onTranscript(text);
      else callbacks.current.onError("No speech detected. Speak while Listening appears.");
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
      onLostPointerCapture={() => stop.current?.()}
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
