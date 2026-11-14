"use client";

import { ReactorProvider } from "@reactor-team/js-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

import { NanoBananaExample } from "@/components/nano-banana-example";
import { OrbisControls } from "@/components/orbis-controls";
import { OrbisPlayer } from "@/components/orbis-player";
import { useOrbisSession } from "@/hooks/use-orbis-session";
import { ORBIS_MODEL_NAME, ORBIS_TRACKS, requestReactorJwt } from "@/lib/orbis";
import { openHost } from "@/lib/camera/pair";

export function OrbisDemo() {
  const jwtPromise = useRef<Promise<string> | null>(null);
  const currentJwt = useRef<string | null>(null);
  const getJwt = useCallback(async () => {
    const pending = (jwtPromise.current ??= requestReactorJwt());
    try {
      const jwt = await pending;
      currentJwt.current = jwt;
      return jwt;
    } catch (error) {
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
    <section className="demo-shell">
      <ReactorProvider
        apiUrl="https://api.reactor.inc"
        modelName={ORBIS_MODEL_NAME}
        modelTracks={[...ORBIS_TRACKS]}
        connectOptions={{ autoConnect: false }}
        jwtToken={getJwt}
      >
        <OrbisSession
          clearJwt={clearJwt}
          getCurrentJwt={getCurrentJwt}
        />
      </ReactorProvider>
    </section>
  );
}

function OrbisSession({
  clearJwt,
  getCurrentJwt,
}: {
  clearJwt: () => void;
  getCurrentJwt: () => string | null;
}) {
  const session = useOrbisSession(clearJwt, getCurrentJwt);

  const [address, setAddress] = useState("");
  const [phoneLink, setPhoneLink] = useState("");
  const [phoneStatus, setPhoneStatus] = useState("");
  const phoneStop = useRef<() => void>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (!phoneLink) return;
    let active = true;
    void import("qrcode").then((module) => module.toDataURL(phoneLink, { margin: 2, width: 200 }))
      .then((url) => { if (active) setQr(url); })
      .catch(() => { if (active) setPhoneStatus("QR unavailable. Open the link on your iPhone."); });
    return () => { active = false; };
  }, [phoneLink]);

  useEffect(() => {
    return () => phoneStop.current?.();
  }, []);

  const sharePhone = () => {
    const ip = address.trim();
    if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) || ip.split(".").some((part) => Number(part) > 255)) {
      setPhoneStatus("Enter the Mac’s Wi-Fi IPv4 address.");
      return;
    }
    phoneStop.current?.();
    setPhoneLink("");
    setQr("");
    setPhoneStatus("Preparing pairing link…");
    try {
      if (!canvasRef.current) return;
      phoneStop.current = openHost(canvasRef.current, ip, (url) => {
        setPhoneLink(url);
        if (url) setPhoneStatus("Scan with your iPhone.");
      }, setPhoneStatus, () => {}, async (text, autoApply) => {
        session.setPrompt(text);
        if (autoApply && session.runStarted && !session.controlsBusy) {
          await session.steerWithPrompt(text);
        }
      });
    } catch {
      setPhoneStatus("This browser could not share the connection.");
    }
  };

  return (
    <>
      <canvas ref={canvasRef} width={2} height={2} hidden />
      <div className="session-grid">
        <OrbisPlayer
          connected={session.connected}
          muted={session.muted}
          runStarted={session.runStarted}
          status={session.status}
        />
        <OrbisControls session={session} />
      </div>

      <fieldset style={{ marginTop: "1rem" }}>
        <legend>iPhone Remote Mic</legend>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            Mac Wi-Fi address
            <input value={address} onChange={(e) => setAddress(e.target.value)} inputMode="decimal" placeholder="192.168.X.X" />
          </label>
          <button type="button" onClick={sharePhone}>Pair iPhone</button>
          {phoneStatus && <span role="status">{phoneStatus}</span>}
        </div>
        {phoneLink && (
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            {qr && <img src={qr} width={200} height={200} alt="Scan to open Remote on iPhone" style={{ background: "#fff", padding: "4px", borderRadius: "8px" }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input aria-label="Pairing link" value={phoneLink} readOnly onFocus={(e) => e.target.select()} style={{ width: "100%", maxWidth: "400px" }} />
              <button type="button" onClick={() => void navigator.clipboard.writeText(phoneLink).then(() => setPhoneStatus("Link copied.")).catch(() => setPhoneStatus("Select and copy the link."))}>
                Copy link
              </button>
            </div>
          </div>
        )}
      </fieldset>

      <NanoBananaExample
        disabled={
          !session.connected || session.runStarted || session.controlsBusy
        }
        onActivityChange={session.setNanoBusy}
        onReady={session.startFromNanoOutput}
      />
    </>
  );
}
