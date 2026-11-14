"use client";

import Link from "next/link";
import { ReactorProvider, useReactor } from "@reactor-team/js-sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useLiveSketch } from "@/hooks/use-live-sketch";
import { Ink } from "@/lib/camera/ink";
import { ORBIS_MODEL_NAME, ORBIS_TRACKS, requestReactorJwt } from "@/lib/orbis";
import { describeCameraMotion } from "@/lib/orbis-camera-motion";
import { RenderOutput, useOBSWindow } from "./output";
import type { LockedHat } from "@/lib/camera/locked-hat";
import { Source } from "./source";
import { captureSource } from "@/lib/camera/frame";
import { Studio as CameraStudio } from "@/components/camera/studio";
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
  const session = useOrbisSession(clearToken, readToken);
  const disconnect = useReactor((state) => state.disconnect);
  const output = useOBSWindow();
  const [liveInk] = useState(() => new Ink());
  const [sketch] = useState(() => new Ink());
  const wardrobe = useWardrobe();
  const [designMode, setDesignMode] = useState<"draw" | "generate" | "environment">("draw");
  const [referenceDirection, setReferenceDirection] = useState("");
  const [referenceHat, setReferenceHat] = useState<LockedHat>();
  const [revision, setRevision] = useState(0);
  const [color, setColor] = useState(colors[0][1]);
  const look = useLook();
  const motion = useMotionPrompt();
  const [run, setRun] = useState<{ look?: LookDraft; openingScene: string; hat?: LockedHat } | null>(null);
  const [error, setError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [preparingCamera, setPreparingCamera] = useState(false);
  const redraw = useCallback(() => setRevision((value) => value + 1), []);
  const busy = session.controlsBusy || capturing || preparingCamera;

  useEffect(() => () => { void disconnect().catch(() => {}); }, [disconnect]);
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
  const camera = useCameraFollow({ openingScene: activeRun?.openingScene,
    canSend: canSteer, send: session.sendSteeringPrompt });
  const pinch = usePinchLayers(liveInk);
  const liveSketch = useLiveSketch({ ink: liveInk, openingScene: activeRun?.openingScene,
    canSend: canSteer, setDirection: camera.setSketchDirection, layers: pinch.layers, pendingPinch: pinch.pending });
  const environment = motion.draft ? undefined : look.environment;
  const capturedDirection = motion.draft ? "" : referenceDirection;
  const { inheritedPrompt, openingScene } = useMemo(() => buildOpeningScene({
    wardrobe: wardrobe.wardrobe, environment, referenceDirection: capturedDirection, startingPrompt, hasCameraSignal: camera.hasSignal,
  }), [wardrobe.wardrobe, environment, capturedDirection, startingPrompt, camera.hasSignal]);
  const renderStatus = session.status === "waiting" ? "Waiting for Orbis…"
    : session.status === "connecting" ? "Connecting to Orbis…"
    : session.controlsBusy ? "Starting scene…"
    : openingScene ? "Ready to start" : "Enter a starting prompt";

  function chooseReference(image: File | null, direction = "", hat?: LockedHat) {
    if (motion.draft) session.setPrompt(motion.draft.prompt);
    motion.clear();
    session.selectImage(image);
    setReferenceDirection(direction);
    setReferenceHat(hat);
  }

  async function start() {
    if (!openingScene || stale || busy || motion.busy || !wardrobe.ready) return;
    const pose = describeCameraMotion(camera.currentMotion());
    const openingPrompt = pose ? `${openingScene}\n\nThe character opens in this pose. ${pose}` : openingScene;
    const draft = motion.draft;
    const accepted = await camera.withControls(() => session.startScene(startingImage, openingPrompt));
    if (accepted) {
      setRun({ look: draft?.look, openingScene, hat: draft ? undefined : referenceHat });
      setError("");
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
      <section className="live-camera" aria-label="Live camera">
        <div className="live-bar"><h2>Live camera</h2><div className="live-tools">
          {camera.following && <span role="status" className="live-placeholder">
            {camera.hasSignal ? "Motion tracking ready" : "Waiting for motion"}</span>}
          <button type="button" aria-pressed={camera.following} title="Steer the render from camera motion"
            onClick={() => camera.changeFollowing(!camera.following)}>Drive Orbis</button>
          <button type="button" aria-pressed={liveSketch.enabled}
            title="Describe pinch drawings with the microphone and send sketch edits to Gemini"
            onClick={() => { if (liveSketch.enabled) pinch.stop(); liveSketch.toggle(); }}>Live sketch</button>
          {liveSketch.enabled && <button type="button" disabled={pinch.micAccess !== "idle"}
            onClick={() => void pinch.enableMicrophone()}>
            {pinch.micAccess === "ready" ? "Microphone ready" : pinch.micAccess === "requesting" ? "Enabling microphone…" : "Enable microphone"}
          </button>}
          {liveSketch.enabled && <button type="button" aria-pressed={pinch.generate}
            onClick={pinch.toggleGeneration}>Generate images</button>}
          {liveSketch.working && <span role="status" className="live-sr">Reading live sketch</span>}
        </div></div>
        <CameraStudio accessoryCamera={accessoryCamera} sharedInk={liveInk} wardrobe={wardrobe} onCameraReference={chooseReference}
          background={look.environmentImage} motionTracking={camera.tracking} onCameraSource={(source) => {
            liveSketch.setSource(source);
            if (!source) pinch.stop();
          }}
          referenceDisabled={busy || session.runStarted} onReferenceBusy={setPreparingCamera} />
        {(pinch.caption || pinch.micStatus) && <output aria-live={pinch.caption ? "off" : "polite"} className="live-sketch-caption">
          {pinch.caption || pinch.micStatus}
        </output>}
        <SketchImageChoices layers={pinch.layers} select={pinch.select} />
      </section>
      <div className="live-connections" aria-label="Connections">
        <button className="live-primary" disabled={busy} onClick={() => {
          if (session.connected) {
            void camera.withControls(session.disconnectSession);
          } else {
            void session.connectSession();
          }
        }} title={session.connected ? "Disconnect Orbis" : "Connect Orbis"}>
          {session.connected ? "Disconnect" : "Connect Orbis"}
        </button>
      </div>
      <div className="live-output">
        <section aria-label="Orbis render">
          <div className="live-bar"><h2>Render</h2><button title="Open the render-only OBS window"
            onClick={() => setError(output.open() ? "" : "Allow pop-ups to open the OBS output.")}>OBS ↗</button></div>
          <RenderOutput running={session.runStarted} muted={session.muted} container={output.container}
            hat={activeRun?.hat} status={renderStatus} layers={pinch.layers} />
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
                <label>Next-run resolution<select disabled={session.runStarted || busy} value={session.resolution}
                  onChange={(event) => session.setResolution(event.target.value)}>
                  <option value="">Fast ({session.preferredResolution})</option>
                  {session.availableResolutions.map((size) => <option key={size}>{size}</option>)}
                </select></label>
              </div>
            </details>
          </div></div>
          {activeRun ? <Steering runLook={activeRun.look} openingScene={activeRun.openingScene}
            disabled={session.paused || !session.connected}
            apply={camera.applyEdit} onLiveSpeech={liveSketch.useSpeech}
            onError={setError} /> :
            <>
              {inheritedPrompt && <details className="live-opening-context" open>
                <summary>From your studio</summary>
                <div tabIndex={0}>{inheritedPrompt}</div>
              </details>}
              <MotionPrompt prompt={startingPrompt} label={inheritedPrompt && !motion.draft ? "Additional direction (optional)" : "Starting prompt"}
              placeholder={inheritedPrompt ? undefined : "A person stands beside a window in a steady medium shot."}
              setPrompt={(prompt) => motion.draft ? motion.setDraft({ ...motion.draft, prompt }) : session.setPrompt(prompt)}
              review={!!motion.draft} busy={motion.busy} disabled={busy} actions={<>
                {stale ? <button disabled={busy || motion.busy || !look.layers.some((layer) => layer.accepted)}
                  onClick={() => void motion.prepare(look, startingPrompt || DEFAULT_MOTION)}>Refresh starting prompt</button> :
                  <button className="live-primary" disabled={busy || motion.busy || !openingScene || !wardrobe.ready}
                    onClick={() => void start()}>Start scene</button>}
              </>} />
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
          <button type="button" disabled={busy || motion.busy || session.runStarted} onClick={() => {
            if (!look.environmentImage) return;
            chooseReference(look.environmentImage);
            if (![startingPrompt, look.environment.description, look.environment.motion].some((text) => text.trim())) {
              session.setPrompt("Hold on the environment and show its natural motion.");
            }
          }}>Use as starting image</button>
        }>
          <Source ink={sketch} revision={revision} update={redraw} label="Environment sketch" />
        </EnvironmentPrompt>}
        <div className="live-tools live-references">
          {designMode === "draw" && <button disabled={busy || session.runStarted || !sketch.hasDrawing} onClick={() => void useReference()}>Use sketch</button>}
        </div>
      </section>
    </div>
    {(error || motion.error || liveSketch.error || pinch.error || camera.error) &&
      <p role="alert">{error || motion.error || liveSketch.error || pinch.error || camera.error}</p>}
  </main>;
}
