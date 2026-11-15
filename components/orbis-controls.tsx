"use client";

import { FormEvent, useState } from "react";

import { PromptWriter } from "@/components/prompt-writer";
import type { OrbisSession } from "@/hooks/use-orbis-session";

export function OrbisControls({
  session,
  subject,
  onSubjectChange,
}: {
  session: OrbisSession;
  subject: string;
  onSubjectChange: (subject: string) => void;
}) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void session.startRun();
  };

  const [idea, setIdea] = useState("");
  const hasText = Boolean(idea || session.prompt);
  // Reset clears the idea and prompt, and also resets Orbis if a run is active.
  const reset = () => {
    setIdea("");
    session.setPrompt("");
    if (session.connected && session.runStarted) void session.reset();
  };

  return (
    <form className="controls" onSubmit={submit}>
      <div className="button-row">
        {!session.connected ? (
          <button
            type="button"
            disabled={session.controlsBusy}
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

      <fieldset
        disabled={
          !session.connected || session.runStarted || session.controlsBusy
        }
      >
        <legend>Scene setup</legend>
        <p className="hint">
          Resolution choices are loaded from Reactor for the next run.
        </p>
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
              <option value="">Model setting (2k default)</option>
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
      </fieldset>

      <PromptWriter
        disabled={session.controlsBusy}
        image={session.image}
        idea={idea}
        onIdeaChange={setIdea}
        onPrompt={session.setPrompt}
      />

      <label>
        Scene prompt
        <textarea
          value={session.prompt}
          placeholder="Describe the opening scene"
          onChange={(event) => session.setPrompt(event.target.value)}
        />
      </label>

      <label>
        Lead character or vehicle (used by the HUD directions)
        <input
          type="text"
          value={subject}
          placeholder="e.g. the dark angular craft"
          onChange={(event) => onSubjectChange(event.target.value)}
        />
      </label>

      <div className="button-row">
        <button
          type="submit"
          disabled={
            !session.connected || session.runStarted || session.controlsBusy
          }
        >
          Action
        </button>
        <button
          type="button"
          disabled={
            !session.connected || !session.runStarted || session.controlsBusy
          }
          onClick={session.steer}
        >
          Send direction
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
            session.controlsBusy ||
            !((session.connected && session.runStarted) || hasText)
          }
          onClick={reset}
        >
          Cut
        </button>
      </div>

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
