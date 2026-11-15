"use client";

import { ReactorView } from "@reactor-team/js-sdk";
import { type FormEvent, useEffect, useRef, useState } from "react";

import marketImage from "@/market.png";
import craftImage from "@/craft.png";
import { OrbisShell } from "@/components/orbis-shell";
import type { OrbisSession } from "@/hooks/use-orbis-session";
import { ORBIS_MODEL_NAME } from "@/lib/orbis";
import { SCENARIOS, scenarioById } from "@/lib/scenarios";
import {
  ACTION_CATEGORIES,
  type ActionCategory,
  type ActionMenu,
  type DialogueLine,
  type DirectorTurn,
  type PlayerAction,
  type Scenario,
  type StoryState,
  continueStory,
  introNarration,
  nextStory,
} from "@/lib/story";

// The frame each film starts from.
const SCENE_IMAGES: Record<string, { src: string }> = {
  market: marketImage,
  craft: craftImage,
};

const MAX_LOG_ENTRIES = 30;
// Gap between one spoken line appearing on screen and the next.
const CAPTION_MS = 3_200;
// Orbis takes 15–30 seconds to bring a second person into the shot. Their
// dialogue is held until a frame check sees them, or until this long passes.
const ARRIVAL_FIRST_CHECK_MS = 7_000;
const ARRIVAL_RECHECK_MS = 3_000;
const ARRIVAL_TIMEOUT_MS = 22_000;
// Keep trying to bring the second person in for this long.
const ARRIVAL_GIVE_UP_MS = 45_000;
// If they are still not both in frame after this long, ask Orbis again.
const ARRIVAL_NUDGE_MS = 14_000;
// The hand-back prompt follows the change prompt once the change is seen on
// screen: never sooner than the first, never later than the second.
const HANDBACK_MIN_MS = 6_000;
const HANDBACK_MAX_MS = 24_000;
const HANDBACK_RECHECK_MS = 2_500;
// After the hand-back prompt has had time to land, check the lead is still
// in frame and pull the film back to them if not.
const LEAD_CHECK_MS = 8_000;
// How often to retry when Reactor has no free server for a model.
// How long to wait before each retry when Reactor has no free server for a
// model. Few and spaced out: hammering a full fleet helps nobody.
const CAPACITY_RETRY_WAITS_MS = [8_000, 20_000];
// After this many automatic re-centres in one turn, stop sending them.
const MAX_RECENTRES_PER_TURN = 3;
// The intro stays up this long unless the viewer starts sooner.
const INTRO_MS = 40_000;

// What the film is doing right now, shown under the viewport.
type NowShowing = {
  stage: "standby" | "deciding" | "changing" | "settled";
  onScreen: string;
  offScreen: string;
  /** The exact prompt Orbis is currently following. */
  prompt: string;
};

const standbyFor = (scenario: Scenario): NowShowing => ({
  stage: "standby",
  onScreen: scenario.initialOnScreen,
  offScreen: "",
  prompt: scenario.openingPrompt,
});

const STAGE_LABEL: Record<NowShowing["stage"], string> = {
  standby: "Standby",
  deciding: "Director deciding",
  changing: "Scene changing",
  settled: "Holding",
};

type LogEntry = {
  id: number;
  kind: "story" | "player" | "system" | "dialogue";
  text: string;
};

// The browser's default voice is often a novelty one (on macOS it can be
// "Albert"), so pick the most natural English voice that is installed.
const NARRATOR_VOICES = [
  /\((premium|enhanced)\)/i,
  /^Google UK English Male$/,
  /^Daniel\b/,
  /^Google US English$/,
  /^Samantha\b/,
  /^Karen\b/,
];

async function pickNarratorVoice(synth: SpeechSynthesis) {
  let voices = synth.getVoices();
  if (!voices.length) {
    // Chrome loads the voice list asynchronously.
    await new Promise<void>((resolve) => {
      const done = () => resolve();
      synth.addEventListener("voiceschanged", done, { once: true });
      setTimeout(done, 1_000);
    });
    voices = synth.getVoices();
  }
  const english = voices.filter((voice) => voice.lang.startsWith("en"));
  for (const pattern of NARRATOR_VOICES) {
    const match = english.find((voice) => pattern.test(voice.name));
    if (match) return match;
  }
  return english.find((voice) => voice.default) ?? english[0] ?? null;
}

export function SceneDirector() {
  // Each film can run on its own Orbis model, so the connection is set up
  // for whichever film is selected.
  const [modelName, setModelName] = useState(
    SCENARIOS[0].model ?? ORBIS_MODEL_NAME,
  );
  return (
    <OrbisShell modelName={modelName}>
      {(session) => <Director session={session} onModel={setModelName} />}
    </OrbisShell>
  );
}

function Director({
  session,
  onModel,
}: {
  session: OrbisSession;
  onModel: (modelName: string) => void;
}) {
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [story, setStory] = useState<StoryState>(scenario.initialStory);
  const [actions, setActions] = useState<ActionMenu>(scenario.initialActions);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [category, setCategory] = useState<ActionCategory | null>(null);
  const [direction, setDirection] = useState("");
  const [thinking, setThinking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [directorError, setDirectorError] = useState("");
  const [now, setNow] = useState<NowShowing>(() => standbyFor(scenario));
  // The background briefing shown over the viewport when a scene begins.
  const [intro, setIntro] = useState(false);
  const [reading, setReading] = useState(false);
  // The current exchange, shown on the video. Lines appear one at a time and
  // then stay up until the next exchange replaces them.
  const [captions, setCaptions] = useState<DialogueLine[]>([]);
  const [captionsShown, setCaptionsShown] = useState(0);

  // Add ?raw=1 to the URL to send the custom direction box straight to Orbis
  // as the prompt, skipping the director. For testing prompt wording.
  const [raw, setRaw] = useState(false);
  useEffect(() => {
    setRaw(new URLSearchParams(window.location.search).get("raw") === "1");
  }, []);

  const logId = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const wasRunning = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // Bumped on every turn and scene change so a stale arrival wait gives up.
  const turnToken = useRef(0);
  // The look of the character last confirmed on screen with the lead.
  const onScreenWith = useRef("");
  const [awaiting, setAwaiting] = useState(false);
  // The turn whose hand-back prompt has already been sent.
  const handedBack = useRef(-1);
  // The latest prompt that puts the lead back in the middle of the shot.
  const holdPrompt = useRef(scenario.defaultHold);
  // The state a film opens with: its own, or one carried over from the film
  // it follows when the viewer has just played that.
  const openingStory = useRef<StoryState>(scenario.initialStory);
  const [carried, setCarried] = useState(false);
  // Which Orbis model the connection is currently set up for.
  const activeModel = useRef(scenario.model ?? ORBIS_MODEL_NAME);
  // Progress shown on the intro while a start is being retried.
  const [startNote, setStartNote] = useState("");

  const live = session.connected && session.runStarted;
  const canAct = live && !session.paused && !thinking && !intro;

  // Timers and key handlers outlive renders, so they read the latest values.
  const latest = useRef({
    story,
    actions,
    category,
    canAct,
    live,
    session,
    scenario,
    intro,
  });
  latest.current = {
    story,
    actions,
    category,
    canAct,
    live,
    session,
    scenario,
    intro,
  };

  const addLog = (kind: LogEntry["kind"], text: string) =>
    setLog((current) =>
      [{ id: ++logId.current, kind, text }, ...current].slice(0, MAX_LOG_ENTRIES),
    );

  // Switch films. A running scene is ended first.
  const chooseScenario = async (id: string) => {
    const next = scenarioById(id);
    if (next.id === scenario.id || starting) return;
    if (latest.current.session.connected) {
      await latest.current.session.disconnectSession();
    }
    clearTimeout(settleTimer.current);
    turnToken.current += 1;
    onScreenWith.current = "";
    holdPrompt.current = next.defaultHold;
    // Carry the story over when this film follows the one just played.
    const played = latest.current.story;
    const follows = next.continues === scenario.id && played.turn > 0;
    const opening = follows ? continueStory(next, played) : next.initialStory;
    openingStory.current = opening;
    setCarried(follows);
    activeModel.current = next.model ?? ORBIS_MODEL_NAME;
    onModel(activeModel.current);
    setScenario(next);
    setStory(opening);
    setActions(next.initialActions);
    setCategory(null);
    setLog([]);
    setCaptions([]);
    setAwaiting(false);
    setIntro(false);
    setDirectorError("");
    setNow(standbyFor(next));
  };

  const begin = async () => {
    if (starting || live) return;
    setStarting(true);
    // The stream starts muted so it can autoplay. Starting the scene is a
    // click, which is what browsers need before they will play sound.
    session.unmute();
    setDirectorError("");
    clearTimeout(settleTimer.current);
    setStory(openingStory.current);
    setActions(scenario.initialActions);
    setCategory(null);
    setLog([]);
    setNow(standbyFor(scenario));
    holdPrompt.current = scenario.defaultHold;
    setCaptions([]);
    setIntro(true);
    turnToken.current += 1;
    onScreenWith.current = "";
    setAwaiting(false);

    // Each film opens on its own start image.
    try {
      // Always start a film on a fresh session. A leftover one may be near
      // its five-minute cap, or in a state where commands go unanswered.
      if (latest.current.session.connected) {
        await latest.current.session.disconnectSession();
      }
      const pause = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      // Reactor answers "no available capacity" when every server for a
      // model is busy. That usually clears within seconds.
      const noCapacity = async () => {
        await pause(100);
        return /capacity|\b429\b/i.test(latest.current.session.error);
      };

      // A film may have fallen back to another model last time.
      const preferred = scenario.model ?? ORBIS_MODEL_NAME;
      const switching = activeModel.current !== preferred;
      activeModel.current = preferred;
      onModel(preferred);
      await pause(switching ? 300 : 50);

      let connected = await latest.current.session.connectSession();
      for (
        let attempt = 1;
        !connected &&
        attempt <= CAPACITY_RETRY_WAITS_MS.length &&
        (await noCapacity());
        attempt += 1
      ) {
        setStartNote(
          `All Orbis servers are busy. Trying again (${attempt} of ${CAPACITY_RETRY_WAITS_MS.length})…`,
        );
        await pause(CAPACITY_RETRY_WAITS_MS[attempt - 1]);
        connected = await latest.current.session.connectSession();
      }

      // Still full: a film that asked for a particular model can run on the
      // app's default one instead.
      let fellBack = false;
      if (!connected && preferred !== ORBIS_MODEL_NAME && (await noCapacity())) {
        setStartNote("Still busy. Starting on the other Orbis model…");
        activeModel.current = ORBIS_MODEL_NAME;
        onModel(ORBIS_MODEL_NAME);
        await pause(300);
        connected = await latest.current.session.connectSession();
        fellBack = connected;
      }
      setStartNote("");
      if (!connected) {
        // Nothing is loading, so do not leave the intro up over an error.
        setIntro(false);
        return;
      }
      if (fellBack) {
        addLog(
          "system",
          "Orbis Dynamic had no free servers, so this film is running on Orbis Stable. It holds the opening framing less well.",
        );
      }
      const response = await fetch(SCENE_IMAGES[scenario.id].src);
      if (!response.ok) throw new Error("Could not load the opening frame");
      const frame = new File([await response.blob()], `${scenario.id}.png`, {
        type: "image/png",
      });
      // Read the session through the ref: connecting re-rendered this
      // component, and the start command must use the connected session.
      const started = await latest.current.session.startFromNanoOutput(
        frame,
        scenario.openingPrompt,
      );
      // The session reports why; do not leave "Film loading…" up over it.
      if (!started) setIntro(false);
    } catch (caught) {
      setDirectorError(caught instanceof Error ? caught.message : String(caught));
      setIntro(false);
    } finally {
      setStartNote("");
      setStarting(false);
    }
  };

  // Announce the scene starting and ending.
  useEffect(() => {
    if (live && !wasRunning.current) {
      addLog("story", latest.current.scenario.initialNarration);
      // Keep the lead in frame from the opening shot onward.
      void watchLead(turnToken.current);
      setNow({ ...standbyFor(latest.current.scenario), stage: "settled" });
    } else if (!live && wasRunning.current) {
      clearTimeout(settleTimer.current);
      setCategory(null);
      setIntro(false);
      setCaptions([]);
      turnToken.current += 1;
      onScreenWith.current = "";
      setAwaiting(false);
      addLog("system", "Transmission ended. Begin a new scene to continue.");
      setNow((current) => ({ ...current, stage: "standby" }));
    }
    wasRunning.current = live;
  }, [live]);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  const speak = (lines: DialogueLine[]) => {
    if (!lines.length) return;
    setCaptions(lines);
    setCaptionsShown(1);
    // Newest entries sit at the top of the log, so add them in reverse.
    setLog((current) =>
      [
        ...[...lines]
          .reverse()
          .map((entry) => ({
            id: ++logId.current,
            kind: "dialogue" as const,
            text: `${entry.speaker}: “${entry.line}”`,
          })),
        ...current,
      ].slice(0, MAX_LOG_ENTRIES),
    );
  };

  // Grab the current video frame as a small base64 JPEG.
  const captureFrame = () => {
    const video = viewportRef.current?.querySelector("video");
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = Math.round((512 * video.videoHeight) / video.videoWidth);
    const context = canvas.getContext("2d");
    if (!context) return null;
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.7).split(",")[1] ?? null;
    } catch {
      return null;
    }
  };

  const isVisible = async (look: string) => {
    const frame = captureFrame();
    if (!frame) return null;
    try {
      const response = await fetch("/api/scene-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame, look }),
      });
      const result = (await response.json().catch(() => null)) as {
        visible?: boolean;
      } | null;
      return typeof result?.visible === "boolean" ? result.visible : null;
    } catch {
      return null;
    }
  };

  const checkFrame = async (payload: { look: string } | { change: string }) => {
    const frame = captureFrame();
    if (!frame) return null;
    try {
      const response = await fetch("/api/scene-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame, ...payload }),
      });
      const result = (await response.json().catch(() => null)) as {
        visible?: boolean;
      } | null;
      return typeof result?.visible === "boolean" ? result.visible : null;
    } catch {
      return null;
    }
  };

  // Send this turn's hand-back prompt, once.
  const handBack = (token: number) => {
    if (token !== turnToken.current || !latest.current.live) return;
    if (handedBack.current === token) return;
    handedBack.current = token;
    const prompt = holdPrompt.current;
    latest.current.session.sendSteer(prompt);
    setNow((showing) => ({ ...showing, stage: "settled", prompt }));
  };

  // The change prompt is short and about one thing, which is what makes
  // Orbis show it fastest. Replacing it early with the longer hand-back
  // prompt slows the change down, and leaving it too long lets the film
  // drift from the lead. So keep it until a frame check sees the change,
  // within limits, and only then hand back.
  const handBackWhenSeen = async (token: number, change: string) => {
    const pause = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const startedAt = Date.now();
    await pause(HANDBACK_MIN_MS);
    while (
      token === turnToken.current &&
      latest.current.live &&
      Date.now() - startedAt < HANDBACK_MAX_MS
    ) {
      if (await checkFrame({ change })) break;
      await pause(HANDBACK_RECHECK_MS);
    }
    handBack(token);
    void watchLead(token);
  };

  // Orbis sometimes loses the lead after a change, and can lose it again
  // after being corrected. Until the next turn, keep looking every few
  // seconds and pull the film back whenever the lead is gone.
  const watchLead = async (token: number) => {
    let announced = false;
    let recentres = 0;
    let checks = 0;
    while (recentres < MAX_RECENTRES_PER_TURN) {
      // Look often just after a change, then ease off.
      checks += 1;
      await new Promise((resolve) =>
        setTimeout(resolve, checks <= 6 ? LEAD_CHECK_MS : LEAD_CHECK_MS * 3),
      );
      if (token !== turnToken.current || !latest.current.live) return;
      // Nothing to check while paused or while nobody is watching the tab.
      if (latest.current.session.paused || document.hidden) continue;
      const current = latest.current.scenario;
      const visible = await isVisible(
        current.watchLook ?? current.leadLook.replace(/^the /i, "a "),
      );
      if (token !== turnToken.current || !latest.current.live) return;
      if (visible !== false) continue;

      // Ask for the lead in the film's usual framing, without the extras
      // that may have crowded it out.
      // Use this turn's hand-back prompt: it names the lead, the camera and
      // whatever the turn added, so re-centring does not wipe the change.
      const prompt = holdPrompt.current;
      recentres += 1;
      latest.current.session.sendSteer(prompt);
      setNow((showing) => ({ ...showing, stage: "settled", prompt }));
      if (!announced) {
        announced = true;
        addLog("system", `Lost sight of ${current.leadName}; camera recentered.`);
      }
    }
  };

  // Show a turn's dialogue once the person speaking is actually on screen.
  // Lines from someone unseen (Voss in the earpiece) are shown at once.
  const speakWhenArrived = async (
    lines: DialogueLine[],
    waitFor: string,
    partnerLook = "",
  ) => {
    if (!lines.length) return;
    if (!waitFor) {
      onScreenWith.current = "";
      return speak(lines);
    }
    // Already together in the previous turn: show the lines at once, but
    // keep watching in case this turn's prompt drops one of them.
    const held = onScreenWith.current !== waitFor;
    if (!held) speak(lines);

    const token = turnToken.current;
    const pause = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const startedAt = Date.now();
    let nudged = false;
    let released = !held;
    let arrived = false;
    setAwaiting(held);
    await pause(ARRIVAL_FIRST_CHECK_MS);

    while (
      token === turnToken.current &&
      latest.current.live &&
      Date.now() - startedAt < ARRIVAL_GIVE_UP_MS
    ) {
      if (await checkFrame({ look: waitFor })) {
        arrived = true;
        onScreenWith.current = waitFor;
        break;
      }
      const elapsed = Date.now() - startedAt;
      // The two-shot prompt sometimes leaves the lead alone in a close-up,
      // most often when he was already facing the camera. In live tests the
      // other person then came in when asked for as the subject of their own
      // sentence, so try that once.
      if (!nudged && elapsed > ARRIVAL_NUDGE_MS && partnerLook) {
        nudged = true;
        const prompt = `A ${partnerLook} steps into the frame and stands face to face with the man, close to him.`;
        latest.current.session.sendSteer(prompt);
        setNow((showing) => ({ ...showing, prompt }));
      }
      // Do not hold the dialogue for ever; keep trying to bring them in.
      if (!released && elapsed > ARRIVAL_TIMEOUT_MS) {
        released = true;
        setAwaiting(false);
        speak(lines);
      }
      await pause(ARRIVAL_RECHECK_MS);
    }

    if (token !== turnToken.current || !latest.current.live) return;
    setAwaiting(false);
    if (!released) speak(lines);
    // Hold the two-shot once both are in it. If they never both appeared,
    // leave the entry prompt running instead of replacing it.
    if (arrived || !nudged) handBack(token);
  };

  // Reveal the exchange one line at a time.
  useEffect(() => {
    if (captionsShown >= captions.length) return;
    const timer = setTimeout(
      () => setCaptionsShown((count) => count + 1),
      CAPTION_MS,
    );
    return () => clearTimeout(timer);
  }, [captions, captionsShown]);

  const stopReading = () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setReading(false);
  };

  const readIntro = async () => {
    if (reading) return stopReading();
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    setReading(true);
    const voice = await pickNarratorVoice(synth);
    // One utterance per passage: Chrome's better voices cut off long ones.
    const passages = introNarration(scenario);
    passages.forEach((passage, index) => {
      const utterance = new SpeechSynthesisUtterance(passage);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.rate = 0.92;
      utterance.pitch = 0.9;
      if (index === passages.length - 1) {
        utterance.onend = () => setReading(false);
      }
      utterance.onerror = () => setReading(false);
      synth.speak(utterance);
    });
  };

  // Leaving the intro starts the film's first exchange.
  const startDirecting = () => {
    // Read through the ref: the key handler holds an old copy of this function.
    if (!latest.current.intro) return;
    stopReading();
    setIntro(false);
    if (latest.current.live) speak(latest.current.scenario.initialDialogue);
  };

  useEffect(() => {
    if (!intro) return;
    const timer = setTimeout(startDirecting, INTRO_MS);
    return () => clearTimeout(timer);
    // startDirecting reads live state through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro]);

  useEffect(() => stopReading, []);

  const act = async (action: PlayerAction) => {
    if (!latest.current.canAct) return;
    setThinking(true);
    setDirectorError("");
    setCategory(null);
    turnToken.current += 1;
    setAwaiting(false);
    addLog("player", action.label);
    setNow((current) => ({ ...current, stage: "deciding" }));

    try {
      const response = await fetch("/api/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: latest.current.story,
          action,
          scenario: latest.current.scenario.id,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | (DirectorTurn & { error?: string })
        | null;
      if (!response.ok || !result?.scenePrompt) {
        throw new Error(result?.error || "The director did not respond");
      }
      // The scene may have ended while the director was thinking.
      if (!latest.current.live) return;

      const current = latest.current.session;
      holdPrompt.current = result.holdPrompt;
      current.sendSteer(result.transitionPrompt);
      setNow({
        stage: "changing",
        onScreen: result.onScreen,
        offScreen: result.offScreen,
        prompt: result.transitionPrompt,
      });
      clearTimeout(settleTimer.current);

      setStory((previous) => nextStory(previous, result, action.label));
      setActions(result.actions);
      addLog("story", result.narration);
      if (result.offScreen) addLog("system", `Off screen: ${result.offScreen}`);
      void speakWhenArrived(
        result.dialogue,
        result.waitFor,
        result.partnerLook,
      );
      // Pair turns hand back from the arrival check; other turns hand back
      // as soon as the change is seen on screen.
      if (!result.waitFor) {
        void handBackWhenSeen(turnToken.current, result.transitionPrompt);
      }
    } catch (caught) {
      setDirectorError(caught instanceof Error ? caught.message : String(caught));
      setNow((current) =>
        current.stage === "deciding" ? { ...current, stage: "settled" } : current,
      );
    } finally {
      setThinking(false);
    }
  };

  // Pull the film back to the lead by re-sending the settled scene prompt.
  const recenter = () => {
    if (!latest.current.canAct) return;
    clearTimeout(settleTimer.current);
    const prompt = holdPrompt.current;
    latest.current.session.sendSteer(prompt);
    setNow((current) => ({ ...current, stage: "settled", prompt }));
    addLog("system", `Camera recentered on ${latest.current.scenario.leadName}.`);
  };

  const submitDirection = (event: FormEvent) => {
    event.preventDefault();
    const text = direction.trim();
    if (!text || !canAct) return;
    setDirection("");
    if (raw) {
      clearTimeout(settleTimer.current);
      session.sendSteer(text);
      addLog("player", `Raw prompt: ${text}`);
      setNow((current) => ({ ...current, stage: "settled", prompt: text }));
      return;
    }
    void act({ category: "custom", label: text, detail: "" });
  };

  // Keyboard: 1–3 pick a category, then 1–2 pick an option. Esc backs out
  // and "/" jumps to the custom direction box.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement;
      if (typing) {
        if (event.key === "Escape") target.blur();
        return;
      }

      const state = latest.current;
      if (latest.current.intro) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startDirecting();
        }
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.key === "Escape") {
        setCategory(null);
      } else if (event.key.toLowerCase() === "r") {
        recenter();
      } else if (/^[1-9]$/.test(event.key) && state.canAct) {
        const index = Number(event.key) - 1;
        if (state.category) {
          const option = state.actions[state.category][index];
          if (option) void act({ category: state.category, ...option });
        } else if (ACTION_CATEGORIES[index]) {
          setCategory(ACTION_CATEGORIES[index].id);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // act reads everything through refs, so the handler never goes stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options = category ? actions[category] : [];
  const error = directorError || session.error;

  let viewportNote = "";
  if (starting) {
    viewportNote = session.connected
      ? "Loading the opening frame…"
      : "Connecting to Orbis…";
  } else if (!live) {
    viewportNote = "";
  }

  return (
    <div className="sd">
      <div className="sd-stage">
        <div className="sd-scenes" role="tablist" aria-label="Scene">
          <span>Scene</span>
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === scenario.id}
              className={item.id === scenario.id ? "active" : ""}
              disabled={starting}
              onClick={() => void chooseScenario(item.id)}
            >
              {item.name}
            </button>
          ))}
          {live && <small>Switching ends the current scene.</small>}
          {!live && carried && (
            <small>Continuing from your night market film.</small>
          )}
          {!live && !carried && scenario.continues && (
            <small>Follows the night market film.</small>
          )}
        </div>
        <div className="sd-viewport" ref={viewportRef}>
          {live ? (
            <ReactorView
              track="main_video"
              audioTrack="main_audio"
              muted={session.muted}
              videoObjectFit="cover"
            />
          ) : (
            <div
              className="sd-standby"
              style={{
                backgroundImage: `linear-gradient(#000000a6, #000000a6), url(${SCENE_IMAGES[scenario.id].src})`,
              }}
            >
              {starting ? (
                <span className="sd-standby-note">{viewportNote}</span>
              ) : (
                <button type="button" className="sd-begin" onClick={begin}>
                  Begin scene
                </button>
              )}
            </div>
          )}

          {intro && (
            <div className="sd-intro">
              <div className="sd-intro-body">
                <h2>{scenario.intro.title}</h2>
                <p className="sd-intro-premise">{scenario.intro.premise}</p>
                <ul className="sd-intro-cast">
                  {scenario.intro.cast.map((member) => (
                    <li key={member.name}>
                      <strong>{member.name}</strong>
                      {member.line}
                    </li>
                  ))}
                </ul>
                <h3>It could go several ways</h3>
                <ul className="sd-intro-next">
                  {scenario.intro.possibilities.map((possibility) => (
                    <li key={possibility}>{possibility}</li>
                  ))}
                </ul>
                <div className="sd-intro-actions">
                  <button type="button" onClick={readIntro}>
                    {reading ? "Stop reading" : "Read aloud"}
                  </button>
                  <button
                    type="button"
                    className="sd-intro-start"
                    disabled={!live}
                    onClick={startDirecting}
                  >
                    {live
                      ? "Start directing (Enter)"
                      : startNote || "Film loading…"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!intro && live && awaiting && (
            <p className="sd-awaiting">Waiting for both of them on screen…</p>
          )}

          {!intro && live && !awaiting && captions.length > 0 && (
            <div className="sd-caption">
              {captions.slice(0, captionsShown).map((entry, index) => (
                <p
                  key={`${index}-${entry.line}`}
                  className={index === captionsShown - 1 ? "latest" : ""}
                >
                  <strong>{entry.speaker}</strong>
                  {entry.line}
                </p>
              ))}
            </div>
          )}

          <div className="sd-strip sd-strip-top">
            <span>
              <em>Weather</em> {story.weather}
            </span>
            <span>
              <em>Security</em> {story.security}
            </span>
            <span className={`sd-threat sd-threat-${story.threatLevel}`}>
              <em>Threat</em>
              <span className="sd-threat-bars" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((level) => (
                  <i
                    key={level}
                    className={level <= story.threatLevel ? "on" : ""}
                  />
                ))}
              </span>
              {story.threatLevel}/5
            </span>
          </div>

          <div className="sd-strip sd-strip-bottom">
            <span>
              <em>Objective</em> {story.objective}
            </span>
            {live && (
              <span className={session.paused ? "sd-rec paused" : "sd-rec"}>
                {session.paused ? "Paused" : "● Live"}
              </span>
            )}
          </div>
        </div>

        <div className="sd-transport">
          <button type="button" onClick={session.toggleMuted}>
            {session.muted ? "Sound on" : "Mute"}
          </button>
          {live && (
            <button
              type="button"
              disabled={session.controlsBusy}
              onClick={session.paused ? session.resume : session.pause}
            >
              {session.paused ? "Resume" : "Pause"}
            </button>
          )}
          {live && (
            <button type="button" disabled={!canAct} onClick={recenter}>
              Find {scenario.leadName}
            </button>
          )}
          {session.connected && (
            <button
              type="button"
              disabled={session.controlsBusy || starting}
              onClick={session.disconnectSession}
            >
              End scene
            </button>
          )}
          <span className="sd-keys">
            Keys: 1–3 choose · Esc back · R find {scenario.leadName} · / custom
            direction
          </span>
        </div>

        <section className="sd-now">
          <h2>
            On screen now
            <span className={`sd-stage-chip sd-stage-${now.stage}`}>
              {STAGE_LABEL[now.stage]}
            </span>
          </h2>
          <p className="sd-now-purpose">
            <em>Story purpose</em>
            {story.storyPurpose}
          </p>
          <p className="sd-now-text">{now.onScreen}</p>
          <p className="sd-now-off">
            <em>What could happen next</em>
            {story.whatNext}
          </p>
          {now.offScreen && (
            <p className="sd-now-off">
              <em>Off screen</em>
              {now.offScreen} The camera stays with {scenario.leadName}, so you
              only see its
              effects from his street.
            </p>
          )}
          <details>
            <summary>Exact prompt Orbis is following</summary>
            <p>{now.prompt}</p>
          </details>
        </section>
      </div>

      <div className="sd-panel">
        <section>
          <h2>Actions</h2>
          <div className="sd-categories">
            {ACTION_CATEGORIES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                disabled={!canAct}
                className={category === item.id ? "active" : ""}
                onClick={() =>
                  setCategory((current) => (current === item.id ? null : item.id))
                }
              >
                {!category && <kbd>{index + 1}</kbd>}
                {item.name}
              </button>
            ))}
          </div>
          {category && (
            <div className="sd-options">
              {options.map((option, index) => (
                <button
                  key={option.label}
                  type="button"
                  disabled={!canAct}
                  onClick={() => void act({ category, ...option })}
                >
                  <kbd>{index + 1}</kbd>
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.detail}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
          <p className="sd-hint">
            {thinking
              ? "The director is working out what happens next…"
              : !live
                ? "Begin the scene to take control."
                : session.paused
                  ? "Resume the scene to act."
                  : category
                    ? "Choose what to do."
                    : "Choose how to shape the scene."}
          </p>
        </section>

        <form className="sd-direction" onSubmit={submitDirection}>
          <input
            ref={inputRef}
            type="text"
            value={direction}
            maxLength={300}
            disabled={!live}
            placeholder={
              raw
                ? "Raw Orbis prompt (sent as typed, no director)"
                : "Custom direction, e.g. a black aircraft descends over the market"
            }
            onChange={(event) => setDirection(event.target.value)}
          />
          <button type="submit" disabled={!canAct || !direction.trim()}>
            Direct
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <section>
          <h2>Cast</h2>
          <ul className="sd-cast">
            {story.characters.map((character) => (
              <li key={character.name} title={character.motivation}>
                <span>
                  <strong>{character.name}</strong>
                  <small>{character.role}</small>
                </span>
                <span className="sd-trust">
                  <i style={{ width: `${character.trust}%` }} />
                </span>
                <small>Trust {character.trust}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className="sd-log-section">
          <h2>Event log</h2>
          <ol className="sd-log">
            {log.length === 0 && <li className="sd-log-system">No events yet.</li>}
            {log.map((entry) => (
              <li key={entry.id} className={`sd-log-${entry.kind}`}>
                {entry.kind === "player" ? `▸ ${entry.text}` : entry.text}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
