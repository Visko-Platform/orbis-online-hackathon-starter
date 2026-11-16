"use client";

import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";

import type { OrbisSession } from "@/hooks/use-orbis-session";

// Keep in sync with the installed @mediapipe/tasks-vision version.
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// Half-width of the neutral zone around the frame centre (0–0.5).
const DEAD_ZONE = 0.16;
// The hand must hold a direction this long before it counts.
const HOLD_MS = 400;
// Orbis applies a prompt at the next chunk boundary (2–4 s to land), so
// sending faster than this only queues competing morphs.
const MIN_STEER_INTERVAL_MS = 2_500;

type Direction = "level" | "left" | "right" | "up" | "down";

const DIRECTION_LABEL: Record<Direction, string> = {
  level: "Level",
  left: "Bank left",
  right: "Bank right",
  up: "Climb",
  down: "Dive",
};

// Orbis steering prompts are deltas: one visible action, scene not restated.
function steeringPrompt(direction: Direction, subject: string) {
  const name = subject.trim() || "main subject";
  const s = /^(the|a|an)\s/i.test(name) ? name : `the ${name}`;
  const S = s.charAt(0).toUpperCase() + s.slice(1);
  switch (direction) {
    case "left":
      return `${S} banks to the left and keeps flying, curving steadily leftward as the camera follows behind it.`;
    case "right":
      return `${S} banks to the right and keeps flying, curving steadily rightward as the camera follows behind it.`;
    case "up":
      return `${S} pulls its nose up and climbs steadily higher into the sky as the camera follows behind it.`;
    case "down":
      return `${S} tips its nose down and descends steadily lower toward the ground as the camera follows behind it.`;
    case "level":
      return `${S} levels out and continues flying straight ahead as the camera follows behind it.`;
  }
}

// x and y are 0–1 in the mirrored preview. Only the dominant axis counts,
// because Orbis blurs compound actions.
function directionFor(x: number, y: number): Direction {
  const dx = x - 0.5;
  const dy = y - 0.5;
  if (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE) return "level";
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}

export function HandFlightControl({ session }: { session: OrbisSession }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [direction, setDirection] = useState<Direction | null>(null);
  const [lastSteer, setLastSteer] = useState("");

  const canSteer = session.connected && session.runStarted && !session.paused;

  // The tracking loop outlives renders, so it reads the latest values here.
  const live = useRef({ canSteer, subject, sendSteer: session.sendSteer });
  live.current = { canSteer, subject, sendSteer: session.sendSteer };

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let frame = 0;
    let stream: MediaStream | undefined;
    let landmarker: HandLandmarker | undefined;

    let candidate: Direction = "level";
    let candidateSince = 0;
    let held: Direction | null = null;
    // Start from "level" so nothing is sent until the hand actually moves.
    let sent: Direction = "level";
    let sentAt = 0;
    let lastVideoTime = -1;

    const draw = (point: { x: number; y: number } | null) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(222, 213, 184, 0.7)";
      context.lineWidth = 2;
      context.strokeRect(
        width * (0.5 - DEAD_ZONE),
        height * (0.5 - DEAD_ZONE),
        width * DEAD_ZONE * 2,
        height * DEAD_ZONE * 2,
      );
      if (point) {
        context.fillStyle = "#8ee59d";
        context.beginPath();
        context.arc(point.x * width, point.y * height, 10, 0, Math.PI * 2);
        context.fill();
      }
    };

    const tick = () => {
      if (cancelled) return;
      frame = requestAnimationFrame(tick);

      const video = videoRef.current;
      if (!video || !landmarker || video.readyState < 2) return;
      if (video.currentTime === lastVideoTime) return;
      lastVideoTime = video.currentTime;

      const now = performance.now();
      const hand = landmarker.detectForVideo(video, now).landmarks[0];
      if (!hand) {
        // No hand in view: keep the last heading rather than snapping level.
        draw(null);
        held = null;
        setDirection(null);
        return;
      }

      // Palm centre: wrist plus the four finger bases. The preview is
      // mirrored, so flip x to match what the user sees.
      const palm = [0, 5, 9, 13, 17].map((index) => hand[index]);
      const x = 1 - palm.reduce((sum, p) => sum + p.x, 0) / palm.length;
      const y = palm.reduce((sum, p) => sum + p.y, 0) / palm.length;
      draw({ x, y });

      const next = directionFor(x, y);
      if (next !== candidate) {
        candidate = next;
        candidateSince = now;
      }
      if (now - candidateSince < HOLD_MS) return;

      if (held !== candidate) {
        held = candidate;
        setDirection(candidate);
      }

      const state = live.current;
      if (
        state.canSteer &&
        candidate !== sent &&
        now - sentAt >= MIN_STEER_INTERVAL_MS
      ) {
        sent = candidate;
        sentAt = now;
        const prompt = steeringPrompt(candidate, state.subject);
        setLastSteer(prompt);
        state.sendSteer(prompt);
      }
    };

    const start = async () => {
      setLoading(true);
      setError("");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (cancelled) return;

        const { FilesetResolver, HandLandmarker } = await import(
          "@mediapipe/tasks-vision"
        );
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
        landmarker = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 1,
        });
        if (cancelled) return;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (cancelled) return;

        setLoading(false);
        draw(null);
        frame = requestAnimationFrame(tick);
      } catch (caught) {
        if (cancelled) return;
        const denied =
          caught instanceof DOMException && caught.name === "NotAllowedError";
        setError(
          denied
            ? "Camera access was blocked. Allow the camera for this site and try again."
            : `Could not start hand tracking: ${
                caught instanceof Error ? caught.message : String(caught)
              }`,
        );
        setLoading(false);
        setEnabled(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      landmarker?.close();
      if (videoRef.current) videoRef.current.srcObject = null;
      setDirection(null);
    };
  }, [enabled]);

  let status = "Camera off";
  if (enabled) {
    if (loading) status = "Starting camera and hand tracker…";
    else if (!direction) status = "Show one hand to the camera";
    else if (!canSteer)
      status = `${DIRECTION_LABEL[direction]} — start a run to steer`;
    else status = DIRECTION_LABEL[direction];
  }

  return (
    <div className="hand-control">
      <div className="hand-control-header">
        <strong>Hand flight control</strong>
        <button type="button" onClick={() => setEnabled((current) => !current)}>
          {enabled ? "Turn camera off" : "Turn camera on"}
        </button>
      </div>
      <p className="hint">
        Hold one hand up to the camera. Move it left or right to bank, up to
        climb, down to dive, and back into the centre box to level out. Each
        change is sent to Orbis as a steering prompt and takes a few seconds to
        show.
      </p>

      <div className="hand-control-body">
        <div className="hand-preview">
          <video ref={videoRef} muted playsInline />
          <canvas ref={canvasRef} width={640} height={480} />
          <span className="status">{status}</span>
        </div>

        <div className="hand-control-side">
          <label>
            What is flying?
            <input
              type="text"
              value={subject}
              placeholder="e.g. the red biplane (default: main subject)"
              onChange={(event) => setSubject(event.target.value)}
            />
          </label>
          <aside>
            <strong>Last steering prompt</strong>
            <code>{lastSteer || "None sent yet"}</code>
          </aside>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
