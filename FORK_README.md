# Orbis fork: features and architecture

This document describes the work in this fork of the Visko Orbis hackathon
starter. The main project is **Live Studio**: sketch on camera, speak a
description, and steer an Orbis video with the resulting transcription and
hand gestures.

The `/camera` and `/looks` areas are useful supporting experiments, but they
are incomplete half-projects. Keep them only if they support the Live Studio
direction; they can be removed if the goal is a focused, polished product.

## Main project: Live Studio

Open `/live` to combine a camera, a sketch canvas, voice input, and an Orbis
render. Start the camera, enable the microphone, capture or choose a starting
image, then start generation. Live Studio also provides a render-only popup for
OBS.

### The core interaction: sketch, transcribe, steer

1. **Draw a mark.** Draw with the pointer or pinch your thumb to all four
   fingertips. Each mark becomes its own layer with its own screen position.
2. **Describe it.** Speak while drawing or use the fist gesture to record a
   separate scene edit. The app transcribes the audio and associates the words
   with the right mark, so “bubbles here” stays connected to the circle drawn
   on screen.
3. **Interpret the sketch.** The app sends the camera frame, aligned sketch,
   transcript, and previous effects to a server route. Gemini turns them into
   concise visual direction and identifies effects to remove. Before the first
   Orbis frame, Live Studio prepares the opening sketch; during a take, new
   sketches and transcripts update the current direction.
4. **Steer Orbis.** The browser sends that direction through the Reactor SDK
   as an Orbis prompt update. Orbis applies changes at generation chunk
   boundaries, so steering is approximate rather than frame-by-frame.

Optional Gemini-generated cutouts can replace drawn strokes and follow the
subject in the camera view, Orbis render, and OBS output. With Drive Orbis on,
locally tracked body and face movement can also contribute prompt updates.

### Hand gestures

The camera worker returns hand landmarks. `hand-gesture.ts` recognizes a
four-finger pinch with a small release tolerance, so bringing the four
fingertips to the thumb starts drawing and separating them finishes the mark.
When no sketch is active, a held fist starts microphone capture; opening the
hand ends capture and starts transcription. Briefly missed camera frames are
smoothed so they do not fragment a stroke or trigger an unintended gesture.

### Supporting experiments: `/camera` and `/looks`

These are broader experiments, not the center of the fork. `/camera` includes
tracked drawing, head/garment surfaces, wardrobe accessories, head references,
and a local head-scan workflow. `/looks` experiments with garment layers,
reference sketches, image generation, prompt planning, and voice. Both can
provide a starting image or ideas for Live Studio, but neither is required for
the main sketch-and-steer flow. They are candidates for removal if reducing
scope is more important than preserving those experiments.

## How the pieces work together

1. `use-pinch-layers.ts` records strokes and speech state. `hand-drawing.ts`
   turns recognized pinches into ink events and fist holds into audio capture
   events.
2. `pinch-audio.ts` and `live-audio.ts` record audio; `/api/looks/transcribe`
   validates and transcribes clips. Transcript text and stroke bounds are
   retained together as sketch-layer context.
3. `use-live-sketch.ts` captures an aligned camera frame and sketch, then calls
   `/api/live-sketch`. The route validates bounded inputs and asks Gemini to
   describe the requested effects and any removals.
4. `use-orbis-session.ts` connects through the Reactor SDK using a scoped token
   from `/api/token`. It starts the scene and sends later prompt updates to
   steer the render.
5. Camera and hand landmarks are processed locally by
   `public/camera-tracker.js` and coordinated in `lib/camera/tracking.ts`.
   Server-side routes hold the Gemini and Reactor credentials; the browser
   receives only the scoped session token and workflow results.

The main entry point is `app/live/page.tsx`. Supporting experiments start at
`app/camera/page.tsx` and `app/looks/page.tsx`. UI is organized under
`components/`, reusable state and interactions under `hooks/`, and core logic
under `lib/`; server routes live under `app/api/`.

## Run locally

Use Node.js 20.9 or newer. Copy `.env.example` to `.env.local`, configure the
keys required by the workflows you want to use, install dependencies, and
start the development server:

```sh
cp .env.example .env.local
npm install
npm run dev
```

The app binds to `127.0.0.1:3000`. The Orbis demo requires a Reactor API key;
Gemini-powered features require a Gemini API key. Keep both keys in the local
server environment. Camera routes require browser camera permission and work
best in a browser with WebRTC, WebGL 2, and worker support. Camera assets are
served locally from `public/camera-models` and `app/camera/wasm`.

Open `/live` for the primary project. The optional `/camera` head-scan
experiment uses FFmpeg, COLMAP, and Brush; see the root README for its command.

## Fork-specific changes in this update

- Reworked pinch recognition and stroke lifecycle around a four-finger pinch;
  separated hand drawing and gesture recognition into `lib/camera/` modules.
- Split hand tracking from body/face tracking in the camera worker and added a
  focused hand-gesture regression script under `tests/`.
- Connected opening sketch preparation to generation start and update, and
  retained transcript-to-stroke association when describing multiple effects.
- Adjusted live steering so current sketch effects are combined with scene
  edits in a stable order.
- Improved camera tracking continuity, including filtering implausible body
  landmark jumps and retaining usable anchors across short detection gaps.
- Hardened voice capture and transcription with input checks, additional audio
  MIME support, timeout handling, retry behavior, and clearer failure states.
- Updated camera and Live Studio guidance to explain the revised gestures and
  opening sketch workflow.

The root `README.md` retains detailed setup and workflow instructions,
including the supporting Camera Studio and Looks experiments.
