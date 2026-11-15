"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useReactor, useReactorMessage } from "@reactor-team/js-sdk";

import { LifecastLogo } from "@/components/lifecast-logo";
import { OrbisSession, StudioInSession } from "@/components/studio";
import { unwrapOrbisMessage } from "@/lib/orbis";
import type { DemoView } from "@/lib/demos";
import { track } from "@/lib/telemetry";

type OmniContext = {
  type?: string;
  page: Record<string, unknown> & { title?: string; url?: string; siteName?: string; vertical?: string };
  images: { dataUrl: string; sourceUrl?: string }[];
  history: { url?: string; title?: string; vertical?: string; keywords?: string[]; ts?: number }[];
  historyImages?: { dataUrl: string; title?: string; url?: string }[];
  historyEnabled?: boolean;
};
type WardrobeItem = { dataUrl: string; label: string; description?: string; ts: number };
type Summary = {
  vertical: "apparel" | "real_estate" | "auto" | "travel";
  productName: string;
  journey?: boolean;
  destinationName?: string;
  heroScene?: string;
  inventory?: { id: string; name: string; kind: string; price?: number; imageUrl?: string }[];
  setting: string;
  trendNotes: string[];
  includeUser: boolean;
  wardrobeUsed: string[];
  productImageIndex: number;
};
type PlanResult = { planId: string; view: DemoView; summary: Summary };

const PHOTO_KEY = "omni.userPhoto";
const WARDROBE_KEY = "omni.wardrobe";
const ICON: Record<string, string> = { apparel: "👕", real_estate: "🏠", auto: "🚗", travel: "🏔" };

async function downscale(src: Blob | string, max: number, quality = 0.86): Promise<string> {
  const blob = typeof src === "string" ? await (await fetch(src)).blob() : src;
  const bmp = await createImageBitmap(blob);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return canvas.toDataURL("image/jpeg", quality);
}

const dataUrlToFile = async (dataUrl: string, name: string) =>
  new File([await (await fetch(dataUrl)).blob()], name, { type: "image/jpeg" });

function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded: keep going without persistence
  }
}

type WarmState = { running: boolean; steps: { story: string; label: string; planId?: string; status: string }[] };

function WarmCard({ userPhoto }: { userPhoto: string | null }) {
  const [warm, setWarm] = useState<WarmState | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const r = await fetch("/api/omni/warm", { cache: "no-store" }).catch(() => null);
      const w = r?.ok ? ((await r.json()) as WarmState) : null;
      if (w) setWarm(w);
      if (w?.running) timer = setTimeout(poll, 3000);
    };
    void poll();
    return () => clearTimeout(timer);
  }, []);
  const start = async () => {
    const r = await fetch("/api/omni/warm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPhoto }),
    });
    setWarm((await r.json()) as WarmState);
    const poll = async () => {
      const w = (await (await fetch("/api/omni/warm", { cache: "no-store" })).json()) as WarmState;
      setWarm(w);
      if (w.running) setTimeout(poll, 3000);
    };
    setTimeout(poll, 2000);
  };
  const done = warm?.steps.filter((x) => x.status === "done").length ?? 0;
  return (
    <div className="omni-card wide">
      <h2>⚡ Pre-render the demo stories</h2>
      <p className="hint">
        Renders every story stop (plans, hero stills, journey shots) and every preset of the 4 demos (each subject × option) on the server with{" "}
        {userPhoto ? "your photo" : "the presenter photo"}, so the live demo has no waiting. The full set takes ~15–20 minutes; replays are instant afterwards.
      </p>
      <div className="button-row">
        <button className="primary" disabled={warm?.running} onClick={start}>
          {warm?.running ? `Rendering… ${done}/${warm.steps.length}` : "Pre-render all"}
        </button>
      </div>
      {warm && warm.steps.length > 0 && (
        <ul className="warm-list">
          {warm.steps.map((x) => (
            <li key={`${x.story}-${x.label}`} className={x.status === "done" ? "ok" : x.status.startsWith("error") ? "bad" : ""}>
              <span>{x.story}</span> {x.label}: <b>{x.status}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export function OmniApp({ embed, admin = false }: { embed: boolean; admin?: boolean }) {
  // One Orbis session for the whole shopping trip: studios remount per page, the stream keeps running.
  return (
    <OrbisSession>
      <OmniInner embed={embed} admin={admin} />
    </OrbisSession>
  );
}

function OmniInner({ embed, admin }: { embed: boolean; admin: boolean }) {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [ctx, setCtx] = useState<OmniContext | null>(null);
  const [manualFiles, setManualFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PlanResult | null>(null);
  const resultRef = useRef<PlanResult | null>(null);
  resultRef.current = result;

  // ---- live bridge: is the stream running right now? ----
  const { status: rStatus, sendCommand, connect } = useReactor((st) => ({ status: st.status, sendCommand: st.sendCommand, connect: st.connect }));
  const [liveNow, setLiveNow] = useState(false);
  const statusRef = useRef(rStatus);
  statusRef.current = rStatus;
  const startedRef = useRef(false);
  useReactorMessage((raw: unknown) => {
    const m = unwrapOrbisMessage(raw) as { type?: string; started?: boolean };
    if (m.type === "state" && typeof m.started === "boolean") startedRef.current = m.started;
    else if (m.type === "generation_started") startedRef.current = true;
    else if (m.type === "generation_reset" || m.type === "generation_complete") startedRef.current = false;
    setLiveNow(startedRef.current);
    if (startedRef.current) everLive.current = true;
  });
  const [transition, setTransition] = useState<{ label: string; step: number; total: number; prompt: string; to: string } | null>(null);
  const [autoLive, setAutoLive] = useState<{ after: number; label: string } | undefined>();
  const busyRef = useRef(false);
  /** Went live at least once this session: if the stream later disconnects (idle), browsing a page brings it back. */
  const everLive = useRef(false);
  // Realtime input from the shopping page (swatch / paint / weather clicks forwarded by the extension).
  const [externalSteer, setExternalSteer] = useState<{ id: number; prompt: string; label: string } | undefined>();
  const [pageInput, setPageInput] = useState<{ id: number; label: string } | null>(null);
  const queuedRef = useRef<OmniContext | null>(null);
  const wardrobeRef = useRef<WardrobeItem[]>([]);
  const photoRef = useRef<string | null>(null);
  wardrobeRef.current = wardrobe;
  photoRef.current = userPhoto;

  const status = (text: string) => {
    if (embed) window.parent.postMessage({ type: "omni:status", text }, "*");
  };

  // ---- persistence ----
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PHOTO_KEY) ?? "null") as string | null;
      setUserPhoto(saved);
      if (!saved) {
        // Preload the presenter's default photo (exact bytes, so pre-rendered plans match).
        void fetch("/api/omni/presenter", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((d: { userPhoto?: string | null } | null) => {
            if (d?.userPhoto && !localStorage.getItem(PHOTO_KEY)) {
              setUserPhoto(d.userPhoto);
              save(PHOTO_KEY, d.userPhoto);
            }
          })
          .catch(() => undefined);
      }
      setWardrobe(JSON.parse(localStorage.getItem(WARDROBE_KEY) ?? "[]"));
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const setPhoto = async (file: File | null) => {
    const dataUrl = file ? await downscale(file, 1024) : null;
    setUserPhoto(dataUrl);
    save(PHOTO_KEY, dataUrl);
  };

  const addToWardrobe = (item: WardrobeItem) => {
    const next = [item, ...wardrobeRef.current.filter((w) => w.label !== item.label)].slice(0, 4);
    setWardrobe(next);
    save(WARDROBE_KEY, next);
  };
  const removeWardrobe = (label: string) => {
    const next = wardrobeRef.current.filter((w) => w.label !== label);
    setWardrobe(next);
    save(WARDROBE_KEY, next);
  };

  // ---- planning ----
  const plan = useCallback(
    async (context: OmniContext, extraNote?: string) => {
      if (busyRef.current) {
        queuedRef.current = context; // latest page wins; handled when the current transition finishes
        return;
      }
      busyRef.current = true;
      const prev = resultRef.current;
      const live = statusRef.current === "ready" && startedRef.current && !!prev;
      setPlanning(true);
      setError("");
      if (!live) setResult(null);
      status(live ? "Steering to the next page…" : "Planning your scene…");
      const t0 = performance.now();
      try {
        const planPromise = fetch("/api/omni/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: context.page,
            images: context.images,
            history: context.historyEnabled === false ? [] : context.history,
            historyImages: context.historyEnabled === false ? [] : context.historyImages ?? [],
            wardrobe: wardrobeRef.current.map(({ dataUrl, label, description }) => ({ dataUrl, label, description })),
            userPhoto: photoRef.current,
            note: extraNote,
          }),
        }).then(async (response) => {
          const d = (await response.json()) as PlanResult & { error?: string };
          track("client.omni.plan", performance.now() - t0, { ok: response.ok, vertical: d.summary?.vertical, live });
          if (!response.ok) throw new Error(d.error ?? `Planning failed (${response.status})`);
          return d;
        });

        if (live && prev) {
          // New page while live: hard image cut to the next page's (pre-rendered) hero. No text morphs.
          const to = String(context.page.title ?? "").split("|")[0].trim();
          setTransition({ label: "Cut", step: 1, total: 1, prompt: `Cutting to ${to}…`, to });
          const data = await planPromise;
          setAutoLive({ after: 0, label: `Cut: ${data.summary.productName.slice(0, 28)}` });
          setResult(data);
          await rememberApparel(data, context);
          status(`${ICON[data.summary.vertical] ?? ""} ${data.summary.productName}: live`);
          setTimeout(() => setTransition(null), 3000);
          return;
        }

        const data = await planPromise;
        if (everLive.current) {
          // Was live before (e.g. idle-disconnected): reconnect and cut straight into this page.
          setAutoLive({ after: 0, label: `Cut: ${data.summary.productName.slice(0, 28)}` });
          if (statusRef.current !== "ready") void connect().catch(() => undefined);
          status("Reconnecting the live video…");
        } else {
          setAutoLive(undefined);
        }
        setResult(data);
        status(`${ICON[data.summary.vertical] ?? ""} ${data.summary.productName}: ready`);
        await rememberApparel(data, context);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : String(caught);
        setError(message);
        setTransition(null);
        status(`Error: ${message}`);
      } finally {
        setPlanning(false);
        busyRef.current = false;
        const next = queuedRef.current;
        queuedRef.current = null;
        if (next) void planRef.current(next);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const planRef = useRef(plan);
  planRef.current = plan;

  /** Trends list cleared in the extension: forget the wardrobe and current scene; keep the live connection for a fast next cut. */
  function resetContext() {
    queuedRef.current = null;
    wardrobeRef.current = [];
    setWardrobe([]);
    save(WARDROBE_KEY, []);
    setTransition(null);
    setPageInput(null);
    setExternalSteer(undefined);
    setAutoLive(undefined);
    setResult(null);
    setCtx(null);
    setError("");
    if (statusRef.current === "ready" && startedRef.current) void sendCommand("reset", {}).catch(() => undefined);
    status("Context reset: open a shopping page to start fresh.");
  }

  // Remember apparel so later car/home scenes can dress you in it.
  async function rememberApparel(data: PlanResult, context: OmniContext) {
    if (data.summary.vertical !== "apparel" || !context.images.length) return;
    const img = context.images[Math.max(0, data.summary.productImageIndex)] ?? context.images[0];
    addToWardrobe({
      dataUrl: await downscale(img.dataUrl, 768),
      label: data.summary.productName.slice(0, 40),
      description: data.view.options[0]?.text,
      ts: Date.now(),
    });
  }

  // ---- extension bridge ----
  useEffect(() => {
    if (!embed) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const msg = event.data as { type?: string; kind?: string; value?: string; prompt?: string; label?: string };
      if (msg?.type === "omni:reset") {
        resetContext();
        return;
      }
      if (msg?.type === "omni:interact" && msg.prompt) {
        const id = Date.now();
        setExternalSteer({ id, prompt: msg.prompt, label: `🛍 ${msg.label ?? msg.value ?? "page"}` });
        setPageInput({ id, label: msg.label ?? msg.value ?? "" });
        setTimeout(() => setPageInput((p) => (p?.id === id ? null : p)), 3500);
        status(`🛍 ${msg.label ?? ""} → live`);
        return;
      }
      const data = event.data as OmniContext;
      if (data?.type !== "omni:context" || !data.page) return;
      setCtx(data);
      void plan(data);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "omni:ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [embed, plan]);

  const planManual = async () => {
    const images = await Promise.all(manualFiles.slice(0, 4).map(async (f) => ({ dataUrl: await downscale(f, 1280, 0.88) })));
    const context: OmniContext = {
      page: { title: note || "Product photos", vertical: "none" },
      images,
      history: [],
      historyImages: [],
    };
    setCtx(context);
    await plan(context, note || undefined);
  };

  const [initialUploads, setInitialUploads] = useState<File[] | undefined>();
  useEffect(() => {
    // Apparel plan without a saved photo: nothing to preload. With a saved photo the server already made "You" a subject.
    setInitialUploads(undefined);
  }, [result?.planId]);

  const s = result?.summary;
  return (
    <div className={`omni ${embed ? "omni-embed" : ""}`}>
      {/* In the extension the side panel header already carries the logo; only the standalone page shows this bar. */}
      {!embed && (
        <div className="omni-brandbar">
          <LifecastLogo size={30} live={liveNow} />
          <span className="tag">Try it on before you buy anything, from that ski jacket to your dream house.</span>
        </div>
      )}
      {!result && (
        <main className="omni-setup">
          <header>

            <h1>{embed ? "Try it on before you buy anything." : "Lifecast: try it on before you buy anything."}</h1>
            <p className="lede">
              From that ski jacket to your dream house. Lifecast reads the page and your recent interests, then casts you in a live,
              steerable video of it.
            </p>
          </header>

          {planning && <div className="omni-card planning">✨ Planning your scene from {ctx?.page.title ? `“${String(ctx.page.title).slice(0, 60)}”` : "your photos"}…</div>}
          {error && <p className="error">{error}</p>}

          <section className="omni-grid">
            {!embed && (
            <div className="omni-card">
              <h2>📷 Your photo</h2>
              <p className="hint">Used to put you in the scene. Saved only in this browser.</p>
              <div className="omni-photo">
                {userPhoto ? <img src={userPhoto} alt="You" /> : <span className="plus">＋</span>}
              </div>
              <div className="button-row">
                <label className="button-like">
                  {userPhoto ? "Replace" : "Upload photo"}
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && setPhoto(e.target.files[0])} />
                </label>
                {userPhoto && <button onClick={() => setPhoto(null)}>Remove</button>}
              </div>
            </div>

            )}
            {!embed && (
            <div className="omni-card">
              <h2>🧥 Wardrobe</h2>
              <p className="hint">Apparel you tried on. Lifecast dresses you in it for car, travel, and home scenes.</p>
              <div className="wardrobe">
                {wardrobe.map((w) => (
                  <figure key={w.label}>
                    <img src={w.dataUrl} alt={w.label} />
                    <figcaption>{w.label}</figcaption>
                    <button className="x" onClick={() => removeWardrobe(w.label)} title="Remove">✕</button>
                  </figure>
                ))}
                {wardrobe.length === 0 && <span className="hint">Empty. Try on some apparel first.</span>}
              </div>
            </div>
            )}

            {!embed && (
              <div className="omni-card wide">
                <h2>🛍 What are you shopping for?</h2>
                <p className="hint">Without the extension: drop product, listing, or car photos and describe it.</p>
                <input
                  className="full"
                  value={note}
                  placeholder="e.g. 'AWD SUV for ski trips' or 'this snowboard jacket'"
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="button-row">
                  <label className="button-like">
                    {manualFiles.length ? `${manualFiles.length} photo(s)` : "Add photos"}
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => setManualFiles([...(e.target.files ?? [])])} />
                  </label>
                  <button className="primary" disabled={planning || (!manualFiles.length && !note.trim())} onClick={planManual}>
                    Plan my scene
                  </button>
                </div>
              </div>
            )}

            {admin && <WarmCard userPhoto={userPhoto} />}
            {!embed && (
              <div className="omni-card wide">
                <h2>🧩 Chrome extension</h2>
                <ol className="hint">
                  <li>
                    Download <a href="/lifecast-extension.zip">lifecast-extension.zip</a> and unzip it.
                  </li>
                  <li>Open chrome://extensions, turn on Developer mode, click “Load unpacked”, and pick the folder.</li>
                  <li>Browse any product, home, or car page, then click the Lifecast icon and choose “Try this page”.</li>
                </ol>
              </div>
            )}
            {embed && !planning && (
              <div className="omni-card wide omni-waiting">
                {userPhoto && <img className="omni-avatar" src={userPhoto} alt="You" />}
                <div>
                  <h2>Open any shopping page</h2>
                  <p className="hint">Try it on before you buy anything, from that ski jacket to your dream house. Lifecast casts you in it, live, and follows you as you browse.</p>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {result && s && (
        <StudioInSession
          key={result.planId}
          demo={result.view}
          compact={embed}
          autoLive={autoLive}
          externalSteer={externalSteer}
          controller={s.vertical === "auto" ? "car" : s.vertical === "real_estate" ? "home" : "person"}
          initialUploads={initialUploads}
          game={{
            title: s.journey ? `${result.view.title}${s.destinationName ? ` → ${s.destinationName}` : ""}` : result.view.title,
            playerName: "You",
            avatarUrl:
              result.view.subjects.find((x) => x.id === "you")?.src ?? result.view.options.find((o) => o.id === "you")?.src ?? userPhoto ?? undefined,
            inventory: s.inventory ?? [],
            budget: (s.inventory ?? []).some((i) => i.kind === "real_estate") ? 1_000_000 : 100_000,
          }}
          onUploads={(files) => {
            if (result.summary.vertical === "apparel" && files[0] && !photoRef.current) void setPhoto(files[0]);
          }}
          banner={
            <section className="omni-banner">
              <div className="omni-banner-main">
                <span className="omni-icon">{ICON[s.vertical]}</span>
                <div>
                  <strong>{s.productName}</strong>
                  <p className="hint">{s.setting}</p>
                </div>
                {!embed && (
                  <button
                    onClick={() => {
                      setResult(null);
                      setCtx(null);
                    }}
                  >
                    ↺ New
                  </button>
                )}
              </div>
              {(s.trendNotes.length > 0 || s.wardrobeUsed.length > 0) && (
                <div className="trend-notes">
                  {s.trendNotes.map((t) => (
                    <span key={t} className="trend">✨ {t}</span>
                  ))}
                  {s.wardrobeUsed.map((w) => (
                    <span key={w} className="trend wear">🧥 wearing: {w}</span>
                  ))}
                </div>
              )}
              {s.journey && (
                <div className="journey">
                  <b>🗺 Journey to {s.destinationName || "the destination"}:</b>
                  <span>Hero = getting in the car</span>
                  {result.view.shots.map((shot) => (
                    <span key={shot.id}>→ {shot.label}</span>
                  ))}
                  {!embed && (
                    <p className="hint">
                      Render the hero → ▶ Go live → “Generate shot list” → Cut through the steps (or tick Auto-play). Steer anytime with “Where to go”.
                    </p>
                  )}
                </div>
              )}
              {!liveNow && !transition && everLive.current && rStatus === "disconnected" && (
                <p className="hint idle-note">⏸ Live video paused to save credits. Browse to any page or press Go live to resume.</p>
              )}
              {!liveNow && !transition && (
                <div className="go-live-row">
                  <button
                    className="primary go-live"
                    disabled={rStatus === "connecting" || rStatus === "waiting"}
                    onClick={async () => {
                      setAutoLive({ after: 0, label: "Hero" });
                      if (rStatus !== "ready") await connect().catch(() => undefined);
                    }}
                  >
                    {rStatus === "connecting" || rStatus === "waiting" ? "Warming up the GPU…" : "🎬 Go live"}
                  </button>
                  <span className="hint">Starts the live video. With Follow on, each shopping page you open cuts the video to you there.</span>
                </div>
              )}
              {pageInput && (
                <div className="page-input">
                  🛍 From the page: <b>{pageInput.label}</b> → steering live
                </div>
              )}
              {transition && (
                <div className="transition-bar">
                  <b>✂ Cut → {transition.to}</b>
                  <span className="t-steps">
                    {Array.from({ length: transition.total }, (_, i) => (
                      <i key={i} className={i < transition.step ? "on" : ""} />
                    ))}
                  </span>
                  <p>{transition.prompt}</p>
                </div>
              )}
              {s.includeUser && !userPhoto && (
                <p className="hint">Tip: upload your photo (📷 tile) to star in the scene yourself.</p>
              )}
            </section>
          }
        />
      )}
    </div>
  );
}

export async function fileFromDataUrl(dataUrl: string, name = "photo.jpg") {
  return dataUrlToFile(dataUrl, name);
}
