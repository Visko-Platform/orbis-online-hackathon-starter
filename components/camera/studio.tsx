"use client";

import { useRouter } from "next/navigation";
import { sendLookDraft } from "@/lib/camera/frame";
import { useEffect, useRef, useState } from "react";
import { HEIGHT, Ink, WIDTH, type Follow } from "@/lib/camera/ink";
import type { HeadPhotos } from "@/lib/camera/head-views";
import type { CameraReference } from "@/lib/camera/locked-hat";
import type { CameraMotionTracking } from "@/lib/camera/motion";
import { openHost } from "@/lib/camera/pair";
import { AccessoryControls } from "./accessory-controls";
import { bindPointer } from "./pointer";
import { openOutput } from "./output";
import { useWardrobe, type WardrobeControls } from "./use-wardrobe";
import { CaptureReference } from "./capture-reference";
import { HeadReference } from "./head-reference";
import { HeadScan } from "./head-scan";
import { AccessoryPosition } from "./accessory-position";
import { CameraOverlays } from "./camera-overlays";
import { composeCamera } from "./compose-camera";
import { JointPicker } from "./joint-picker";
import styles from "./studio.module.css";

type CameraProps = {
  accessoryCamera?: React.RefObject<HTMLVideoElement | null>;
  background?: File;
  sharedInk?: Ink;
  onCameraReference?: CameraReference;
  onCameraSource?: (source: HTMLCanvasElement | null) => void;
  referenceDisabled?: boolean;
  onReferenceBusy?: (busy: boolean) => void;
  motionTracking?: CameraMotionTracking;
};

export function Studio({ wardrobe: sharedWardrobe, ...props }: CameraProps & { wardrobe?: WardrobeControls } = {}) {
  return sharedWardrobe ? <Camera {...props} wardrobe={sharedWardrobe} /> : <StandaloneCamera {...props} />;
}

function StandaloneCamera(props: Omit<Parameters<typeof Camera>[0], "wardrobe">) {
  const wardrobe = useWardrobe();
  return <Camera {...props} wardrobe={wardrobe} showWardrobe />;
}

function Camera({ sharedInk, wardrobe, onCameraReference, onCameraSource, referenceDisabled, showWardrobe, onReferenceBusy, accessoryCamera, background, motionTracking }: CameraProps & {
  wardrobe: WardrobeControls;
  showWardrobe?: boolean;
}) {
  const router = useRouter();
  const clean = useRef<HTMLCanvasElement>(null);
  const localCamera = useRef<HTMLVideoElement>(null);
  const scanCamera = accessoryCamera ?? localCamera;
  const canvas = useRef<HTMLCanvasElement>(null);
  const worn = wardrobe.worn;
  const [position] = useState(() => new AccessoryPosition());
  const [movingId, setMovingId] = useState("");
  const [localInk] = useState(() => new Ink());
  const ink = useRef(sharedInk ?? localInk);
  const stopCamera = useRef<() => void>(null);
  const stopPhone = useRef<() => void>(null);
  const output = useRef<ReturnType<typeof openOutput>>(null);
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
  const [phoneStatus, setPhoneStatus] = useState("");
  const [phoneTools, setPhoneTools] = useState(false);
  const [address, setAddress] = useState("");
  const [link, setLink] = useState("");
  const [qr, setQr] = useState("");

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
      stopPhone.current?.();
      output.current?.close();
    };
  }, []);

  useEffect(() => bindPointer(canvas.current!, (action, point) => {
    if (activeMove) position.apply(movingId, action, point);
    else ink.current.apply("mac", action, point);
  }), [activeMove, movingId, position]);

  useEffect(() => {
    if (!link) return;
    let active = true;
    void import("qrcode").then((module) => module.toDataURL(link, { margin: 2, width: 200 }))
      .then((url) => { if (active) setQr(url); })
      .catch(() => { if (active) setPhoneStatus("QR unavailable. Open the link on your iPhone."); });
    return () => { active = false; };
  }, [link]);

  function stop() {
    request.current++;
    stopCamera.current?.();
    stopCamera.current = null;
    stopPhone.current?.();
    stopPhone.current = null;
    ink.current.apply("mac", "cancel");
    setRunning(false);
    setStarting(false);
    setLink("");
    setQr("");
    setPhoneStatus("");
    const element = canvas.current;
    element?.getContext("2d")?.clearRect(0, 0, WIDTH, HEIGHT);
    output.current?.clear();
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
        pieces: () => worn.current, status: setCameraStatus, onFrame: (frame) => output.current?.draw(frame),
        motionTracking,
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

  function share() {
    const ip = address.trim();
    if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) || ip.split(".").some((part) => Number(part) > 255)) {
      setPhoneStatus("Enter the Mac’s Wi-Fi IPv4 address.");
      return;
    }
    stopPhone.current?.();
    setLink("");
    setQr("");
    setPhoneStatus("Preparing pairing link…");
    try {
      stopPhone.current = openHost(canvas.current!, ip, (url) => {
        setLink(url);
        if (url) setPhoneStatus("Scan with your iPhone.");
      }, setPhoneStatus, (action, point) => ink.current.apply("phone", action, point));
    } catch {
      setPhoneStatus("This browser could not share the live canvas.");
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
        {sharedInk && !running && <div className={styles.start}>
          <button className="live-primary" onClick={() => { if (starting) stop(); else void start(); }}>
            {starting ? "Cancel camera setup" : "Start camera"}
          </button>
        </div>}
      </div>
      <div className={styles.controls}>
        {(!sharedInk || running) && <button onClick={() => { if (running || starting) stop(); else void start(); }}>
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
        <label>Follow <select value={follow} onChange={(event) => changeFollow(event.target.value as Follow)}>
          <option value="off">Off</option>
          <option value="shoulders">Shoulders</option>
          <option value="face">Face</option>
          <option value="joint">Joint or feature</option>
          <option value="hat">3D hat</option>
          <option value="garment">3D garment</option>
        </select></label>
        {follow === "joint" && <JointPicker label="Joint or facial feature" value={joint} onChange={(value) => {
          ink.current.joint = value;
          setJoint(value);
        }} />}
        <button onClick={() => {
          if (output.current?.focus()) return;
          output.current = openOutput(ink.current);
          if (!output.current) setCameraStatus("Allow pop-ups to open the second screen.");
        }}>Pop out</button>
        {onCameraReference && (running ? <CaptureReference canvas={canvas} worn={worn} ink={ink.current} headPhotos={headPhotos}
          hasPieces={Object.keys(wardrobe.wardrobe.worn).length > 0} environment={wardrobe.wardrobe.environment} background={background} disabled={referenceDisabled}
          onCapture={onCameraReference} onError={setCameraStatus} onBusy={onReferenceBusy} /> : <button disabled>Capture camera</button>)}
        <button disabled={!running} onClick={() => {
          const frame = document.createElement("canvas");
          frame.width = WIDTH;
          frame.height = HEIGHT;
          const dressed = worn.current.length > 0;
          frame.getContext("2d")!.drawImage(dressed ? canvas.current! : clean.current!, 0, 0);
          sendLookDraft({ frame, ink: dressed ? new Ink() : ink.current.snapshot() });
          router.push("/looks");
        }}>Send to Looks</button>
        <button disabled={!running} onClick={() => setPhoneTools(!phoneTools)}>Open on iPhone</button>
      </div>
      <CameraOverlays ink={ink.current} wardrobe={wardrobe} follow={follow} changeFollow={changeFollow}
        movingId={activeMove ? movingId : ""} onMove={running ? setMovingId : undefined} position={position} />
      <HeadScan camera={scanCamera} running={running} ink={ink.current}
        disabled={referenceDisabled} onCapture={onCameraReference} />
      {onCameraReference && running && <HeadReference camera={clean} photos={headPhotos}
        onChange={setHeadPhotos} onError={setCameraStatus} disabled={!!referenceDisabled} />}
      {showWardrobe && <AccessoryControls controls={wardrobe} camera={scanCamera} />}
      {cameraStatus && <p role={sharedInk ? "alert" : "status"}>{cameraStatus}</p>}
      {phoneTools && running && <section className={styles.pair} aria-label="iPhone pairing">
        <label>Mac Wi-Fi address <input value={address} onChange={(e) => setAddress(e.target.value)} inputMode="decimal" /></label>
        <button onClick={share}>New link</button>
        {phoneStatus && <p role="status">{phoneStatus}</p>}
        {link && <>
          {qr && <img src={qr} width={200} height={200} alt="Scan to open Camera Studio on iPhone" />}
          <input aria-label="Pairing link" value={link} readOnly onFocus={(event) => event.target.select()} />
          <button onClick={() => void navigator.clipboard.writeText(link)
            .then(() => setPhoneStatus("Link copied."))
            .catch(() => setPhoneStatus("Select and copy the link."))}>Copy link</button>
        </>}
      </section>}
    </Root>
  );
}
