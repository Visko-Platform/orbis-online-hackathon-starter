# AI Scene Director

A Next.js example for the public Reactor-hosted Visko Orbis API, in two parts:

- **Scene Director** (`/`): an interactive film generated live by Orbis. The
  player picks actions, an AI director decides what happens next, and the
  video is steered to match.
- **Studio** (`/studio`): the original starter's manual controls. It
  demonstrates server-side token minting, WebRTC video and audio,
  text-to-video, optional image-to-video, live prompt steering, delivery
  resolution, pause, resume, and a foldable Nano Banana-to-Orbis livestreaming
  example.

## Requirements

- Node.js 20.9 or newer
- A Reactor API key with access to Visko Orbis Stable, and to Visko Orbis
  Dynamic for the Sky run film
- A Google Gemini API key with access to Nano Banana
- Optionally, an Anthropic API key

Everything runs on the Gemini key alone. When `ANTHROPIC_API_KEY` is also set,
Claude takes over the text and vision work: directing the film, checking video
frames, and writing Studio prompts. Nano Banana image editing always uses
Gemini. The director's instructions and the committed cache were written and
tested with Claude.

## Run locally

```bash
cp .env.example .env.local
# Add your API keys to .env.local.
npm install
npm run dev
```

Open <http://localhost:3000> for the Scene Director, or
<http://localhost:3000/studio> for the manual controls.

`npm run dev` starts Next.js through a small session-cleanup wrapper. While in
development, sessions created by this starter are recorded in the gitignored
`.reactor-dev-sessions.json` file. It contains session IDs and metadata, but no
API keys or JWTs. The wrapper uses the server-only `REACTOR_API_KEY` to delete
recorded sessions before startup and again on `Ctrl+C`/`SIGTERM`, so restarting
the dev server cannot silently leave a previous Orbis session consuming
capacity. If a startup sweep cannot delete a recorded session, the wrapper
refuses to start another dev server and reports the session ID.

Set the keys in `.env.local`:

```dotenv
REACTOR_API_KEY=your_reactor_api_key
GEMINI_API_KEY=your_gemini_api_key
# Optional. Leave it out to use Gemini throughout.
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Keep all keys server-side. The browser receives only the short-lived Reactor
JWT, the director's turns, and the image returned by the Nano Banana route.

## Scene Director

Choose a film, click **Begin scene**, and direct it. Each turn you pick one
action from three categories (Investigate, Manipulate, Intervene) or type a
custom direction. The keys `1`–`3` choose, `Esc` goes back, `R` brings the
camera back to the lead, and `/` jumps to the custom direction box.

### The two scenes

The **Scene** buttons above the video switch between two films. They are two
parts of one story with the same cast: Kade, a replicant hunter; Iris, the
fugitive he was sent to retire, who used to be his partner; and Captain Voss,
his commander. Each film is one Orbis session, which is capped at 5 minutes.
Both are defined in `lib/scenarios.ts`.

| | Night market | Sky run |
|---|---|---|
| Story | Kade hunts Iris through a rain-soaked market on foot, finds her, and has to choose between his orders and his old partner. | Kade and Iris are in his craft with the proof against Voss, running for the off-world transport at the harbor. |
| You control | The district's cameras, drones, lights, and weather | Air control, the tower guns, and the weather grid |
| Voss is | A voice in Kade's earpiece | A voice on the radio, with interceptors |
| Camera | Behind Kade at street level, moving in to a two-shot when he and Iris meet | Alongside the craft, which stays large in the frame |
| Start image | `market.png` | `craft.png` |
| Orbis model | Stable, which moves in for close shots of two people | Dynamic, which holds the start image's composition |

Sky run is the sequel. Play at least one turn of Night market and then switch
to Sky run, and the story carries over: the choices you made, the events that
happened, and how far each character trusts you. The story is held in the
browser, so reloading the page in between loses it. Start Sky run on its own
and it opens from its default state, in which Kade and Iris have already
escaped together. Night market always starts fresh.

Switching scenes ends the one that is running.

### How a turn works

1. The browser sends the story state and the chosen action to
   `POST /api/director`. The state is plain JSON held in the browser; there is
   no database.
2. The director model returns one turn as structured JSON: what happens, the
   dialogue, updated characters and threat level, the next six choices, and
   two Orbis prompts. The model is Gemini (`gemini-3.5-flash`) by default, or
   Claude (`claude-opus-5-5`) when `ANTHROPIC_API_KEY` is set.
3. The change prompt is sent to Orbis straight away with `set_prompt`. It
   describes only the next visible change.
4. The hand-back prompt follows once the change has been seen on screen. It
   names everything that should stay in the shot, because Orbis shows only what
   its latest prompt describes.
5. `POST /api/scene-check` sends a frame of the live video to the same
   provider to decide when that has happened: whether the change is visible, whether a second
   character has arrived, and whether the lead is still in frame. Dialogue
   between two characters is held until both are on screen.

Each film's rules for writing Orbis prompts live in its `orbisBrief` in
`lib/scenarios.ts`. Most of them record what did and did not work in live
tests, so read them before changing a prompt. `lib/story.ts` then applies
safeguards to every turn, for example keeping both people in the shot during a
conversation. An opening choice can also carry fixed, tested prompts in the
scenario's `openingPrompts`, which replace the director's.

A director turn takes about 13 seconds with Claude. Sessions are capped at 5 minutes, and
`lib/orbis-limits.ts` keeps session starts and steering prompts inside
Reactor's rate limits.

### Director cache

Every turn is saved as a Markdown file in `director-cache/<film>/`, so a branch
that has been played before answers instantly with no model call. The file name
carries a hash of the film, the director's instructions, the story state, and
the action. Changing a brief or the opening story therefore makes the earlier
files for that film unreachable; delete them and warm the cache again.

To fill the cache ahead of time, run the dev server and play every choice from
the start of each film:

```bash
curl -X POST localhost:3000/api/director/prewarm \
  -H 'Content-Type: application/json' -d '{"depth": 2}'
```

Depth 1 is 6 turns per film, depth 2 is 42, and depth 3 is 258. Turns that are
already cached cost nothing, so it is safe to run again. Add
`"scenario": "market"` or `"scenario": "craft"` to warm one film. The route
only works in development. The committed cache covers depth 2 for both films.

Custom directions are cached too, but only for the exact words typed.

### Testing prompts against Orbis

Open <http://localhost:3000/?raw=1> to send the custom direction box straight
to Orbis as typed, with no director. This is the quickest way to find wording
Orbis will actually render.

## Studio

`/studio` keeps the starter's manual controls: choose a start image, write the
prompt, pick a resolution, and steer the running video. It adds:

- **Write prompt**: `POST /api/write-prompt` writes an Orbis prompt from a
  short idea and the start image. Gemini (`gemini-3.5-flash`) writes it by
  default; Claude writes it instead when `ANTHROPIC_API_KEY` is set.
- **Direction HUD**: preset camera, weather, movement, and event directions
  from `lib/director-actions.ts`, each sent as a single steering prompt.

`components/hand-flight-control.tsx` steers with a hand in front of the webcam,
using MediaPipe hand tracking in the browser. It is not mounted at the moment;
the HUD buttons direct the scene instead.

## Nano Banana kickoff example

In the Studio, connect to Orbis, expand **Livestreaming example**, and click
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

## API flow

1. `POST /api/token` requests a scoped session JWT from
   `https://api.reactor.inc/tokens`.
2. `ReactorProvider` connects to `reactor/visko-orbis-stable` (or
   `reactor/visko-orbis-dynamic` for the Sky run film) with the recv-only
   `main_video` and `main_audio` tracks.
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

## Documented model behavior

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

## Project files

Scene Director:

- `app/page.tsx` and `components/scene-director.tsx` are the Scene Director
  page: the video, the action menu, the cast, and the event log.
- `app/api/director/route.ts` asks the director model for one turn and caches
  it.
- `app/api/director/prewarm/route.ts` fills the director cache in development.
- `app/api/scene-check/route.ts` asks whether something is visible in a frame
  of the live video.
- `lib/scenarios.ts` defines the films: start image, cast, story, opening
  choices, and the director's instructions.
- `lib/story.ts` contains the story state types and the prompt safeguards.
- `lib/server/director-cache.ts` reads and writes the cached turns.
- `director-cache/` holds the cached turns.
- `market.png` and `craft.png` are the films' start images.

Shared:

- `app/api/token/route.ts` performs the server-side token exchange.
- `app/api/session-cleanup/route.ts` performs best-effort session deletion when
  the browser page exits.
- `app/api/session-registry/route.ts` records verified development sessions for
  startup and shutdown cleanup.
- `scripts/dev-with-session-cleanup.mjs` wraps `next dev` with the development
  cleanup sweeps.
- `components/orbis-shell.tsx` connects a subtree to Orbis: it mints tokens and
  sets up the Reactor provider.
- `hooks/use-orbis-session.ts` contains the reusable Orbis command sequence and
  session state.
- `lib/orbis.ts` contains the public model configuration and message helpers.
- `lib/orbis-limits.ts` limits how often sessions start and prompts are sent.
- `.env.example` documents the required environment variables.

Studio:

- `app/studio/page.tsx` and `components/orbis-demo.tsx` compose the player,
  controls, and demo.
- `app/api/nano-banana/route.ts` performs the server-side image edit.
- `app/api/orbis-prompt/route.ts` creates the image-grounded video prompt.
- `app/api/write-prompt/route.ts` writes an Orbis prompt with Gemini, or with
  Claude when an Anthropic key is set.
- `components/orbis-player.tsx` renders the streamed video and audio.
- `components/orbis-controls.tsx` renders the session controls.
- `components/prompt-writer.tsx` is the Write prompt control.
- `components/scene-hud.tsx` and `lib/director-actions.ts` are the direction
  HUD and its preset prompts.
- `components/hand-flight-control.tsx` is the webcam hand steering, currently
  not mounted.
- `components/nano-banana-example.tsx` owns the kickoff example and source image.
- `dog.png` is the Nano Banana source image.
- `lib/orbis-prompt.ts` contains the plain-text Gemini grounding instruction.
- `lib/nano-banana.ts` contains the model and kickoff prompt.

For the complete command parameters, message schemas, tracks, and current model
behavior, use the public Reactor documentation:

- [Visko Orbis Stable API](https://www.reactor.inc/models/visko-orbis-stable/api)
- [Visko Orbis Dynamic API](https://www.reactor.inc/models/visko-orbis-dynamic/api)
- [Gemini image generation and editing](https://ai.google.dev/gemini-api/docs/image-generation)
- [Claude API](https://platform.claude.com/docs)
