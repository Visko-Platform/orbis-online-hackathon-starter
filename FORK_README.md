# Orbis fork: features and architecture

This document describes the product and implementation added to this fork of
the Visko Orbis hackathon starter, plus the current hand interaction and
opening-sketch refinements. The original starter demonstrates a server-minted
Reactor token and a browser connection to Orbis Stable. This fork builds camera,
look-design, and live-production workflows around that session.

## What this fork adds

### Camera Studio

`/camera` provides a local camera canvas with pointer drawing and tracked
drawing. The browser runs bundled MediaPipe face, hand, and body models in
workers. Camera tracking and drawing remain in the browser. Ink can follow face
features, shoulders, body joints, or tracked 3D head and garment surfaces.
Recent changes split hand gesture and drawing logic into focused modules,
separate hand tracking from body tracking, and improve how long tracking
anchors remain usable through brief detection gaps.

The studio can capture a camera frame, save front/profile/back head references,
record a head orbit for local Gaussian splat training, and build a local
wardrobe of generated pieces. Headwear can be fitted to a head scan; generated
pieces can be anchored to head, torso, or hands and previewed over the live
camera. A render-only popup can be selected as an OBS window source.

### Looks

`/looks` lets a user describe garments, draw or import a reference outline,
prepare and edit image prompts, and generate candidate images. Garments are
kept as separate layers so a layer can be replaced or reordered. A prepared
look can be animated in Looks or sent to Live Studio. Look drafts are held in
the current browser tab and are not a server-side account library.

Gemini handles image generation, prompt preparation, planning questions, and
audio transcription. Gemini Live is used for interactive voice planning and
steering through short-lived tokens minted by the server.

### Live Studio

`/live` combines camera capture, drawing, an Orbis stream, prompt steering, and
an OBS output window. Its setup guide walks through camera, controls,
microphone, starting image, and generation. A prepared image from Looks, an
uploaded image, or a camera capture can supply the opening frame.

Live sketches associate each drawn mark with its transcript and screen bounds.
They can be submitted as a group to describe a scene effect and where it
belongs. The opening-sketch flow prepares that direction before Orbis starts;
later sketches steer the active take. Optional generated sketch cutouts can
replace strokes and follow the subject across the camera preview, Orbis render,
and OBS output.

Hand input uses a four-finger pinch (all four fingertips gathered to the
thumb) to draw, and a fist to trigger speech capture when drawing is inactive.
The microphone transcript is linked to the relevant sketch or used as a scene
edit. Audio transcription is bounded by request limits and a timeout, and
accepts common browser recording formats.

Drive Orbis uses locally tracked face and body landmarks to turn movement into
short prompt updates. Orbis applies prompt steering at generation chunk
boundaries, so movement is translated into approximate actions rather than
direct frame-by-frame control.

## How the pieces work together

1. The browser requests a scoped Reactor session token from `/api/token`; the
   API key remains server-side. `use-orbis-session.ts` connects through the
   Reactor SDK and sends image, prompt, resolution, start, pause, resume, reset,
   and steering commands.
2. Camera and hand tracking run in `public/camera-tracker.js` using locally
   served MediaPipe assets. `lib/camera/tracking.ts` coordinates workers,
   gesture recognition, drawing, and tracking results. Camera images are
   captured/composited in the browser before a selected image is sent to the
   generation APIs.
3. `use-pinch-layers.ts` collects gesture-driven strokes and speech; the
   drawing and audio modules keep the transcript associated with its stroke.
   `use-live-sketch.ts` packages the opening or live edits and calls
   `/api/live-sketch`, which validates bounded inputs and asks Gemini for
   concise scene direction.
4. Look, accessory, image, prompt, and transcription endpoints live under
   `app/api`. They validate request inputs and call Gemini from the server.
   Browser code talks to these same-origin routes and never receives the
   Gemini API key.
5. Orbis renders the generated video and audio in the browser. Live Studio can
   mirror that render into a dedicated popup window for capture software.

The principal entry points are `app/camera/page.tsx`, `app/looks/page.tsx`,
and `app/live/page.tsx`. Their feature UI is organized under `components/`,
reusable state and interactions under `hooks/`, camera/looks logic under
`lib/`, and server routes under `app/api/`.

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

Useful pages are `/camera`, `/looks`, and `/live`. The optional local head-scan
training workflow uses FFmpeg, COLMAP, and Brush; see the head-scan section in
the root README for its command and workflow.

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

The fork also contains earlier product work in the commits based on the
upstream starter: Camera Studio and its local tracking/wardrobe tools, Looks
and its image/voice workflows, Live Studio and OBS output, and prompt/session
integration. The root `README.md` retains the end-user walkthrough for those
features.
