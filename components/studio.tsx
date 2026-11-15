"use client";

import { ReactorProvider, ReactorView } from "@reactor-team/js-sdk";
import Link from "next/link";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { type LifeSimAction, type LifeSimEvent, LifeSimHud, type LifeSimItem, type LifeSimQuest } from "@/components/life-sim";
import { useOrbisStudio, type OrbisStudio } from "@/hooks/use-orbis-studio";
import type { DemoShot, DemoView } from "@/lib/demos";
import { cropTo169, postForImage, postForPrompt, urlToFile } from "@/lib/image";
import { ORBIS_MODEL_NAME, ORBIS_TRACKS, requestReactorJwt } from "@/lib/orbis";

type Still = { file: File; url: string; model?: string };
type ShotState = {
  status: "idle" | "loading" | "ready" | "error";
  still?: Still;
  cutPrompt?: string;
  error?: string;
};

function useStill() {
  const [still, setStillState] = useState<Still | null>(null);
  const setStill = useCallback((file: File | null, model?: string) => {
    setStillState((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return file ? { file, url: URL.createObjectURL(file), model } : null;
    });
  }, []);
  return [still, setStill] as const;
}

export type StudioExtras = {
  /** Files to preload as uploads (e.g. the shopper's saved photo). */
  initialUploads?: File[];
  /** Called whenever the user uploads photos. */
  onUploads?: (files: File[]) => void;
  /** Hide the big header (embedded in the extension side panel). */
  compact?: boolean;
  /** Rendered above the studio grid (e.g. Lifecast "what we detected" card). */
  banner?: React.ReactNode;
  /** Enables Lifecast game mode (life-sim HUD). */
  game?: GameConfig;
  /** Auto "image cut": once the hero is ready and time >= after, start a take from it on the live session. */
  autoLive?: { after: number; label: string };
  /** Realtime input from outside (e.g. a swatch clicked on the shopping page): steer the live stream now. */
  externalSteer?: { id: number; prompt: string; label: string };
  /** Which realtime controller to show (snow/person, car, home). */
  controller?: "person" | "car" | "home";
};

type Control = { key: string; arrow: string; label: string; prompt: string };
const CONTROLS: Record<"person" | "car" | "home", Control[]> = {
  person: [
    { key: "w", arrow: "↑", label: "Faster", prompt: "The person speeds up, moving faster through the scene." },
    { key: "a", arrow: "←", label: "Left", prompt: "The person leans and turns to the left." },
    { key: "d", arrow: "→", label: "Right", prompt: "The person leans and turns to the right." },
    { key: "s", arrow: "↓", label: "Stop", prompt: "The person slows to a stop and turns toward the camera, smiling." },
    { key: " ", arrow: "␣", label: "Jump", prompt: "The person jumps high into the air." },
  ],
  car: [
    { key: "w", arrow: "↑", label: "Accelerate", prompt: "The vehicle accelerates hard down the road." },
    { key: "a", arrow: "←", label: "Left", prompt: "The vehicle turns left around a curve." },
    { key: "d", arrow: "→", label: "Right", prompt: "The vehicle turns right around a curve." },
    { key: "s", arrow: "↓", label: "Brake", prompt: "The vehicle slows down and comes to a smooth stop." },
    { key: " ", arrow: "␣", label: "Lights", prompt: "The vehicle's headlights flash on brightly." },
  ],
  home: [
    { key: "w", arrow: "↑", label: "Walk", prompt: "The camera walks forward through the room." },
    { key: "a", arrow: "←", label: "Look left", prompt: "The camera turns to the left inside the room." },
    { key: "d", arrow: "→", label: "Look right", prompt: "The camera turns to the right inside the room." },
    { key: "s", arrow: "↓", label: "Step back", prompt: "The camera steps back to show the whole room." },
    { key: " ", arrow: "␣", label: "Lights", prompt: "Warm lamps switch on throughout the room." },
  ],
};
const ARROW_KEYS: Record<string, string> = { ArrowUp: "w", ArrowLeft: "a", ArrowRight: "d", ArrowDown: "s" };

export type GameConfig = {
  title: string;
  playerName?: string;
  avatarUrl?: string;
  inventory: Omit<LifeSimItem, "owned">[];
  budget?: number;
  /** Start in game mode as soon as the studio opens. */
  autoStart?: boolean;
};

type SessionCtxValue = { clearJwt: () => void; getCurrentJwt: () => string | null };
const SessionCtx = createContext<SessionCtxValue | null>(null);

/** One Orbis (Reactor) session that can outlive individual studios (Lifecast keeps it across shopping pages). */
export function OrbisSession({ children }: { children: ReactNode }) {
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
      <SessionCtx.Provider value={{ clearJwt, getCurrentJwt }}>{children}</SessionCtx.Provider>
    </ReactorProvider>
  );
}

export function StudioShell({ demo, ...extras }: { demo: DemoView } & StudioExtras) {
  return (
    <OrbisSession>
      <StudioInSession demo={demo} {...extras} />
    </OrbisSession>
  );
}

/** A studio inside an existing OrbisSession (remounting it keeps the live connection). */
export function StudioInSession({ demo, ...extras }: { demo: DemoView } & StudioExtras) {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("StudioInSession must be inside <OrbisSession>");
  return <Studio demo={demo} clearJwt={ctx.clearJwt} getCurrentJwt={ctx.getCurrentJwt} {...extras} />;
}

function Studio({
  demo,
  clearJwt,
  getCurrentJwt,
  initialUploads,
  onUploads,
  compact,
  banner,
  game,
  autoLive,
  externalSteer,
  controller,
}: {
  demo: DemoView;
  clearJwt: () => void;
  getCurrentJwt: () => string | null;
} & StudioExtras) {
  const s = useOrbisStudio(clearJwt, getCurrentJwt);

  // ---- setup state ----
  const [subjectId, setSubjectId] = useState(demo.subjects[0]?.id ?? "");
  const [subjectIds, setSubjectIds] = useState<string[]>(demo.subjects[0] ? [demo.subjects[0].id] : []);
  const [subjectText, setSubjectText] = useState("");
  // Any number of uploaded photos become extra subjects (shopper photos, more rooms, ...).
  const [uploads, setUploads] = useState<{ id: string; label: string; src: string; file: File }[]>([]);
  const addUploads = (files: FileList | File[] | null, notify = true) => {
    if (!files?.length) return;
    if (notify) onUploads?.([...files]);
    const added = [...files]
      .filter((f) => f.type.startsWith("image/"))
      .map((file, i) => ({
        id: `upload-${Date.now()}-${i}`,
        label: file.name.replace(/\.[^.]+$/, "").slice(0, 18) || "Upload",
        src: URL.createObjectURL(file),
        file,
      }));
    if (!added.length) return;
    setUploads((cur) => [...cur, ...added]);
    setSubjectId(added[0].id);
    if (demo.multiSubject) setSubjectIds((cur) => [...cur, ...added.map((x) => x.id)]);
  };
  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current || !initialUploads?.length) return;
    preloaded.current = true;
    addUploads(initialUploads, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUploads]);
  const allSubjects = useMemo(() => [...demo.subjects, ...uploads], [demo.subjects, uploads]);
  const isUpload = (id: string) => id.startsWith("upload-");
  const subjectFile = async (id: string) => {
    const up = uploads.find((x) => x.id === id);
    if (up) return up.file;
    const subject = demo.subjects.find((x) => x.id === id);
    return subject ? urlToFile(subject.src) : undefined;
  };
  const [optionIds, setOptionIds] = useState<string[]>(
    demo.defaultOptionIds ?? (demo.options[0] ? [demo.options[0].id] : []),
  );
  const [custom, setCustom] = useState("");
  const [fast, setFast] = useState(false);
  const [hero, setHero] = useStill();
  const [heroBusy, setHeroBusy] = useState(false);
  /** Where the current hero came from: server pre-render (its shots apply) or the user. */
  const heroSource = useRef<"prerender" | "user" | null>(null);
  const [serverHeroPrompt, setServerHeroPrompt] = useState<string | undefined>();
  const [setupError, setSetupError] = useState("");

  // ---- shots ----
  const [shots, setShots] = useState<Record<string, ShotState>>({});
  const [customShots, setCustomShots] = useState<DemoShot[]>([]);
  const [customShotText, setCustomShotText] = useState("");
  const allShots = useMemo(() => [...demo.shots, ...customShots], [demo.shots, customShots]);

  // ---- direction ----
  const [direction, setDirection] = useState("");
  const [rawMode, setRawMode] = useState(false);
  const [writing, setWriting] = useState("");

  // Click = switch to that option (matches the pre-rendered presets); Shift/Cmd-click = combine (multi-option demos).
  const toggleOption = (id: string, combine = false) =>
    setOptionIds((cur) =>
      demo.multiOption && (combine || demo.defaultOptionIds)
        ? cur.includes(id)
          ? cur.filter((x) => x !== id)
          : [...cur, id]
        : cur.length === 1 && cur[0] === id && !demo.defaultOptionIds
          ? cur
          : [id],
    );

  const pickSubject = (id: string) => {
    setSubjectId(id);
    if (demo.multiSubject) {
      setSubjectIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
    }
  };

  // Step 1: high-res hero still.
  /** Render a hero still for one subject (or typed text). Shared by the hero button and batch staging. */
  const renderHero = async (opts: { text?: string; id?: string }) => {
    const form = new FormData();
    form.append("demoId", demo.id);
    if (opts.text) {
      form.append("subjectText", opts.text);
    } else {
      const id = opts.id ?? subjectId;
      const subject = await subjectFile(id);
      if (!subject) throw new Error(`Choose a ${demo.subjectLabel.toLowerCase()} first.`);
      form.append("subject", subject);
      if (isUpload(id) || demo.subjects.find((x) => x.id === id)?.person) form.append("subjectKind", "upload");
    }
    form.append("optionIds", optionIds.join(","));
    if (custom.trim()) form.append("custom", custom.trim());
    if (fast) form.append("fast", "1");
    for (const option of demo.options.filter((o) => optionIds.includes(o.id) && o.src)) {
      form.append("optionImages", await urlToFile(option.src!));
    }
    return postForImage("/api/hero", form);
  };

  const generateHero = async (fromText?: string) => {
    setHeroBusy(true);
    setSetupError("");
    s.touch();
    try {
      const { file, model } = await renderHero({ text: fromText });
      setHero(file, model);
      heroSource.current = "user";
      setShots({});
    } catch (caught) {
      setSetupError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setHeroBusy(false);
    }
  };

  const useSubjectAsHero = async () => {
    setSetupError("");
    try {
      const file = await subjectFile(subjectId);
      if (!file) throw new Error("Choose an image first.");
      setHero(file, "original");
      heroSource.current = "user";
      setShots({});
    } catch (caught) {
      setSetupError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  // Step 2: frontier model generates angle / scenario shots from the hero.
  const writeOpening = async (image: File, motion: string) => {
    const form = new FormData();
    form.append("mode", "opening");
    form.append("demoId", demo.id);
    form.append("image", image);
    form.append("request", motion);
    return postForPrompt(form);
  };

  const generateShot = async (shot: DemoShot) => {
    if (!hero) return;
    s.touch();
    setShots((cur) => ({ ...cur, [shot.id]: { status: "loading" } }));
    try {
      const form = new FormData();
      form.append("demoId", demo.id);
      form.append("hero", hero.file);
      if (demo.shots.some((x) => x.id === shot.id)) form.append("shotId", shot.id);
      else form.append("instruction", shot.instruction);
      if (fast) form.append("fast", "1");
      const { file, model } = await postForImage("/api/shot", form);
      const still = { file, url: URL.createObjectURL(file), model };
      setShots((cur) => ({ ...cur, [shot.id]: { status: "ready", still } }));
      // Pre-write the cut prompt so cutting is instant later.
      const cutPrompt = await writeOpening(file, shot.motion).catch(() => shot.motion);
      setShots((cur) => ({ ...cur, [shot.id]: { ...cur[shot.id], cutPrompt } }));
    } catch (caught) {
      setShots((cur) => ({
        ...cur,
        [shot.id]: { status: "error", error: caught instanceof Error ? caught.message : String(caught) },
      }));
    }
  };

  /** Put every selected subject (e.g. a list of cities) on the shot board as ready shots. */
  const subjectsToBoard = async () => {
    s.touch();
    const picked = allSubjects.filter((x) => subjectIds.includes(x.id));
    const newShots: DemoShot[] = picked.map((x) => ({
      id: `subject-${x.id}`,
      label: x.label,
      instruction: "",
      motion: demo.openingMotion,
    }));
    setCustomShots((cur) => [...cur.filter((c) => !newShots.some((n) => n.id === c.id)), ...newShots]);
    await Promise.all(
      picked.map(async (x) => {
        const id = `subject-${x.id}`;
        try {
          let file: File;
          let model = "asset";
          if (demo.boardRendersSubjects) {
            // e.g. furnish every selected room in the chosen style first
            setShots((cur) => ({ ...cur, [id]: { status: "loading" } }));
            ({ file, model } = await renderHero({ id: x.id }));
          } else {
            file = (await subjectFile(x.id))!;
          }
          const still = { file, url: URL.createObjectURL(file), model };
          setShots((cur) => ({ ...cur, [id]: { status: "ready", still } }));
          const cutPrompt = await writeOpening(file, demo.openingMotion).catch(() => demo.openingMotion);
          setShots((cur) => ({ ...cur, [id]: { ...cur[id], cutPrompt } }));
        } catch (caught) {
          setShots((cur) => ({ ...cur, [id]: { status: "error", error: String(caught) } }));
        }
      }),
    );
  };

  /** Add the current hero (e.g. a typed city) to the shot board. */
  const heroToBoard = async () => {
    if (!hero) return;
    const id = `hero-${Date.now()}`;
    const label = (subjectText.trim() || "Hero").slice(0, 22);
    setCustomShots((cur) => [...cur, { id, label, instruction: "", motion: demo.openingMotion }]);
    const still = { file: hero.file, url: URL.createObjectURL(hero.file), model: hero.model };
    setShots((cur) => ({ ...cur, [id]: { status: "ready", still } }));
    const cutPrompt = await writeOpening(hero.file, demo.openingMotion).catch(() => demo.openingMotion);
    setShots((cur) => ({ ...cur, [id]: { ...cur[id], cutPrompt } }));
  };

  const generateAllShots = () => {
    for (const shot of allShots) {
      if (!shot.instruction) continue; // subject cards are already ready
      if (shots[shot.id]?.status !== "ready" && shots[shot.id]?.status !== "loading") void generateShot(shot);
    }
  };

  const addCustomShot = () => {
    const text = customShotText.trim();
    if (!text) return;
    const shot: DemoShot = {
      id: `custom-${Date.now()}`,
      label: text.slice(0, 22),
      instruction: text,
      motion: "Natural continuous motion of the subject; the camera moves smoothly.",
    };
    setCustomShots((cur) => [...cur, shot]);
    setCustomShotText("");
    void generateShot(shot);
  };

  // Step 3: go live / cut / morph.
  const goLive = async (label = "Hero") => {
    if (!hero) return;
    setWriting(heroSource.current === "prerender" && serverHeroPrompt ? "" : "Writing opening prompt…");
    try {
      const prompt =
        heroSource.current === "prerender" && serverHeroPrompt ? serverHeroPrompt : await writeOpening(hero.file, demo.openingMotion);
      setWriting("");
      await s.startTake(await cropTo169(hero.file, 1280, "hero.jpg"), prompt, {
        kind: label === "Hero" ? "take" : "cut",
        label,
        imageUrl: hero.url,
      });
    } catch (caught) {
      s.setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setWriting("");
    }
  };

  const cutTo = async (shot: DemoShot) => {
    const st = shots[shot.id];
    if (!st?.still) return;
    const prompt = st.cutPrompt ?? shot.motion;
    await s.startTake(await cropTo169(st.still.file, 1280, `${shot.id}.jpg`), prompt, {
      kind: "cut",
      label: shot.label,
      imageUrl: st.still.url,
    });
  };

  const morphTo = async (shot: DemoShot) => {
    const st = shots[shot.id];
    if (!st?.still) return;
    setWriting(`Reading "${shot.label}"…`);
    try {
      const form = new FormData();
      form.append("mode", "shot");
      form.append("demoId", demo.id);
      form.append("image", st.still.file);
      form.append("request", shot.motion);
      form.append("scene", s.scenePrompt);
      form.append("recent", JSON.stringify(s.recentPrompts()));
      const prompt = await postForPrompt(form);
      s.steer(prompt, shot.label, "morph");
    } catch (caught) {
      s.setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setWriting("");
    }
  };

  const swapOption = async (optionId: string) => {
    const option = demo.options.find((o) => o.id === optionId);
    if (!option) return;
    setWriting(`Writing swap: ${option.label}…`);
    try {
      const form = new FormData();
      form.append("mode", "swap");
      form.append("demoId", demo.id);
      form.append("optionId", optionId);
      form.append("scene", s.scenePrompt);
      form.append("recent", JSON.stringify(s.recentPrompts()));
      if (option.src) form.append("image", await urlToFile(option.src));
      const prompt = await postForPrompt(form);
      s.steer(prompt, `Swap: ${option.label}`);
    } catch (caught) {
      s.setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setWriting("");
    }
  };

  const sendDirection = async () => {
    const text = direction.trim();
    if (!text) return;
    if (rawMode) {
      s.steer(text);
      setDirection("");
      return;
    }
    setWriting("Directing…");
    try {
      const form = new FormData();
      form.append("mode", "change");
      form.append("demoId", demo.id);
      form.append("request", text);
      form.append("scene", s.scenePrompt);
      form.append("recent", JSON.stringify(s.recentPrompts()));
      const prompt = await postForPrompt(form);
      steerLive(prompt, text);
      setDirection("");
    } catch (caught) {
      s.setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setWriting("");
    }
  };

  // Scene timer: every scene is a short image-anchored take. After `shotSeconds` the stream hard-cuts
  // (set_image) to the next ready shot; after the last one it pauses on the final frame instead of drifting.
  const [autoplay, setAutoplay] = useState(true);
  const [shotSeconds, setShotSeconds] = useState(10);
  // Realtime input (controller, swatches, chips) holds the current scene; auto-cut resumes once input stops (capped).
  const lastInteractAt = useRef(0);
  const dueCut = useRef<{ run: () => void; at: number } | null>(null);
  useEffect(() => {
    const d = dueCut.current;
    if (!d) return;
    dueCut.current = null;
    d.run();
  }, [s.telemetry.chunk]);
  useEffect(() => {
    const t = setInterval(() => {
      const d = dueCut.current;
      if (d && Date.now() - d.at > 2500) {
        dueCut.current = null;
        d.run();
      }
    }, 500);
    return () => clearInterval(t);
  }, []);
  const autoIndex = useRef(0);
  const readyShots = allShots.filter((x) => shots[x.id]?.status === "ready");
  const lastTake = s.log.find((e) => e.kind === "take" || e.kind === "cut");
  useEffect(() => {
    if (!autoplay || !s.connected || !s.runStarted || !lastTake || s.paused || s.busy) return;
    const idx = readyShots.findIndex((x) => x.label === lastTake.label);
    const next = idx >= 0 ? readyShots[idx + 1] : readyShots[0];
    // Auto demo: next scene ~10 s after this one starts; every steering input restarts the countdown (no cap).
    const due = Math.max(lastTake.at, lastInteractAt.current) + shotSeconds * 1000;
    const wait = Math.max(500, due - Date.now());
    const timer = setTimeout(() => {
      // Cut on a chunk boundary: wait for the chunk in flight to land (max 2.5 s), so scenes never truncate mid-chunk.
      dueCut.current = { run: () => (next ? void cutTo(next) : void s.pause()), at: Date.now() };
    }, wait);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, s.connected, s.runStarted, s.paused, s.busy, lastTake?.id, shotSeconds, readyShots.length, s.log.length]);

  // Scenario runner: one steer per step on a timer.
  const [scenario, setScenario] = useState<{ id: string; step: number } | null>(null);
  const [stepSeconds, setStepSeconds] = useState(5);
  useEffect(() => {
    if (!scenario) return;
    const def = demo.scenarios?.find((x) => x.id === scenario.id);
    if (!def || !s.connected || !s.runStarted || scenario.step >= def.steps.length) {
      setScenario(null);
      return;
    }
    const timer = setTimeout(() => {
      s.steer(def.steps[scenario.step], `${def.label} ${scenario.step + 1}/${def.steps.length}`);
      setScenario({ id: scenario.id, step: scenario.step + 1 });
    }, scenario.step === 0 ? 0 : stepSeconds * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, s.connected, s.runStarted]);

  const live = s.connected && s.runStarted;
  const steerLive = (prompt: string, label: string) => {
    lastInteractAt.current = Date.now();
    s.steer(prompt, label);
  };

  // ---- realtime controller (D-pad / WASD / arrows / space) ----
  // Context controls: generated for the scene on screen (hero / each shot), cached server-side; static set until they arrive.
  const [sceneCtl, setSceneCtl] = useState<{ scene: string; controls: Control[] } | null>(null);
  useEffect(() => {
    const scene = s.scenePrompt;
    if (!controller || !scene || sceneCtl?.scene === scene) return;
    let stop = false;
    void fetch("/api/controls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scene, hint: demo.industry }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ controls: Control[] }>) : null))
      .then((d) => {
        if (!stop && d?.controls?.length === 5) setSceneCtl({ scene, controls: d.controls });
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.scenePrompt, controller]);
  const controls = controller ? (sceneCtl && sceneCtl.scene === s.scenePrompt ? sceneCtl.controls : CONTROLS[controller]) : null;
  const contextual = !!sceneCtl && sceneCtl.scene === s.scenePrompt;
  const [pressed, setPressed] = useState<string | null>(null);
  const fire = (c: Control) => {
    if (!live) return;
    setPressed(c.key);
    setTimeout(() => setPressed((p) => (p === c.key ? null : p)), 250);
    steerLive(c.prompt, `🎮 ${c.label}`);
  };
  useEffect(() => {
    if (!controls) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (document.querySelector(".ls-root")) return; // game mode has its own keys
      const k = ARROW_KEYS[e.key] ?? e.key.toLowerCase();
      const c = controls.find((x) => x.key === k);
      if (c) {
        e.preventDefault();
        fire(c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, live]);

  // ---- realtime input from the shopping page (swatches, paint, weather...) ----
  useEffect(() => {
    if (!externalSteer || !live) return;
    steerLive(externalSteer.prompt, externalSteer.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSteer?.id]);

  // ---- server pre-render: hero + shots rendered on the backend, picked up as they land ----
  const [prerender, setPrerender] = useState<{ status: string; shots: number; total: number } | null>(null);
  const shotsRef = useRef(shots);
  shotsRef.current = shots;
  const heroRef = useRef(hero);
  heroRef.current = hero;
  // Static demos: one pre-render per (subject, options) preset; Lifecast plans: one per plan.
  const prerenderId = demo.id.startsWith("omni-")
    ? demo.id
    : isUpload(subjectId)
      ? null
      : `${demo.id}~${subjectId}~${[...optionIds].sort().join("+")}`;
  const lastPrerenderId = useRef<string | null>(null);
  useEffect(() => {
    if (!prerenderId) {
      setPrerender(null);
      return;
    }
    // Selection changed: swap to that preset's pre-rendered scene (unless the user rendered their own).
    if (lastPrerenderId.current && lastPrerenderId.current !== prerenderId && heroSource.current !== "user") {
      heroSource.current = null;
      setHero(null);
      setShots({});
      setServerHeroPrompt(undefined);
      heroRef.current = null;
      shotsRef.current = {};
    }
    lastPrerenderId.current = prerenderId;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const r = await fetch(`/api/prerender/${encodeURIComponent(prerenderId)}`, { cache: "no-store" });
        if (!r.ok) return;
        const m = (await r.json()) as {
          status: string;
          total?: number;
          hero?: { url: string; model: string; prompt?: string };
          shots: Record<string, { url: string; model: string; cutPrompt?: string }>;
        };
        if (stopped) return;
        setPrerender({ status: m.status, shots: Object.keys(m.shots ?? {}).length, total: m.total ?? demo.shots.length });
        if (m.hero && !heroRef.current && heroSource.current !== "user") {
          const file = await urlToFile(m.hero.url, "hero.jpg");
          if (stopped || heroRef.current) return;
          heroSource.current = "prerender";
          setHero(file, `${m.hero.model} · prerendered`);
          setServerHeroPrompt(m.hero.prompt);
        }
        if (heroSource.current === "prerender") {
          for (const [id, v] of Object.entries(m.shots ?? {})) {
            const cur = shotsRef.current[id];
            if (cur?.status === "ready" || cur?.status === "loading") continue;
            const file = await urlToFile(v.url, `${id}.jpg`);
            if (stopped) return;
            setShots((c) => (c[id]?.status === "ready" ? c : { ...c, [id]: { status: "ready", still: { file, url: URL.createObjectURL(file), model: `${v.model} · prerendered` }, cutPrompt: v.cutPrompt } }));
          }
        }
        if (m.status === "running" || m.status === "queued") timer = setTimeout(tick, 3000);
      } catch {
        timer = setTimeout(tick, 5000);
      }
    };
    const start = setTimeout(() => void tick(), 250); // debounce rapid clicking through presets
    return () => {
      stopped = true;
      clearTimeout(start);
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prerenderId]);

  // ---- auto image-cut (Lifecast follow mode): cut to this page's hero once it's ready and the transition has played ----
  const autoLiveDone = useRef(false);
  useEffect(() => {
    if (!autoLive || autoLiveDone.current) return;
    const timer = setInterval(() => {
      if (autoLiveDone.current || !hero || !s.connected || s.busy || Date.now() < autoLive.after) return;
      autoLiveDone.current = true;
      void goLive(autoLive.label);
    }, 300);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLive, hero, s.connected, s.busy]);

  // ---- Lifecast game mode ----
  const [gameMode, setGameMode] = useState(Boolean(game?.autoStart));
  const [owned, setOwned] = useState<string[]>([]);
  const [budget, setBudget] = useState(game?.budget ?? 100_000);
  const journeyShots = demo.shots;
  const doneLabels = new Set(s.log.filter((e) => e.kind === "cut" || e.kind === "morph").map((e) => e.label));
  const lastShotLabel = s.log.find((e) => (e.kind === "cut" || e.kind === "morph") && e.label)?.label;
  const gameQuests: LifeSimQuest[] = [
    { id: "start", label: "▶ Start your life", done: s.log.some((e) => e.kind === "take"), current: !s.log.some((e) => e.kind === "take") },
    ...journeyShots.map((x) => ({
      id: x.id,
      label: x.label,
      done: doneLabels.has(x.label),
      current: lastShotLabel === x.label,
    })),
  ];
  const playShot = (x: DemoShot) => {
    const st = shots[x.id];
    if (st?.status === "ready") {
      if (live) void cutTo(x);
      else void cutTo(x);
    } else if (st?.status !== "loading") {
      void generateShot(x);
    }
  };
  const gameActions: LifeSimAction[] = [
    {
      id: "start",
      label: !s.connected || !hero ? (heroBusy || s.busy ? "Getting ready…" : "Get ready") : live ? "Back to start" : "▶ Start your life",
      group: "Journey",
      hotkey: "0",
      run: () => {
        // Connect (cold GPU can take minutes) and render the hero in parallel; press again to go live.
        if (!s.connected && !s.busy) void s.connectSession();
        if (!hero && !heroBusy) void generateHero();
        if (s.connected && hero && !s.busy) void goLive();
      },
    },
    ...journeyShots.map((x, i) => ({
      id: `shot-${x.id}`,
      label: shots[x.id]?.status === "ready" ? x.label : shots[x.id]?.status === "loading" ? `${x.label} (rendering)` : `${x.label} (render)`,
      group: "Journey",
      hotkey: String(i + 1),
      run: () => playShot(x),
    })),
    ...demo.chips
      .filter((c) => c.group !== "Where to go")
      .map((c) => ({ id: `chip-${c.group}-${c.label}`, label: c.label, group: c.group, run: () => steerLive(c.prompt, c.label) })),
  ];
  const gameEvents: LifeSimEvent[] = useMemo(() => {
    const pool = demo.chips.filter((c) => c.group !== "Camera" && c.group !== "Where to go");
    const out: LifeSimEvent[] = [];
    for (let i = 0; i + 1 < pool.length; i += 2) {
      const a = pool[i];
      const b = pool[i + 1];
      out.push({
        id: `ev-${i}`,
        title: `🎲 Life happens: ${a.label} or ${b.label}?`,
        choices: [
          { label: a.label, run: () => s.steer(a.prompt, `Event: ${a.label}`) },
          { label: b.label, run: () => s.steer(b.prompt, `Event: ${b.label}`) },
        ],
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.chips, s.steer]);
  const gameInventory: LifeSimItem[] = (game?.inventory ?? []).map((it) => ({ ...it, owned: owned.includes(it.id) }));

  const chipGroups = useMemo(() => {
    const groups = new Map<string, typeof demo.chips>();
    // Text steering is only for minor touches; scene-level "Where to go" moves are image cuts instead.
    for (const chip of demo.chips.filter((c) => c.group !== "Where to go")) groups.set(chip.group, [...(groups.get(chip.group) ?? []), chip]);
    return [...groups.entries()];
  }, [demo]);

  return (
    <main className="studio" style={{ ["--accent" as string]: demo.accent }}>
      <header className={`studio-header ${compact ? "compact" : ""}`}>
        <div>
          {!compact && <Link href="/" className="back">← All demos</Link>}
          <h1>{demo.title}</h1>
          <p className="tagline">
            <span className="industry">{demo.industry}</span> {!compact && demo.tagline}
          </p>
        </div>
        <ConnectionBar s={s} compact={compact} />
      </header>
      {banner}

      <div className={`studio-grid ${compact ? "demo-mode" : ""}`}>
        <section className="stage-col">
          {gameMode && game ? (
            <LifeSimHud
              title={game.title}
              player={{ name: game.playerName ?? "You", avatarUrl: game.avatarUrl }}
              live={live}
              connected={s.connected}
              busy={s.busy || writing || (s.pendingSteer ? `Queued: ${s.pendingSteer}` : "")}
              quests={gameQuests}
              inventory={gameInventory}
              onToggleOwned={(id) => setOwned((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))}
              budget={budget}
              onBudgetChange={setBudget}
              actions={gameActions}
              events={gameEvents}
              log={s.log}
              onExit={() => setGameMode(false)}
            >
              <Player s={s} hero={hero} compact={compact} />
            </LifeSimHud>
          ) : (
            <Player s={s} hero={hero} compact={compact} />
          )}
          {controls && !gameMode && (
            <div className={`controller ${live ? "" : "off"}`}>
              <span className="ctl-title">
                {live ? (contextual ? "✨ Controls for this scene" : "Drive it live") : "Go live to drive"} · WASD / arrows / space
              </span>
              <div className="dpad">
                {controls.map((c) => (
                  <button
                    key={c.key}
                    className={`ctl ctl-${c.key === " " ? "space" : c.key} ${pressed === c.key ? "pressed" : ""}`}
                    disabled={!live}
                    onClick={() => fire(c)}
                  >
                    <b>{c.arrow}</b>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {game && !gameMode && (
            <button className="primary game-launch" onClick={() => setGameMode(true)}>
              🎮 Play your life (game mode)
            </button>
          )}

          <div className="transport">
            <button disabled={!live || s.paused || !!s.busy} onClick={s.pause}>Pause</button>
            <button disabled={!live || !s.paused || !!s.busy} onClick={s.resume}>Resume</button>
            {!compact && <button disabled={!live || !!s.busy} onClick={s.reset}>Reset</button>}
            <button onClick={s.toggleMuted}>{s.muted ? "🔇 Sound off" : "🔊 Sound on"}</button>
            <span className="spacer" />
            <button disabled={!live || !!s.busy} onClick={() => s.exportClip(10, `${demo.id}-${Date.now()}.mp4`)}>
              Export last 10s
            </button>
            <button disabled={!live || !!s.busy} onClick={() => s.exportClip(30, `${demo.id}-${Date.now()}.mp4`)}>
              30s
            </button>
          </div>

          <section className="panel">
            <div className="panel-head">
              <h2>Shot board</h2>
              {!compact && prerender && prerender.status !== "unknown" && (
                <span className={`prerender-badge prerender-${prerender.status}`}>
                  {prerender.status === "done"
                    ? `⚡ pre-rendered ${prerender.shots}/${prerender.total}`
                    : prerender.status === "needs-photo"
                      ? "upload your photo to pre-render"
                      : `⏳ server rendering ${prerender.shots}/${prerender.total}`}
                </span>
              )}
              {compact ? (
                <p className="hint">✂ Cut = hard cut to that scene (new image). Scenes auto-cut every few seconds.</p>
              ) : (
              <p className="hint">
                Frontier image model renders new angles and scenarios from the hero still.
                <b> Cut</b> restarts Orbis from the shot image (true image steer).
                <b> Morph</b> steers the running stream toward it with text (no cut).
              </p>
              )}
            </div>
            {!compact && (
            <div className="shot-actions">
              <button disabled={!hero} onClick={generateAllShots}>Generate shot list</button>
              <input
                value={customShotText}
                placeholder="Custom shot, e.g. 'close-up of her hands zipping the jacket'"
                onChange={(e) => setCustomShotText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomShot()}
                disabled={!hero}
              />
              <button disabled={!hero || !customShotText.trim()} onClick={addCustomShot}>Add shot</button>
            </div>
            )}
            <div className="shot-grid">
              {hero && (
                <figure className="shot hero-shot">
                  <img src={hero.url} alt="Hero still" />
                  <figcaption>
                    <strong>Hero</strong>
                    <span className="model">{hero.model}</span>
                  </figcaption>
                  <div className="shot-buttons">
                    <button disabled={!s.connected || !!s.busy || !!writing} onClick={() => goLive()}>
                      {live ? "Cut to hero" : "▶ Go live"}
                    </button>
                    {demo.multiSubject && <button onClick={heroToBoard} title="Add to shot board">＋</button>}
                  </div>
                </figure>
              )}
              {allShots.map((shot) => {
                const st = shots[shot.id];
                return (
                  <figure key={shot.id} className={`shot shot-${st?.status ?? "idle"}`}>
                    {st?.still ? (
                      <img src={st.still.url} alt={shot.label} />
                    ) : (
                      <button
                        className="shot-placeholder"
                        disabled={!hero || st?.status === "loading"}
                        onClick={() => generateShot(shot)}
                        title={st?.error ?? shot.instruction}
                      >
                        {st?.status === "loading" ? "Rendering…" : st?.status === "error" ? "Retry" : "Render"}
                      </button>
                    )}
                    <figcaption>
                      <strong>{shot.label}</strong>
                      {st?.still?.model && <span className="model">{st.still.model}</span>}
                    </figcaption>
                    {st?.status === "ready" && (
                      <div className="shot-buttons">
                        <button disabled={!s.connected || !!s.busy} onClick={() => cutTo(shot)}>✂ Cut</button>
                      </div>
                    )}
                  </figure>
                );
              })}
            </div>
            <div className="autoplay">
              <label>
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => {
                    autoIndex.current = 0;
                    setAutoplay(e.target.checked);
                  }}
                />
                Auto-cut: each scene runs
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={shotSeconds}
                onChange={(e) => setShotSeconds(Math.min(60, Math.max(5, Number(e.target.value) || 10)))}
              />
              s, then cuts to the next shot. Steering restarts the countdown.
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Direct live</h2>
              <p className="hint">One change per direction; it lands at the next chunk (~2–4 s).</p>
            </div>
            {/* text "story" sequences removed: scene changes are image cuts (shot board / auto-cut) */}
            <div className="chip-groups">
              {chipGroups.map(([group, chips]) => (
                <div key={group} className="chip-group">
                  <span className="chip-label">{group}</span>
                  {chips.map((chip) => (
                    <button key={chip.label} className="chip" disabled={!live} onClick={() => steerLive(chip.prompt, chip.label)}>
                      {chip.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="direction-row">
              <input
                value={direction}
                placeholder={rawMode ? "Raw Orbis prompt" : "Say it like a director: 'make it feel like sunset and have her look back'"}
                onChange={(e) => setDirection(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendDirection()}
                disabled={!live}
              />
              <button disabled={!live || !direction.trim() || !!writing} onClick={sendDirection}>Direct</button>
              {!compact && (
                <label className="raw-toggle">
                  <input type="checkbox" checked={rawMode} onChange={(e) => setRawMode(e.target.checked)} /> raw
                </label>
              )}
            </div>
            {/* text live-swap removed (big changes must be image cuts) */}
            {false && demo.options.filter((o) => o.id !== "you").length > 0 && (
              <div className="swap-row">
                <span className="chip-label">Live swap · {demo.optionLabel}</span>
                {demo.options.filter((o) => o.id !== "you").map((o) => (
                  <button key={o.id} className="swap" disabled={!live || !!writing} onClick={() => swapOption(o.id)}>
                    {o.src && <img src={o.src} alt="" />}
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            {(writing || s.pendingSteer) && (
              <p className="pending">{writing || `Queued: ${s.pendingSteer}`}</p>
            )}
          </section>
        </section>

        {!compact && (
        <aside className="side-col">
          <section className="panel">
            <div className="panel-head">
              <h2>1 · Setup</h2>
            </div>
            <h3>{demo.subjectLabel}</h3>
            <div className="thumb-row">
              {allSubjects.map((subject) => (
                <button
                  key={subject.id}
                  className={`thumb ${(demo.multiSubject ? subjectIds.includes(subject.id) : subjectId === subject.id) ? "selected" : ""} ${subjectId === subject.id ? "focused" : ""}`}
                  onClick={() => pickSubject(subject.id)}
                >
                  <img src={subject.src} alt={subject.label} />
                  <span>{subject.label}</span>
                </button>
              ))}
              <label className="thumb upload">
                <span className="plus">＋</span>
                <span>{demo.uploadLabel ?? "Upload photos"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    addUploads(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {demo.multiSubject && (
              <div className="button-row">
                <button disabled={subjectIds.length === 0} onClick={subjectsToBoard}>
                  {demo.boardRendersSubjects ? "Furnish" : "Put"} {subjectIds.length} selected on shot board
                </button>
              </div>
            )}
            {demo.subjectFromText && (
              <div className="direction-row text-subject">
                <input
                  value={subjectText}
                  placeholder={demo.subjectFromText.placeholder}
                  onChange={(e) => setSubjectText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && subjectText.trim() && generateHero(subjectText.trim())}
                />
                <button disabled={heroBusy || !subjectText.trim()} onClick={() => generateHero(subjectText.trim())}>
                  Render
                </button>
              </div>
            )}
            <h3>
              {demo.optionLabel} {demo.multiOption && <span className="hint">(shift-click to combine)</span>}
            </h3>
            <div className="thumb-row options">
              {demo.options.map((o) => (
                <button
                  key={o.id}
                  className={`thumb small ${optionIds.includes(o.id) ? "selected" : ""}`}
                  onClick={(e) => toggleOption(o.id, e.shiftKey || e.metaKey || e.ctrlKey)}
                  title={o.text}
                >
                  {o.src ? <img src={o.src} alt={o.label} /> : <span className="swatch">{o.label[0]}</span>}
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
            <input
              className="full"
              value={custom}
              placeholder="Extra direction for the hero still (optional)"
              onChange={(e) => setCustom(e.target.value)}
            />
            <div className="button-row">
              <button className="primary" disabled={heroBusy} onClick={() => generateHero()}>
                {heroBusy ? "Rendering hero still…" : "2 · Render hero still"}
              </button>
              <button disabled={heroBusy} onClick={useSubjectAsHero}>Use photo as-is</button>
            </div>
            <label className="fast-toggle">
              <input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} />
              Fast mode (Nano Banana Flash instead of Pro)
            </label>
            {setupError && <p className="error">{setupError}</p>}
          </section>

          <section className="panel log-panel">
            <div className="panel-head">
              <h2>Take log</h2>
            </div>
            {s.error && <p className="error">{s.error}</p>}
            <ol className="log">
              {s.log.map((entry) => (
                <li key={entry.id} className={`log-${entry.kind}`}>
                  {entry.imageUrl && <img src={entry.imageUrl} alt="" />}
                  <div>
                    <span className="log-kind">
                      {entry.kind}
                      {entry.label ? ` · ${entry.label}` : ""}
                    </span>
                    <p>{entry.text}</p>
                  </div>
                </li>
              ))}
              {s.log.length === 0 && <li className="hint">Directions and cuts will appear here.</li>}
            </ol>
          </section>
        </aside>
        )}
      </div>
    </main>
  );
}

function ConnectionBar({ s, compact }: { s: OrbisStudio; compact?: boolean }) {
  const mm = String(Math.floor(s.connectedSeconds / 60)).padStart(2, "0");
  const ss = String(s.connectedSeconds % 60).padStart(2, "0");
  return (
    <div className="connection">
      <span className={`dot dot-${s.status}`} /> <span className="status-text">{s.status}</span>
      {s.connected && !compact && (
        <span className="meter">
          {mm}:{ss} · ${s.costUsd.toFixed(2)}
          {s.idleSecondsLeft < 90 && ` · idle off in ${s.idleSecondsLeft}s`}
        </span>
      )}
      {s.connected ? (
        <button onClick={s.disconnectSession}>Disconnect</button>
      ) : compact ? null : (
        <button className="primary" disabled={!!s.busy || s.status !== "disconnected"} onClick={s.connectSession}>
          Connect Orbis
        </button>
      )}
    </div>
  );
}

function Player({ s, hero, compact }: { s: OrbisStudio; hero: Still | null; compact?: boolean }) {
  return (
    <div className="player">
      {s.connected && s.runStarted ? (
        <>
          <ReactorView track="main_video" audioTrack="main_audio" muted={s.muted} videoObjectFit="cover" />
          {s.priming && <img key={s.priming} className="priming-still" src={s.priming} alt="" />}
        </>
      ) : hero ? (
        <img className="player-still" src={hero.url} alt="Hero still" />
      ) : (
        <div className="player-placeholder">
          {compact
            ? s.status === "connecting" || s.status === "waiting"
              ? "Warming up the live model…"
              : "Setting the scene…"
            : s.connected
              ? "Render a hero still, then Go live"
              : "Connect Orbis early: a cold GPU can take a few minutes"}
        </div>
      )}
      <div className="hud">
        {s.runStarted && <span className="live-badge">● LIVE</span>}
        {s.runStarted && (
          <span>
            chunk {s.telemetry.chunk}
            {s.telemetry.resolution ? ` · ${s.telemetry.resolution}` : ""}
            {s.telemetry.fps ? ` · ${s.telemetry.fps}fps` : ""}
          </span>
        )}
        {s.busy && <span className="busy">{s.busy}</span>}
        {s.latency && s.runStarted && Date.now() - s.latency.at < 8000 && (
          <span key={s.latency.at} className="latency">
            ↯ {s.latency.kind === "steer" ? "steered" : "cut"} in {(s.latency.ms / 1000).toFixed(1)}s
          </span>
        )}
      </div>
    </div>
  );
}
