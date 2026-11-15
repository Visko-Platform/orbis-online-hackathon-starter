"use client";

import { FormEvent } from "react";

import type { OrbisSession } from "@/hooks/use-orbis-session";
import { LiveVoice } from "@/components/looks/live-voice";
import { OrbisPhotoSpace } from "@/components/orbis-photo-space";

export function OrbisControls({ session }: { session: OrbisSession }) {
  const needsImagePrompt = Boolean(session.image && (session.describingImage || !session.prompt.trim()));
  const canStart = session.connected && !session.runStarted && !session.controlsBusy &&
    !session.describingImage && Boolean(session.prompt.trim());
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canStart) void session.startRun();
  };

  return (
    <form className="controls" onSubmit={submit}>
      <div className="button-row">
        {!session.connected ? (
          <button
            type="button"
            disabled={session.controlsBusy || needsImagePrompt}
            onClick={session.connectSession}
          >
            Connect
          </button>
        ) : (
          <button
            type="button"
            disabled={session.controlsBusy}
            onClick={session.disconnectSession}
          >
            Disconnect
          </button>
        )}
        <button type="button" onClick={session.toggleMuted}>
          {session.muted ? "Enable sound" : "Mute"}
        </button>
      </div>

      <fieldset disabled={session.runStarted || session.controlsBusy}>
        <legend>Next run setup</legend>
        <div className="two-column">
          <label>
            Optional start image (16:9 recommended)
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                session.selectImage(event.target.files?.[0] || null)
              }
            />
          </label>
          <label>
            Resolution for next run
            <select
              value={session.resolution}
              onChange={(event) => session.setResolution(event.target.value)}
            >
              <option value="">Fast ({session.preferredResolution})</option>
              {session.availableResolutions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="selected-image">
          Orbis start image: {session.image?.name || "none (text-to-video)"}
          {session.imageStatus ? ` · ${session.imageStatus}` : ""}
        </p>
        {session.image && !session.runStarted && <OrbisPhotoSpace image={session.image}
          disabled={session.controlsBusy} onUse={session.selectImage} />}
      </fieldset>

      <label>
        Prompt
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            value={session.prompt}
            placeholder={session.image ? undefined : "Enter prompt here"}
            onChange={(event) => session.setPrompt(event.target.value)}
            style={{ flexGrow: 1 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <LiveVoice 
              disabled={session.controlsBusy}
              onTranscript={(text) => session.setPrompt((current) => current ? current + " " + text : text)}
              onError={(error) => alert(error)}
            />
          </div>
        </div>
      </label>

      <div className="button-row">
        {session.describingImage && <span role="status">Describing starting image…</span>}
        {session.image && !session.runStarted && !session.describingImage && (session.promptError || !session.prompt.trim()) &&
          <button type="button" disabled={session.controlsBusy} onClick={() => session.selectImage(session.image)}>
            {session.promptError ? "Retry image prompt" : "Generate image prompt"}
          </button>}
        <button type="submit" disabled={!canStart}>Start run</button>
        <button
          type="button"
          disabled={
            !session.connected || !session.runStarted || session.controlsBusy
          }
          onClick={() => session.steer()}
        >
          Steer current run
        </button>
      </div>

      <div className="button-row secondary">
        <button
          type="button"
          disabled={
            !session.connected ||
            !session.runStarted ||
            session.paused ||
            session.controlsBusy
          }
          onClick={session.pause}
        >
          Pause
        </button>
        <button
          type="button"
          disabled={
            !session.connected ||
            !session.runStarted ||
            !session.paused ||
            session.controlsBusy
          }
          onClick={session.resume}
        >
          Resume
        </button>
        <button
          type="button"
          disabled={
            !session.connected || !session.runStarted || session.controlsBusy
          }
          onClick={session.reset}
        >
          Reset
        </button>
      </div>

      {session.promptError && <p className="error" role="alert">{session.promptError}</p>}
      {session.error && <p className="error">{session.error}</p>}
      <aside>
        <strong>Recent model events</strong>
        <code>
          {session.events.length ? session.events.join(" · ") : "No events yet"}
        </code>
      </aside>
    </form>
  );
}
