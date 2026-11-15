# Lifecast architecture and engineering notes

## The core idea: keyframe-anchored live video
Orbis streams continuously and morphs at the next ~1.8 s chunk boundary after each `set_prompt`. Pure text steering drifts within a few scenes: faces change, products lose detail, locations wander.
Lifecast therefore treats Orbis like a live camera on a **storyboard of high-resolution keyframes**:

1. **Hero still:** Nano Banana Pro (`gemini-3-pro-image`, 2K) renders you in the product, in a scene chosen by the planner.
2. **Shots:** the same model renders each journey step at 1K. It's given references (your photo, the apparel you browsed earlier, the destination) so identity and wardrobe stay consistent.
3. **Cut** = `reset → set_audio_enabled → set_resolution "1080p" → upload → set_image(shot) → set_prompt(motion, passthrough) → start`. **Every scene change is a hard image cut.**
4. **Steer** = a text prompt on the running stream, reserved for minor interactive touches (turn, accelerate, recolor, weather). It's always anchored as `<scene prompt> <one change>` so the model keeps the setting and subject.

Fallback image models: `gemini-3.1-flash-image`, then `gemini-2.5-flash-image`. Text: `gemini-3.5-flash`, then `gemini-2.5-flash` (JSON mode for plans and controls).

## Orbis session engine (`hooks/use-orbis-studio.ts`)
- **Single-flight cuts:** one `startTake` at a time; the newest request is queued and older ones dropped.
- **`passthrough: true` on every `set_prompt`.** The server-side prompt rewrite occasionally took 10 s, and after a `reset` that froze the stream. Prompts are pre-written by Gemini anyway. One retry on failure.
- **Conditions grace ≤ 1.5 s** before `start` (this wait used to stall for up to 20 s).
- **Priming overlay:** the cut's still stays on screen until the first live frames arrive (the first chunk has 0 frames, ~3.7 s to first picture), so there's no black flash.
- **Chunk-aligned steering** (per the official chunks-and-timing guide): at most one prompt in flight per chunk, released on `chunk_complete`, newest wins, 2.5 s fallback.
- **Honest latency:** the HUD measures steer → the *second* `chunk_complete` (the first chunk rendered with the new prompt actually on screen), not the command ack.
- **Auto demo:** a scene advances after ~10 s with a cut to the next shot. Any steering input restarts that scene's countdown (no cap). The cut waits for the chunk in flight (≤ 2.5 s). The sequence pauses on the last shot.
- **Idle protection:** auto-disconnect after 15 idle minutes (Orbis bills while connected). Lifecast remembers it was live and reconnects + cuts in on the next page.
- **1080p** via `set_resolution` before every start (it applies at start and survives `reset`).
- Session tokens are minted server-side and capped at 30 min. The browser only sees a session JWT.

## Lifecast planner (`lib/server/omni.ts`)
- **Input:** the current page (URL, title, price, JSON-LD types, keywords, images), the local interest history with its newest images (2 apparel + 1 travel + 1 real-estate), the wardrobe (the last apparel tried) and your photo.
- **Output (Gemini JSON):** vertical, hero scene, shots, chips, a 5-step scenario, and for vehicle pages with a destination + apparel in history, **journey mode**
  (hero = you in the jacket getting in; shots `Drive → Arrive → Lift → Ride`, or ending inside a home). Also an `inventory` of browsed items with prices for the game.
- **Scene rules:** the car always stays outside (an early bug parked it inside the loft; fixed by labeling destination references interior-only); homes are interior-only;
  the walkthrough never renders beyond balconies or exterior boundaries.
- **Plan cache key (v3):** page URL without query + photo hash; for car pages also the newest apparel URL and the newest destination URL. That made it robust to noisy history
  (an earlier, stricter key missed the cache between story stops). The plan id is `omni-<key>`, stable across restarts.

## Pre-rendering and warm-up (`lib/server/{prerender,warm,controls}.ts`)
- Each demo preset (`<demo>~<subject>~<options>`) or plan id gets `manifest.json + hero.jpg + shot-*.jpg + prompts` under `CACHE_DIR/prerender/<id>/`. Resumable.
- **Warm-up** replays every story page exactly like the extension (same URLs, history, wardrobe, photo), so live requests hit the cache:
  64 presets + 14 story pages ≈ 450 Nano Banana Pro images in ~12 min with a global semaphore (`MAX_IMAGE_JOBS=10`).
- **Context controls:** for the hero and every shot prompt, Gemini writes 5 inputs (up/left/right/down/action → W/A/S/D/Space). They're disk-cached by scene text, ~1.3 s each when uncached, at most 6 concurrent.

## Chrome extension (`extension/`)
- **Content script:** a page classifier with JSON-LD types (declared travel or destination types are decisive, +30), Open Graph, price, keywords (snow, surf, swim, general apparel)
  → apparel / real_estate / auto / travel. Click listener for `[data-lifecast-prompt]` elements → `omni:interact`.
- **Background:** a local shopping history (newest 30, price + image, downscaled), badge, toggle + clear.
- **Side panel:** iframe of `/omni?embed=1`. **Follow mode** auto-sends each new shopping page after 2.5 s.
- **Protocol:** `omni:ready` (app → panel), `omni:context {page, images, history, historyImages}` (panel → app), `omni:status`, `omni:interact {prompt}` (page control → live steer),
  `omni:reset` (clearing interests resets the wardrobe, plan, queue and stream while keeping the connection).
- **Auth:** an optional site password (`proxy.ts`). The cookie is `SameSite=None; Secure; Partitioned`, so it works inside the side-panel iframe. Scripts can send an `x-orbis-key` header.

## Profiling baseline (Gemini side, measured)
| Step | p50 |
|---|---|
| Hero still (Nano Banana Pro, 2K) | 20.5 s |
| Shot (Nano Banana Pro, 1K) | 15.6 s (5–7 shots in parallel: 15–27 s wall clock) |
| Fast mode (Flash image) | ~9 s / shot, ~10 s / hero |
| Planner (JSON) | 7–10 s |
| Opening prompt / morph prompt / change prompt | 2.4 s / 1.9 s / 0.6 s |
| Context controls | ~1.3 s |
| App overhead | < 100 ms |

Image generation is the bottleneck, which is why everything a demo needs is pre-rendered and cached, and live interaction uses Orbis text steers (~2–3 s) and cached-image cuts (~5 s).

## Lessons about Orbis
- Open with WHO + WHAT + WHERE + camera. Each follow-up should be **one visible change**, phrased as a state transition. No negation. Pre-crop references to 16:9.
- Don't send prompts faster than chunks land. Debounce UI input.
- `set_image` and seed are read only at `start` (and cleared by `reset`), so an image steer is a cut, not a morph.
- A moderation flag terminates the session. Keep demo prompts clean (the disaster demo has a safe "industrial explosion" fallback).
- A cold GPU can take minutes: connect before you present.
- js-sdk 3.x commands resolve to their reply, or `undefined` on rejection (details arrive as `command_error`). `state` no longer echoes the prompt, so track what you sent.
- Live video reinterprets faces more than the stills do. Frequent image cuts are the fix.
