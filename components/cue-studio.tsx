"use client";

/*
 * Cue studio: queue images, start Orbis on the first, then fire each next cue
 * as a morph (prompt steer, no cut) or a cut (reset + restart on the image).
 *
 * Design references (Mobbin):
 *  - Vimeo live event studio: prepared scenes as thumbnails beside the program
 *    output, live one outlined, one click to switch.
 *    https://mobbin.com/screens/6caeef01-524d-4452-b645-36f30e9a6967
 *  - Manus presenter view / Pitch recorder: a labelled "next" preview plus a
 *    visible clock. Adapted: the clock counts DOWN the 5-minute session cap,
 *    and "next" shows whether its prompt is ready.
 *    https://mobbin.com/screens/10a16223-0c80-448a-9a6a-c06687910306
 *    https://mobbin.com/screens/70b473b1-5f0f-4639-9209-c35d0d950e27
 *  - Magnific video generator: start image → end image as an explicit pair,
 *    status inline on the item. Adapted: every hop in the sequence is drawn as
 *    a connector you can switch between morph and cut.
 *    https://mobbin.com/screens/cd59b33d-b7b1-4ffd-b532-ef9476548f91
 * Deliberate deviation: the transition lives on the connector between two
 * cues, and the connector's look encodes it (a blend for morph, a hard break
 * for cut).
 */

import { ReactorProvider, useReactorMessage } from "@reactor-team/js-sdk";
import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { OrbisPlayer } from "@/components/orbis-player";
import { useOrbisSession } from "@/hooks/use-orbis-session";
import { useReactorJwt } from "@/hooks/use-reactor-jwt";
import {
  type Cue,
  type Transition,
  normalizeImage,
  opensRun,
  requestMorphPrompt,
  requestOpeningPrompt,
  wantedPromptKey,
} from "@/lib/cues";
import {
  ORBIS_MODEL_NAME,
  ORBIS_TRACKS,
  SESSION_LIMIT_SECONDS,
  unwrapOrbisMessage,
} from "@/lib/orbis";

/** Chunks after a fire before the new picture is on screen (~1.8 s each). */
const CHUNKS_TO_LAND = 2;
const MAX_CUES = 24;

export function CueStudio() {
  const { getJwt, getCurrentJwt, clearJwt } = useReactorJwt();

  return (
    <section className="demo-shell">
      <ReactorProvider
        apiUrl="https://api.reactor.inc"
        modelName={ORBIS_MODEL_NAME}
        modelTracks={[...ORBIS_TRACKS]}
        connectOptions={{ autoConnect: false }}
        jwtToken={getJwt}
      >
        <CueSession clearJwt={clearJwt} getCurrentJwt={getCurrentJwt} />
      </ReactorProvider>
    </section>
  );
}

function CueSession({
  clearJwt,
  getCurrentJwt,
}: {
  clearJwt: () => void;
  getCurrentJwt: () => string | null;
}) {
  const session = useOrbisSession(clearJwt, getCurrentJwt);

  const [cues, setCues] = useState<Cue[]>([]);
  const [liveId, setLiveId] = useState<string | null>(null);
  const [livePrompt, setLivePrompt] = useState("");
  const [landed, setLanded] = useState(true);
  const [firedAt, setFiredAt] = useState(0);
  const [firingId, setFiringId] = useState<string | null>(null);
  const [studioError, setStudioError] = useState("");
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [holdSeconds, setHoldSeconds] = useState(10);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const chunksSinceFire = useRef(0);

  const liveIndex = cues.findIndex((cue) => cue.id === liveId);
  const busy = session.controlsBusy || firingId !== null;

  // ---- Session clock: the token caps every session at SESSION_LIMIT_SECONDS.
  useEffect(() => {
    if (session.connected) {
      setConnectedAt((current) => current ?? Date.now());
      const timer = setInterval(() => setNow(Date.now()), 1_000);
      return () => clearInterval(timer);
    }
    setConnectedAt(null);
  }, [session.connected]);

  // ---- A fire has "landed" once a couple of chunks have rendered after it.
  useReactorMessage((raw) => {
    if (unwrapOrbisMessage(raw).type !== "chunk_complete") return;
    chunksSinceFire.current += 1;
    if (chunksSinceFire.current >= CHUNKS_TO_LAND) setLanded(true);
  });

  // ---- Prompt writer: keeps every cue's prompt in step with its inputs.
  // A morph prompt is written relative to the cue before it, so cues are
  // written in order and rewritten when their inputs change (unless edited).
  useEffect(() => {
    cues.forEach((cue, index) => {
      if (cue.edited) return;
      const key = wantedPromptKey(cues, index);
      if (cue.promptKey === key && cue.promptState !== "idle") return;
      const opening = opensRun(index, cue);
      const previous = cues[index - 1];
      if (!opening && previous.promptState !== "ready") return;

      setCues((current) =>
        current.map((item) =>
          item.id === cue.id
            ? { ...item, promptState: "writing", promptKey: key, promptError: "" }
            : item,
        ),
      );
      const request = opening
        ? requestOpeningPrompt(cue.file, cue.direction)
        : requestMorphPrompt(cue.file, previous.prompt, cue.direction);
      request.then(
        (prompt) =>
          setCues((current) =>
            current.map((item) =>
              item.id === cue.id && item.promptKey === key && !item.edited
                ? { ...item, prompt, promptState: "ready" }
                : item,
            ),
          ),
        (caught: unknown) =>
          setCues((current) =>
            current.map((item) =>
              item.id === cue.id && item.promptKey === key && !item.edited
                ? {
                    ...item,
                    promptState: "error",
                    promptError:
                      caught instanceof Error ? caught.message : String(caught),
                  }
                : item,
            ),
          ),
      );
    });
  }, [cues]);

  // ---- Release object URLs when the page goes away.
  const cuesRef = useRef(cues);
  cuesRef.current = cues;
  useEffect(
    () => () => cuesRef.current.forEach((cue) => URL.revokeObjectURL(cue.url)),
    [],
  );

  const updateCue = (id: string, patch: Partial<Cue>) =>
    setCues((current) =>
      current.map((cue) => (cue.id === id ? { ...cue, ...patch } : cue)),
    );

  const addFiles = async (files: FileList | File[]) => {
    setStudioError("");
    const room = MAX_CUES - cues.length;
    const picked = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || file.type === "")
      .slice(0, Math.max(0, room));
    const failures: string[] = [];
    const added: Cue[] = [];
    for (const original of picked) {
      try {
        const file = await normalizeImage(original);
        added.push({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          name: original.name,
          direction: "",
          transition: "morph",
          prompt: "",
          promptState: "idle",
          promptError: "",
          promptKey: "",
          edited: false,
        });
      } catch (caught) {
        failures.push(caught instanceof Error ? caught.message : String(caught));
      }
    }
    if (added.length) setCues((current) => [...current, ...added]);
    if (Array.from(files).length > picked.length) {
      failures.push(`Only ${MAX_CUES} cues fit in one progression.`);
    }
    if (failures.length) setStudioError(failures.join(" "));
  };

  const moveCue = (index: number, offset: -1 | 1) =>
    setCues((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const removeCue = (id: string) =>
    setCues((current) => {
      const cue = current.find((item) => item.id === id);
      if (cue) URL.revokeObjectURL(cue.url);
      return current.filter((item) => item.id !== id);
    });

  // ---- Firing a cue.
  // Not running → open a run on the cue's exact image.
  // Running     → morph (steer the prompt) or cut (reset + restart on image).
  const fire = async (index: number) => {
    const cue = cues[index];
    if (!cue || busy) return;
    setFiringId(cue.id);
    setStudioError("");
    try {
      let prompt: string;
      let ok: boolean;
      if (!session.runStarted || (index > 0 && cue.transition === "cut")) {
        prompt =
          opensRun(index, cue) && cue.promptState === "ready"
            ? cue.prompt
            : await requestOpeningPrompt(cue.file, cue.direction);
        ok = session.runStarted
          ? await session.cutTo(cue.file, prompt)
          : await session.startWith(cue.file, prompt);
      } else {
        // A cue's stored morph prompt was written from the cue before it.
        // When jumping from anywhere else (or back to the opening cue, which
        // only has an opening prompt), write one from what is on screen.
        const storedMorphFits =
          liveIndex === index - 1 &&
          !opensRun(index, cue) &&
          cue.promptState === "ready";
        prompt = storedMorphFits
          ? cue.prompt
          : await requestMorphPrompt(
              cue.file,
              livePrompt || cues[index - 1]?.prompt || "",
              cue.direction,
            );
        ok = await session.steerTo(prompt);
      }
      if (ok) {
        chunksSinceFire.current = 0;
        setLanded(false);
        setLiveId(cue.id);
        setLivePrompt(prompt);
        setFiredAt(Date.now());
      }
    } catch (caught) {
      setStudioError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setFiringId(null);
    }
  };
  const fireRef = useRef(fire);
  fireRef.current = fire;

  // When stopped, Start resumes from the cue that was last live.
  const nextIndex = session.runStarted
    ? liveIndex + 1
    : Math.max(0, liveIndex);
  const nextCue = cues[nextIndex];
  const nextReady = Boolean(nextCue && nextCue.promptState === "ready");

  // ---- Auto-advance: once the current cue has landed and held, fire the next.
  useEffect(() => {
    if (
      !autoAdvance ||
      !session.runStarted ||
      session.paused ||
      busy ||
      !landed ||
      liveIndex < 0 ||
      !nextCue ||
      !nextReady
    ) {
      return;
    }
    const wait = Math.max(0, holdSeconds * 1_000 - (Date.now() - firedAt));
    const timer = setTimeout(() => void fireRef.current(nextIndex), wait);
    return () => clearTimeout(timer);
  }, [
    autoAdvance,
    busy,
    firedAt,
    holdSeconds,
    landed,
    liveIndex,
    nextCue,
    nextIndex,
    nextReady,
    session.paused,
    session.runStarted,
  ]);

  const remaining = connectedAt
    ? Math.max(0, SESSION_LIMIT_SECONDS - Math.floor((now - connectedAt) / 1_000))
    : SESSION_LIMIT_SECONDS;

  const liveCue = liveIndex >= 0 ? cues[liveIndex] : null;
  const fireLabel = (() => {
    if (!nextCue) return cues.length ? "End of cues" : "Add images to start";
    if (!session.connected) return "Connect to start";
    const number = nextIndex + 1;
    if (firingId === nextCue.id) return `Firing cue ${number}…`;
    if (!session.runStarted) return `Start on cue ${number}`;
    if (nextCue.promptState === "writing" || nextCue.promptState === "idle") {
      return `Writing cue ${number} prompt…`;
    }
    if (nextCue.promptState === "error") return `Cue ${number} prompt failed`;
    return `${nextCue.transition === "cut" ? "Cut" : "Morph"} to cue ${number}`;
  })();
  const canFireNext =
    session.connected &&
    !busy &&
    Boolean(nextCue) &&
    (!session.runStarted || nextReady);

  return (
    <div className="cue-grid">
      <div className="cue-stage">
        <div className="cue-player">
          <OrbisPlayer
            connected={session.connected}
            muted={session.muted}
            runStarted={session.runStarted}
            status={session.status}
          />
          {liveCue && session.runStarted && (
            <span className={`cue-onair ${landed ? "" : "is-moving"}`}>
              {landed ? "On air" : "Arriving"} · cue {liveIndex + 1}
            </span>
          )}
        </div>

        <div className="cue-transport">
          <div className="cue-transport-row">
            <div className="button-row">
              {!session.connected ? (
                <button type="button" disabled={busy} onClick={session.connectSession}>
                  Connect
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={session.disconnectSession}
                >
                  Disconnect
                </button>
              )}
              <button
                type="button"
                className="ghost"
                onClick={session.toggleMuted}
              >
                {session.muted ? "Enable sound" : "Mute"}
              </button>
            </div>
            <div className="button-row">
              {session.paused ? (
                <button
                  type="button"
                  className="ghost"
                  disabled={!session.runStarted || busy}
                  onClick={session.resume}
                >
                  Resume
                </button>
              ) : (
                <button
                  type="button"
                  className="ghost"
                  disabled={!session.runStarted || busy}
                  onClick={session.pause}
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                className="ghost"
                disabled={!session.runStarted || busy}
                onClick={session.reset}
              >
                Stop run
              </button>
              <span
                className={`cue-clock ${
                  session.connected && remaining <= 30 ? "is-low" : ""
                } ${session.connected ? "" : "is-idle"}`}
                title="Each Orbis session is capped at 5 minutes"
              >
                {formatClock(remaining)}
                <small>{session.connected ? "left" : "per session"}</small>
              </span>
            </div>
          </div>

          <div className="cue-now-next">
            <CueSlot
              label="Now"
              cue={session.runStarted ? liveCue : null}
              index={liveIndex}
              detail={
                !session.runStarted
                  ? "Nothing playing"
                  : landed
                    ? "Playing"
                    : "Arriving at the next chunk…"
              }
            />
            <span className="cue-now-next-arrow" aria-hidden>
              →
            </span>
            <CueSlot
              label="Next"
              cue={nextCue ?? null}
              index={nextIndex}
              detail={
                !nextCue
                  ? cues.length
                    ? "Last cue reached"
                    : "No cues yet"
                  : !session.runStarted
                    ? "Opens the run"
                    : nextCue.transition === "cut"
                      ? "Hard cut to the exact image"
                      : "Morphs from what's playing"
              }
            />
            <button
              type="button"
              className="cue-fire"
              disabled={!canFireNext}
              onClick={() => void fire(nextIndex)}
            >
              {fireLabel}
            </button>
          </div>

          <label className="cue-auto">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(event) => setAutoAdvance(event.target.checked)}
            />
            <span>Auto-advance, holding each cue</span>
            <input
              type="number"
              min={4}
              max={60}
              value={holdSeconds}
              onChange={(event) =>
                setHoldSeconds(
                  Math.min(60, Math.max(4, Number(event.target.value) || 10)),
                )
              }
            />
            <span>seconds</span>
          </label>

          {(studioError || session.error) && (
            <p className="error">{studioError || session.error}</p>
          )}
        </div>
      </div>

      <CueList
        cues={cues}
        liveId={session.runStarted ? liveId : null}
        nextId={nextCue?.id ?? null}
        firingId={firingId}
        canFire={session.connected && !busy}
        onAdd={addFiles}
        onFire={(index) => void fire(index)}
        onMove={moveCue}
        onRemove={removeCue}
        onUpdate={updateCue}
      />
    </div>
  );
}

function CueSlot({
  label,
  cue,
  index,
  detail,
}: {
  label: string;
  cue: Cue | null;
  index: number;
  detail: string;
}) {
  return (
    <div className="cue-slot">
      <div className="cue-slot-thumb">
        {cue ? <img src={cue.url} alt="" /> : null}
      </div>
      <div className="cue-slot-text">
        <span className="cue-label">{label}</span>
        <strong>{cue ? `Cue ${index + 1}` : "—"}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}

type CueListProps = {
  cues: Cue[];
  liveId: string | null;
  nextId: string | null;
  firingId: string | null;
  canFire: boolean;
  onAdd: (files: FileList | File[]) => Promise<void>;
  onFire: (index: number) => void;
  onMove: (index: number, offset: -1 | 1) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Cue>) => void;
};

function CueList({
  cues,
  liveId,
  nextId,
  firingId,
  canFire,
  onAdd,
  onFire,
  onMove,
  onRemove,
  onUpdate,
}: CueListProps) {
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) void onAdd(event.dataTransfer.files);
  };
  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) void onAdd(event.target.files);
    event.target.value = "";
  };

  return (
    <div
      className={`cue-panel ${dragging ? "is-dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div className="cue-panel-head">
        <div>
          <span className="cue-label">Progression</span>
          <h2>
            {cues.length} {cues.length === 1 ? "cue" : "cues"}
          </h2>
        </div>
        <button type="button" onClick={() => fileInput.current?.click()}>
          Add images
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onPick}
        />
      </div>

      {cues.length === 0 ? (
        <button
          type="button"
          className="cue-empty"
          onClick={() => fileInput.current?.click()}
        >
          <strong>Drop images in the order they should play</strong>
          <span>
            The first one opens the run. Each one after it is reached by a morph
            (the shot transforms toward it) or a cut (a restart on the exact
            image). Images are cropped to 16:9 so nothing gets squashed.
          </span>
        </button>
      ) : (
        <ol className="cue-list">
          {cues.map((cue, index) => (
            <CueItem
              key={cue.id}
              cue={cue}
              index={index}
              count={cues.length}
              isLive={cue.id === liveId}
              isNext={cue.id === nextId}
              isFiring={cue.id === firingId}
              canFire={canFire}
              onFire={() => onFire(index)}
              onMove={(offset) => onMove(index, offset)}
              onRemove={() => onRemove(cue.id)}
              onUpdate={(patch) => onUpdate(cue.id, patch)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function CueItem({
  cue,
  index,
  count,
  isLive,
  isNext,
  isFiring,
  canFire,
  onFire,
  onMove,
  onRemove,
  onUpdate,
}: {
  cue: Cue;
  index: number;
  count: number;
  isLive: boolean;
  isNext: boolean;
  isFiring: boolean;
  canFire: boolean;
  onFire: () => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<Cue>) => void;
}) {
  const setTransition = (transition: Transition) => {
    if (transition !== cue.transition) onUpdate({ transition, edited: false });
  };
  const promptKind = opensRun(index, cue)
    ? index === 0
      ? "Opening prompt"
      : "Prompt after the cut"
    : "Morph prompt";

  return (
    <>
      {index > 0 && (
        <li className={`cue-link is-${cue.transition}`} aria-label="Transition">
          <span className="cue-link-line" aria-hidden />
          <div className="cue-switch" role="radiogroup" aria-label={`How cue ${index + 1} arrives`}>
            {(["morph", "cut"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={cue.transition === option}
                className={cue.transition === option ? "is-on" : ""}
                onClick={() => setTransition(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <span className="cue-link-hint">
            {cue.transition === "morph"
              ? "shot transforms toward it"
              : "restart on the exact image"}
          </span>
        </li>
      )}

      <li
        className={`cue-card ${isLive ? "is-live" : ""} ${
          isNext ? "is-next" : ""
        }`}
      >
        <span className="cue-number">{String(index + 1).padStart(2, "0")}</span>
        <img className="cue-thumb" src={cue.url} alt={cue.name} />
        <div className="cue-body">
          <div className="cue-title">
            <span title={cue.name}>{cue.name}</span>
            {isLive && <em className="cue-flag is-live">Live</em>}
            {isNext && !isLive && <em className="cue-flag">Next</em>}
          </div>
          <DraftField
            value={cue.direction}
            placeholder={
              index === 0 ? "Motion, e.g. waves roll in" : "Change, e.g. night falls"
            }
            onCommit={(direction) => onUpdate({ direction, edited: false })}
          />
          <details className="cue-prompt">
            <summary>
              <PromptStatus cue={cue} kind={promptKind} />
            </summary>
            {cue.promptState === "ready" || cue.edited ? (
              <DraftField
                multiline
                value={cue.prompt}
                placeholder="Prompt Orbis will receive"
                onCommit={(prompt) =>
                  onUpdate({ prompt, edited: true, promptState: "ready" })
                }
              />
            ) : null}
            <button
              type="button"
              className="ghost small"
              disabled={cue.promptState === "writing"}
              onClick={() =>
                onUpdate({ edited: false, promptState: "idle", promptKey: "" })
              }
            >
              {cue.promptState === "error" ? "Try again" : "Rewrite with Gemini"}
            </button>
          </details>
        </div>
        <div className="cue-actions">
          <button
            type="button"
            disabled={!canFire || isLive}
            onClick={onFire}
            title="Fire this cue now"
          >
            {isFiring ? "…" : "Go"}
          </button>
          <div className="cue-order">
            <button
              type="button"
              className="ghost small"
              aria-label="Move up"
              disabled={index === 0}
              onClick={() => onMove(-1)}
            >
              ↑
            </button>
            <button
              type="button"
              className="ghost small"
              aria-label="Move down"
              disabled={index === count - 1}
              onClick={() => onMove(1)}
            >
              ↓
            </button>
            <button
              type="button"
              className="ghost small"
              aria-label="Remove cue"
              disabled={isLive}
              onClick={onRemove}
            >
              ✕
            </button>
          </div>
        </div>
      </li>
    </>
  );
}

function PromptStatus({ cue, kind }: { cue: Cue; kind: string }) {
  if (cue.edited) return <span className="is-ready">{kind} · edited</span>;
  switch (cue.promptState) {
    case "writing":
      return <span className="is-writing">{kind} · writing…</span>;
    case "ready":
      return <span className="is-ready">{kind} · ready</span>;
    case "error":
      return <span className="is-error">{kind} · failed: {cue.promptError}</span>;
    default:
      return <span>{kind} · waits for the cue above</span>;
  }
}

/** Text field that keeps a local draft and commits on blur or Enter, so typing
 *  doesn't trigger a Gemini rewrite per keystroke. */
function DraftField({
  value,
  placeholder,
  multiline,
  onCommit,
}: {
  value: string;
  placeholder: string;
  multiline?: boolean;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (draft.trim() !== value.trim()) onCommit(draft.trim());
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      (event.target as HTMLElement).blur();
    }
  };
  return multiline ? (
    <textarea
      className="cue-field"
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  ) : (
    <input
      className="cue-field"
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
