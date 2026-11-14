"use client";

import { useEffect, useRef, useState } from "react";
import { HEIGHT, WIDTH, paint, type Point } from "@/lib/camera/ink";
import { description, signal } from "@/lib/camera/pair";
import { transcribeAudio } from "@/lib/looks/requests";
import { bindPointer } from "./pointer";
import styles from "./studio.module.css";

export function Phone() {
  const video = useRef<HTMLVideoElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const channel = useRef<RTCDataChannel>(null);
  const [status, setStatus] = useState("Connecting to Mac…");
  
  const recorder = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [autoApply, setAutoApply] = useState(true);

  useEffect(() => {
    const match = location.hash.match(/^#([\w-]{32})\.([\w-]{32})$/);
    if (!match) {
      setStatus("Scan a pairing link from the Mac.");
      return;
    }
    history.replaceState(null, "", location.pathname);
    const [, id, key] = match;
    const abort = new AbortController();
    const peer = new RTCPeerConnection({ iceServers: [] });
    const player = video.current!;
    const canvas = overlay.current!;
    const ctx = canvas.getContext("2d")!;
    let points: Point[] = [];
    let clear = 0;
    const deadline = window.setTimeout(() => disconnect("Could not connect. Open a new link from the Mac."), 20_000);
    const unbind = bindPointer(canvas, (action, point) => {
      const connection = channel.current;
      if (connection?.readyState !== "open") return;
      if (action === "move" && connection.bufferedAmount > 64_000) return;
      connection.send(JSON.stringify({ action, point }));
      if (action === "start") {
        points = [];
        window.clearTimeout(clear);
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
      }
      if (point) {
        const next = { x: point.x * WIDTH, y: point.y * HEIGHT };
        paint(ctx, points.length ? [points[points.length - 1], next] : [next]);
        points.push(next);
      }
      if (action === "end" || action === "cancel") {
        clear = window.setTimeout(() => ctx.clearRect(0, 0, WIDTH, HEIGHT), 180);
      }
    });
    function disconnect(message: string) {
      if (abort.signal.aborted) return;
      abort.abort();
      window.clearTimeout(deadline);
      peer.close();
      player.srcObject = null;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      setStatus(message);
    }
    peer.ontrack = ({ track }) => {
      player.srcObject = new MediaStream([track]);
      void player.play().catch(() => setStatus("Tap the picture to play."));
    };
    peer.ondatachannel = ({ channel: incoming }) => {
      channel.current = incoming;
      incoming.onopen = () => { window.clearTimeout(deadline); setStatus(""); };
      incoming.onclose = () => disconnect("Mac disconnected. Open a new link to reconnect.");
    };
    peer.onconnectionstatechange = () => {
      if (["failed", "disconnected"].includes(peer.connectionState)) {
        disconnect("Connection lost. Open a new link from the Mac.");
      }
    };
    void (async () => {
      try {
        const offer = await signal({ action: "offer", id, key }, abort.signal);
        await peer.setRemoteDescription({ type: "offer", sdp: offer.sdp });
        await peer.setLocalDescription(await peer.createAnswer());
        await signal({ action: "answer", id, key, sdp: await description(peer, abort.signal) }, abort.signal);
      } catch (error) {
        disconnect(error instanceof Error ? error.message : "Could not connect.");
      }
    })();
    return () => {
      abort.abort();
      window.clearTimeout(clear);
      window.clearTimeout(deadline);
      unbind();
      peer.close();
      player.srcObject = null;
      channel.current = null;
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        if (blob.size === 0) return;
        setStatus("Transcribing...");
        try {
          const text = await transcribeAudio(blob);
          if (text && channel.current?.readyState === "open") {
            channel.current.send(JSON.stringify({ action: "prompt", text, autoApply }));
          }
          setStatus("");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Transcription failed.");
        }
      };
      recorder.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
      setStatus("Recording...");
    } catch (error) {
      setStatus("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (recorder.current && recorder.current.state !== "inactive") {
      recorder.current.stop();
      setRecording(false);
    }
  };

  return (
    <main className={styles.phone}>
      <div className={styles.stage}>
        <video ref={video} autoPlay muted playsInline />
        <canvas ref={overlay} width={WIDTH} height={HEIGHT} aria-label="Draw on live video"
          onClick={() => { void video.current?.play().catch(() => {}); }} />
      </div>
      <div className={styles.controls}>
        <button disabled={!!status} onClick={() => {
          if (channel.current?.readyState === "open") channel.current.send(JSON.stringify({ action: "undo" }));
        }}>Undo</button>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={autoApply} onChange={(e) => setAutoApply(e.target.checked)} />
          Auto-Steer
        </label>
        <button 
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerCancel={stopRecording}
          onContextMenu={(e) => e.preventDefault()}
          style={{ 
            background: recording ? "#cc0000" : "#222", 
            color: "#fff", 
            padding: "16px",
            fontWeight: "bold",
            flexGrow: 1,
            touchAction: "none"
          }}
        >
          {recording ? "Release to Send" : "Hold to Speak"}
        </button>
        <span role="status">{status}</span>
      </div>
    </main>
  );
}
