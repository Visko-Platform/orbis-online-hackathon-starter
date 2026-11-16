"use client";

import { useState } from "react";

import { NanoBananaExample } from "@/components/nano-banana-example";
import { OrbisControls } from "@/components/orbis-controls";
import { OrbisPlayer } from "@/components/orbis-player";
import { OrbisShell } from "@/components/orbis-shell";
import { SceneHud } from "@/components/scene-hud";
import type { OrbisSession as OrbisSessionState } from "@/hooks/use-orbis-session";

export function OrbisDemo() {
  return (
    <section className="demo-shell">
      <OrbisShell>{(session) => <OrbisSession session={session} />}</OrbisShell>
    </section>
  );
}

function OrbisSession({ session }: { session: OrbisSessionState }) {
  // Who the HUD's directions refer to, e.g. "the red biplane".
  const [subject, setSubject] = useState("");

  return (
    <>
      <div className="session-grid">
        <OrbisPlayer
          connected={session.connected}
          muted={session.muted}
          paused={session.paused}
          runStarted={session.runStarted}
          status={session.status}
        >
          <SceneHud session={session} subject={subject} />
        </OrbisPlayer>
        <OrbisControls
          session={session}
          subject={subject}
          onSubjectChange={setSubject}
        />
      </div>

      {/* Hand-gesture control (components/hand-flight-control.tsx) is
          disabled for now; the HUD buttons direct the scene instead. */}

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
