"use client";

// Starship Window: sit in a cockpit, pick a destination on the console, warp,
// and arrive at a live Orbis world outside the glass.
//
// Around every world:
//   - the DIRECTOR (Gemini) invents three onward destinations and sometimes an
//     unexpected event that hits a little after arrival;
//   - VESTA (Gemini Live, voice-out) reacts to every click, jump, arrival and
//     event, with her words as subtitles across the windshield;
//   - the cockpit plays its own engine hum, teleport and alert sounds, while
//     Orbis supplies the world's sound.
//
// Layers, back to front (inside one 16:9 stage that covers the screen):
//   1. Orbis video   2. warp canvas   3. glass   4. cockpit PNG   5. console UI

import {
  ReactorProvider,
  ReactorView,
  useReactorMessage,
} from "@reactor-team/js-sdk";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { type Pulse, WarpCanvas } from "@/components/warp-canvas";
import { useOrbisSession } from "@/hooks/use-orbis-session";
import { useReactorJwt } from "@/hooks/use-reactor-jwt";
import { CockpitAudio } from "@/lib/cockpit-audio";
import { Copilot } from "@/lib/copilot";
import {
  ORBIS_MODEL_NAME,
  ORBIS_TRACKS,
  SESSION_LIMIT_SECONDS,
  unwrapOrbisMessage,
} from "@/lib/orbis";
import {
  DESTINATIONS,
  type Destination,
  JUMP_PROMPT,
  ORIGIN,
  plottedCourse,
  promptFor,
  scenePrompt,
} from "@/lib/starship";

type Phase = "docked" | "launching" | "flying" | "jumping";

type WorldEvent = { title: string; view: string; log: string };

type DirectorPlan = {
  options?: { name: string; era: string; teaser: string; view: string; log: string }[];
  event?: WorldEvent | null;
  error?: string;
};

const SHAKE_MS = 1_500;
/** An event is sent to Orbis this long after arrival (plus up to 6 s jitter). */
const EVENT_DELAY_MS = 12_000;
/** The scene driver writes Orbis a fresh beat this often. */
const SCENE_BEAT_MS = 6_500;
/** Orbis shows a prompt 6–10 s after it's sent; give up looking after this. */
const SEE_TIMEOUT_MS = 15_000;
/** VESTA's video feed: one frame this often. */
const VESTA_FRAME_MS = 1_000;

/** Who is steering Orbis right now. The scene driver only acts when "free". */
type SceneLock = "free" | "launch" | "jump" | "event";

/** A JPEG (base64, no data: prefix) of the live Orbis video, or null. */
function captureFrame(width = 512): string | null {
  const video = document.querySelector<HTMLVideoElement>(".sw-world video");
  if (!video || video.readyState < 2 || !video.videoWidth) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round((width * video.videoHeight) / video.videoWidth);
  canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7).split(",")[1] ?? null;
}

async function askScene<T>(body: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await fetch("/api/scene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export function StarshipWindow() {
  const { getJwt, getCurrentJwt, clearJwt } = useReactorJwt();
  return (
    <ReactorProvider
      apiUrl="https://api.reactor.inc"
      modelName={ORBIS_MODEL_NAME}
      modelTracks={[...ORBIS_TRACKS]}
      connectOptions={{ autoConnect: false }}
      jwtToken={getJwt}
    >
      <Cockpit clearJwt={clearJwt} getCurrentJwt={getCurrentJwt} />
    </ReactorProvider>
  );
}

function Cockpit({
  clearJwt,
  getCurrentJwt,
}: {
  clearJwt: () => void;
  getCurrentJwt: () => string | null;
}) {
  const session = useOrbisSession(clearJwt, getCurrentJwt);

  const [phase, setPhase] = useState<Phase>("docked");
  const [here, setHere] = useState<Destination>(ORIGIN);
  const [target, setTarget] = useState<Destination | null>(null);
  const [scanned, setScanned] = useState<Destination[] | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["Systems cold. Pick a destination, or LAUNCH."]);
  const [caption, setCaption] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [plotting, setPlotting] = useState(false);
  const [course, setCourse] = useState("");
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [shaking, setShaking] = useState(false);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  /** Two independent faders (0–1): Orbis's world sound and VESTA's voice. */
  const [worldLevel, setWorldLevel] = useState(0.8);
  const [vestaLevel, setVestaLevel] = useState(1);

  const stage = useRef<HTMLDivElement>(null);
  const audio = useRef<CockpitAudio | null>(null);
  const copilot = useRef<Copilot | null>(null);
  const opening = useRef<Destination>(ORIGIN);
  const visitedRef = useRef<string[]>([]);
  const voyage = useRef(0); // bumped when a flight ends: in-flight work stops
  const world = useRef(0); // bumped on every arrival or jump: stale scans/events stop
  const eventTimer = useRef<number | null>(null);
  const warnedLowDrive = useRef(false);
  const sceneLock = useRef<SceneLock>("free");
  const lastPrompt = useRef("");
  const beats = useRef(0);
  const lastSpokeAt = useRef(0);

  const addLog = (line: string) => setLog((current) => [...current, line].slice(-3));
  const firePulse = (kind: Pulse["kind"]) =>
    setPulse((current) => ({ kind, id: (current?.id ?? 0) + 1 }));
  const shake = () => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), SHAKE_MS);
  };
  const tellVesta = (text: string) => {
    lastSpokeAt.current = Date.now();
    copilot.current?.update(text);
  };

  /** Steer Orbis and remember the prompt the scene driver continues from. */
  const steer = async (prompt: string) => {
    const ok = await session.steerTo(prompt);
    if (ok) lastPrompt.current = prompt;
    return ok;
  };

  /**
   * Orbis shows a prompt 6–10 s after it's sent. Poll the live video until
   * `expect` is actually on screen, so nothing is announced early.
   * Resolves true when seen, false on timeout or when `stillValid` turns false.
   */
  const waitUntilSeen = async (expect: string, stillValid: () => boolean) => {
    const deadline = Date.now() + SEE_TIMEOUT_MS;
    await new Promise((resolve) => window.setTimeout(resolve, 3_500));
    while (Date.now() < deadline && stillValid()) {
      const frame = captureFrame();
      if (frame) {
        const result = await askScene<{ visible: boolean }>({ mode: "check", frame, expect });
        if (result?.visible) return true;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1_500));
    }
    return false;
  };
  const clearEventTimer = () => {
    if (eventTimer.current) window.clearTimeout(eventTimer.current);
    eventTimer.current = null;
  };

  // ---- Parallax: pointer → CSS variables (no re-renders).
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      stage.current?.style.setProperty("--px", x.toFixed(3));
      stage.current?.style.setProperty("--py", y.toFixed(3));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // ---- Tear everything down when the page goes away.
  useEffect(
    () => () => {
      clearEventTimer();
      copilot.current?.close();
      audio.current?.dispose();
    },
    [],
  );

  // ---- Duck the engine while VESTA talks; fade subtitles after she stops.
  useEffect(() => {
    audio.current?.duck(speaking);
    if (speaking || !caption) return;
    const timer = window.setTimeout(() => setCaption(""), 4_500);
    return () => window.clearTimeout(timer);
  }, [speaking, caption]);

  // ---- Chunk clock: Orbis finishes a chunk about every 1.8 s.
  const chunks = useRef(0);
  const waiters = useRef<{ target: number; resolve: () => void }[]>([]);
  useReactorMessage((raw) => {
    if (unwrapOrbisMessage(raw).type !== "chunk_complete") return;
    chunks.current += 1;
    waiters.current = waiters.current.filter((waiter) => {
      if (chunks.current < waiter.target) return true;
      waiter.resolve();
      return false;
    });
  });
  const waitChunks = (count: number, timeoutMs: number) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, timeoutMs);
      waiters.current.push({
        target: chunks.current + count,
        resolve: () => {
          clearTimeout(timer);
          resolve();
        },
      });
    });

  // ---- Faders. Orbis plays through the <video> element, so the world fader
  // is the element's volume; VESTA's fader is her output gain.
  useEffect(() => {
    const apply = () => {
      const video = document.querySelector<HTMLVideoElement>(".sw-world video");
      if (video) video.volume = worldLevel;
    };
    apply();
    const timer = window.setInterval(apply, 1_000); // the video element can be replaced
    return () => window.clearInterval(timer);
  }, [worldLevel, session.runStarted]);
  useEffect(() => {
    copilot.current?.setVolume(vestaLevel);
  }, [vestaLevel]);

  // ---- VESTA's eyes: stream her a frame of the view every second.
  useEffect(() => {
    if (!session.runStarted) return;
    const timer = window.setInterval(() => {
      const frame = captureFrame(384);
      if (frame) copilot.current?.sendFrame(frame);
    }, VESTA_FRAME_MS);
    return () => window.clearInterval(timer);
  }, [session.runStarted]);

  // ---- Scene driver: every ~6.5 s, look at the view and write Orbis the
  // next beat so the shot keeps moving. Pauses during jumps and events.
  const driverState = useRef({ phase, here });
  driverState.current = { phase, here };
  useEffect(() => {
    if (!session.runStarted) return;
    let busy = false;
    const timer = window.setInterval(async () => {
      const { phase: current, here: place } = driverState.current;
      if (busy || current !== "flying" || sceneLock.current !== "free") return;
      const frame = captureFrame();
      if (!frame) return;
      busy = true;
      const thisWorld = world.current;
      const beat = await askScene<{ prompt: string; seen: string }>({
        mode: "evolve",
        frame,
        world: `${place.name} (${place.era}): ${place.view}`,
        lastPrompt: lastPrompt.current,
      });
      busy = false;
      if (!beat?.prompt || world.current !== thisWorld || sceneLock.current !== "free") return;
      await steer(beat.prompt);
      beats.current += 1;
      // Now and then, VESTA remarks on what she sees (if she's been quiet).
      if (beats.current % 3 === 0 && Date.now() - lastSpokeAt.current > 15_000) {
        tellVesta("Observation: say one short remark about something you can see right now.");
      }
    }, SCENE_BEAT_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.runStarted]);

  // ---- Drive clock: every session is capped at five minutes.
  useEffect(() => {
    if (session.connected) {
      setConnectedAt((current) => current ?? Date.now());
      const timer = setInterval(() => setNow(Date.now()), 1_000);
      return () => clearInterval(timer);
    }
    setConnectedAt(null);
  }, [session.connected]);
  const remaining = connectedAt
    ? Math.max(0, SESSION_LIMIT_SECONDS - Math.floor((now - connectedAt) / 1_000))
    : SESSION_LIMIT_SECONDS;
  useEffect(() => {
    if (remaining > 60) {
      warnedLowDrive.current = false;
    } else if (session.connected && !warnedLowDrive.current) {
      warnedLowDrive.current = true;
      tellVesta("One minute of drive time left before the drive shuts down.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, session.connected]);

  // ---- Arriving: log it, tell VESTA, scan for onward routes, and maybe
  // schedule an unexpected event.
  const arrive = (dest: Destination, how: "launch" | "jump") => {
    world.current += 1;
    const thisWorld = world.current;
    const flight = voyage.current;
    clearEventTimer();
    visitedRef.current = [...visitedRef.current, dest.name];
    setVisited(visitedRef.current);
    setHere(dest);
    setTarget(null);
    setScanned(null);
    setAlert(null);
    setPhase("flying");
    addLog(`[${dest.era}] ${dest.log}`);
    sceneLock.current = "free";
    tellVesta(
      how === "launch"
        ? `Launch complete. We are at ${dest.name} (${dest.era}). Greet the captain and the room, and say what you see outside.`
        : `Arrived at ${dest.name} (${dest.era}). Say what you see outside.`,
    );

    void fetch("/api/director", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        world: { name: dest.name, era: dest.era, view: dest.view },
        visited: visitedRef.current,
      }),
    })
      .then(async (response) => {
        const plan = (await response.json()) as DirectorPlan;
        if (!response.ok || !plan.options) throw new Error(plan.error || "scan failed");
        if (world.current !== thisWorld) return;
        setScanned(
          plan.options.slice(0, 3).map((option, index) => ({
            id: `scan-${thisWorld}-${index}`,
            name: option.name,
            era: option.era,
            teaser: option.teaser,
            view: option.view,
            log: option.log,
            generated: true,
          })),
        );
        addLog("Scan complete: new routes plotted.");
        window.setTimeout(() => {
          if (world.current !== thisWorld) return;
          tellVesta(
            `New routes plotted: ${plan.options!
              .slice(0, 3)
              .map((option) => `${option.name} (${option.era}), "${option.teaser}"`)
              .join("; ")}. Tease them and pick a favourite.`,
          );
        }, 6_000);
        if (plan.event) {
          const event = plan.event;
          eventTimer.current = window.setTimeout(
            () => {
              if (world.current === thisWorld && voyage.current === flight) {
                void strike(event, thisWorld);
              }
            },
            EVENT_DELAY_MS + Math.random() * 6_000,
          );
        }
      })
      .catch(() => {
        if (world.current !== thisWorld) return;
        setScanned([]);
        addLog("Long-range scan failed. Charted routes only.");
      });
  };

  // ---- An unexpected event: alert, morph the view in place, VESTA reacts.
  const strike = async (event: WorldEvent, thisWorld: number) => {
    if (world.current !== thisWorld || sceneLock.current !== "free") return;
    // Send it to Orbis silently; only raise the alarm once it's on screen.
    sceneLock.current = "event";
    const ok = await steer(scenePrompt(event.view));
    if (!ok || world.current !== thisWorld) {
      if (world.current === thisWorld) sceneLock.current = "free";
      return;
    }
    const seen = await waitUntilSeen(event.view, () => world.current === thisWorld);
    if (world.current !== thisWorld) return;
    setHere((current) => ({ ...current, view: event.view, generated: true }));
    sceneLock.current = "free";
    if (!seen) {
      addLog("Sensors flagged something, but it never surfaced.");
      return;
    }
    audio.current?.alert();
    setAlert(event.title);
    shake();
    addLog(event.log);
    tellVesta(`ALERT: ${event.title}. Call it out from what you can see.`);
    window.setTimeout(() => {
      if (world.current === thisWorld) setAlert(null);
    }, 7_000);
  };

  // ---- Launch, optionally straight into a destination.
  // The click is the gesture browsers need before sound, so all audio
  // starts here: the engine, the copilot, and Orbis's own sound.
  const launch = (into: Destination = ORIGIN) => {
    if (phase !== "docked") return;
    opening.current = into;
    visitedRef.current = [];
    setVisited([]);
    setPhase("launching");
    setTarget(into === ORIGIN ? null : into);
    addLog(into === ORIGIN ? "Ignition…" : `Ignition. Plotting straight for ${into.name}…`);

    audio.current ??= new CockpitAudio();
    audio.current.setMuted(false);
    audio.current.start();
    if (session.muted) session.toggleMuted();

    copilot.current?.close();
    const vesta = new Copilot({
      onCaption: setCaption,
      onSpeaking: setSpeaking,
      onError: (message) => addLog(`${message}. Flying solo.`),
    });
    copilot.current = vesta;
    vesta.setVolume(vestaLevel);
    vesta.connect().catch((caught: unknown) => {
      addLog(`VESTA offline: ${caught instanceof Error ? caught.message : String(caught)}`);
    });

    void session.connectSession().then((ok) => {
      if (!ok) {
        setPhase("docked");
        setTarget(null);
        addLog("Ignition failed. Try again.");
      }
    });
  };

  const starting = useRef(false);
  useEffect(() => {
    if (phase !== "launching" || !session.connected || session.runStarted || starting.current) {
      return;
    }
    starting.current = true;
    const into = opening.current;
    void (async () => {
      // Empty sound prompt: Orbis makes its audio from the picture itself.
      await session.setAudioPrompt("");
      sceneLock.current = "launch";
      const flight = voyage.current;
      const ok = await session.startWith(null, promptFor(into));
      starting.current = false;
      if (ok) {
        lastPrompt.current = promptFor(into);
        await waitUntilSeen(into.view, () => voyage.current === flight);
        if (voyage.current !== flight) return;
        firePulse("arrive");
        arrive(into, "launch");
      } else {
        sceneLock.current = "free";
        setPhase("docked");
        setTarget(null);
        addLog("Drive stalled on ignition.");
      }
    })();
    // session methods are recreated each render; the phase guard is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session.connected, session.runStarted]);

  // ---- The flight ends when the session does (dock, error, or 5:00).
  useEffect(() => {
    if ((phase === "flying" || phase === "jumping") && !session.connected) {
      voyage.current += 1;
      world.current += 1;
      sceneLock.current = "free";
      clearEventTimer();
      setTarget(null);
      setScanned(null);
      setAlert(null);
      setPlotting(false);
      setPhase("docked");
      addLog("Flight ended. Pick a destination to fly again.");
      tellVesta("The drive has shut down and the flight is over. Say goodbye to the room.");
      const vesta = copilot.current;
      const engine = audio.current;
      copilot.current = null;
      audio.current = null;
      window.setTimeout(() => {
        vesta?.close();
        engine?.dispose();
      }, 6_000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session.connected]);

  // ---- A jump: teleport effect, stars stretch, destination, arrival.
  const jump = async (dest: Destination) => {
    if (phase !== "flying") return;
    const flight = voyage.current;
    const stillFlying = () => voyage.current === flight;

    world.current += 1; // cancels this world's pending scan and event
    sceneLock.current = "jump";
    clearEventTimer();
    setPhase("jumping");
    setTarget(dest);
    setPlotting(false);
    setAlert(null);
    addLog(`Jump plotted: ${dest.name}, ${dest.era}.`);
    tellVesta(`The captain chose ${dest.name} (${dest.era}). The jump starts now.`);
    audio.current?.teleport();
    firePulse("jump");
    shake();

    const intoJump = await session.steerTo(JUMP_PROMPT);
    if (intoJump) await waitChunks(1, 2_500);
    if (!stillFlying()) return;

    const arriving = await steer(promptFor(dest));
    if (!stillFlying()) return;
    if (!arriving) {
      sceneLock.current = "free";
      setTarget(null);
      setPhase("flying");
      addLog(`Jump aborted. Still at ${here.name}.`);
      return;
    }
    // Arrive (chime, ring, VESTA) only once the new world is on screen.
    await waitUntilSeen(dest.view, stillFlying);
    if (!stillFlying()) return;
    audio.current?.arrive();
    firePulse("arrive");
    arrive(dest, "jump");
  };

  const submitCourse = (event: FormEvent) => {
    event.preventDefault();
    if (course.trim().length < 3) return;
    void jump(plottedCourse(course));
    setCourse("");
  };

  // ---- The console: six keys. Docked: all six charted worlds (a click
  // launches straight there). Flying: three scanned routes on the left,
  // three charted worlds on the right.
  const docked = phase === "docked";
  const unvisited = DESTINATIONS.filter(
    (dest) => dest.id !== here.id && !visited.includes(dest.name),
  );
  const chartedPool =
    unvisited.length >= 6 ? unvisited : DESTINATIONS.filter((dest) => dest.id !== here.id);
  const rightKeys: Destination[] = docked ? DESTINATIONS.slice(3, 6) : chartedPool.slice(0, 3);
  const leftKeys: (Destination | null)[] = docked
    ? DESTINATIONS.slice(0, 3)
    : scanned === null
      ? [null, null, null]
      : scanned.length
        ? scanned
        : chartedPool.slice(3, 6);
  const keyList = [...leftKeys, ...rightKeys];

  const press = (dest: Destination | null) => {
    if (!dest) return;
    if (phase === "docked") launch(dest);
    else if (phase === "flying") void jump(dest);
  };

  // ---- Keyboard for demos: 1–6 keys, P plot, L launch, Esc cancel.
  // Dev only: J / A rehearse the jump / arrival effects without Orbis.
  const rehearse = (kind: Pulse["kind"]) => {
    if (process.env.NODE_ENV !== "development") return;
    audio.current ??= new CockpitAudio();
    audio.current.start();
    if (kind === "jump") {
      audio.current.teleport();
      shake();
    } else {
      audio.current.arrive();
    }
    firePulse(kind);
  };
  // Dev only: V connects VESTA (if needed) and asks for a systems check.
  const rehearseVesta = async () => {
    if (process.env.NODE_ENV !== "development") return;
    if (!copilot.current) {
      const vesta = new Copilot({
        onCaption: setCaption,
        onSpeaking: setSpeaking,
        onError: (message) => addLog(message),
      });
      copilot.current = vesta;
      vesta.setVolume(vestaLevel);
      try {
        await vesta.connect();
      } catch (caught) {
        addLog(`VESTA offline: ${caught instanceof Error ? caught.message : String(caught)}`);
        copilot.current = null;
        return;
      }
    }
    tellVesta("Systems check before launch. Introduce yourself to the room in one line.");
  };
  const keys = useRef({ press, launch, rehearse, rehearseVesta, keyList, phase });
  keys.current = { press, launch, rehearse, rehearseVesta, keyList, phase };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.tagName === "INPUT") {
        if (event.key === "Escape") setPlotting(false);
        return;
      }
      const current = keys.current;
      const key = event.key.toLowerCase();
      if (/^[1-6]$/.test(key)) current.press(current.keyList[Number(key) - 1] ?? null);
      else if (key === "p" && current.phase === "flying") {
        event.preventDefault();
        setPlotting(true);
      } else if (key === "l" && current.phase === "docked") current.launch();
      else if (key === "j") current.rehearse("jump");
      else if (key === "a") current.rehearse("arrive");
      else if (key === "v") void current.rehearseVesta();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const flying = phase === "flying";
  const jumping = phase === "jumping";
  const shown = target ?? here;

  return (
    <div className="sw">
      <div className="sw-stage" ref={stage}>
        <div className="sw-world">
          {session.runStarted ? (
            <ReactorView
              track="main_video"
              audioTrack="main_audio"
              muted={session.muted}
              videoObjectFit="cover"
            />
          ) : (
            <div className="sw-starfield" />
          )}
        </div>

        <WarpCanvas pulse={pulse} />
        <div className="sw-glass" aria-hidden />

        {alert && (
          <div className="sw-alert" role="alert">
            <span>Alert</span>
            {alert}
          </div>
        )}

        {flying && !plotting && scanned && scanned.length > 0 && (
          <div className="sw-choices" key={scanned[0].id}>
            {scanned.map((dest, index) => (
              <button
                key={dest.id}
                type="button"
                className="sw-choice"
                style={{ animationDelay: `${index * 140}ms` }}
                onClick={() => void jump(dest)}
              >
                <span className="sw-choice-num">{index + 1}</span>
                <span className="sw-choice-era">{dest.era}</span>
                <strong>{dest.name}</strong>
                <em>{dest.teaser}</em>
              </button>
            ))}
          </div>
        )}

        {caption && (
          <div className={`sw-subtitle ${speaking ? "is-speaking" : ""}`} aria-live="polite">
            <span className="sw-subtitle-name">
              <i aria-hidden /> VESTA
            </span>
            <p>{caption}</p>
          </div>
        )}

        <div className="sw-cabin">
          <div className={`sw-cabin-inner ${shaking ? "is-shaking" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sw-cockpit" src="/cockpit.png" alt="" draggable={false} />

            {/* Left screen: drive time */}
            <div className="sw-screen sw-screen-left">
              <span className="sw-label">Drive</span>
              <strong className={remaining <= 60 && session.connected ? "is-low" : ""}>
                {formatClock(remaining)}
              </strong>
              <span className="sw-bar" aria-hidden>
                <span style={{ width: `${(remaining / SESSION_LIMIT_SECONDS) * 100}%` }} />
              </span>
            </div>

            {/* Centre screen: launch, log, plot */}
            <div className="sw-screen sw-screen-center">
              {docked ? (
                <button type="button" className="sw-launch" onClick={() => launch()}>
                  Launch
                  <small>or pick a destination · 5-min flight</small>
                </button>
              ) : plotting ? (
                <form className="sw-plot" onSubmit={submitCourse}>
                  <span className="sw-label">Plot course</span>
                  <input
                    autoFocus
                    value={course}
                    maxLength={120}
                    placeholder="Venice during Carnival, 1750"
                    onChange={(event) => setCourse(event.target.value)}
                  />
                  <span className="sw-hint">Enter to jump · Esc to cancel</span>
                </form>
              ) : (
                <>
                  {(jumping || phase === "launching") && target && (
                    <div className="sw-jumping">Jumping → {target.era}</div>
                  )}
                  <ol className="sw-log">
                    {log.map((line, index) => (
                      <li key={`${index}-${line}`}>{line}</li>
                    ))}
                  </ol>
                  {session.error && <p className="sw-error">{session.error}</p>}
                  {flying && (
                    <button type="button" className="sw-plot-key" onClick={() => setPlotting(true)}>
                      Plot custom course (P)
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Right screen: where (and when) we are */}
            <div className="sw-screen sw-screen-right">
              <span className="sw-label">
                {jumping ? "In transit" : phase === "launching" ? "Launching" : "Position"}
              </span>
              <strong>{docked ? "Hangar" : shown.name}</strong>
              <span className="sw-era">{docked ? "—" : shown.era}</span>
            </div>

            {/* Console wings: the star map */}
            {[leftKeys, rightKeys].map((group, side) => (
              <div key={side} className={`sw-keys ${side === 0 ? "sw-keys-left" : "sw-keys-right"}`}>
                <span className="sw-keys-title">
                  {side === 0 && !docked ? "Scanned routes" : "Charted"}
                </span>
                {group.map((dest, index) => {
                  const number = side * 3 + index + 1;
                  if (!dest) {
                    return (
                      <div key={`scan-${index}`} className="sw-key is-scanning" aria-hidden>
                        <span className="sw-key-num">{number}</span>
                        <span className="sw-key-name">Scanning…</span>
                        <span className="sw-key-era" />
                      </div>
                    );
                  }
                  const isTarget = target?.id === dest.id;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      className={`sw-key ${dest.generated ? "is-generated" : ""} ${isTarget ? "is-target" : ""}`}
                      disabled={!docked && !flying && !isTarget}
                      title={dest.teaser ?? dest.log}
                      onClick={() => press(dest)}
                    >
                      <span className="sw-key-num">{number}</span>
                      <span className="sw-key-name">{dest.name}</span>
                      <span className="sw-key-era">{dest.era}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="sw-corner">
        <Link href="/">← Starter</Link>
        <button
          type="button"
          onClick={() => {
            const muted = !session.muted;
            audio.current?.setMuted(muted);
            copilot.current?.setMuted(muted);
            session.toggleMuted();
          }}
        >
          {session.muted ? "Sound: off" : "Sound: on"}
        </button>
        <Fader label="World" value={worldLevel} onChange={setWorldLevel} />
        <Fader label="VESTA" value={vestaLevel} onChange={setVestaLevel} />
        {session.connected && (
          <button
            type="button"
            disabled={phase === "launching"}
            onClick={() => void session.disconnectSession()}
          >
            Dock
          </button>
        )}
        <span className={`sw-status status-${session.status}`}>{session.status}</span>
      </nav>
    </div>
  );
}

function Fader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="sw-mix">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        aria-label={`${label} volume`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>{Math.round(value * 100)}%</output>
    </label>
  );
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
