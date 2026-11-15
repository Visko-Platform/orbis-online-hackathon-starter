"use client";

import { useState } from "react";
import { CameraIcon } from "@/components/camera/camera-icon";

type SetupGuideProps = {
  cameraReady: boolean;
  cameraStarting: boolean;
  cameraError: string;
  driveOn: boolean;
  trackingReady: boolean;
  sketchOn: boolean;
  generateSketchImages: boolean;
  microphone: "idle" | "requesting" | "ready";
  microphoneError: string;
  sketchPending: boolean;
  imageReady: boolean;
  preparingImage: boolean;
  generationStatus: string;
  canStartGeneration: boolean;
  generationBusy: boolean;
  running: boolean;
  connected: boolean;
  stopping: boolean;
  updating: boolean;
  startCamera: () => void;
  stopCamera: () => void;
  captureCamera: () => void;
  startGeneration: () => void;
  stopLive: () => void;
  updateRender: () => void;
  toggleDrive: () => void;
  toggleSketch: () => void;
  toggleGenerateSketchImages: () => void;
  enableMicrophone: () => void;
};

export function SetupGuide({ cameraReady, cameraStarting, cameraError, driveOn, trackingReady, sketchOn,
  generateSketchImages, microphone, microphoneError, sketchPending, imageReady, preparingImage, generationStatus,
  canStartGeneration, generationBusy, running, connected, stopping, updating, startCamera, stopCamera, captureCamera, startGeneration,
  stopLive, updateRender,
  toggleDrive, toggleSketch, toggleGenerateSketchImages, enableMicrophone }: SetupGuideProps) {
  const [microphoneSkipped, setMicrophoneSkipped] = useState(false);
  if (running) return <section className="live-setup live-setup-running" aria-label="Studio setup">
    <span className="live-setup-done">✓</span><span>Live</span>
    <span className="live-setup-note">Camera {cameraReady ? "on" : "off"} · Microphone {microphone === "ready" ? "ready" : "off"}</span>
    <button type="button" aria-pressed={driveOn} onClick={toggleDrive}>Drive Orbis</button>
    <button type="button" aria-pressed={sketchOn} onClick={toggleSketch}>Live sketch</button>
    <button type="button" aria-pressed={generateSketchImages} disabled={!sketchOn}
      onClick={toggleGenerateSketchImages}>Generate sketch images</button>
    <button type="button" disabled={!cameraReady || sketchPending || generationBusy || updating || stopping}
      onClick={updateRender}>{updating ? "Updating…" : "Update render"}</button>
    <button type="button" className="live-stop" disabled={stopping}
      onClick={stopLive}>{stopping ? "Stopping…" : "Stop and disconnect"}</button>
    {microphone !== "ready" && <button type="button" disabled={microphone === "requesting"}
      onClick={enableMicrophone}>Enable microphone</button>}
  </section>;

  const offerMicrophone = cameraReady && sketchOn && microphone !== "ready" && !microphoneSkipped;
  const current = offerMicrophone ? 3 : imageReady || canStartGeneration || sketchPending ? 5 : cameraReady ? 4 : 1;
  const steps = [
    { label: "Start camera", done: cameraReady, detail: cameraError || (cameraReady ? "Camera ready" : cameraStarting ? "Starting camera…" : "Choose your camera source below") },
    { label: "Live controls", done: sketchOn, detail: `Drive Orbis ${driveOn ? trackingReady ? "· tracking ready" : "· waiting for motion" : "· off"}  ·  Live sketch ${sketchOn ? "on" : "off"}` },
    { label: "Microphone", done: microphone === "ready", detail: microphoneError || (microphone === "ready" ? "Speak while drawing" : microphone === "requesting" ? "Allow access in your browser" : microphoneSkipped ? "Skipped · enable anytime" : "Caption sketches before generation") },
    { label: "Capture camera", done: imageReady, detail: preparingImage ? "Preparing image…" : imageReady ? "Starting image ready" : "Take a still for Orbis" },
    { label: "Start generation", done: false, detail: generationStatus || (imageReady ? "Review your image and direction below" : canStartGeneration ? "Start from your prompt" : "Available after capture") },
  ];

  return <section className="live-setup" aria-label="Studio setup">
    <div className="live-bar"><h2>Set up your live scene</h2>
      {(connected || cameraReady || microphone === "ready") && <button type="button" className="live-stop" disabled={stopping}
        onClick={stopLive}>{stopping ? "Stopping…" : "Stop and disconnect"}</button>}
    </div>
    <ol className="live-setup-steps">
      {steps.map((step, index) => <li key={step.label} className={current === index + 1 ? "live-setup-current" : ""}
        aria-current={current === index + 1 ? "step" : undefined}>
        <span className="live-setup-number" aria-hidden="true">{step.done ? "✓" : index + 1}</span>
        <span className="live-setup-copy"><strong>{step.label}</strong><small>{step.detail}</small></span>
        {index === 0 && <button type="button" onClick={cameraReady || cameraStarting ? stopCamera : startCamera}>
          {cameraStarting ? "Cancel setup" : cameraReady ? "Stop camera" : "Start camera"}</button>}
        {index === 1 && <div className="live-setup-actions">
          <button type="button" aria-pressed={driveOn} onClick={toggleDrive}>Drive Orbis</button>
          <button type="button" aria-pressed={sketchOn} onClick={toggleSketch}>Live sketch</button>
          <button type="button" aria-pressed={generateSketchImages} disabled={!sketchOn}
            onClick={toggleGenerateSketchImages}>Generate sketch images</button>
        </div>}
        {index === 2 && microphone !== "ready" && <button type="button" disabled={microphone === "requesting"}
          onClick={enableMicrophone}>{microphone === "requesting" ? "Enabling…" : "Enable microphone"}</button>}
        {index === 2 && microphone === "idle" && !microphoneSkipped && <button type="button" className="live-setup-skip"
          onClick={() => setMicrophoneSkipped(true)}>Skip for now</button>}
        {index === 3 && <button type="button" disabled={!cameraReady || sketchPending || preparingImage || generationBusy}
          aria-label={preparingImage ? "Preparing camera image" : imageReady ? "Capture again" : "Capture camera"}
          onClick={captureCamera}>{preparingImage ? "…" : <CameraIcon />}</button>}
        {index === 4 && <button type="button" disabled={!canStartGeneration || generationBusy}
          onClick={startGeneration}>{generationBusy ? "Starting…" : "Start generation"}</button>}
      </li>)}
    </ol>
  </section>;
}
