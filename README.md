# VESTA Quantum Starship

**A cockpit you fly through live, AI-generated worlds.** Pick a destination
on the console, open the blast shield, and the window becomes a real-time
[Visko Orbis](https://github.com/Visko-Platform/orbis-online-hackathon-starter)
video stream you steer as you go: across time, to other planets, into
emergencies you have to talk or click your way out of, and home again to dock.

Built for the Orbis online hackathon as a fork of the official starter; the
original starter's examples and documentation are kept intact below.

## What it does

- **A live world outside the window.** Orbis Stable renders the view in real
  time at 2K. A scene driver looks at the picture every few seconds and writes
  the next beat of the shot, so the flight keeps moving forward instead of
  looping.
- **20 destinations and an endless map.** Charted worlds (Cretaceous Earth,
  Europa, Venice at Carnival, a Dyson swarm…) have pre-rendered opening
  frames; type any course into the plotter and an invented world is rendered
  on the spot.
- **An AI director.** Gemini plans each leg of the journey: the routes on
  the console, unexpected events, and emergencies with two choices, all
  shaped by the decisions you've already made.
- **Missions.** Each flight draws a mission: *Impactor* (track an asteroid
  back through time, plant a charge, full reverse before it blows), *The
  Lantern Signal*, *The Last Seed* or *The Echo*.
- **VESTA, your copilot.** A dry, slightly sarcastic voice on Gemini Live.
  She sees the window (a frame a second), describes only what's actually on
  screen, and takes spoken orders: *"take us to Alexandria"*, *"add a
  thunderstorm"*, *"bank left"*. A status light shows her link.
- **The wormhole.** Jumps go through a WebGL shader built from the last frame
  of the world you're leaving: a dark, mirrored nebula tunnel ending in an
  Interstellar-style lens that shows the destination, inverted, the moment
  Orbis has it on screen.
- **Docking.** Every flight ends with a last jump home, a slow glide into the
  bay and the blast doors sealing shut.
- **Sound.** A synthesized cockpit (engine hum tied to the throttle, jump and
  arrival effects, alerts, door servos) plus per-world music prompted
  through Orbis, with separate World and VESTA faders.

## Run it

```bash
cp .env.example .env.local   # add both keys
npm install
npm run dev
```

Open <http://localhost:3000/window>.

| Key | Used for |
| --- | --- |
| `REACTOR_API_KEY` | Orbis sessions (server-side token minting) |
| `GEMINI_API_KEY` | Director, scene driver, VESTA (Gemini Live), image renders |

The Gemini project needs **billing enabled**: free-tier quotas run out
within a single flight. Neither key ever reaches the browser; VESTA connects
with short-lived Gemini tokens locked to her configuration.

## Flying

| Control | |
| --- | --- |
| Console keys | Launch to a charted world (docked) or jump (flying) |
| **Space** (hold) | Talk to VESTA |
| **↑ / ↓** | Throttle: drift, cruise, boost |
| **← / →** | Bank |
| **P** | Plot a course to anywhere |
| **Q / E** | Pick the left / right choice in an emergency |
| **C** | Jump style: *Cut* (restart on a pre-rendered frame) or *Morph* (steer the live shot) |
| **G** | Window framing |
| **H / M** | Show or hide the helm and mission panels |
| **Z** | Presentation mode (hides the chrome) |
| Hold **Dock** | Fly home and end the flight |

Flights are capped at 10 minutes per Orbis session; the ship docks itself
just before time runs out.

## How it's built

| Piece | Where |
| --- | --- |
| Cockpit, flight phases, jumps, docking | `components/starship-window.tsx`, `app/window/window.css` |
| Worlds, missions, prompt composition | `lib/starship.ts` |
| Wormhole shader | `components/cut-dissolve.tsx` |
| Warp streaks | `components/warp-canvas.tsx` |
| Cockpit audio (Web Audio, all synthesized) | `lib/cockpit-audio.ts` |
| VESTA: Gemini Live client, persona, tools | `lib/copilot.ts`, `lib/copilot-config.ts` |
| Director (routes, emergencies, missions) | `app/api/director/route.ts` |
| Scene driver and vision checks | `app/api/scene/route.ts` |
| Gemini Live token minting | `app/api/live-token/route.ts` |
| Invented-world opening frames | `app/api/world-image/route.ts` |
| Orbis session hook (start, steer, cut, music) | `hooks/use-orbis-session.ts` |
| Pre-rendering the library's opening frames | `scripts/generate-openers.mjs`, `scripts/fit-16x9.py` |

Some things we learned about Orbis along the way:

- A new prompt shows up 6–10 seconds after it's sent, so the director and
  scene driver plan ahead rather than react.
- `set_image` only takes effect at the start of a run. A *Cut* jump resets
  and restarts on the destination's frame; the wormhole hides the restart.
- Orbis drifts into flying backwards unless every prompt says, at both ends,
  that the camera moves forward.
- Arrival is detected locally, by watching the video's pixels change, rather
  than by asking a vision model, so the wormhole releases the instant the new
  world appears.

---

## The original Orbis hackathon starter

A minimal Next.js example for the public Reactor-hosted Visko Orbis Stable API.
It demonstrates server-side token minting, WebRTC video and audio, text-to-video,
optional image-to-video, live prompt steering, delivery resolution, pause,
resume, and a foldable Nano Banana-to-Orbis livestreaming example.

### Requirements

- Node.js 20.9 or newer
- A Reactor API key with access to Visko Orbis Stable
- A Google Gemini API key with access to Nano Banana

### Run locally

```bash
cp .env.example .env.local
# Add your Reactor API key to .env.local.
npm install
npm run dev
```

Open <http://localhost:3000>.

`npm run dev` starts Next.js through a small session-cleanup wrapper. While in
development, sessions created by this starter are recorded in the gitignored
`.reactor-dev-sessions.json` file. It contains session IDs and metadata, but no
API keys or JWTs. The wrapper uses the server-only `REACTOR_API_KEY` to delete
recorded sessions before startup and again on `Ctrl+C`/`SIGTERM`, so restarting
the dev server cannot silently leave a previous Orbis session consuming
capacity. If a startup sweep cannot delete a recorded session, the wrapper
refuses to start another dev server and reports the session ID.

Set both keys in `.env.local`:

```dotenv
REACTOR_API_KEY=your_reactor_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Keep both keys server-side. The browser receives only the short-lived Reactor
JWT and the image returned by the Nano Banana route.

### Nano Banana kickoff example

Connect to Orbis, expand **Livestreaming example**, and click
**Edit and start stream**. The bundled `dog.png` is displayed as the source
image. The server sends it with the displayed image-editing prompt to
`gemini-2.5-flash-image`. Gemini then analyzes the edited image with the user
prompt and returns a plain-text, image-grounded prompt. The
edited output is previewed, uploaded as the Orbis start image, and used with
that grounded prompt to begin the stream.

The two starting prompts are exported from `lib/nano-banana.ts`.
`NANO_BANANA_PROMPT` controls the image edit, while `ORBIS_KICKOFF_PROMPT`
describes the requested motion. The final Gemini-grounded prompt is displayed
before it is sent to Orbis.

### API flow

1. `POST /api/token` requests a scoped session JWT from
   `https://api.reactor.inc/tokens`.
2. `ReactorProvider` connects to `reactor/visko-orbis-stable` with the
   recv-only `main_video` and `main_audio` tracks.
3. The model sends a `state` snapshot. Its `state.available_resolutions` list
   replaces the starter's initial documented resolution choices.
4. If supplied, the reference image is uploaded and passed to `set_image`
   before `start`.
5. If selected, `set_resolution` stages a delivery tier for the next `start`.
   Omitting it keeps the model's current setting; the documented default is
   `2k`.
6. `set_prompt` supplies the required prompt, then `start` begins generation.
7. Sending another `set_prompt` while running steers the video at the next
   chunk boundary.

### Documented model behavior

- A prompt is required before `start`; the reference image is optional.
- A 16:9 reference image works best. Other aspect ratios are resized without
  cropping and may appear distorted.
- The starter initially shows the currently documented `1080p`, `2k`, and `4k`
  tiers. After connection, treat `state.available_resolutions` as authoritative
  and send the selected value exactly as given.
- `set_resolution` applies from the next `start`, not during the active run.
- Orbis emits chunks about every 1.8 seconds. The first chunk emits no frames
  while the upscaler primes; this is expected.
- Commands are asynchronous. Use model events such as `state`,
  `prompt_accepted`, `resolution_accepted`, `generation_started`,
  `chunk_complete`, and `command_error` as the source of truth.
- `pause` takes effect after the current chunk. `resume` continues the same
  generation, and `reset` clears the current prompt and image.

### Project files

- `app/api/token/route.ts` performs the server-side token exchange.
- `app/api/session-cleanup/route.ts` performs best-effort session deletion when
  the browser page exits.
- `app/api/session-registry/route.ts` records verified development sessions for
  startup and shutdown cleanup.
- `scripts/dev-with-session-cleanup.mjs` wraps `next dev` with the development
  cleanup sweeps.
- `app/api/nano-banana/route.ts` performs the server-side image edit.
- `app/api/orbis-prompt/route.ts` creates the image-grounded video prompt.
- `components/orbis-demo.tsx` composes the provider, player, controls, and demo.
- `components/orbis-player.tsx` renders the streamed video and audio.
- `components/orbis-controls.tsx` renders the session controls.
- `components/nano-banana-example.tsx` owns the kickoff example and source image.
- `hooks/use-orbis-session.ts` contains the reusable Orbis command sequence and
  session state.
- `dog.png` is the Nano Banana source image.
- `lib/orbis.ts` contains the public model configuration and message helpers.
- `lib/orbis-prompt.ts` contains the plain-text Gemini grounding instruction.
- `lib/nano-banana.ts` contains the model and kickoff prompt.
- `.env.example` documents the required environment variables.

For the complete command parameters, message schemas, tracks, and current model
behavior, use the public Reactor documentation:

- [Visko Orbis Stable API](https://www.reactor.inc/models/visko-orbis-stable/api)
- [Visko Orbis Dynamic API](https://www.reactor.inc/models/visko-orbis-dynamic/api)
- [Gemini image generation and editing](https://ai.google.dev/gemini-api/docs/image-generation)
