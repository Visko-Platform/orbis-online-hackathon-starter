"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Public types                                                        */
/* ------------------------------------------------------------------ */

export type LifeSimAction = {
  id: string;
  label: string; // e.g. "Ride the gondola"
  group: string; // e.g. "Where to go" | "Action" | "Conditions" | "Camera" | "Journey"
  hotkey?: string; // single key like "1", "q", "z"; auto-assigned if missing
  run: () => void;
};
export type LifeSimQuest = { id: string; label: string; done: boolean; current: boolean };
export type LifeSimItem = {
  id: string;
  name: string;
  kind: "apparel" | "travel" | "real_estate" | "auto" | string;
  price?: number; // USD; may be missing
  imageUrl?: string;
  owned: boolean;
};
export type LifeSimEvent = {
  id: string;
  title: string; // e.g. "A blizzard rolls in!"
  choices: { label: string; run: () => void }[]; // 2 choices
};
export type LifeSimLogEntry = { id: number; kind: string; label?: string; text: string; at: number };
// kinds used: "take", "cut", "steer", "morph", "system", "error"

export type LifeSimProps = {
  title: string;
  player: { name: string; avatarUrl?: string };
  live: boolean;
  connected: boolean;
  busy?: string;
  quests: LifeSimQuest[];
  inventory: LifeSimItem[];
  onToggleOwned: (id: string) => void;
  budget: number;
  onBudgetChange: (usd: number) => void;
  actions: LifeSimAction[];
  events: LifeSimEvent[];
  log: LifeSimLogEntry[]; // newest first
  onExit: () => void;
  children: ReactNode;
};

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const XP_BY_KIND: Record<string, number> = { take: 50, cut: 30, steer: 10, morph: 15 };
const XP_LABEL: Record<string, string> = { take: "New take", cut: "Cut", steer: "Direction", morph: "Morph" };
const XP_PER_LEVEL = 150;
const xpFor = (kind: string): number => XP_BY_KIND[kind] ?? 0;

const KIND_ICON: Record<string, string> = { apparel: "👕", travel: "🏔", real_estate: "🏠", auto: "🚗" };
const kindIcon = (kind: string): string => KIND_ICON[kind] ?? "🛍";

const ROW_KEYS = [
  ["q", "w", "e", "r", "t"],
  ["a", "s", "d", "f", "g"],
  ["z", "x", "c", "v", "b"],
];
const JOURNEY_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const SPARE_KEYS = [...ROW_KEYS.flat(), "y", "u", "i", "o", "p", "h", "j", "k", "l", "n", "m", ...JOURNEY_KEYS, "0"];
const RESERVED_KEYS = new Set([" ", "[", "]", "escape"]);

const EVENT_MIN_MS = 35_000;
const EVENT_SPREAD_MS = 20_000; // 35–55 s
const EVENT_TTL_MS = 12_000;
const TOAST_TTL_MS = 4_000;
const POPUP_TTL_MS = 1_600;
const LEVELUP_TTL_MS = 2_400;
const PRESS_MS = 180;

const usdFull = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});
function money(n: number): string {
  return Math.abs(n) >= 100_000 ? usdCompact.format(n) : usdFull.format(n);
}

function truncate(s: string, max = 18): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function keyLabel(k: string): string {
  return k.length === 1 ? k.toUpperCase() : k;
}

function isJourney(group: string): boolean {
  return group.trim().toLowerCase() === "journey";
}

type KeyedAction = { action: LifeSimAction; key?: string; index: number };

/** Explicit hotkeys win; then Journey → 1..9; groups 1–3 → qwert / asdfg / zxcvb; leftovers from a spare pool. */
function assignHotkeys(actions: LifeSimAction[]): KeyedAction[] {
  const keys: (string | undefined)[] = new Array(actions.length).fill(undefined);
  const used = new Set<string>();
  const take = (pool: string[], i: number) => {
    const k = pool.find((p) => !used.has(p));
    if (k) {
      keys[i] = k;
      used.add(k);
    }
  };

  actions.forEach((a, i) => {
    const k = a.hotkey?.trim().toLowerCase();
    if (k && !RESERVED_KEYS.has(k) && !used.has(k)) {
      keys[i] = k;
      used.add(k);
    }
  });

  actions.forEach((a, i) => {
    if (keys[i] === undefined && isJourney(a.group)) take(JOURNEY_KEYS, i);
  });

  const otherGroups: string[] = [];
  for (const a of actions) if (!isJourney(a.group) && !otherGroups.includes(a.group)) otherGroups.push(a.group);
  otherGroups.slice(0, ROW_KEYS.length).forEach((g, gi) => {
    actions.forEach((a, i) => {
      if (keys[i] === undefined && a.group === g) take(ROW_KEYS[gi], i);
    });
  });

  actions.forEach((_, i) => {
    if (keys[i] === undefined) take(SPARE_KEYS, i);
  });

  return actions.map((action, index) => ({ action, key: keys[index], index }));
}

/** Keeps a ref pointing at the latest value (updated after commit). */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** Calls fn once after ms; timer is owned by the calling component and cleared on unmount. */
function useTimeout(fn: () => void, ms: number) {
  const fnRef = useLatest(fn);
  useEffect(() => {
    const t = window.setTimeout(() => fnRef.current(), ms);
    return () => window.clearTimeout(t);
  }, [ms, fnRef]);
}

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

type AchStats = {
  takes: number;
  steers: number;
  cuts: number;
  ownedCount: number;
  ownedTotal: number;
  budget: number;
  allQuestsDone: boolean;
  level: number;
};
type Achievement = { id: string; icon: string; title: string; desc: string; test: (s: AchStats) => boolean };

const ACHIEVEMENTS: Achievement[] = [
  { id: "first-take", icon: "🎬", title: "Lights, camera, life!", desc: "Rolled your first take.", test: (s) => s.takes >= 1 },
  { id: "director", icon: "🎥", title: "Director", desc: "Steered your life 5 times.", test: (s) => s.steers >= 5 },
  { id: "smash-cut", icon: "✂️", title: "Smash cut", desc: "Cut to your first new shot.", test: (s) => s.cuts >= 1 },
  { id: "shopaholic", icon: "🛍️", title: "Shopaholic", desc: "Own 3 items.", test: (s) => s.ownedCount >= 3 },
  {
    id: "smart-shopper",
    icon: "💰",
    title: "Smart shopper",
    desc: "Bought in and stayed within budget.",
    test: (s) => s.ownedCount > 0 && s.ownedTotal <= s.budget,
  },
  { id: "quest-complete", icon: "🏆", title: "Quest complete", desc: "Finished every step of the journey.", test: (s) => s.allQuestsDone },
  { id: "level-3", icon: "⭐", title: "Level 3", desc: "Reached level 3.", test: (s) => s.level >= 3 },
];

/* ------------------------------------------------------------------ */
/* Small self-expiring pieces (timers live in their own effects)       */
/* ------------------------------------------------------------------ */

function XpPopup({ amount, label, onDone }: { amount: number; label: string; onDone: () => void }) {
  useTimeout(onDone, POPUP_TTL_MS);
  return (
    <div className="ls-xp-popup" aria-hidden="true">
      +{amount} XP{label ? <span> · {label}</span> : null}
    </div>
  );
}

function AchievementToast({ ach, delay, onDone }: { ach: Achievement; delay: number; onDone: () => void }) {
  useTimeout(onDone, TOAST_TTL_MS + delay);
  return (
    <div className="ls-toast" role="status" style={{ animationDelay: `${delay}ms` }}>
      <div className="ls-toast-icon" aria-hidden="true">
        {ach.icon}
      </div>
      <div className="ls-toast-body">
        <div className="ls-micro ls-toast-kicker">Achievement unlocked</div>
        <div className="ls-toast-title">{ach.title}</div>
        <div className="ls-toast-desc">{ach.desc}</div>
      </div>
    </div>
  );
}

function LevelUpBanner({ level, onDone }: { level: number; onDone: () => void }) {
  useTimeout(onDone, LEVELUP_TTL_MS);
  return (
    <div className="ls-levelup" role="status">
      <span className="ls-levelup-star" aria-hidden="true">
        ★
      </span>
      Level up · LV {level}
    </div>
  );
}

function EventCard({
  event,
  onChoose,
  onDismiss,
}: {
  event: LifeSimEvent;
  onChoose: (index: number) => void;
  onDismiss: () => void;
}) {
  useTimeout(onDismiss, EVENT_TTL_MS);
  const glyphs = ["[", "]"];
  return (
    <div className="ls-event ls-glass" role="dialog" aria-label="Life event">
      <div className="ls-event-head">
        <span className="ls-micro ls-event-kicker">⚡ Life event</span>
        <button type="button" className="ls-event-close" onClick={onDismiss} aria-label="Dismiss event">
          ✕
        </button>
      </div>
      <div className="ls-event-title">{event.title}</div>
      <div className="ls-event-choices">
        {event.choices.map((c, i) => (
          <button key={`${i}-${c.label}`} type="button" className="ls-event-choice" onClick={() => onChoose(i)}>
            {glyphs[i] ? <kbd className="ls-kbd">{glyphs[i]}</kbd> : null}
            <span>{c.label}</span>
          </button>
        ))}
      </div>
      <div className="ls-event-timer" style={{ animationDuration: `${EVENT_TTL_MS}ms` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HUD                                                                 */
/* ------------------------------------------------------------------ */

export function LifeSimHud(props: LifeSimProps): JSX.Element {
  const {
    title,
    player,
    live,
    connected,
    busy,
    quests,
    inventory,
    onToggleOwned,
    budget,
    onBudgetChange,
    actions,
    events,
    log,
    onExit,
    children,
  } = props;

  /* ---------- derived stats ---------- */
  const stats = useMemo(() => {
    let xp = 0;
    let takes = 0;
    let cuts = 0;
    let steers = 0;
    for (const e of log) {
      xp += xpFor(e.kind);
      if (e.kind === "take") takes++;
      else if (e.kind === "cut") cuts++;
      else if (e.kind === "steer") steers++;
    }
    return { xp, takes, cuts, steers };
  }, [log]);
  const level = Math.floor(stats.xp / XP_PER_LEVEL) + 1;
  const xpInto = stats.xp % XP_PER_LEVEL;

  const ownedItems = inventory.filter((i) => i.owned);
  const ownedTotal = ownedItems.reduce((sum, i) => sum + (i.price ?? 0), 0);
  const overBudget = ownedTotal > budget;
  const spendPct = budget > 0 ? Math.min(1, ownedTotal / budget) : ownedTotal > 0 ? 1 : 0;

  const questsDone = quests.filter((q) => q.done).length;
  const allQuestsDone = quests.length > 0 && questsDone === quests.length;

  const keyed = useMemo(() => assignHotkeys(actions), [actions]);
  const groups = useMemo(() => {
    const out: { name: string; items: KeyedAction[] }[] = [];
    for (const k of keyed) {
      let g = out.find((x) => x.name === k.action.group);
      if (!g) {
        g = { name: k.action.group, items: [] };
        out.push(g);
      }
      g.items.push(k);
    }
    return out;
  }, [keyed]);

  /* ---------- XP popups ---------- */
  const [popups, setPopups] = useState<{ id: number; amount: number; label: string }[]>([]);
  const newestIdRef = useRef<number | null>(log[0]?.id ?? null);
  const popSeq = useRef(0);
  useEffect(() => {
    const newest = log[0]?.id ?? null;
    const prev = newestIdRef.current;
    if (newest === prev) return;
    newestIdRef.current = newest;
    if (newest === null) return;
    let amount = 0;
    let label = "";
    for (let i = 0; i < log.length && i < 12; i++) {
      const e = log[i];
      if (e.id === prev) break;
      if (e.kind === "system" || e.kind === "error") continue;
      const x = xpFor(e.kind);
      if (x > 0) {
        amount += x;
        if (!label) label = XP_LABEL[e.kind] ?? "";
      }
    }
    if (amount <= 0) return;
    const id = ++popSeq.current;
    setPopups((p) => [...p.slice(-3), { id, amount, label }]);
  }, [log]);
  const removePopup = useCallback((id: number) => setPopups((p) => p.filter((x) => x.id !== id)), []);

  /* ---------- level up ---------- */
  const prevLevelRef = useRef(level);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  useEffect(() => {
    if (level > prevLevelRef.current) setLevelUp(level);
    prevLevelRef.current = level;
  }, [level]);

  /* ---------- achievements ---------- */
  const awardedRef = useRef(new Set<string>());
  const toastSeq = useRef(0);
  const [toasts, setToasts] = useState<{ key: number; ach: Achievement; delay: number }[]>([]);
  useEffect(() => {
    const s: AchStats = {
      takes: stats.takes,
      steers: stats.steers,
      cuts: stats.cuts,
      ownedCount: ownedItems.length,
      ownedTotal,
      budget,
      allQuestsDone,
      level,
    };
    const fresh = ACHIEVEMENTS.filter((a) => !awardedRef.current.has(a.id) && a.test(s));
    if (!fresh.length) return;
    for (const a of fresh) awardedRef.current.add(a.id);
    const items = fresh.map((ach, i) => ({ key: ++toastSeq.current, ach, delay: i * 350 }));
    setToasts((t) => [...t, ...items].slice(-4));
  }, [stats.takes, stats.steers, stats.cuts, ownedItems.length, ownedTotal, budget, allQuestsDone, level]);
  const removeToast = useCallback((key: number) => setToasts((t) => t.filter((x) => x.key !== key)), []);

  /* ---------- random life events ---------- */
  const eventsRef = useLatest(events);
  const [activeEvent, setActiveEvent] = useState<{ seq: number; event: LifeSimEvent } | null>(null);
  const activeEventRef = useLatest(activeEvent);
  const lastEventIdRef = useRef<string | null>(null);
  const eventSeq = useRef(0);
  useEffect(() => {
    if (!live) return;
    let timer: number | undefined;
    const fire = () => {
      if (activeEventRef.current) return;
      const pool = eventsRef.current;
      if (!pool.length) return;
      const candidates = pool.length > 1 ? pool.filter((e) => e.id !== lastEventIdRef.current) : pool;
      const event = candidates[Math.floor(Math.random() * candidates.length)];
      lastEventIdRef.current = event.id;
      setActiveEvent({ seq: ++eventSeq.current, event });
    };
    const schedule = () => {
      timer = window.setTimeout(() => {
        fire();
        schedule();
      }, EVENT_MIN_MS + Math.random() * EVENT_SPREAD_MS);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [live, eventsRef, activeEventRef]);

  const dismissEvent = useCallback(() => setActiveEvent(null), []);
  const chooseEvent = useCallback(
    (index: number) => {
      const current = activeEventRef.current;
      if (!current) return;
      // Prefer the latest version of the event (fresh closures) if the pool was re-rendered.
      const fresh = eventsRef.current.find((e) => e.id === current.event.id) ?? current.event;
      const choice = fresh.choices[index] ?? current.event.choices[index];
      setActiveEvent(null);
      choice?.run();
    },
    [activeEventRef, eventsRef],
  );

  /* ---------- pressed key feedback ---------- */
  const [pressed, setPressed] = useState<{ index: number; seq: number } | null>(null);
  const pressSeq = useRef(0);
  useEffect(() => {
    if (!pressed) return;
    const t = window.setTimeout(() => setPressed(null), PRESS_MS);
    return () => window.clearTimeout(t);
  }, [pressed]);
  const fireAction = useCallback((k: KeyedAction) => {
    setPressed({ index: k.index, seq: ++pressSeq.current });
    k.action.run();
  }, []);

  /* ---------- side panels (narrow layout drawers) ---------- */
  const [panel, setPanel] = useState<"quests" | "inventory" | null>(null);
  const togglePanel = (p: "quests" | "inventory") => setPanel((cur) => (cur === p ? null : p));

  /* ---------- budget editor ---------- */
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");
  const openBudgetEditor = () => {
    setBudgetDraft(String(budget));
    setEditingBudget(true);
  };
  const commitBudget = () => {
    const n = Number(budgetDraft);
    if (budgetDraft.trim() !== "" && Number.isFinite(n) && n >= 0) onBudgetChange(Math.round(n));
    setEditingBudget(false);
  };

  /* ---------- global hotkeys ---------- */
  const keyHandlerRef = useLatest((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target instanceof HTMLElement ? e.target : null;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    const key = e.key.toLowerCase();

    if (key === "escape") {
      e.preventDefault();
      if (panel) setPanel(null);
      else onExit();
      return;
    }
    if (e.shiftKey || e.repeat) return;

    if (key === " ") {
      // Reserved: no-op. Avoid page scroll, but let focused buttons keep their native Space behavior.
      if (!target || !target.closest("button, a, [role='button']")) e.preventDefault();
      return;
    }
    if (key === "[" || key === "]") {
      if (activeEvent) {
        e.preventDefault();
        chooseEvent(key === "[" ? 0 : 1);
      }
      return;
    }
    const hit = keyed.find((k) => k.key === key);
    if (hit) {
      e.preventDefault();
      fireAction(hit);
    }
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyHandlerRef]);

  /* ---------- render ---------- */
  const initial = (player.name.trim()[0] ?? "?").toUpperCase();
  const statusText = live ? "Live" : connected ? "Paused" : "Offline";

  return (
    <div className="ls-root" role="region" aria-label="Life simulation game">
      {/* Game viewport */}
      <div className="ls-viewport">
        <div className="ls-screen">{children}</div>
        <div className="ls-vignette" aria-hidden="true" />
        <div className="ls-corner ls-corner-tl" aria-hidden="true" />
        <div className="ls-corner ls-corner-tr" aria-hidden="true" />
        <div className="ls-corner ls-corner-bl" aria-hidden="true" />
        <div className="ls-corner ls-corner-br" aria-hidden="true" />
      </div>

      <div className="ls-hud">
        {/* ---------- top bar ---------- */}
        <div className="ls-top">
          <div className="ls-top-left">
            <div className="ls-player ls-glass">
              <div className="ls-avatar">
                {player.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.avatarUrl} alt="" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <div className="ls-player-info">
                <div className="ls-player-row">
                  <span className="ls-player-name" title={player.name}>
                    {player.name}
                  </span>
                  <span className="ls-level" title={`${stats.xp} XP total`}>
                    LV {level}
                  </span>
                </div>
                <div
                  className="ls-xpbar"
                  role="progressbar"
                  aria-label="Experience to next level"
                  aria-valuemin={0}
                  aria-valuemax={XP_PER_LEVEL}
                  aria-valuenow={xpInto}
                >
                  <div className="ls-xpbar-fill" style={{ width: `${(xpInto / XP_PER_LEVEL) * 100}%` }} />
                </div>
                <div className="ls-micro ls-xp-text">
                  {xpInto} / {XP_PER_LEVEL} XP
                </div>
              </div>
              <div className="ls-xp-popups">
                {popups.map((p) => (
                  <XpPopup key={p.id} amount={p.amount} label={p.label} onDone={() => removePopup(p.id)} />
                ))}
              </div>
            </div>

            <div className="ls-toggles">
              <button
                type="button"
                className={`ls-toggle${panel === "quests" ? " ls-toggle--on" : ""}`}
                onClick={() => togglePanel("quests")}
                aria-expanded={panel === "quests"}
              >
                📜 Quests {questsDone}/{quests.length}
              </button>
              <button
                type="button"
                className={`ls-toggle${panel === "inventory" ? " ls-toggle--on" : ""}`}
                onClick={() => togglePanel("inventory")}
                aria-expanded={panel === "inventory"}
              >
                🎒 Bag {ownedItems.length}/{inventory.length}
              </button>
            </div>
          </div>

          <div className="ls-top-center">
            <div className="ls-title-card ls-glass">
              <div className="ls-micro">Now simulating</div>
              <div className="ls-title" title={title}>
                {title}
              </div>
              <div className={`ls-status ls-status--${statusText.toLowerCase()}`}>
                <span className="ls-status-dot" aria-hidden="true" />
                {statusText}
              </div>
              {busy ? (
                <div className="ls-busy">
                  <span className="ls-spinner" aria-hidden="true" />
                  {busy}
                </div>
              ) : null}
            </div>
            {levelUp !== null ? (
              <LevelUpBanner key={levelUp} level={levelUp} onDone={() => setLevelUp(null)} />
            ) : null}
          </div>

          <div className="ls-top-right">
            <button type="button" className="ls-exit" onClick={onExit} title="Leave game mode (Esc)">
              ✕ Exit game
            </button>
            <div className={`ls-wallet ls-glass${overBudget ? " ls-wallet--over" : ""}`}>
              <div className="ls-wallet-row">
                <span className="ls-micro">Budget</span>
                {editingBudget ? (
                  <input
                    className="ls-budget-input"
                    type="number"
                    min={0}
                    step={1000}
                    value={budgetDraft}
                    autoFocus
                    aria-label="Budget in USD"
                    onChange={(e) => setBudgetDraft(e.target.value)}
                    onBlur={commitBudget}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitBudget();
                      else if (e.key === "Escape") {
                        e.stopPropagation();
                        setEditingBudget(false);
                      }
                    }}
                  />
                ) : (
                  <button type="button" className="ls-budget" onClick={openBudgetEditor} title="Edit budget">
                    {money(budget)} <span className="ls-edit" aria-hidden="true">✎</span>
                  </button>
                )}
              </div>
              <div className="ls-wallet-row">
                <span className="ls-micro">Owned</span>
                <span className="ls-owned-total">{money(ownedTotal)}</span>
              </div>
              <div className="ls-wallet-bar" aria-hidden="true">
                <div className="ls-wallet-bar-fill" style={{ width: `${spendPct * 100}%` }} />
              </div>
              <div className="ls-micro ls-wallet-left">
                {overBudget ? `Over by ${money(ownedTotal - budget)}` : `${money(budget - ownedTotal)} left`}
              </div>
            </div>
            <div className="ls-toasts">
              {toasts.map((t) => (
                <AchievementToast key={t.key} ach={t.ach} delay={t.delay} onDone={() => removeToast(t.key)} />
              ))}
            </div>
          </div>
        </div>

        {/* ---------- left: quest log ---------- */}
        <aside className="ls-side ls-quests ls-glass" data-open={panel === "quests"} aria-label="Quests">
          <div className="ls-side-head">
            <span className="ls-micro ls-side-title">Quests</span>
            <span className="ls-micro">
              {questsDone}/{quests.length}
            </span>
            <button type="button" className="ls-side-close" onClick={() => setPanel(null)} aria-label="Close quests">
              ✕
            </button>
          </div>
          <ol className="ls-quest-list">
            {quests.map((q) => {
              const state = q.done ? "done" : q.current ? "current" : "todo";
              return (
                <li key={q.id} className={`ls-quest ls-quest--${state}`}>
                  <span className="ls-quest-mark" aria-hidden="true">
                    {q.done ? "✓" : q.current ? "▶" : "○"}
                  </span>
                  <span className="ls-quest-label">{q.label}</span>
                </li>
              );
            })}
            {!quests.length ? <li className="ls-empty">No quests yet.</li> : null}
          </ol>
          {allQuestsDone ? <div className="ls-quest-complete">🏆 Life goal complete!</div> : null}
        </aside>

        {/* ---------- right: inventory ---------- */}
        <aside className="ls-side ls-inventory ls-glass" data-open={panel === "inventory"} aria-label="Inventory">
          <div className="ls-side-head">
            <span className="ls-micro ls-side-title">Inventory</span>
            <span className="ls-micro">
              {ownedItems.length}/{inventory.length} owned
            </span>
            <button
              type="button"
              className="ls-side-close"
              onClick={() => setPanel(null)}
              aria-label="Close inventory"
            >
              ✕
            </button>
          </div>
          <div className="ls-slots">
            {inventory.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ls-slot${item.owned ? " ls-slot--owned" : ""}`}
                onClick={() => onToggleOwned(item.id)}
                aria-pressed={item.owned}
                title={`${item.name}${item.price !== undefined ? ` · ${usdFull.format(item.price)}` : ""} — click to ${
                  item.owned ? "drop" : "own"
                }`}
              >
                <span className="ls-slot-art">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" />
                  ) : (
                    <span className="ls-slot-glyph" aria-hidden="true">
                      {kindIcon(item.kind)}
                    </span>
                  )}
                  <span className="ls-slot-kind" aria-hidden="true">
                    {kindIcon(item.kind)}
                  </span>
                  {item.owned ? <span className="ls-ribbon">Owned</span> : null}
                </span>
                <span className="ls-slot-meta">
                  <span className="ls-slot-name">{item.name}</span>
                  <span className="ls-slot-price">
                    {item.price !== undefined ? money(item.price) : "Price n/a"}
                  </span>
                </span>
              </button>
            ))}
            {!inventory.length ? <div className="ls-empty">Empty. Browse to find loot.</div> : null}
          </div>
        </aside>

        {/* ---------- bottom: events + action bar ---------- */}
        <div className="ls-bottom">
          {activeEvent ? (
            <EventCard
              key={activeEvent.seq}
              event={activeEvent.event}
              onChoose={chooseEvent}
              onDismiss={dismissEvent}
            />
          ) : null}

          {groups.length ? (
            <div className="ls-actionbar ls-glass" role="toolbar" aria-label="Actions">
              {groups.map((g) => (
                <div key={g.name} className="ls-group">
                  <div className="ls-micro ls-group-name">{g.name}</div>
                  <div className="ls-group-keys">
                    {g.items.map((k) => (
                      <button
                        key={k.action.id}
                        type="button"
                        className={`ls-key${pressed?.index === k.index ? " ls-key--pressed" : ""}`}
                        onClick={() => fireAction(k)}
                        title={k.key ? `${k.action.label} [${keyLabel(k.key)}]` : k.action.label}
                        aria-keyshortcuts={k.key}
                      >
                        <kbd className="ls-kbd ls-key-cap">{k.key ? keyLabel(k.key) : "·"}</kbd>
                        <span className="ls-key-label">{truncate(k.action.label)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default LifeSimHud;
