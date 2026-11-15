"use client";

import { useCallback, useRef } from "react";

import { type OrbisModelKey, requestReactorJwt } from "@/lib/orbis";

// One session-scoped JWT per page. Reactor only lets a scoped token act on
// sessions it created itself, so every hop of a session (create, ICE, DELETE,
// cleanup) must present the same token: memoize it instead of re-minting.
export function useReactorJwt(model: OrbisModelKey = "stable") {
  const jwtPromise = useRef<Promise<string> | null>(null);
  const currentJwt = useRef<string | null>(null);
  // A token is scoped to one model: switching model drops the memoized one.
  const modelRef = useRef(model);
  if (modelRef.current !== model) {
    modelRef.current = model;
    jwtPromise.current = null;
    currentJwt.current = null;
  }

  const getJwt = useCallback(async () => {
    const pending = (jwtPromise.current ??= requestReactorJwt(modelRef.current));
    try {
      const jwt = await pending;
      currentJwt.current = jwt;
      return jwt;
    } catch (error) {
      // Do not permanently cache a failed token request.
      if (jwtPromise.current === pending) jwtPromise.current = null;
      throw error;
    }
  }, []);
  const getCurrentJwt = useCallback(() => currentJwt.current, []);
  const clearJwt = useCallback(() => {
    jwtPromise.current = null;
    currentJwt.current = null;
  }, []);

  return { getJwt, getCurrentJwt, clearJwt };
}
