"use client";

import {
  ReactorProvider,
  ReactorView,
  useReactor,
  useReactorInternalMessage,
  useReactorMessage,
} from "@reactor-team/js-sdk";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { useOrbisSession } from "@/hooks/use-orbis-session";
import {
  type LiveCaption,
  type Recorder,
  playBlob,
  prefetchVoices,
  speakWithBrowser,
  startLiveCaption,
  startRecording,
} from "@/lib/drama/audio";
import {
  AUDIO_PROMPTS,
  CAST,
  gestureBeat,
  OPENING_PROMPTS,
  reactionPrompt,
  type SceneId,
} from "@/lib/drama/cast";
import type {
  DirectorBeat,
  DirectorRequest,
  DramaLine,
  Ending,
  TranscriptEntry,
} from "@/lib/drama/director";
import {
  type Gesture,
  type GestureTracker,
  type TrackerStatus,
  startGestureTracker,
} from "@/lib/drama/gestures";
import { FIRST_SCENE, SCENES } from "@/lib/drama/script";
import {
  ORBIS_MODEL_NAME,
  ORBIS_TRACKS,
  requestReactorJwt,
  unwrapOrbisMessage,
} from "@/lib/orbis";

type Phase = "title" | "connecting" | "playing" | "interlude" | "ended";

const SILENCE_NUDGE_MS = 15_000;
const MAX_NUDGES = 2;
const FIRST_FRAME_MS = 3_500;
const INTERLUDE_MIN_MS = 4_000;
const MIN_TURNS_PER_SCENE = 2;
const GESTURE_SHOT_HOLD_MS = 4_000;
const END_SCREEN_IDLE_MS = 60_000;
const ORBIS_USD_PER_SECOND = 0.0097; // visko-orbis-stable, api.reactor.inc/pricing

// The light director model sometimes writes stage directions as dialogue
// ("Lysa looks up at you..."). Those are dropped; the video prompt already
// shows the action. Narration looks like a name followed straight by a
// third-person verb ("Lysa looks", "Captain Brannoc raises"), or a line that
// opens on "The ..." without anyone speaking in first or second person.
const SPEAKING = /\b(i|i'm|i'll|me|my|mine|we|us|our|you|your|yours)\b|[我你您]/i;
const NAME_WORDS = [
  ...new Set(
    Object.values(CAST).flatMap((member) => member.name.split(" ")).concat(["King", "Queen"]),
  ),
].join("|");
const NAME_THEN_VERB = new RegExp(`^(?:(?:${NAME_WORDS})\\s+)+[a-z]+s\\b`);
function isStageDirection(text: string) {
  const line = text.trim();
  // Questions and exclamations are speech, never stage directions.
  if (NAME_THEN_VERB.test(line) && !/[?!]/.test(line)) return true;
  return /^The\s/.test(line) && !SPEAKING.test(line);
}

// Lines offered to the player (the hint buttons) belong to the player. The
// director sometimes gives one of them to another character, stealing the
// player's move, so a character line that closely matches a hint is dropped.
const words = (text: string) =>
  new Set(text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean));
function echoesPlayerLine(text: string, playerLines: string[]) {
  const line = words(text);
  return playerLines.some((candidate) => {
    const other = words(candidate);
    if (!other.size || !line.size) return false;
    let shared = 0;
    other.forEach((word) => line.has(word) && (shared += 1));
    // The character's line has to BE the player's line, mostly word for word;
    // obeying an order ("At once! Drag her out!") shares words but is fine.
    return shared / line.size >= 0.75 && shared >= 4;
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A scene without a rendered opening frame starts from its text prompt alone.
async function loadSceneImage(scene: SceneId) {
  const response = await fetch(`/scenes/${scene}.jpg`);
  if (!response.ok) return null;
  const blob = await response.blob();
  return new File([blob], `${scene}.jpg`, { type: blob.type || "image/jpeg" });
}

export function CrownGame() {
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
    <ReactorProvider
      apiUrl="https://api.reactor.inc"
      modelName={ORBIS_MODEL_NAME}
      modelTracks={[...ORBIS_TRACKS]}
      connectOptions={{ autoConnect: false }}
      jwtToken={getJwt}
    >
      <Stage clearJwt={clearJwt} getCurrentJwt={getCurrentJwt} />
    </ReactorProvider>
  );
}

function Stage({
  clearJwt,
  getCurrentJwt,
}: {
  clearJwt: () => void;
  getCurrentJwt: () => string | null;
}) {
  const session = useOrbisSession(clearJwt, getCurrentJwt);
  const liveSendCommand = useReactor((state) => state.sendCommand);
  // ?dry=1 rehearses the whole story on the still frames with no Orbis
  // session, so writing and voices can be tested without spending credit.
  const [dry, setDry] = useState(false);
  useEffect(() => {
    setDry(new URLSearchParams(window.location.search).has("dry"));
  }, []);
  const sendCommand: typeof liveSendCommand = (command, payload) =>
    dry
      ? (Promise.resolve(undefined) as ReturnType<typeof liveSendCommand>)
      : liveSendCommand(command, payload);

  const [phase, setPhaseState] = useState<Phase>("title");
  const [scene, setScene] = useState<SceneId>(FIRST_SCENE);
  const [subtitle, setSubtitle] = useState<{ who: string; text: string } | null>(null);
  const [playerLine, setPlayerLine] = useState("");
  const [hints, setHints] = useState<string[]>(SCENES[FIRST_SCENE].hints);
  // The hints the player could see when they spoke, plus what they said.
  const offeredHints = useRef<string[]>(SCENES[FIRST_SCENE].hints);
  const [queenPower, setQueenPower] = useState(35);
  const [thinking, setThinking] = useState(false);
  const [voicing, setVoicing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [notice, setNotice] = useState("");
  const [typed, setTyped] = useState("");
  const [geminiToday, setGeminiToday] = useState<{ usd: number; calls: number; failed: number; budget: number } | null>(null);
  const [orbisSeconds, setOrbisSeconds] = useState(0);
  const [gesturesOn, setGesturesOn] = useState(false);
  const [tracker, setTrackerStatus] = useState<TrackerStatus>({ hands: 0, open: false, swing: 0 });
  const [gestureFlash, setGestureFlash] = useState("");

  const phaseRef = useRef<Phase>("title");
  const sceneRef = useRef<SceneId>(FIRST_SCENE);
  // This scene's lines; earlier scenes are folded into a short summary.
  const transcript = useRef<TranscriptEntry[]>([]);
  const earlierScenes = useRef("");
  const revealed = useRef<string[]>([]);
  const queenPowerRef = useRef(35);
  const turn = useRef(0);
  const sceneStartedAt = useRef(0);
  const lastPrompt = useRef("");
  const beatId = useRef(0);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const stopBrowserVoice = useRef<(() => void) | null>(null);
  const recorder = useRef<Recorder | null>(null);
  const caption = useRef<LiveCaption | null>(null);
  // getUserMedia takes a moment; a release that arrives before the mic is up
  // used to be lost, leaving the recorder running and every later press
  // ignored. Track the start and honor a stop that came in during it.
  const micStarting = useRef(false);
  // A gesture's shot needs ~2 chunks to play out; until then the director's
  // next shot waits, or Orbis morphs away mid-slap and the hit looks soft.
  const gestureShotUntil = useRef(0);
  const stopAfterStart = useRef(false);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudges = useRef(0);
  const thinkingRef = useRef(false);
  // Set while a scene-ending beat plays, so talking over it can't strand the scene.
  const locked = useRef(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<GestureTracker | null>(null);

  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };
  const inPlay = () => phaseRef.current === "playing";
  const playerName = () => SCENES[sceneRef.current].role.title;

  // ---- voices --------------------------------------------------------------

  const interrupt = () => {
    beatId.current += 1;
    currentAudio.current?.pause();
    currentAudio.current = null;
    stopBrowserVoice.current?.();
    stopBrowserVoice.current = null;
  };

  const playLines = async (lines: DramaLine[]) => {
    const id = ++beatId.current;
    const voices = prefetchVoices(
      lines.map((line) => ({
        text: line.text,
        speaker: line.speaker,
        delivery: line.delivery,
      })),
    );
    for (const [index, line] of lines.entries()) {
      if (beatId.current !== id) return false;
      const name = CAST[line.speaker]?.name ?? line.speaker;
      setVoicing(true);
      const blob = await voices[index];
      setVoicing(false);
      if (beatId.current !== id) return false;
      setSubtitle({ who: line.speaker === "narrator" ? "" : name, text: line.text });
      transcript.current.push({ who: name, text: line.text });
      if (blob) {
        await playBlob(blob, (audio) => (currentAudio.current = audio));
      } else {
        await speakWithBrowser(line.text, line.speaker, (stop) => (stopBrowserVoice.current = stop));
        stopBrowserVoice.current = null;
      }
      await sleep(250);
    }
    if (beatId.current === id) setSubtitle(null);
    return beatId.current === id;
  };

  // ---- silence nudges ------------------------------------------------------

  const clearSilence = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = null;
  };

  const armSilence = () => {
    clearSilence();
    silenceTimer.current = setTimeout(() => {
      if (!inPlay() || thinkingRef.current || recorder.current) return;
      if (nudges.current >= MAX_NUDGES) return;
      nudges.current += 1;
      void sendTurn({ silence: true });
    }, SILENCE_NUDGE_MS);
  };

  // ---- scenes --------------------------------------------------------------

  const startScene = async (next: SceneId, holdCard: Promise<unknown> = Promise.resolve()) => {
    const config = SCENES[next];
    sceneRef.current = next;
    setScene(next);
    turn.current = 0;
    nudges.current = 0;
    transcript.current = [];
    if (next !== FIRST_SCENE) await sendCommand("reset", {});
    await sendCommand("set_audio_prompt", { prompt: AUDIO_PROMPTS[next] });
    const image = await loadSceneImage(next);
    lastPrompt.current = OPENING_PROMPTS[next];
    if (!dry) {
      // A start can fail if a command reply gets lost mid-switch (seen once as
      // "Orbis did not accept the prompt"). Reset and retry, and as a last
      // resort start from the text prompt alone, so a scene never sits on the
      // still image while the session bills.
      let started = await session.startScene(image, OPENING_PROMPTS[next]);
      for (const retryImage of [image, null]) {
        if (started) break;
        console.warn(`Orbis start failed for ${next}; retrying${retryImage ? "" : " without image"}`);
        await sleep(1_000);
        await sendCommand("reset", {});
        started = await session.startScene(retryImage, OPENING_PROMPTS[next]);
      }
      if (started) setNotice("");
      else setNotice("The live video couldn't start this scene. Press End and Begin again.");
      await sleep(FIRST_FRAME_MS);
    }
    await holdCard;
    sceneStartedAt.current = performance.now();
    setHints(config.hints);
    offeredHints.current = config.hints;
    setPhase("playing");
    await playLines(config.opening);
    armSilence();
  };

  const goToScene = async (next: SceneId) => {
    clearSilence();
    const summary = transcript.current
      .slice(-10)
      .map((entry) => `${entry.who}: ${entry.text}`)
      .join(" / ");
    earlierScenes.current += `\n[${sceneRef.current}] ${summary}`;
    setPhase("interlude");
    setScene(next);
    setSubtitle(null);
    setPlayerLine("");
    await startScene(next, sleep(INTERLUDE_MIN_MS));
  };

  const finish = async (result: Ending) => {
    clearSilence();
    setPhase("ended");
    setEnding(result);
    await playLines([{ speaker: "narrator", text: result.cliffhanger, delivery: "low, ominous" }]);
    setSubtitle(null);
    // Stop paying for frames nobody is watching.
    await sendCommand("pause", {}).catch(() => undefined);
    if (!dry) {
      idleTimer.current = setTimeout(
        () => void session.disconnectSession(),
        END_SCREEN_IDLE_MS,
      );
    }
  };

  // ---- the director loop ---------------------------------------------------

  const handleBeat = async (beat: DirectorBeat) => {
    const currentScene = sceneRef.current;
    const config = SCENES[currentScene];
    if (beat.heard?.trim()) {
      transcript.current.push({ who: playerName(), text: beat.heard.trim() });
      // Gesture actions arrive as "(The queen slaps Lysa...)"; show them
      // without the brackets.
      setPlayerLine(beat.heard.trim().replace(/^\((.*)\)$/, "$1"));
    }
    if (beat.orbisPrompt) {
      const prompt = beat.orbisPrompt;
      const send = () => {
        lastPrompt.current = prompt;
        void sendCommand("set_prompt", { prompt, passthrough: true });
      };
      const wait = gestureShotUntil.current - performance.now();
      if (wait > 0) setTimeout(send, wait);
      else send();
    }
    // Lines the player saw as hints when they spoke, plus what they said.
    // Only the offered hints: matching the player's own line also dropped
    // characters obeying it ("Read your ledger" → Corvin reading it).
    const reserved = [...offeredHints.current];
    if (beat.hints?.length) {
      // New hints never repeat a line a character says in this same beat.
      const spoken = (beat.lines ?? []).map((line) => line.text);
      const next = beat.hints
        .map((hint) => hint.replace(/<[^>]*>/g, "").replace(/[*_#`]/g, "").trim())
        .filter((hint) => hint && !echoesPlayerLine(hint, spoken))
        .slice(0, 3);
      if (next.length) {
        setHints(next);
        offeredHints.current = next;
      }
    }
    if (currentScene === "chamber" && Number.isFinite(beat.queenPower)) {
      queenPowerRef.current = Math.max(0, Math.min(100, beat.queenPower));
      setQueenPower(queenPowerRef.current);
    }
    if (beat.revealed?.length) revealed.current = beat.revealed;

    const outOfTurns = turn.current >= config.maxTurns;
    // The player gets at least two lines per scene, even if the director
    // tries to wrap up on the first.
    const directorEnds = beat.endScene && turn.current >= MIN_TURNS_PER_SCENE;
    const nextScene = config.next && (directorEnds || outOfTurns) ? config.next : null;
    const endsStory = !config.next && (Boolean(beat.ending) || outOfTurns);
    locked.current = Boolean(nextScene) || endsStory;
    // The player voices their own character; never put words in their mouth.
    const lines = (beat.lines ?? []).filter(
      (line) =>
        line.speaker !== config.player &&
        !isStageDirection(line.text) &&
        !echoesPlayerLine(line.text, reserved),
    );
    // The closing hook belongs to the scene's last beat. If the director
    // spends it early, hold it back so it doesn't play twice.
    if (!nextScene && config.closingMatch) {
      const early = lines.filter((line) => config.closingMatch?.test(line.text));
      if (early.length && early.length < lines.length) {
        lines.splice(0, lines.length, ...lines.filter((line) => !early.includes(line)));
      }
    }
    // Guarantee the clues and the hook that set up the next scene. The clues
    // go before the hook, so the scene always ends on the hook.
    if (nextScene) {
      let hookAt = lines.findIndex((line) => config.closingMatch?.test(line.text));
      if (hookAt === -1 && config.closing) {
        lines.push(config.closing);
        hookAt = lines.length - 1;
      }
      if (config.clues && !lines.some((line) => config.clueMatch?.test(line.text))) {
        lines.splice(hookAt === -1 ? lines.length : hookAt, 0, ...config.clues);
      }
    }
    const finished = await playLines(lines);
    locked.current = false;
    if ((!finished && !nextScene && !endsStory) || sceneRef.current !== currentScene) return;
    setPlayerLine("");

    if (nextScene) {
      await goToScene(nextScene);
    } else if (endsStory && beat.ending) {
      await finish(beat.ending);
    } else if (endsStory) {
      await finish({
        type: queenPowerRef.current >= 50 ? "divorce" : "fall",
        title: queenPowerRef.current >= 50 ? "The Crown, Returned" : "A New Queen",
        cliffhanger:
          queenPowerRef.current >= 50
            ? "In the courtyard, an envoy from the emperor across the sea is waiting for her."
            : "On the floor, the physician's sealed ledger has fallen open.",
      });
    } else {
      armSilence();
    }
  };

  const sendTurn = async (input: {
    audio?: Blob;
    text?: string;
    silence?: boolean;
    /** Set when a gesture already sent its own shot. */
    skipReaction?: boolean;
  }) => {
    if (thinkingRef.current || locked.current || !inPlay()) return;
    thinkingRef.current = true;
    setThinking(true);
    setNotice("");
    clearSilence();
    if (!input.silence) {
      turn.current += 1;
      nudges.current = 0;
    }
    if (input.text) setPlayerLine(input.text);
    if (!input.silence && !input.skipReaction) {
      // Instant reaction shot: the room freezes and turns to the player while
      // the director writes the real beat. Every prompt we send is fully
      // written, so it goes with passthrough: Orbis otherwise rewrites each
      // one server-side, and by Act 3 that queue backed up enough to time out
      // the scene's start commands.
      const physicianPresent = transcript.current.some((entry) => entry.who === CAST.physician.name);
      // The guard's whisper at the top of the chamber comes from outside the
      // door; guards are only in the room once the queen has called them.
      const guardsPresent = transcript.current.some(
        (entry) => entry.who === SCENES.chamber.role.title && /guard|seize|drag|侍卫|卫兵/i.test(entry.text),
      );
      void sendCommand("set_prompt", {
        prompt: reactionPrompt(sceneRef.current, { physician: physicianPresent, guards: guardsPresent }),
        passthrough: true,
      });
    }

    const state: DirectorRequest = {
      scene: sceneRef.current,
      turn: turn.current,
      elapsedSeconds: (performance.now() - sceneStartedAt.current) / 1000,
      queenPower: queenPowerRef.current,
      revealed: revealed.current,
      earlierScenes: earlierScenes.current || undefined,
      transcript: transcript.current,
      playerText: input.text,
      silence: input.silence,
    };
    const form = new FormData();
    form.set("state", JSON.stringify(state));
    if (input.audio) form.set("audio", input.audio, "line.wav");

    let beat: DirectorBeat | null = null;
    try {
      const response = await fetch("/api/director", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The director missed that.");
      beat = result as DirectorBeat;
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : String(caught));
      armSilence();
    } finally {
      thinkingRef.current = false;
      setThinking(false);
    }
    if (beat) await handleBeat(beat);
  };

  const flashNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice((current) => (current === text ? "" : current)), 2_500);
  };

  // ---- webcam gestures -----------------------------------------------------

  const onGesture = (gesture: Gesture) => {
    const name = gesture === "crown" ? "Crown" : gesture === "slap" ? "Slap" : "Point";
    // Say why a seen gesture didn't play, instead of ignoring it.
    if (!inPlay()) return;
    if (thinkingRef.current || locked.current) {
      flashNotice(`${name} seen. Wait a moment, the court is still answering.`);
      return;
    }
    if (recorder.current) {
      flashNotice(`${name} seen. Finish speaking first.`);
      return;
    }
    const beat = gestureBeat(sceneRef.current, gesture);
    if (!beat) {
      if (gesture === "crown") flashNotice("The crown only comes off in the bedchamber.");
      return;
    }
    clearSilence();
    interrupt();
    setSubtitle(null);
    // The shot goes out first, so the video answers within one chunk, and it
    // is held for two chunks before the director's next shot replaces it.
    gestureShotUntil.current = performance.now() + GESTURE_SHOT_HOLD_MS;
    lastPrompt.current = beat.prompt;
    void sendCommand("set_prompt", { prompt: beat.prompt, passthrough: true });
    setGestureFlash(beat.label);
    setTimeout(() => setGestureFlash(""), 2_500);
    void sendTurn({ text: beat.action, skipReaction: true });
  };
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  useEffect(() => {
    if (!gesturesOn || !cameraRef.current) return;
    let cancelled = false;
    startGestureTracker(
      cameraRef.current,
      (gesture) => onGestureRef.current(gesture),
      (status) => setTrackerStatus(status),
    )
      .then((started) => {
        if (cancelled) started.stop();
        else trackerRef.current = started;
      })
      .catch(() => {
        setNotice("Camera blocked or unavailable. Gestures need Chrome with camera access.");
        setGesturesOn(false);
      });
    return () => {
      cancelled = true;
      trackerRef.current?.stop();
      trackerRef.current = null;
      setTrackerStatus({ hands: 0, open: false, swing: 0 });
    };
  }, [gesturesOn]);

  // Dev aid: trigger a gesture without a camera, e.g. __crownGesture("slap").
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    (window as unknown as { __crownGesture?: (g: Gesture) => void }).__crownGesture = (g) =>
      onGestureRef.current(g);
  }, []);

  // ---- push to talk --------------------------------------------------------

  const beginTalking = async () => {
    if (recorder.current || micStarting.current) return;
    // Say why the mic isn't listening instead of ignoring the player.
    if (!inPlay()) {
      if (phaseRef.current === "interlude" || phaseRef.current === "connecting") {
        flashNotice("The next scene is still starting. Talk once it's on screen.");
      }
      return;
    }
    if (thinkingRef.current || locked.current) {
      flashNotice("Hold on, the court is still answering.");
      return;
    }
    clearSilence();
    interrupt();
    setSubtitle(null);
    micStarting.current = true;
    stopAfterStart.current = false;
    try {
      recorder.current = await startRecording();
      micStarting.current = false;
      setRecording(true);
      setPlayerLine("");
      // Chinese if the player has been speaking Chinese, otherwise English.
      const lastPlayerLine = [...transcript.current]
        .reverse()
        .find((entry) => entry.who === playerName())?.text;
      caption.current = startLiveCaption(
        (text) => setPlayerLine(text),
        lastPlayerLine && /[\u4e00-\u9fff]/.test(lastPlayerLine) ? "zh-CN" : "en-US",
      );
      if (stopAfterStart.current) {
        // Released already: give it a beat so there's something to hear.
        setTimeout(() => void endTalking(), 1_200);
      }
    } catch {
      micStarting.current = false;
      setNotice("Microphone blocked. Allow mic access in Chrome, or type your line below.");
    }
  };

  const endTalking = async () => {
    if (micStarting.current) {
      stopAfterStart.current = true;
      return;
    }
    const active = recorder.current;
    if (!active) return;
    recorder.current = null;
    setRecording(false);
    const liveCaption = caption.current;
    caption.current = null;
    const [clip, said] = await Promise.all([active.stop(), liveCaption?.stop() ?? Promise.resolve("")]);
    // Text is faster for the director than audio; fall back to the clip when
    // the browser couldn't caption it.
    if (said.trim().length >= 4) await sendTurn({ text: said.trim() });
    else if (clip) await sendTurn({ audio: clip });
    else {
      flashNotice("Didn't catch that. Speak a little longer, then send.");
      armSilence();
    }
  };

  useEffect(() => {
    const typing = (event: KeyboardEvent) =>
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement;
    const down = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || typing(event)) return;
      event.preventDefault();
      void beginTalking();
    };
    const up = (event: KeyboardEvent) => {
      if (event.code !== "Space" || typing(event)) return;
      event.preventDefault();
      void endTalking();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  const submitTyped = (event: FormEvent) => {
    event.preventDefault();
    const text = typed.trim();
    if (!text) return;
    if (locked.current) return;
    setTyped("");
    interrupt();
    void sendTurn({ text });
  };

  // ---- Orbis lifecycle -----------------------------------------------------

  const begin = async () => {
    setNotice("");
    transcript.current = [];
    earlierScenes.current = "";
    revealed.current = [];
    queenPowerRef.current = 35;
    setQueenPower(35);
    setEnding(null);
    setPhase("connecting");
    if (dry) {
      await startScene(FIRST_SCENE);
      return;
    }
    if (!session.connected) {
      const ok = await session.connectSession();
      if (!ok) setPhase("title");
    }
  };

  useEffect(() => {
    if (phase === "connecting" && session.connected) void startScene(FIRST_SCENE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session.connected]);

  // A failed start that the retry then recovers is not worth alarming the
  // player about; startScene clears the notice itself once a retry works.
  useEffect(() => {
    if (session.error && !/did not accept|Timed out waiting for Orbis/.test(session.error)) {
      setNotice(session.error);
    }
  }, [session.error]);

  // If the run ends on its own mid-scene, pick it back up from the last prompt.
  useReactorMessage((raw) => {
    const message = unwrapOrbisMessage(raw);
    if (message.type === "generation_complete" && inPlay() && lastPrompt.current) {
      void sendCommand("set_prompt", { prompt: lastPrompt.current, passthrough: true }).then(() =>
        sendCommand("start", {}),
      );
    }
  });

  useReactorInternalMessage((message) => {
    const kind = (message as { type?: string })?.type ?? "";
    if (kind.toLowerCase().includes("moderation")) {
      console.warn("Reactor moderation event", message);
      setNotice("The video model softened that shot.");
    }
  });

  // Spend meter: Gemini from the server ledger, Orbis from connected time.
  useEffect(() => {
    const load = () =>
      fetch("/api/usage")
        .then((response) => response.json())
        .then((usage) =>
          setGeminiToday({
            usd: usage.today.usd,
            calls: usage.today.calls,
            failed: usage.today.failed,
            budget: usage.dailyBudgetUsd,
          }),
        )
        .catch(() => undefined);
    void load();
    const timer = setInterval(load, 10_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session.connected) return;
    const timer = setInterval(() => setOrbisSeconds((seconds) => seconds + 1), 1_000);
    return () => clearInterval(timer);
  }, [session.connected]);

  // Keep the model's ambience under the voices.
  useEffect(() => {
    if (!session.runStarted) return;
    const timer = setInterval(() => {
      const video = screenRef.current?.querySelector("video");
      if (video) video.volume = 0.35;
      screenRef.current?.querySelectorAll("audio").forEach((audio) => {
        audio.volume = 0.35;
      });
    }, 1_000);
    return () => clearInterval(timer);
  }, [session.runStarted]);

  useEffect(
    () => () => {
      clearSilence();
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    [],
  );

  const playAgain = async () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setEnding(null);
    transcript.current = [];
    earlierScenes.current = "";
    revealed.current = [];
    queenPowerRef.current = 35;
    setQueenPower(35);
    setPlayerLine("");
    if (session.connected || dry) {
      setPhase("connecting");
      await sendCommand("reset", {});
      await startScene(FIRST_SCENE);
    } else {
      await begin();
    }
  };

  const leave = async () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    interrupt();
    clearSilence();
    await session.disconnectSession();
    setEnding(null);
    setPhase("title");
  };

  // ---- render --------------------------------------------------------------

  const playing = phase === "playing";
  const config = SCENES[scene];
  const role = config.role;

  return (
    <div className="crown">
      <div className="screen" ref={screenRef}>
        <img
          key={scene}
          className="still"
          src={`/scenes/${scene}.jpg`}
          alt=""
          onError={(event) => (event.currentTarget.style.display = "none")}
        />
        {session.runStarted && phase !== "title" ? (
          <div className="live">
            <ReactorView
              track="main_video"
              audioTrack="main_audio"
              muted={false}
              videoObjectFit="cover"
            />
          </div>
        ) : null}
        <div className="vignette" />

        {playing ? (
          <div className="role">
            <span>{role.tag}</span>
            <strong>{role.title}</strong>
          </div>
        ) : null}

        {scene === "chamber" && (phase === "playing" || phase === "ended") ? (
          <div className="power" title="Your hold on the crown">
            <span>Crown</span>
            <div className="power-track">
              <div className="power-fill" style={{ width: `${queenPower}%` }} />
            </div>
          </div>
        ) : null}

        {playerLine && playing ? (
          <div className="player-line">
            <span>{role.title}</span>“{playerLine}”
          </div>
        ) : null}

        {subtitle ? (
          <div className={`subtitle ${subtitle.who ? "" : "narration"}`}>
            {subtitle.who ? <span>{subtitle.who}</span> : null}
            {subtitle.text}
          </div>
        ) : null}

        {gestureFlash ? <div className="gesture-flash">{gestureFlash}</div> : null}
        <video
          ref={cameraRef}
          className={`camera ${gesturesOn ? "on" : ""}`}
          muted
          playsInline
        />
        {gesturesOn ? (
          <div className="camera-status">
            <div>
              {tracker.hands
                ? `${tracker.open ? "✋ open" : "✊ closed"} · ${tracker.hands} hand${tracker.hands > 1 ? "s" : ""}`
                : "show your hands"}
            </div>
            {/* Swing meter: fills as a sideways swing nears slap distance. */}
            <div className="swing-track" title="Swing across the frame to slap">
              <div
                className={`swing-fill ${tracker.swing >= 1 ? "full" : ""}`}
                style={{ width: `${Math.min(100, tracker.swing * 100)}%` }}
              />
            </div>
          </div>
        ) : null}
        {thinking || voicing ? <div className="thinking">the court reacts…</div> : null}
        {recording ? <div className="listening">● listening. Click the mic again (or let go of Space) to send</div> : null}

        {phase === "title" ? (
          <div className="card title-card">
            <p className="eyebrow">A live drama you play with your voice</p>
            <h1>Crown &amp; Concubine</h1>
            <p>
              You are the King. Five years married, no heir, and a queen who
              blames you for it. Tomorrow you ride out to hunt, and you find a
              beautiful captive being whipped in the mud. Then live with what
              you did, as the Queen.
            </p>
            <button className="primary" onClick={() => void begin()}>
              Begin
            </button>
            {dry ? <p className="small">Rehearsal mode: no live video, no credit used.</p> : null}
            <p className="small">
              Click the mic, say anything, click again to send. Or hold <kbd>Space</kbd>.
            </p>
          </div>
        ) : null}

        {phase === "connecting" ? (
          <div className="card">
            <p className="eyebrow">Summoning the court</p>
            <p>Waking the live video model. The first start can take a minute.</p>
            <div className="spinner" />
          </div>
        ) : null}

        {phase === "interlude" && config.card ? (
          <div className="card interlude">
            <p className="eyebrow">{config.card.eyebrow}</p>
            <h2>{config.card.title}</h2>
            <p>{config.card.body}</p>
          </div>
        ) : null}

        {phase === "ended" && ending ? (
          <div className={`card ending ending-${ending.type}`}>
            <p className="eyebrow">Episode 1 · {ending.type}</p>
            <h2>{ending.title}</h2>
            <p>{ending.cliffhanger}</p>
            <div className="paywall">
              <span>🔒 Episode 2</span>
              <button className="primary" onClick={() => void playAgain()}>
                Play again
              </button>
              <button onClick={() => void leave()}>End session</button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="deck">
        <button
          className={`mic ${recording ? "on" : ""}`}
          disabled={!playing || thinking}
          onClick={() => void (recording ? endTalking() : beginTalking())}
          aria-label={recording ? "Send your line" : "Start speaking"}
          title="Click to speak, click again to send (or hold Space)"
        >
          {recording ? "●" : "🎙"}
        </button>
        <div className="deck-main">
          <div className="hints">
            {playing
              ? hints.map((hint) => (
                  <button
                    key={hint}
                    disabled={thinking}
                    onClick={() => {
                      if (locked.current) return;
                      interrupt();
                      void sendTurn({ text: hint });
                    }}
                  >
                    {hint}
                  </button>
                ))
              : null}
          </div>
          <form onSubmit={submitTyped}>
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={playing ? `Speak or type as ${role.title}…` : ""}
              disabled={!playing || thinking}
            />
          </form>
        </div>
        <button
          className={`quiet ${gesturesOn ? "gestures-on" : ""}`}
          onClick={() => setGesturesOn((on) => !on)}
          title="Swing an open hand to slap · point and hold to seize · both hands up then down to take off the crown"
        >
          {gesturesOn ? "📷 Gestures on" : "📷 Gestures"}
        </button>
        {session.connected ? (
          <button className="quiet" onClick={() => void leave()}>
            End
          </button>
        ) : null}
      </div>
      {notice ? <p className="notice">{notice}</p> : null}
      <p className="spend">
        Orbis this visit ≈ ${(orbisSeconds * ORBIS_USD_PER_SECOND).toFixed(2)}
        {session.connected ? " (live, billing)" : ""}
        {geminiToday
          ? ` · Gemini today ≈ $${geminiToday.usd.toFixed(3)} at paid rates, ${geminiToday.calls} calls, ${geminiToday.failed} rate-limited · cap $${geminiToday.budget}/day`
          : ""}
      </p>
    </div>
  );
}
