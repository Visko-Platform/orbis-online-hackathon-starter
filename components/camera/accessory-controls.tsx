"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ACCESSORY_PROMPT_LIMIT, accessoryPlacements, accessoryReferenceTypes, accessoryViews, isAccessoryPlacement, resolveAccessoryPlacement, validAccessoryReference, type AccessoryPlacement } from "@/lib/camera/accessory";
import { cutOutAccessory, decodeAccessory } from "@/lib/camera/accessory-overlay";
import type { WardrobePiece } from "@/lib/camera/wardrobe";
import { captureAccessoryPhoto } from "@/lib/camera/frame";
import { responseError } from "@/lib/looks/requests";
import type { WardrobeControls } from "./use-wardrobe";
import styles from "./studio.module.css";

function PiecePreview({ piece, angle }: { piece: WardrobePiece; angle: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let open = true;
    const ctx = canvas.current?.getContext("2d");
    ctx?.clearRect(0, 0, 220, 132);
    void cutOutAccessory(piece.sheet, angle).then((view) => {
      if (open && ctx) {
        const scale = Math.min(208 / view.width, 120 / view.height);
        const width = view.width * scale, height = view.height * scale;
        ctx.drawImage(view, (220 - width) / 2, (132 - height) / 2, width, height);
      }
      view.close();
    }).catch(() => {});
    return () => { open = false; };
  }, [piece, angle]);
  return <canvas ref={canvas} width={220} height={132} role="img" aria-label={`${piece.prompt}, ${accessoryViews[angle]}`} />;
}

export function AccessoryControls({ controls, camera }: { controls: WardrobeControls; camera: RefObject<HTMLVideoElement | null> }) {
  const { wardrobe, ready, storageError, add, wear, remove, deletePiece, saveOutfit, loadOutfit } = controls;
  const [selectedPlacement, setPlacement] = useState<AccessoryPlacement>("eyes");
  const [prompt, setPrompt] = useState("");
  const placement = resolveAccessoryPlacement(prompt, selectedPlacement);
  const [reference, setReference] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);
  const canGenerate = ready && Boolean(prompt.trim() || reference);
  const [busy, setBusy] = useState<"generate" | "wear" | "capture" | null>(null);
  const [selected, setSelected] = useState("");
  const [angle, setAngle] = useState(0);
  const [error, setError] = useState("");
  const [outfitName, setOutfitName] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const request = useRef<AbortController>(null);
  const piece = wardrobe.pieces.find(({ id }) => id === selected) ?? wardrobe.pieces.at(-1);
  const isWorn = piece && wardrobe.worn[piece.placement] === piece.id;

  useEffect(() => () => { request.current?.abort(); }, []);

  async function run(action: "generate" | "wear" | "capture", work: (signal: AbortSignal) => Promise<void>) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(action);
    setError("");
    try {
      await work(controller.signal);
    } catch (caught) {
      if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Accessory unavailable.");
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setBusy(null);
      }
    }
  }

  async function generate(signal: AbortSignal) {
    const body = new FormData();
    body.set("prompt", prompt.trim());
    body.set("placement", placement);
    if (reference) body.set("reference", reference);
    const response = await fetch("/api/camera-accessory", {
      method: "POST",
      body,
      signal,
    });
    if (!response.ok) throw await responseError(response);
    const sheet = await response.blob();
    const views = await decodeAccessory(sheet);
    views.forEach((view) => view.close());
    if (signal.aborted) return;
    const id = crypto.randomUUID();
    add({ id, prompt: prompt.trim() || reference!.name.slice(0, ACCESSORY_PROMPT_LIMIT), placement, sheet });
    setSelected(id);
    setAngle(0);
  }

  return <section className={styles.wardrobe} aria-label="Look wardrobe">
    <form className={styles.accessory} onSubmit={(event) => {
      event.preventDefault();
      if (canGenerate) void run("generate", generate);
    }}>
      <input aria-label="Describe a wardrobe piece" placeholder={accessoryPlacements[placement].example} value={prompt}
        maxLength={ACCESSORY_PROMPT_LIMIT} disabled={!!busy} onChange={(event) => setPrompt(event.target.value)} />
      <select aria-label="Wardrobe slot" value={placement} disabled={!!busy} onChange={(event) => {
        if (isAccessoryPlacement(event.target.value)) setPlacement(event.target.value);
      }}>
        {Object.entries(accessoryPlacements).map(([value, { label }]) => isAccessoryPlacement(value) &&
          <option key={value} value={value} disabled={resolveAccessoryPlacement(prompt, value) !== value}>{label}</option>)}
      </select>
      <input ref={fileInput} type="file" aria-label="Accessory reference photo" accept={accessoryReferenceTypes.join(",")} disabled={!!busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && !validAccessoryReference(file)) {
            event.target.value = "";
            setReference(undefined);
            setError("Choose a JPEG, PNG or WebP photo up to 3 MB.");
            return;
          }
          setReference(file);
          setError("");
        }} />
      <button type="button" disabled={!!busy} onClick={() => void run("capture", async (signal) => {
        const photo = await captureAccessoryPhoto(camera.current);
        if (signal.aborted) return;
        if (fileInput.current) fileInput.current.value = "";
        setReference(photo);
      })}>Take photo</button>
      {reference && <button type="button" disabled={!!busy} onClick={() => {
        if (fileInput.current) fileInput.current.value = "";
        setReference(undefined);
      }}>Remove {reference.name === "Camera photo.jpg" ? "camera photo" : "photo"}</button>}
      <button disabled={!!busy || !canGenerate}>{busy === "generate" ? "Generating…" : "Generate accessory"}</button>
    </form>
    {piece && <div className={styles.wardrobePreview}>
      <PiecePreview piece={piece} angle={angle} />
      <div className={styles.wardrobeActions}>
        <select aria-label="Wardrobe piece" value={piece.id} onChange={(event) => { setSelected(event.target.value); setAngle(0); }}>
          {wardrobe.pieces.map((item) => <option key={item.id} value={item.id}>
            {item.prompt}{wardrobe.worn[item.placement] === item.id ? " · On camera" : ""}
          </option>)}
        </select>
        <select aria-label="Turnaround view" value={angle} onChange={(event) => setAngle(Number(event.target.value))}>
          {accessoryViews.map((label, index) => <option key={label} value={index}>{label}</option>)}
        </select>
        <button type="button" disabled={!!busy} onClick={() => {
          if (isWorn) { remove(piece.placement); return; }
          void run("wear", (signal) => wear(piece, signal));
        }}>{isWorn ? "Remove from camera" : "Add to camera"}</button>
        <button type="button" disabled={!!busy} onClick={() => deletePiece(piece.id)}>Delete piece</button>
      </div>
    </div>}
    {(Object.keys(wardrobe.worn).length > 0 || !!wardrobe.outfits?.length) && <div className={styles.accessory}>
      {!!wardrobe.outfits?.length && <>
        <select aria-label="Saved look" value={outfitId} disabled={!!busy} onChange={(event) => setOutfitId(event.target.value)}>
          <option value="">Saved looks</option>
          {wardrobe.outfits.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
        <button disabled={!!busy || !outfitId} onClick={() => void run("wear", (signal) => loadOutfit(outfitId, signal))}>Wear look</button>
      </>}
      {Object.keys(wardrobe.worn).length > 0 && <>
        <input aria-label="Look name" placeholder="Look name" value={outfitName} maxLength={80} disabled={!!busy}
          onChange={(event) => setOutfitName(event.target.value)} />
        <button disabled={!!busy || !outfitName.trim()} onClick={() => {
          saveOutfit(outfitName.trim());
          setOutfitName("");
        }}>Save look</button>
      </>}
    </div>}
    {(error || storageError) && <p role="alert">{error || storageError}</p>}
  </section>;
}
