"use client";

import { useEffect, useRef, useState } from "react";
import { decodeAccessory, type CameraAccessory } from "@/lib/camera/accessory-overlay";
import { headwearFromViews } from "@/lib/camera/headwear";
import { garmentFit } from "@/lib/camera/upper-body";
import { emptyWardrobe, loadWardrobe, saveWardrobe, wornAccessories, type Wardrobe, type WardrobePiece } from "@/lib/camera/wardrobe";

async function decodeWardrobePiece(piece: WardrobePiece): Promise<CameraAccessory> {
  const views = await decodeAccessory(piece.sheet);
  try {
    const headwear = piece.placement === "head" ? headwearFromViews(views) : undefined;
    const fit = piece.placement === "shoulders" ? garmentFit(views[0]) : undefined;
    return { ...piece, views, headwear, garmentFit: fit };
  } catch (error) {
    views.forEach((view) => view.close());
    throw error;
  }
}

function releaseWardrobePiece(piece: CameraAccessory) {
  piece.views.forEach((view) => view.close());
}

export function useWardrobe() {
  const [wardrobe, setWardrobe] = useState(emptyWardrobe);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const decoded = useRef(new Map<string, CameraAccessory>());
  const worn = useRef<CameraAccessory[]>([]);
  const current = useRef(emptyWardrobe);
  const saves = useRef(Promise.resolve());
  const wearRevision = useRef(0);

  useEffect(() => {
    let closed = false;
    void loadWardrobe().then(async (saved) => {
      if (closed) return;
      const activePieces = saved.pieces.filter((piece) => saved.worn[piece.placement] === piece.id);
      for (const piece of activePieces) {
        const item = await decodeWardrobePiece(piece).catch(() => null);
        if (closed) { if (item) releaseWardrobePiece(item); return; }
        if (item) decoded.current.set(piece.id, item);
      }
      current.current = saved;
      worn.current = wornAccessories(saved, decoded.current);
      setWardrobe(saved);
    }).catch(() => { if (!closed) setStorageError("Wardrobe storage is unavailable."); })
      .finally(() => { if (!closed) setReady(true); });
    return () => {
      closed = true;
      decoded.current.forEach(releaseWardrobePiece);
      decoded.current.clear();
      worn.current = [];
    };
  }, []);

  function update(next: Wardrobe) {
    current.current = next;
    worn.current = wornAccessories(next, decoded.current);
    setWardrobe(next);
    saves.current = saves.current.then(() => saveWardrobe(next)).catch(() => {
      setStorageError("Couldn’t save the wardrobe to this browser.");
    });
  }

  function add(piece: WardrobePiece) {
    update({ ...current.current, pieces: [...current.current.pieces, piece] });
  }

  function release(id: string | undefined) {
    if (!id) return;
    const item = decoded.current.get(id);
    if (item) releaseWardrobePiece(item);
    decoded.current.delete(id);
  }

  async function wear(piece: WardrobePiece, signal: AbortSignal) {
    const revision = ++wearRevision.current;
    const item = await decodeWardrobePiece(piece);
    if (signal.aborted || revision !== wearRevision.current) {
      releaseWardrobePiece(item);
      return;
    }
    release(current.current.worn[item.placement]);
    decoded.current.set(item.id, item);
    update({ ...current.current, worn: { ...current.current.worn, [item.placement]: item.id } });
  }

  function remove(placement: CameraAccessory["placement"]) {
    wearRevision.current++;
    const worn = { ...current.current.worn };
    release(worn[placement]);
    delete worn[placement];
    update({ ...current.current, worn });
  }

  function removeAll() {
    wearRevision.current++;
    if (!Object.keys(current.current.worn).length) return;
    for (const id of Object.values(current.current.worn)) release(id);
    update({ ...current.current, worn: {} });
  }

  function deletePiece(id: string) {
    wearRevision.current++;
    const previous = current.current;
    const withoutPiece = (worn: Wardrobe["worn"]) =>
      Object.fromEntries(Object.entries(worn).filter(([, item]) => item !== id)) as Wardrobe["worn"];
    release(id);
    update({
      ...previous,
      pieces: previous.pieces.filter((piece) => piece.id !== id),
      worn: withoutPiece(previous.worn),
      outfits: previous.outfits?.map((outfit) => ({ ...outfit, worn: withoutPiece(outfit.worn) })),
    });
  }

  function setEnvironment(environment: string) {
    update({ ...current.current, environment });
  }

  function saveOutfit(name: string) {
    const { outfits = [], worn } = current.current;
    const existing = outfits.find((outfit) => outfit.name === name);
    const outfit = { id: existing?.id ?? crypto.randomUUID(), name, worn: { ...worn } };
    update({ ...current.current, outfits: [...outfits.filter(({ id }) => id !== outfit.id), outfit] });
  }

  async function loadOutfit(id: string, signal: AbortSignal) {
    const outfit = current.current.outfits?.find((item) => item.id === id);
    if (!outfit) return;
    const revision = ++wearRevision.current;
    const pieces = current.current.pieces.filter((piece) => outfit.worn[piece.placement] === piece.id);
    const items: CameraAccessory[] = [];
    try {
      for (const piece of pieces) {
        if (signal.aborted || revision !== wearRevision.current) return;
        items.push(await decodeWardrobePiece(piece));
      }
      if (signal.aborted || revision !== wearRevision.current) return;
      for (const value of Object.values(current.current.worn)) release(value);
      for (const piece of items) decoded.current.set(piece.id, piece);
      items.length = 0;
      update({ ...current.current, worn: { ...outfit.worn } });
    } finally {
      items.forEach(releaseWardrobePiece);
    }
  }

  return { wardrobe, worn, ready, storageError, add, wear, remove, removeAll, deletePiece, saveOutfit, loadOutfit };
}

export type WardrobeControls = ReturnType<typeof useWardrobe>;
