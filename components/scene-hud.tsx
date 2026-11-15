"use client";

import { useEffect, useRef, useState } from "react";

import type { OrbisSession } from "@/hooks/use-orbis-session";
import {
  DIRECTOR_CATEGORIES,
  type DirectorAction,
  subjectPhrase,
} from "@/lib/director-actions";

// Orbis applies a prompt at the next chunk boundary, so sending faster than
// this only queues competing morphs.
const COOLDOWN_MS = 2_000;
// A steering prompt replaces the active prompt and stays active, so a
// direction like "the camera pulls back" would repeat forever and the lead
// would drift out of the scene. After a direction has had time to land and
// play (2–4 s to land, then a couple of chunks), settle back to the scene.
const SETTLE_MS = 7_000;

export function SceneHud({
  session,
  subject,
}: {
  session: OrbisSession;
  subject: string;
}) {
  const [open, setOpen] = useState(true);
  const [categoryId, setCategoryId] = useState(DIRECTOR_CATEGORIES[0].id);
  const [cooling, setCooling] = useState(false);
  const [lastDirection, setLastDirection] = useState("");
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // Lasting scene changes (rain, night, fire…) by group.
  const conditions = useRef(new Map<string, string>());

  const category =
    DIRECTOR_CATEGORIES.find((item) => item.id === categoryId) ??
    DIRECTOR_CATEGORIES[0];
  const live = session.connected && session.runStarted && !session.paused;
  const disabled = !live || cooling || session.controlsBusy;

  // The settle timer fires later, so it reads the latest values from here.
  const latest = useRef({ live, session });
  latest.current = { live, session };

  useEffect(
    () => () => {
      clearTimeout(cooldownTimer.current);
      clearTimeout(settleTimer.current);
    },
    [],
  );

  // A new scene starts with no lasting changes and nothing left to settle.
  useEffect(() => {
    if (!session.runStarted) {
      clearTimeout(settleTimer.current);
      conditions.current.clear();
      setLastDirection("");
    }
  }, [session.runStarted]);

  const settle = (label: string) => {
    const { live: stillLive, session: current } = latest.current;
    const scene = current.prompt.trim();
    if (!stillLive || !scene) return;
    current.sendSteer([scene, ...conditions.current.values()].join(" "));
    setLastDirection(`${label} (settled)`);
  };

  const direct = (action: DirectorAction) => {
    session.sendSteer(action.prompt(subjectPhrase(subject)));
    if (action.condition) {
      const { group, text } = action.condition;
      if (text) conditions.current.set(group, text);
      else conditions.current.delete(group);
    }
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => settle(action.label), SETTLE_MS);
    setLastDirection(action.label);
    setCooling(true);
    clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => setCooling(false), COOLDOWN_MS);
  };

  if (!open) {
    return (
      <button
        type="button"
        className="hud-toggle hud-toggle-closed"
        onClick={() => setOpen(true)}
      >
        Show HUD
      </button>
    );
  }

  return (
    <div className="hud">
      <div className="hud-actions">
        {category.actions.map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={disabled}
            onClick={() => direct(action)}
          >
            {action.label}
          </button>
        ))}
      </div>
      <div className="hud-bar">
        <div className="hud-tabs" role="tablist">
          {DIRECTOR_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === category.id}
              className={item.id === category.id ? "hud-tab-active" : ""}
              onClick={() => setCategoryId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <span className="hud-note">
          {!live
            ? "Start the scene to direct it"
            : lastDirection
              ? `Sent: ${lastDirection}`
              : "Pick a direction"}
        </span>
        <button
          type="button"
          className="hud-toggle"
          onClick={() => setOpen(false)}
        >
          Hide
        </button>
      </div>
    </div>
  );
}
