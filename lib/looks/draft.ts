import { useSyncExternalStore } from "react";
import type { Ink, Point } from "@/lib/camera/ink";
import type { GarmentContext } from "./intent";

export type AcceptedGarment = { pixels: HTMLCanvasElement; prompt: string; outline: readonly Point[] };
export type Garment = { id: string; name: string; outline: readonly Point[]; accepted?: AcceptedGarment };
export type Environment = { description: string; motion: string; is360: boolean };
export type LookDraft = {
  source: "blank" | "webcam";
  frame: HTMLCanvasElement | null;
  reference?: Ink;
  layers: readonly Garment[];
  activeId: string | "environment" | null;
  environment: Environment;
  environmentImage?: File;
};

const emptyEnvironment: Environment = { description: "", motion: "", is360: false };
const empty: LookDraft = { source: "blank", frame: null, layers: [], activeId: null, environment: emptyEnvironment };
let draft = empty;
const listeners = new Set<() => void>();
const garmentText = new Map<string, { description: string; review: string | null }>();
export const readGarmentText = (id: string) => garmentText.get(id);
export function saveGarmentText(id: string, description: string, review: string | null) {
  if (draft.layers.some((layer) => layer.id === id) || id === "environment") garmentText.set(id, { description, review });
}
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const readLook = () => draft;
export const useLook = () => useSyncExternalStore(subscribe, readLook, () => empty);

function writeLook(next: LookDraft) {
  draft = next;
  listeners.forEach((listener) => listener());
}

export function setLookSource(source: LookDraft["source"], frame: HTMLCanvasElement | null = null, reference?: Ink) {
  garmentText.clear();
  writeLook({ ...empty, source, frame, reference });
}

export function addGarment(name: string) {
  const id = crypto.randomUUID();
  writeLook({ ...draft, layers: [...draft.layers, { id, name, outline: [] }], activeId: id });
}

export function selectGarment(id: LookDraft["activeId"]) {
  writeLook({ ...draft, activeId: id });
}

export function changeGarment(id: string, change: Partial<Pick<Garment, "outline" | "accepted">>) {
  writeLook({ ...draft, layers: draft.layers.map((layer) => layer.id === id ? { ...layer, ...change } : layer) });
}

export function changeEnvironment(change: Partial<Environment>) {
  writeLook({ ...draft, environment: { ...draft.environment, ...change } });
}

export function setEnvironmentImage(environmentImage: File | undefined) {
  writeLook({ ...draft, environmentImage });
}

export function removeGarment(id: string) {
  garmentText.delete(id);
  const layers = draft.layers.filter((layer) => layer.id !== id);
  writeLook({ ...draft, layers, activeId: draft.activeId === id ? layers.at(-1)?.id ?? null : draft.activeId });
}

export function moveGarment(id: string, direction: -1 | 1) {
  const layers = [...draft.layers];
  const index = layers.findIndex((layer) => layer.id === id);
  const neighbor = index + direction;
  if (index < 0 || neighbor < 0 || neighbor >= layers.length) return;
  [layers[index], layers[neighbor]] = [layers[neighbor], layers[index]];
  writeLook({ ...draft, layers });
}

export function garmentContext(layers: readonly Garment[]): GarmentContext[] {
  return layers.flatMap(({ id, name, accepted }) => accepted ? [{ id, name, prompt: accepted.prompt }] : []);
}

export type MotionReview = { image: File; prompt: string; look: LookDraft; resolution?: string };
let handoff: MotionReview | null = null;
export function sendMotionReview(value: MotionReview) { handoff = value; }
export function takeMotionReview() { const value = handoff; handoff = null; return value; }

export function sameComposition(first: LookDraft, second: LookDraft) {
  if (first.layers === second.layers && first.frame === second.frame && first.source === second.source && first.environment === second.environment) return true;
  const a = first.layers.filter((layer) => layer.accepted);
  const b = second.layers.filter((layer) => layer.accepted);
  return first.frame === second.frame && first.source === second.source &&
    first.environment.description === second.environment.description &&
    first.environment.motion === second.environment.motion &&
    first.environment.is360 === second.environment.is360 &&
    a.length === b.length && a.every((layer, index) => layer.accepted === b[index].accepted);
}
