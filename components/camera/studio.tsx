"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { HEIGHT, Ink, WIDTH, type Follow } from "@/lib/camera/ink";
import type { HeadPhotos } from "@/lib/camera/head-views";
import type { CameraReference } from "@/lib/camera/locked-hat";
import type { CameraMotionTracking } from "@/lib/camera/motion";
import { AccessoryControls } from "./accessory-controls";
import { bindPointer } from "./pointer";
import { useWardrobe, type WardrobeControls } from "./use-wardrobe";
import { CaptureReference } from "./capture-reference";
import { HeadReference } from "./head-reference";
import { HeadScan } from "./head-scan";
import { AccessoryPosition } from "./accessory-position";
import { CameraOverlays } from "./camera-overlays";
import { composeCamera } from "./compose-camera";
import { JointPicker } from "./joint-picker";
import { CameraIcon } from "./camera-icon";
import styles from "./studio.module.css";

type CameraProps = {
  accessoryCamera?: React.RefObject<HTMLVideoElement | null>;
  background?: File;
  sharedInk?: Ink;
  onCameraReference?: CameraReference;
  onCameraSource?: (source: HTMLCanvasElement | null) => void;
  onCameraStatus?: (status: string) => void;
  actionsRef?: RefObject<{ start: () => void; stop: () => void; capture: () => void;
    prepare: () => Promise<{ image: File; direction: string } | null> } | null>;
  designDirection?: string;
  onCameraStarting?: (starting: boolean) => void;
  referenceDisabled?: boolean;
  onReferenceBusy?: (busy: boolean) => void;
  motionTracking?: CameraMotionTracking;
  onFistChange?: (held: boolean) => void;
};

export function Studio({ wardrobe: sharedWardrobe, ...props }: CameraProps & { wardrobe?: WardrobeControls } = {}) {
  return sharedWardrobe ? <Camera {...props} wardrobe={sharedWardrobe} /> : <StandaloneCamera {...props} />;
}

function StandaloneCamera(props: Omit<Parameters<typeof Camera>[0], "wardrobe">) {
  const wardrobe = useWardrobe();
  return <Camera {...props} wardrobe={wardrobe} showWardrobe />;
}

function Camera({ sharedInk, wardrobe, onCameraReference, onCameraSource, onCameraStatus, actionsRef, onCameraStarting, referenceDisabled, showWardrobe, onReferenceBusy, accessoryCamera, background, designDirection, motionTracking, onFistChange }: CameraProps & {
  wardrobe: WardrobeControls;
  showWardrobe?: boolean;
}) {
  const clean = useRef<HTMLCanvasElement>(null);
  const localCamera = useRef<HTMLVideoElement>(null);
  const scanCamera = accessoryCamera ?? localCamera;
  const canvas = useRef<HTMLCanvasElement>(null);
  const worn = wardrobe.worn;
  const [position] = useState(() => new AccessoryPosition());
  const [movingId, setMovingId] = useState("");
  const [localInk] = useState(() => { const value = new Ink(); value.follow = "headAndShoulders"; return value; });
  const ink = useRef(sharedInk ?? localInk);
  const stopCamera = useRef<() => void>(null);
  const request = useRef(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [source, setSource] = useState("");
  const [running, setRunning] = useState(false);
  const activeMove = running && wardrobe.wardrobe.pieces.some(({ id, placement }) =>
    id === movingId && wardrobe.wardrobe.worn[placement] === id);
  const [starting, setStarting] = useState(false);
  const [follow, setFollow] = useState<Follow>(() => ink.current.follow);
  const [joint, setJoint] = useState(() => ink.current.joint);
  const [headPhotos, setHeadPhotos] = useState<HeadPhotos>({});
  const [cameraStatus, setCameraStatus] = useState("");
  const captureAction = useRef<((notify?: boolean) => Promise<{ image: File; direction: string } | null>) | null>(null);

  useEffect(() => { onCameraStatus?.(cameraStatus); }, [cameraStatus, onCameraStatus]);
  useEffect(() => { onCameraStarting?.(starting); }, [starting, onCameraStarting]);
  useEffect(() => {
    if (actionsRef) actionsRef.current = {
      start: () => { if (!running && !starting) void start(); },
      stop: () => { if (running || starting) stop(); },
      capture: () => { if (running && !referenceDisabled) captureAction.current?.(); },
      prepare: () => running && !referenceDisabled ? captureAction.current?.(false) ?? Promise.resolve(null) : Promise.resolve(null),
    };
  });
  useEffect(() => () => { if (actionsRef) actionsRef.current = null; }, [actionsRef]);

  useEffect(() => {
    const refresh = () => {
      if (!navigator.mediaDevices) return;
      void navigator.mediaDevices.enumerateDevices().then((items) =>
        setDevices(items.filter((item) => item.kind === "videoinput" && item.deviceId)),
      ).catch(() => {});
    };
    refresh();
    navigator.mediaDevices?.addEventListener("devicechange", refresh);
    return () => {
      request.current++;
      navigator.mediaDevices?.removeEventListener("devicechange", refresh);
      stopCamera.current?.();
    };
  }, []);

  useEffect(() => bindPointer(canvas.current!, (action, point) => {
    if (activeMove) position.apply(movingId, action, point);
    else ink.current.apply("mac", action, point);
  }), [activeMove, movingId, position]);

  function stop() {
    request.current++;
    stopCamera.current?.();
    stopCamera.current = null;
    onFistChange?.(false);
    ink.current.apply("mac", "cancel");
    setRunning(false);
    setStarting(false);
    const element = canvas.current;
    element?.getContext("2d")?.clearRect(0, 0, WIDTH, HEIGHT);
  }

  async function start() {
    const id = ++request.current;
    setStarting(true);
    setCameraStatus("");
    let stream: MediaStream | undefined;
    try {
      const cameraSource: MediaTrackConstraints = source === "user" || source === "environment"
        ? { facingMode: { exact: source } }
        : source ? { deviceId: { exact: source.slice("device:".length) } } : {};
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 },
          ...cameraSource },
        audio: false,
      });
      const camera = stream;
      if (id !== request.current) { camera.getTracks().forEach((item) => item.stop()); return; }
      const player = document.createElement("video");
      player.muted = true;
      player.playsInline = true;
      player.srcObject = camera;
      await player.play();
      if (id !== request.current) { camera.getTracks().forEach((item) => item.stop()); return; }
      const [trackItem] = camera.getVideoTracks();
      const ended = () => { stop(); setCameraStatus("Camera disconnected."); };
      trackItem.addEventListener("ended", ended);
      scanCamera.current = player;
      const drawing = ink.current;
      drawing.onSurfaceUnavailable = () => setCameraStatus("3D drawing requires WebGL 2. Choose another Follow mode to draw.");
      const endComposition = composeCamera({
        video: player, canvas: canvas.current!, clean: clean.current!, ink: drawing, position,
        pieces: () => worn.current, status: setCameraStatus,
        motionTracking, onFistChange,
      });
      stopCamera.current = () => {
        onCameraSource?.(null);
        setMovingId("");
        endComposition();
        drawing.resetSurfaceRenderer();
        drawing.onSurfaceUnavailable = undefined;
        trackItem.removeEventListener("ended", ended);
        camera.getTracks().forEach((item) => item.stop());
        player.srcObject = null;
        scanCamera.current = null;
      };
      onCameraSource?.(clean.current);
      setRunning(true);
      const items = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      if (request.current === id && items.length) {
        setDevices(items.filter((item) => item.kind === "videoinput" && item.deviceId));
      }
    } catch (error) {
      stream?.getTracks().forEach((item) => item.stop());
      if (id === request.current) {
        const unavailable = error instanceof DOMException && error.name === "OverconstrainedError";
        const facingLabel = source === "user" ? "Front" : source === "environment" ? "Rear" : "";
        setCameraStatus(unavailable && facingLabel ? `${facingLabel} camera unavailable on this device.`
          : error instanceof Error ? error.message : "Camera unavailable.");
      }
    } finally {
      if (id === request.current) setStarting(false);
    }
  }

  function changeFollow(mode: Follow) {
    ink.current.follow = mode;
    setFollow(mode);
    setCameraStatus("");
  }

  const Root = sharedInk ? "div" : "main";
  return (
    <Root className={sharedInk ? styles.embedded : styles.studio}>
      {!sharedInk && <h1>Camera studio</h1>}
      <canvas ref={clean} width={WIDTH} height={HEIGHT} hidden />
      <div className={styles.stage}>
        <canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label="Live camera drawing canvas"
          style={sharedInk && !running ? { pointerEvents: "none" } : activeMove ? { cursor: "move" } : undefined} />
        {sharedInk && !running && !actionsRef && <div className={styles.start}>
          <button className="live-primary" onClick={() => { if (starting) stop(); else void start(); }}>
            {starting ? "Cancel camera setup" : "Start camera"}
          </button>
        </div>}
      </div>
      <div className={styles.controls}>
        {onCameraReference && (running ? <CaptureReference canvas={canvas} worn={worn} ink={ink.current} headPhotos={headPhotos}
          hasPieces={Object.keys(wardrobe.wardrobe.worn).length > 0} environment={wardrobe.wardrobe.environment} background={background} designDirection={designDirection} disabled={referenceDisabled}
          actionRef={captureAction} hideButton={!!actionsRef} onCapture={onCameraReference} onError={setCameraStatus} onBusy={onReferenceBusy} /> : !actionsRef &&
          <button disabled aria-label="Capture camera"><CameraIcon /></button>)}
        {!actionsRef && (!sharedInk || running) && <button onClick={() => { if (running || starting) stop(); else void start(); }}>
          {running || starting ? "Stop camera" : "Start camera"}
        </button>}
        <select aria-label="Camera source" value={source} disabled={running || starting} onChange={(e) => setSource(e.target.value)}>
          <option value="">Default camera</option>
          <option value="user">Front camera</option>
          <option value="environment">Rear camera</option>
          {devices.map((item, index) => <option key={item.deviceId} value={`device:${item.deviceId}`}>{item.label || `Camera ${index + 1}`}</option>)}
        </select>
        <button aria-label={sharedInk ? "Undo camera drawing" : undefined} onClick={() => ink.current.apply("mac", "undo")}>Undo</button>
        <button disabled={!wardrobe.ready} onClick={() => {
          if (follow === "hat" || follow === "garment") changeFollow("off");
          ink.current.clear();
          position.clearJoints();
          wardrobe.removeAll();
        }}>Clear overlays</button>
      </div>
      <CameraOverlays ink={ink.current} wardrobe={wardrobe} follow={follow} changeFollow={changeFollow}
        movingId={activeMove ? movingId : ""} onMove={running ? setMovingId : undefined} position={position} />
      <details className={styles.advanced}>
        <summary>Advanced</summary>
        <div className={styles.controls}>
          <label>Follow <select value={follow} onChange={(event) => changeFollow(event.target.value as Follow)}>
            <option value="headAndShoulders">Head and shoulders</option>
            <option value="face">Head</option>
            <option value="shoulders">Shoulders</option>
            <option value="joint">Joint or feature</option>
            <option value="hat">3D hat</option>
            <option value="garment">3D garment</option>
            <option value="off">Off</option>
          </select></label>
          {follow === "joint" && <JointPicker label="Joint or facial feature" value={joint} onChange={(value) => {
            ink.current.joint = value;
            setJoint(value);
          }} />}
        </div>
        <HeadScan camera={scanCamera} running={running} ink={ink.current}
          disabled={referenceDisabled} onCapture={onCameraReference} />
      </details>
      {onCameraReference && running && <HeadReference camera={clean} photos={headPhotos}
        onChange={setHeadPhotos} onError={setCameraStatus} disabled={!!referenceDisabled} />}
      {showWardrobe && <AccessoryControls controls={wardrobe} camera={scanCamera} />}
      {cameraStatus && <p role={sharedInk ? "alert" : "status"}>{cameraStatus}</p>}
    </Root>
  );
}
