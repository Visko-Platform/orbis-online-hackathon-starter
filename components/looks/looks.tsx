"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { takeLookDraft } from "@/lib/camera/frame";
import { sameComposition, sendMotionReview, setLookSource, useLook, selectGarment, type MotionReview } from "@/lib/looks/draft";
import { preferredOrbisResolution, STABLE_RESOLUTIONS } from "@/lib/orbis";
import { OrbisPhotoSpace } from "@/components/orbis-photo-space";
import { Drawing } from "./drawing";
import { EnvironmentPrompt } from "./environment-prompt";
import { GarmentPrompt } from "./garment-prompt";
import { Layers } from "./layers";
import { MotionPrompt, useMotionPrompt } from "./motion-prompt";
import { Steering } from "./steering";
import { openTake } from "./take";
import "./looks.css";

export function Looks() {
  const router = useRouter();
  const look = useLook();
  const layer = look.layers.find((item) => item.id === look.activeId);
  const hasStill = look.layers.some((item) => item.accepted);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState<MotionReview | null>(null);
  const [playing, setPlaying] = useState(false);
  const [motionOpen, setMotionOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("");
  const motion = useMotionPrompt();
  const video = useRef<HTMLVideoElement>(null);
  const take = useRef<ReturnType<typeof openTake> | null>(null);

  useEffect(() => {
    const transferred = takeLookDraft();
    if (transferred) setLookSource("webcam", transferred.frame, transferred.ink);
    return () => take.current?.close();
  }, []);

  function stop(message?: string) {
    take.current?.close();
    take.current = null;
    setPlaying(false);
    setRunning(null);
    setStatus("");
    if (message) { setError(message); setMotionOpen(true); }
  }

  function changeSource(source: "blank" | "webcam") {
    motion.clear();
    setMotionOpen(false);
    setError("");
    setLookSource(source);
  }

  function approve(inStudio: boolean) {
    const draft = motion.draft;
    if (!draft?.prompt.trim() || !sameComposition(draft.look, look)) return;
    const approved = { ...draft, prompt: draft.prompt.trim(), resolution };
    if (inStudio) {
      sendMotionReview(approved);
      router.push("/live");
      return;
    }
    if (!video.current || take.current) return;
    setRunning(approved);
    setError("");
    take.current = openTake(approved.image, approved.prompt, resolution, video.current, { status: setStatus,
      firstFrame: () => { setPlaying(true); setStatus(""); }, ended: stop });
    setMotionOpen(false);
  }

  const stale = !!motion.draft && !sameComposition(motion.draft.look, look);
  const isEnvironment = look.activeId === "environment";
  const drawing = <Drawing look={look} layer={layer} isEnvironment={isEnvironment}
    onFreeze={(frame) => setLookSource("webcam", frame)} onError={setError} />;

  return <main className="looks">
    <header className="looks-row looks-head"><h1>Looks</h1><nav className="looks-row" aria-label="Studios">
      <Link href="/camera">Camera studio</Link><Link href="/live?design=generate">Live wardrobe</Link>
    </nav></header>
    {!running && <>
      <div className="looks-row looks-sources">
        <button aria-pressed={look.source === "blank"} onClick={() => { if (look.source !== "blank") changeSource("blank"); }}>Blank canvas</button>
        <button aria-pressed={look.source === "webcam"} onClick={() => { if (look.source !== "webcam") changeSource("webcam"); }}>Webcam</button>
        <button aria-pressed={look.activeId === "environment"} onClick={() => selectGarment("environment")}>Environment</button>
        {look.frame && <button onClick={() => changeSource("webcam")}>Retake</button>}
      </div>
      {(look.source === "blank" || look.frame) && <Layers look={look} />}
      {isEnvironment ? <EnvironmentPrompt look={look} sketch={look.reference}
        referenceAction={<Link href="/live?design=environment">Open in Live Studio</Link>}>
        {drawing}
      </EnvironmentPrompt> : drawing}
      {layer && <GarmentPrompt key={layer.id} layer={layer} look={look} />}
      {hasStill && !motionOpen && <button className="looks-tools" onClick={() => setMotionOpen(true)}>Animate look</button>}
      {motionOpen && hasStill && <MotionPrompt prompt={motion.draft?.prompt ?? description}
        setPrompt={(prompt) => motion.draft ? motion.setDraft({ ...motion.draft, prompt }) : setDescription(prompt)}
        busy={motion.busy} review={!!motion.draft} actions={<>
          {!motion.draft || stale ? <button disabled={motion.busy} onClick={() => void motion.prepare(look, stale ? motion.draft!.prompt : description)}>
            {stale ? "Refresh motion prompt" : "Prepare motion prompt"}
          </button> : <>
            <label>Resolution<select value={resolution} onChange={(event) => setResolution(event.target.value)}>
              <option value="">Fast ({preferredOrbisResolution()})</option>
              {STABLE_RESOLUTIONS.map((size) => <option key={size}>{size}</option>)}
            </select></label>
            <button disabled={!motion.draft.prompt.trim()} onClick={() => approve(false)}>Start take</button>
            <button disabled={!motion.draft.prompt.trim()} onClick={() => approve(true)}>Open in Live Studio</button>
          </>}
          <button onClick={() => { motion.clear(); setMotionOpen(false); }}>Cancel</button>
        </>} />}
      {motionOpen && hasStill && motion.draft && !stale && <OrbisPhotoSpace image={motion.draft.image}
        onUse={(image) => { if (motion.draft) motion.setDraft({ ...motion.draft, image }); }} />}
    </>}
    <div className="looks-stage" hidden={!running}>
      <video ref={video} muted playsInline aria-label="Generated Orbis take" />
    </div>
    {running && <button className="looks-tools" onClick={() => stop()}>Stop take</button>}
    {running && playing && <Steering runLook={running.look} openingScene={running.prompt} onError={setError}
      apply={async (prompt) => {
        const current = take.current;
        if (!current) return false;
        await current.apply(prompt);
        return take.current === current;
      }} />}
    {(error || motion.error) && <p role="alert">{error || motion.error}</p>}
    {status && <p role="status">{status}</p>}
  </main>;
}
