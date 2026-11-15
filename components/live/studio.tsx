"use client";

import Link from "next/link";
import { ReactorProvider, useReactor } from "@reactor-team/js-sdk";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { MotionPrompt, useMotionPrompt } from "@/components/looks/motion-prompt";
import { LookImage } from "@/components/looks/images";
import { Steering } from "@/components/looks/steering";
import { sameComposition, takeMotionReview, useLook, type LookDraft } from "@/lib/looks/draft";
import { DEFAULT_MOTION } from "@/lib/looks/intent";
import { useOrbisSession } from "@/hooks/use-orbis-session";
import { OrbisPhotoSpace } from "@/components/orbis-photo-space";
import { useCameraFollow } from "@/hooks/use-camera-follow";
import { usePinchLayers } from "@/hooks/use-pinch-layers";
import { SketchImageChoices } from "./sketch-images";
import { SetupGuide } from "./setup-guide";
import { useLiveSketch, type OpeningSketch } from "@/hooks/use-live-sketch";
import { Ink } from "@/lib/camera/ink";
import { ORBIS_MODEL_NAME, ORBIS_TRACKS, requestReactorJwt } from "@/lib/orbis";
import { DEFAULT_CAMERA_SCENE, describeCameraMotion } from "@/lib/orbis-camera-motion";
import { RenderOutput, useOBSWindow } from "./output";
import type { LockedHat } from "@/lib/camera/locked-hat";
import { Source } from "./source";
import { captureSource } from "@/lib/camera/frame";
import { Studio as CameraStudio, type CameraActions } from "@/components/camera/studio";
import { prepareWardrobeReference } from "@/components/camera/wardrobe-reference";
import { EnvironmentPrompt } from "@/components/looks/environment-prompt";
import { AccessoryControls } from "@/components/camera/accessory-controls";
import { useWardrobe } from "@/components/camera/use-wardrobe";
import { buildOpeningScene } from "./opening-context";
import "@/components/looks/looks.css";
import "./studio.css";

const tracks = [...ORBIS_TRACKS];
const connection = { autoConnect: false };
const colors = [["Gold", "#ffe083"], ["Red", "#c83242"], ["Black", "#151515"], ["White", "#ffffff"]];

export function LiveStudio() {
  const jwt = useRef<string | null>(null);
  const pendingToken = useRef<Promise<string> | null>(null);
  const getToken = useCallback(async () => {
    const pending = (pendingToken.current ??= requestReactorJwt());
    try {
      const token = await pending;
      if (pendingToken.current === pending) jwt.current = token;
      return token;
    } catch (error) {
      if (pendingToken.current === pending) pendingToken.current = null;
      throw error;
    }
  }, []);
  const readToken = useCallback(() => jwt.current, []);
  const clearToken = useCallback(() => {
    pendingToken.current = null;
    jwt.current = null;
  }, []);
  return <ReactorProvider modelName={ORBIS_MODEL_NAME} modelTracks={tracks}
    connectOptions={connection} jwtToken={getToken}>
    <Workspace readToken={readToken} clearToken={clearToken} />
  </ReactorProvider>;
}

function Workspace({ readToken, clearToken }: {
  readToken: () => string | null;
  clearToken: () => void;
}) {
  const accessoryCamera = useRef<HTMLVideoElement>(null);
  const cameraActions = useRef<CameraActions>(null);
  const session = useOrbisSession(clearToken, readToken);
  const disconnect = useReactor((state) => state.disconnect);
  const output = useOBSWindow();
  const [liveInk] = useState(() => { const value = new Ink(); value.follow = "headAndShoulders"; return value; });
  useSyncExternalStore(liveInk.subscribeDrawing, liveInk.drawingRevision, () => 0);
  const [sketch] = useState(() => new Ink());
  const wardrobe = useWardrobe();
  const [designMode, setDesignMode] = useState<"draw" | "generate" | "environment">("draw");
  const [referenceDirection, setReferenceDirection] = useState("");
  const [referenceHat, setReferenceHat] = useState<LockedHat>();
  const [revision, setRevision] = useState(0);
  const [color, setColor] = useState(colors[0][1]);
  const look = useLook();
  const motion = useMotionPrompt();
  const nextRunId = useRef(0);
  const [run, setRun] = useState<{ id: number; look?: LookDraft; openingScene: string; sketch?: OpeningSketch; hat?: LockedHat } | null>(null);
  const [error, setError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [preparingCamera, setPreparingCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [fistHeld, setFistHeld] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [generation, setGeneration] = useState<"start" | "update" | null>(null);
  const openingJob = useRef<AbortController>(null);
  const redraw = useCallback(() => setRevision((value) => value + 1), []);
  const busy = session.controlsBusy || capturing || preparingCamera || stopping || !!generation;

  useEffect(() => () => { void disconnect().catch(() => {}); }, [disconnect]);
  useEffect(() => () => openingJob.current?.abort(), []);
  useEffect(() => {
    const design = new URLSearchParams(window.location.search).get("design");
    if (design === "generate" || design === "environment") setDesignMode(design);
  }, []);
  const loadMotion = motion.setDraft;
  const setResolution = session.setResolution;
  useEffect(() => {
    const incoming = takeMotionReview();
    if (!incoming) return;
    loadMotion(incoming);
    if (incoming.resolution !== undefined) setResolution(incoming.resolution);
  }, [loadMotion, setResolution]);

  const stale = !!motion.draft && !sameComposition(motion.draft.look, look);
  const startingPrompt = motion.draft?.prompt ?? session.prompt;
  const startingImage = motion.draft?.image ?? session.image;
  const activeRun = session.runStarted ? run : null;
  const canSteer = session.connected && !session.paused && !busy;
  const camera = useCameraFollow({ openingScene: activeRun?.openingScene, runId: activeRun?.id,
    openingSketch: activeRun?.sketch?.direction, canSend: canSteer, send: session.sendSteeringPrompt });
  const pinch = usePinchLayers(liveInk);
  const liveSketch = useLiveSketch({ ink: liveInk, openingScene: activeRun?.openingScene, runId: activeRun?.id,
    openingSketch: activeRun?.sketch, canSend: canSteer, setDirection: camera.setSketchDirection,
    layers: pinch.layers, pendingSpeech: pinch.pending });
  const environment = motion.draft ? undefined : look.environment;
  const capturedDirection = motion.draft ? "" : referenceDirection;
  const hasCameraFallback = cameraReady && !startingImage;
  const designDirection = liveInk.hasVisibleDrawing
    ? ["Turn the camera sketch into a physical feature at the drawn size and position.",
      ...new Set(pinch.layers.filter(({ selected }) => !selected).map(({ transcript }) => transcript))].join(" ").slice(0, 1_500)
    : "";
  const { inheritedPrompt, openingScene } = useMemo(() => buildOpeningScene({
    wardrobe: wardrobe.wardrobe, environment, referenceDirection: capturedDirection, startingPrompt,
    hasCameraSignal: hasCameraFallback, hasStartingImage: !!startingImage,
  }), [wardrobe.wardrobe, environment, capturedDirection, startingPrompt, hasCameraFallback, startingImage]);
  const needsImagePrompt = !!startingImage && (session.describingImage || !startingPrompt.trim());
  const canStart = Boolean(openingScene && !needsImagePrompt);
  const renderStatus = session.status === "waiting" ? "Waiting for Orbis…"
    : session.status === "connecting" ? "Connecting to Orbis…"
    : session.controlsBusy ? "Starting scene…"
    : canStart ? "Ready to start" : startingImage ? "Waiting for starting prompt…" : "Add a starting image or prompt";

  function chooseReference(image: File | null, direction = "", hat?: LockedHat) {
    motion.clear();
    session.selectImage(image);
    setReferenceDirection(direction);
    setReferenceHat(hat);
  }

  async function generate(mode: "start" | "update") {
    if (busy || pinch.pending || openingJob.current) return;
    const updating = mode === "update";
    if (updating ? !session.runStarted || !cameraReady : !canStart || stale || motion.busy || !wardrobe.ready) return;
    const job = new AbortController();
    openingJob.current = job;
    setGeneration(mode);
    setError("");
    try {
      const sketch = await liveSketch.prepareOpening(openingScene, job.signal);
      let image = startingImage;
      let sceneText = openingScene;
      const captureCamera = updating || !image && cameraReady && (wardrobe.worn.current.length > 0 || liveInk.hasVisibleDrawing);
      let preparedDirection: string | undefined;
      if (captureCamera) {
        const prepared = await cameraActions.current?.prepare(sketch?.direction ?? designDirection);
        if (!prepared) return;
        image = prepared.image;
        preparedDirection = prepared.direction;
        sceneText = buildOpeningScene({ wardrobe: wardrobe.wardrobe, environment, referenceDirection: preparedDirection,
          startingPrompt, hasCameraSignal: true, hasStartingImage: true }).openingScene;
      }
      const pose = updating ? "" : describeCameraMotion(camera.currentMotion());
      const openingDirection = [sketch?.direction, pose && `The character opens in this pose. ${pose}`].filter(Boolean).join("\n\n");
      const scene = await camera.withControls(async () => {
        job.signal.throwIfAborted();
        if (updating && !await session.reset()) return null;
        job.signal.throwIfAborted();
        return session.startScene(image, sceneText, openingDirection);
      });
      if (!scene || job.signal.aborted) return;
      if (updating) motion.clear();
      if (image && preparedDirection !== undefined) {
        session.loadPreparedImage(image, startingPrompt || DEFAULT_CAMERA_SCENE);
        setReferenceDirection(preparedDirection);
      }
      setRun({ id: ++nextRunId.current, look: motion.draft?.look, openingScene: scene, sketch,
        hat: updating || motion.draft ? undefined : referenceHat });
    } catch (caught) {
      if (!job.signal.aborted) setError(caught instanceof Error && caught.name !== "TimeoutError"
        ? caught.message : "Couldn’t prepare the opening sketch. Try again.");
    } finally {
      openingJob.current = null;
      setGeneration(null);
    }
  }

  async function stopLive() {
    if (stopping) return;
    setStopping(true);
    openingJob.current?.abort();
    camera.changeFollowing(false);
    cameraActions.current?.stop();
    pinch.stop();
    try {
      if (session.status !== "disconnected") await session.disconnectSession();
      setRun(null);
    } finally {
      setStopping(false);
    }
  }

  async function useReference() {
    setError("");
    setCapturing(true);
    try {
      const frame = await captureSource(sketch);
      const { image, direction } = await prepareWardrobeReference(frame, [], AbortSignal.timeout(65_000), {
        headPhotos: {}, environment: look.environment.description, background: look.environmentImage, sketch: true,
      });
      chooseReference(image, direction);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn’t capture the reference.");
    } finally {
      setCapturing(false);
    }
  }

  return <main className="live-studio">
    <header className="live-heading"><h1>Live Studio</h1><nav aria-label="Workspaces">
      <Link href="/">Starter</Link><Link href="/looks">Looks</Link><Link href="/camera">Camera Studio</Link>
    </nav></header>
    <div className="live-grid">
      <SetupGuide cameraReady={cameraReady} cameraStarting={cameraStarting} cameraError={cameraError}
        driveOn={camera.following} trackingReady={camera.hasSignal} sketchOn={liveSketch.enabled}
        generateSketchImages={pinch.generate} microphone={pinch.micAccess}
        microphoneError={pinch.micAccess === "idle" ? pinch.error : ""}
        imageReady={!!startingImage} preparingImage={preparingCamera || capturing}
        generationStatus={session.controlsBusy ? "Starting scene…" : session.status === "connecting" ? "Connecting to Orbis…"
          : generation === "start" ? "Preparing opening scene…" : pinch.pending ? "Waiting for sketch transcript…" : session.error}
        canStartGeneration={canStart && !stale && wardrobe.ready && !busy && !motion.busy && !pinch.pending}
        sketchPending={pinch.pending}
        generationBusy={busy || motion.busy} running={session.runStarted}
        connected={session.connected || session.status === "connecting" || session.status === "waiting"}
        stopping={stopping} updating={generation === "update"}
        startCamera={() => cameraActions.current?.start()} stopCamera={() => cameraActions.current?.stop()}
        captureCamera={() => cameraActions.current?.capture()} startGeneration={() => void generate("start")}
        stopLive={() => void stopLive()} updateRender={() => void generate("update")}
        toggleDrive={() => camera.changeFollowing(!camera.following)}
        toggleSketch={() => { if (liveSketch.enabled) pinch.stop(); liveSketch.toggle(); }}
        toggleGenerateSketchImages={pinch.toggleGeneration}
        enableMicrophone={() => void pinch.enableMicrophone()} />
      <section className="live-camera" aria-label="Live camera">
        <div className="live-bar"><h2>Live camera</h2><div className="live-tools">
          {liveSketch.enabled && cameraReady && (pinch.micAccess === "ready" ? <>
            <span className="live-placeholder">Sketch mic ready</span>
            {(pinch.canCaptionStroke || pinch.manual) && <button type="button"
              disabled={pinch.manual ? pinch.micStatus !== "Listening…" : pinch.pending} onClick={pinch.captionLastStroke}>
              {pinch.manual ? "Finish speaking" : "Caption last stroke"}
            </button>}
          </> : <button type="button" disabled={pinch.micAccess === "requesting"}
            onClick={() => void pinch.enableMicrophone()}>
            {pinch.micAccess === "requesting" ? "Enabling microphone…" : "Enable sketch microphone"}
          </button>)}
          {camera.following && <span role="status" className="live-placeholder">
            {camera.hasSignal ? "Motion tracking ready" : "Waiting for motion"}</span>}
          {fistHeld && <span role="status" className="live-placeholder">Listening…</span>}
          {liveSketch.working && <span role="status" className="live-placeholder">Preparing sketch edit…</span>}
        </div></div>
        <CameraStudio accessoryCamera={accessoryCamera} sharedInk={liveInk} wardrobe={wardrobe}
          actionsRef={cameraActions} onCameraStarting={setCameraStarting}
          onFistChange={setFistHeld}
          onCameraReference={chooseReference} onCameraStatus={setCameraError}
          designDirection={designDirection}
          background={look.environmentImage} motionTracking={camera.tracking} onCameraSource={(source) => {
            setCameraReady(!!source);
            liveSketch.setSource(source);
            if (!source) pinch.stop();
          }}
          referenceDisabled={busy} onReferenceBusy={setPreparingCamera} />
        {(pinch.caption || pinch.micStatus) && <output aria-live={pinch.micStatus ? "polite" : "off"} className="live-sketch-caption">
          {[pinch.micStatus, pinch.caption].filter(Boolean).join(" ")}
        </output>}
        {liveSketch.enabled && pinch.error && <p role="alert">{pinch.error}</p>}
        <SketchImageChoices layers={pinch.layers} select={pinch.select} />
      </section>
      <div className="live-output">
        <section aria-label="Orbis render">
          <div className="live-bar"><h2>Render</h2><button title="Open the render-only OBS window"
            onClick={() => setError(output.open() ? "" : "Allow pop-ups to open the OBS output.")}>OBS ↗</button></div>
          <RenderOutput running={session.runStarted} muted={session.muted} container={output.container}
            hat={activeRun?.hat} status={renderStatus} layers={pinch.layers}
            timeline={session.timeline} onFirstFrame={session.onFirstFrame} />
          {session.error && <p role="alert">{session.error}</p>}
        </section>
        <section className="live-steer" aria-label={activeRun ? "Steering chat" : "Start scene"}>
          <div className="live-bar"><h2>{activeRun ? "Steer" : "Start scene"}</h2><div className="live-tools">
            <button title={session.paused ? "Resume" : "Pause"} aria-label={session.paused ? "Resume" : "Pause"}
              disabled={!session.runStarted || busy} onClick={() => void camera.withControls(session.paused ? session.resume : session.pause)}>
              {session.paused ? "▶" : "Ⅱ"}
            </button>
            <button title="Reset run" aria-label="Reset run" disabled={!session.runStarted || busy}
              onClick={() => void camera.withControls(session.reset)}>↻</button>
            <details className="live-settings">
              <summary title="Settings" aria-label="Settings">⚙</summary>
              <div>
                <button onClick={session.toggleMuted}>{session.muted ? "Enable sound" : "Mute"}</button>
                {session.connected && <button onClick={() => void camera.withControls(session.disconnectSession)}>Disconnect Orbis</button>}
                <label>Next-run resolution<select disabled={session.runStarted || busy} value={session.resolution}
                  onChange={(event) => session.setResolution(event.target.value)}>
                  <option value="">Fast ({session.preferredResolution})</option>
                  {session.availableResolutions.map((size) => <option key={size}>{size}</option>)}
                </select></label>
              </div>
            </details>
          </div></div>
          {activeRun ? <Steering key={activeRun.id} runLook={activeRun.look} openingScene={activeRun.openingScene}
            disabled={session.paused || !session.connected}
            holdToTalk={fistHeld}
            apply={camera.applyEdit}
            onError={setError} /> :
            <>
              {inheritedPrompt && <details className="live-opening-context" open>
                <summary>From your studio</summary>
                <div tabIndex={0}>{inheritedPrompt}</div>
              </details>}
              <MotionPrompt prompt={startingPrompt} label="Starting prompt" voiceHeld={fistHeld}
              placeholder={startingImage || inheritedPrompt ? undefined : "A person stands beside a window in a steady medium shot."}
              setPrompt={(prompt) => motion.draft ? motion.setDraft({ ...motion.draft, prompt }) : session.setPrompt(prompt)}
              review={!!startingImage} busy={motion.busy} disabled={busy} actions={<>
                {session.describingImage && <span role="status">Describing starting image…</span>}
                {startingImage && !motion.draft && !session.describingImage && (session.promptError || !startingPrompt.trim()) &&
                  <button type="button" disabled={busy} onClick={() => session.selectImage(startingImage)}>
                    {session.promptError ? "Retry image prompt" : "Generate image prompt"}
                  </button>}
                {stale && <button disabled={busy || motion.busy || !look.layers.some((layer) => layer.accepted)}
                  onClick={() => void motion.prepare(look, startingPrompt || DEFAULT_MOTION)}>Refresh starting prompt</button>}
              </>} />
              {session.promptError && <p role="alert">{session.promptError}</p>}
            </>}
          {!activeRun && <div className="live-look-reference">
            {startingImage ? <>
              <LookImage image={startingImage} alt="Orbis starting image" />
              <button disabled={busy} onClick={() => chooseReference(null)}>Remove starting image</button>
              {!referenceHat && <OrbisPhotoSpace image={startingImage} disabled={busy}
                onUse={(image) => motion.draft ? motion.setDraft({ ...motion.draft, image }) : chooseReference(image, referenceDirection)} />}
            </> : <label>Reference photo
              <input type="file" accept="image/*" disabled={busy} onChange={(event) => chooseReference(event.target.files?.[0] ?? null)} />
            </label>}
          </div>}
        </section>
      </div>
      <section className="live-draw" aria-label="Look design">
        <div className="live-bar"><div className="live-tools" role="group" aria-label="Look design mode">
          <button aria-pressed={designMode === "draw"} onClick={() => setDesignMode("draw")}>Draw</button>
          <button aria-pressed={designMode === "generate"} onClick={() => setDesignMode("generate")}>Generate</button>
          <button aria-pressed={designMode === "environment"} onClick={() => setDesignMode("environment")}>Environment</button>
        </div><div className="live-tools" hidden={designMode !== "draw" && (designMode !== "environment" || !!look.environmentImage)}>
          {colors.map(([name, value]) => <button key={value} className="live-swatch"
            style={{ background: value }} title={name} aria-label={name} aria-pressed={color === value}
            onClick={() => { setColor(value); sketch.color = value; liveInk.color = value; }} />)}
          <button title="Undo sketch stroke" aria-label="Undo drawing"
            onClick={() => { sketch.apply("tools", "undo"); redraw(); }}>↶</button>
          <button title="Clear sketch" aria-label="Clear drawing"
            onClick={() => { sketch.clear(); redraw(); }}>×</button>
        </div></div>
        {designMode === "draw" && <Source ink={sketch} revision={revision} update={redraw} label="Blank drawing canvas" />}
        <div hidden={designMode !== "generate"}><AccessoryControls controls={wardrobe} camera={accessoryCamera} /></div>
        {designMode === "environment" && <EnvironmentPrompt look={look} sketch={sketch} referenceAction={
          <button type="button" disabled={busy || motion.busy || session.runStarted}
            onClick={() => chooseReference(look.environmentImage ?? null)}>Use as starting image</button>
        }>
          <Source ink={sketch} revision={revision} update={redraw} label="Environment sketch" />
        </EnvironmentPrompt>}
        <div className="live-tools live-references">
          {designMode === "draw" && <button disabled={busy || session.runStarted || !sketch.hasDrawing} onClick={() => void useReference()}>Use sketch</button>}
        </div>
      </section>
    </div>
    {(error || motion.error || liveSketch.error || camera.error) &&
      <p role="alert">{error || motion.error || liveSketch.error || camera.error}</p>}
  </main>;
}
