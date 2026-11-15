# Lifecast: directed demo stories

> **Try it on before you buy anything, from that ski jacket to your dream house.**

**Lifecast: live it before you buy it.** A Chrome extension reads what you shop for, merges your browsing trends,
and casts you in a live, steerable video of your life with it, playable as a life-sim game.

If `SITE_PASSWORD` is set, sign in once in a normal tab **and** once inside the Lifecast side panel. `<app>` below is your deployment (default `http://localhost:3000`).
Story picker: `<app>/shop` (a presenter bar on every page shows the step and the **Next →** link).

## Before going on stage (10 min)
1. Chrome: load the extension (chrome://extensions → Developer mode → Load unpacked → `extension/`, or unzip `<app>/lifecast-extension.zip`; set the app URL with ⚙ in the panel).
   After updates, click ↻ on the extension card.
2. `<app>/omni` (alias `/lifecast`): upload your photo once, or place it at `CACHE_DIR/presenter.jpg` to make it the default. Clear the Wardrobe (✕).
3. Side panel: **Clear** "Your shopping interests", keep "Use for trends" on.
4. **Pre-render:** press **⚡ Pre-render all** on `/omni?admin=1` (~12 min, ~$60 of Gemini) to cache every demo preset (64) and story page (14).
   It replays every story stop on the server and renders all plans, heroes, journey shots, and Orbis prompts (plus the 4 demos), so on stage
   each *Try this page* is ready in under a second and the shot board shows "⚡ pre-rendered". (CLI: `curl -X POST -H "x-orbis-key: <password>" <app>/api/omni/warm`
   reuses the last photo the server saw.) Re-run it if you change the photo.
5. Warm Orbis: Connect once early (a cold GPU can take minutes; ≈$0.58/min while connected).

## 🏆 Judging: Realtime · Creativity · Functionality (5 pts each). 3-minute script
| Time | Do | Say (criterion) |
|---|---|---|
| 0:00 | Jacket page, panel open, **🎬 Go live** (pre-warmed) | "Lifecast: live it before you buy it. I'm browsing a jacket, and that's me, live, in it." *(Creativity)* |
| 0:20 | Press **D**, **Space**, then click the **Sunset** swatch on the page | "I'm driving the video like a game, and the shopping page is a controller too: watch **↯ steered in ~2 s**." *(Realtime)* |
| 0:40 | Click **Next → Resort**, keep talking | "I just changed websites, and the live video cut to me at the resort. Same session, a new image anchor every scene, so it stays sharp." *(Realtime + Functionality)* |
| 1:20 | **Next → Cars → SUV** | "It remembered the jacket and the resort: here I am in that jacket, getting into the SUV, driving to Powder Peak." *(Creativity: trend merging)* |
| 1:50 | Let it auto-cut (or press **✂ Cut** on *3 · Lift*, *4 · Ride*) | "Each step is a keyframe from a frontier image model, fed to Orbis with set_image: short, controlled scenes." *(Functionality)* |
| 2:20 | **🎮 Game mode**, press 1-4 / Q-W, an event pops up | "Shopping becomes a life sim: quests, budget, inventory with real prices." *(Creativity)* |
| 2:45 | *Export last 30s* | "And every shopper leaves with their own ad." |
Backup: if Orbis is slow, narrate over the pre-rendered shot board, then cut in when live.

## ⭐ The showcase: live follow mode (image cuts across websites)
1. Open the Lifecast side panel (Follow ☑ on by default) on the first stop of a story, e.g. the Glacier jacket.
2. When the studio appears, press **🎬 Go live** (connects + starts from the pre-rendered hero; do it before you start talking in case the GPU is cold).
3. **Auto demo:** each scene advances after ~10 s with an image cut (`set_image`) to the next shot; **any steering input restarts that scene's countdown**,
   so keep driving to stay in a scene as long as you like (no cap). After the last shot it holds the final frame.
   The cut's still is held on screen until live frames arrive (no black flash). A green "↯ cut in X s" shows the realtime latency.
4. Just **browse to the next site** (presenter bar → Next). ~2.5 s after landing, Lifecast **hard-cuts** to you on that page ("✂ Cut → …").
5. **Realtime (score this!):** drive it with **W A S D / arrows / Space** or the on-screen D-pad. The controls are **generated for each scene**
   ("✨ Controls for this scene": surfing = Paddle out / Catch wave, gondola = Lean / Wipe glass, loft = Step forward / Inspect island), and click
   controls **on the shopping page itself**: color swatches recolor what you wear, car paint + "See it in Snow/Night", resort "Live conditions",
   loft "Try a look". Each lands in ~2–3 s (green "↯ steered in X s"). While you steer, the scene holds; it moves on ~10 s after your last input.
6. At the car, the journey shots auto-cut: getting in → drive → arrive → lift → ride. 🎮 game mode: 0 = start, 1-9 = cut to a step, letters = touches.

## Stories
| Story | Persona | Stops (click **Try this page** on the bold ones) | End sequence (journey shots) |
|---|---|---|---|
| 🏂 Powder Day (**from that ski jacket to your dream house**) | Weekend snowboarder | **Glacier jacket** → Powder Peak resort → Cars → **Trailhead AWD SUV** → **Alpine chalet** | You in the jacket get in → drive → arrive → gondola → snowboard → walk through the chalet you'd buy (move the furniture) |
| 🏄 Surf Escape | Cold-water surfer | **Tidal wetsuit** → **Seafoam egg board** → Swell Bay surf town → Cars → **Ridge 4x4 pickup** | Load the board into the pickup → coast road → arrive at the surf shacks → paddle out → surf |
| 🏙 City Move | Professional moving downtown | **Camel trench** → **Downtown loft** (walkthrough + move furniture) → Cars → **Volt GT coupe** | You in the trench drive through the city at night → arrive at the loft → step in (car stays outside) → inside your new home |

After the pre-render: each Try is ready in <1 s with all stills. Without it: plan ≈7–10 s, hero ≈22 s, shots ≈15–17 s (the server starts rendering them as soon as a plan exists).

## End sequence in the studio
*Render hero still* → *Connect / ▶ Go live* → *Generate shot list* → **Cut** through the steps (or *Auto-play*), or ▶ the story scenario for one continuous take.
Steer anytime: "Where to go", Action, Conditions chips. *Export last 30s* to finish.

## 🎮 Game mode ("Play your life")
Button under the player (Esc exits). It's a life-sim HUD over the live video:
- **0** = Get ready (connects Orbis + renders the hero in parallel; press again to start your life). **1–9** = journey steps (renders the step if needed, then cuts to it).
- **Q W E R** "Where to go", **A S D F** actions, **Z X C** conditions, then camera/story keys (shown on the keycaps).
- Quests = journey steps (✓ as you reach them) · XP and levels (take +50, cut +30, morph +15, direction +10) · achievements.
- Inventory = what you browsed, with prices; click to "own" it. The wallet tracks spend vs budget ($100k, or $1M when a home is involved; editable).
- Random **life events** every ~45 s while live ("Golden hour or Street rain?"); pick with the buttons or `[` / `]`.

## Fallbacks
- Extension misbehaves → `/omni` manual mode (upload photos + describe) still plans, uses your wardrobe and photo, and has game mode.
- Image generation slow → *Fast mode* (≈9 s/shot).
- Orbis capacity error → show the rendered shot board as a storyboard; retry Connect.

## Tests (no Orbis cost)
- `python3 -I scripts/story_test.py <powder|surf|city> <dir> [--render]`: replays a story exactly as the extension + app would; `--render` makes `<story>-sheet.jpg`.
- `scripts/e2e/ui_smoke.cjs` (Playwright Chromium; `BASE_URL`, `SITE_PASSWORD`): logs in, renders the storefront, sends an extension context, opens the studio + game mode, and screenshots (1440 px and 420 px).
