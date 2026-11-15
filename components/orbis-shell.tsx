"use client";

import { ReactorProvider } from "@reactor-team/js-sdk";
import { type ReactNode, useCallback, useRef } from "react";

import { type OrbisSession, useOrbisSession } from "@/hooks/use-orbis-session";
import { ORBIS_MODEL_NAME, ORBIS_TRACKS, requestReactorJwt } from "@/lib/orbis";

/**
 * Connects a subtree to Orbis: mints session tokens through /api/token, sets
 * up the Reactor provider, and hands the session to its render-prop child.
 */
export function OrbisShell({
  children,
  modelName = ORBIS_MODEL_NAME,
}: {
  children: (session: OrbisSession) => ReactNode;
  /** Which Orbis model to connect to. Change it only while disconnected. */
  modelName?: string;
}) {
  const jwtPromise = useRef<Promise<string> | null>(null);
  const currentJwt = useRef<string | null>(null);
  const getJwt = useCallback(async () => {
    const pending = (jwtPromise.current ??= requestReactorJwt());
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

  return (
    <ReactorProvider
      apiUrl="https://api.reactor.inc"
      modelName={modelName}
      modelTracks={[...ORBIS_TRACKS]}
      connectOptions={{ autoConnect: false }}
      jwtToken={getJwt}
    >
      <SessionBridge clearJwt={clearJwt} getCurrentJwt={getCurrentJwt}>
        {children}
      </SessionBridge>
    </ReactorProvider>
  );
}

function SessionBridge({
  children,
  clearJwt,
  getCurrentJwt,
}: {
  children: (session: OrbisSession) => ReactNode;
  clearJwt: () => void;
  getCurrentJwt: () => string | null;
}) {
  return <>{children(useOrbisSession(clearJwt, getCurrentJwt))}</>;
}
