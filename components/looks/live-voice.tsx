"use client";

import { useEffect, useRef, useState } from "react";
import { openLiveAudio } from "@/lib/looks/live-audio";

export function LiveVoice({ question, disabled, busy, onTranscript, onError }: {
  question?: string;
  disabled?: boolean;
  busy?: boolean;
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
}) {
  const session = useRef<ReturnType<typeof openLiveAudio> | null>(null);
  const callbacks = useRef({ onTranscript, onError });
  const readQuestion = useRef("");
  const [status, setStatus] = useState("");
  useEffect(() => { callbacks.current = { onTranscript, onError }; }, [onTranscript, onError]);
  useEffect(() => () => session.current?.close(), []);
  useEffect(() => {
    if (!question) readQuestion.current = "";
    if (question && session.current && !status && readQuestion.current !== question) {
      readQuestion.current = question;
      void session.current.speak(question);
    }
  }, [question, status]);
  useEffect(() => {
    if (disabled) {
      session.current?.close();
      session.current = null;
      setStatus("");
    }
  }, [disabled]);

  function start() {
    if (status === "Listening…") { session.current?.stop(); return; }
    if (status || disabled || busy) return;
    try {
      session.current ??= openLiveAudio({ status: setStatus,
        transcript: (text) => callbacks.current.onTranscript(text),
        error: (error) => { session.current = null; setStatus(""); callbacks.current.onError(error); } });
      if (question && readQuestion.current !== question) {
        readQuestion.current = question;
        void session.current.speak(question);
      } else void session.current.listen();
    } catch {
      callbacks.current.onError("Microphone unavailable. You can continue by typing.");
    }
  }

  return <>
    <button type="button" disabled={disabled || (status !== "Listening…" && (busy || !!status))} onClick={start}>
      {status === "Listening…" ? "Finish speaking" : status || (question ? "Speak or hear question" : "Speak")}
    </button>
    <span className="looks-sr" role="status">{status}</span>
  </>;
}
