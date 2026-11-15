"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { readCameraMotion, type CameraMotionTracking } from "@/lib/camera/motion";
import { CAMERA_EDIT_LIMIT, CAMERA_MOTION_KEYS, CAMERA_SCENE_LIMIT, cameraSteeringPayload, type CameraMotion } from "@/lib/orbis-camera-motion";

const UPDATE_MS = 650;
const FRESH_MS = 600;
const STABLE_MS = 100;
type MotionKey = keyof CameraMotion;
type MotionValue = NonNullable<CameraMotion[MotionKey]>;
type Sample = { candidate: MotionValue; since: number; seen: number; stable?: MotionValue };

export function useCameraFollow({ openingScene, openingSketch = "", runId, canSend, send }: {
  openingScene?: string;
  openingSketch?: string;
  runId?: number;
  canSend: boolean;
  send: (payload: ReturnType<typeof cameraSteeringPayload>) => Promise<void>;
}) {
  const [following, setFollowing] = useState(true);
  const [hasSignal, setHasSignal] = useState(false);
  const [error, setError] = useState("");
  const enabled = useRef(true);
  const samples = useRef(new Map<MotionKey, Sample>());
  const lastMotion = useRef("");
  const currentScene = useRef("");
  const sketch = useRef("");
  const lastSketch = useRef("");
  const nextUpdate = useRef(0);
  const retryAt = useRef(0);
  const controlling = useRef(false);
  const pending = useRef<Promise<void> | null>(null);
  const runVersion = useRef(0);

  const [tracking] = useState<CameraMotionTracking>(() => ({
    enabled: () => enabled.current,
    onFrame(frame) {
      if (!frame) {
        samples.current.clear();
        return;
      }
      const now = performance.now();
      const motion = readCameraMotion(frame);
      for (const key of CAMERA_MOTION_KEYS) {
        const value = motion[key];
        if (!value) continue;
        const sample = samples.current.get(key);
        if (!sample || now - sample.seen > FRESH_MS) {
          samples.current.set(key, { candidate: value, since: now, seen: now });
          continue;
        }
        if (sample.candidate !== value) {
          sample.candidate = value;
          sample.since = now;
        }
        sample.seen = now;
        if (now - sample.since >= STABLE_MS) sample.stable = value;
      }
    },
  }));

  function currentMotion(): CameraMotion {
    if (!enabled.current) return {};
    const now = performance.now();
    return Object.fromEntries(CAMERA_MOTION_KEYS.flatMap((key) => {
      const sample = samples.current.get(key);
      return sample?.stable && now - sample.seen <= FRESH_MS ? [[key, sample.stable]] : [];
    }));
  }

  const setSketchDirection = useCallback((value: string) => { sketch.current = value; }, []);

  async function update(scene: string, sceneDirection: string, direction: string, motion: CameraMotion) {
    const version = runVersion.current;
    await send(cameraSteeringPayload(scene.slice(0, CAMERA_SCENE_LIMIT), sceneDirection ? [sceneDirection] : [], direction, motion));
    if (version === runVersion.current) {
      lastMotion.current = JSON.stringify(motion);
      lastSketch.current = direction;
      setError("");
    }
  }

  const tick = useEffectEvent(() => {
    const motion = currentMotion();
    const visible = Object.keys(motion).length > 0;
    setHasSignal(visible);
    if (!visible) lastMotion.current = "";

    const now = performance.now();
    const direction = sketch.current;
    if (!openingScene || !canSend || controlling.current || pending.current || now < retryAt.current) return;
    if (direction === lastSketch.current &&
        (!visible || now < nextUpdate.current || JSON.stringify(motion) === lastMotion.current)) return;

    const version = runVersion.current;
    nextUpdate.current = now + UPDATE_MS;
    pending.current = update(openingScene, currentScene.current, direction, motion).catch(() => {
      if (version !== runVersion.current) return;
      retryAt.current = performance.now() + 2_000;
      setError("Orbis couldn’t apply the live update. Retrying…");
    }).finally(() => { pending.current = null; });
  });

  useEffect(() => {
    const timer = window.setInterval(tick, 80);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    lastMotion.current = "";
    lastSketch.current = openingSketch;
    sketch.current = openingSketch;
    currentScene.current = "";
    nextUpdate.current = 0;
    retryAt.current = 0;
    setError("");
    return () => { runVersion.current++; };
  }, [openingScene, openingSketch, runId]);

  function changeFollowing(value: boolean) {
    enabled.current = value;
    setFollowing(value);
    if (!value) {
      samples.current.clear();
      lastMotion.current = "";
      setHasSignal(false);
    }
  }

  async function withControls<T>(action: () => Promise<T>): Promise<T | undefined> {
    if (controlling.current) return;
    controlling.current = true;
    try {
      await pending.current;
      return await action();
    } finally {
      controlling.current = false;
    }
  }

  async function applyEdit(sceneDirection: string) {
    if (!openingScene || !canSend || !sceneDirection.trim() || sceneDirection.length > CAMERA_EDIT_LIMIT) return false;
    const version = runVersion.current;
    return (await withControls(async () => {
      if (version !== runVersion.current) return false;
      try {
        await update(openingScene, sceneDirection, sketch.current, currentMotion());
        if (version !== runVersion.current) return false;
        currentScene.current = sceneDirection;
        return true;
      } catch {
        if (version === runVersion.current) setError("Orbis couldn’t apply the scene edit.");
        return false;
      }
    })) ?? false;
  }

  return { following, changeFollowing, hasSignal, error, currentMotion, tracking, withControls, applyEdit, setSketchDirection };
}
