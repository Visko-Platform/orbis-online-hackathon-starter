# Orbis hackathon starter!

A minimal Next.js example for the public Reactor-hosted Visko Orbis Stable API.
It demonstrates server-side token minting, WebRTC video and audio, text-to-video,
optional image-to-video, live prompt steering, delivery resolution, pause,
resume, and a foldable Nano Banana-to-Orbis livestreaming example.

## Requirements

- Node.js 20.9 or newer
- A Reactor API key with access to Visko Orbis Stable
- A Google Gemini API key with access to Nano Banana

## Run locally

```bash
cp .env.example .env.local
# Add your Reactor API key to .env.local.
npm install
npm run dev
```

Open <http://127.0.0.1:3000>. Both development and production startup bind to
IPv4 loopback. Keep this instance local and avoid forwarding its port. The API
routes accept same-origin browser requests without a login. Closing the page
can still request best-effort cleanup of its own session with its session JWT.

Set both keys in `.env.local`:

```dotenv
REACTOR_API_KEY=your_reactor_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Keep both keys server-side. The browser gets a scoped Reactor JWT for Orbis
and a separate short-lived token when Gemini Live opens.

## Nano Banana kickoff example

Connect to Orbis, expand **Livestreaming example**, and click
**Edit and start stream**. The bundled `dog.png` is displayed as the source
image. The server sends it with the displayed image-editing prompt to
`gemini-2.5-flash-image`. Gemini then analyzes the edited image with the user
prompt and returns a plain-text, image-grounded prompt. The
edited output is previewed, uploaded as the Orbis start image, and used with
that grounded prompt to begin the stream.

The two starting prompts are exported from `lib/nano-banana.ts`.
`NANO_BANANA_PROMPT` controls the image edit, while `ORBIS_KICKOFF_PROMPT`
describes the requested motion. The Gemini-grounded prompt is displayed for
review. The app adds the shared live-action rendering direction when it sends
the prompt to Orbis.

## API flow

1. `POST /api/token` requests a scoped session JWT from
   `https://api.reactor.inc/tokens`.
2. `ReactorProvider` connects to `reactor/visko-orbis-stable` with the
   recv-only `main_video` and `main_audio` tracks.
3. The model sends a `state` snapshot with `state.available_resolutions`.
4. If supplied, the reference image is uploaded and passed to `set_image`
   before `start`.
5. `set_resolution` stages the selected delivery tier for the next `start`.
   The app's **Fast** setting prefers 720p when offered, then 1080p, the
   smallest tier currently documented for Orbis Stable.
6. `set_prompt` supplies the required prompt, then `start` begins generation.
7. Sending another `set_prompt` while running steers the video at the next
   chunk boundary.

The app adds photorealistic live-action direction to opening prompts and live
edits. Describe the subject, action, setting, and camera in the opening prompt.
For live steering, request one visible change at a time. The prompt asks Orbis
to hold the current framing, lighting, and background unless the edit changes
them. [Reactor prompting guide](https://www.reactor.inc/learn/visko-orbis-prompting-api)

## Documented model behavior

- A prompt is required before `start`; the reference image is optional.
- The app center-crops reference photos to 16:9 and caps their upload size at
  1280×720 to avoid stretching and reduce upload time. This prepares the
  opening image. The stream uses the selected delivery tier.
- **Explore in 3D** estimates depth in the browser, textures a 3D surface with
  the photo, and lets you choose a nearby viewpoint. The first preview needs
  a model download. **Use this view** sends the rendered image as the next
  opening frame. Depth is estimated from visible pixels, so camera movement
  is limited. Orbis receives the rendered still and generates the video.
- `set_resolution` applies from the next `start`, not during the active run.
- Orbis emits chunks about every 1.8 seconds. The first chunk emits no frames
  while the upscaler primes; this is expected.
- Commands are asynchronous. Use model events such as `state`,
  `prompt_accepted`, `resolution_accepted`, `generation_started`,
  `chunk_complete`, and `command_error` as the source of truth.
- `pause` takes effect after the current chunk. `resume` continues the same
  generation, and `reset` clears the current prompt and image.

## Project files

- `app/api/token/route.ts` performs the server-side token exchange.
- `app/api/session-cleanup/route.ts` performs best-effort session deletion when
  the browser page exits.
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

## Local camera studio

Run `npm run dev` and open [Camera Studio](http://127.0.0.1:3000/camera) in Chrome on the Mac. Start the camera and grant camera access. To switch cameras, stop capture, choose a source, and start again. An iPhone configured for Continuity Camera can appear as one of the Mac’s sources.

Draw with the pointer or briefly pinch your thumb and index finger in view of the camera. Release to finish the stroke. **Follow → Shoulders** anchors new ink to your shoulders. **Follow → Face** attaches new ink to facial features, including the irises, or to a 3D head plane outside the face mesh. Tracking runs locally in the browser. **Pop out** opens a window you can drag to another display.

Choose **Follow → 3D hat** to draw on the crown or brim, or **3D garment** to draw on a torso surface. Turn to expose another side and keep drawing. The pointer and both hands can draw independently. The browser renders the surfaces with WebGL 2 and runs the bundled Google MediaPipe models locally. Back-of-head tracking uses an estimate from body landmarks when a face pose is unavailable. Ink stays on the surface after tracking reacquires it.

**Send to Looks** and **Capture camera** take a still of the visible angle. Orbis Stable uses the still as an image-to-video starting frame. It receives the visible pixels and generates any newly revealed views.

In Live Studio, open **Head reference** to save the front, both profiles, and back of your head from the clean webcam feed. The photos stay in the camera panel for the current visit. **Prepare Orbis look** sends the saved angles, the live composition, and a four-view render of any drawn hat to Gemini to prepare a single photorealistic starting image. The head photos help guide that image. Orbis itself receives the resulting still.

### Local Gaussian head scan

1. In **Head scan**, record a 15–30 second orbit with a movable camera, such as an iPhone selected as the camera source. Keep your head still as the camera moves around it. Fill the frame with your head, use even lighting, and include the crown and back with overlapping views. Download the scan video.
2. Install [FFmpeg](https://ffmpeg.org/), [COLMAP](https://colmap.github.io/install.html) (BSD 3-Clause), and the [Brush CLI](https://github.com/ArthurBrussee/brush/releases) (Apache 2.0). Run the local training command below. Set `HEAD_SPLAT_BRUSH` to the Brush binary’s path if it is named `brush_app` or kept outside your shell’s search path.
3. Import a trained Gaussian PLY from the output folder’s `exports` directory. Studio also opens SPZ and SPLAT files. Under **Fit head and hat**, align the hat and adjust the crop to remove nearby background. Choose an orbit and elevation. Use **Draw on hat** to add strokes directly from that angle, then select **Use for Orbis** in Live Studio. It sets the rendered JPEG as the next run’s starting image. The recording, training data, and splat are handled locally.

```sh
node 'scripts/train-head-splat.mjs' '/path/to/head-orbit.webm' '/path/to/new-head-scan-folder'
```

When the scan preview shows a drawn hat, **Use for Orbis with locked hat** sends a bare-head JPEG. Live Studio and its OBS pop-out render the original hat mesh and ink over the generated video. Tracking uses nearby orbit views from the local scan. Use a small turn near the starting angle. The hat hides when Studio can’t match the generated head pose.

Under **Camera overlays** below the preview, select **Remove** beside any drawing layer or generated piece. **Clear overlays** removes everything from the camera preview and keeps generated pieces and outfits saved in your wardrobe. Looks shows a **Delete** button beside every garment layer.

In Live Studio, switch the **Draw** panel to **Generate**, choose a slot, and describe a piece. **Generate accessory** sends the description and slot to Nano Banana. Inspect the front, angled, profile, and inside views, then select **Add to camera**. The browser tracks head angles, shoulders, and hand positions locally. Headwear uses a 3D shape based on the front and profile silhouettes and rotates as you turn, look up or down, and tilt. You can draw over the camera composition and save combinations of pieces as named looks in this browser.

**Prepare Orbis look** sends a camera still and the worn pieces’ turnaround sheets to Gemini to produce a fitted opening frame. The motion prompt also carries the selected pieces and grip direction for any hand props. Starting the Orbis run sends the prepared image and prompt to Reactor.

### Draw from an iPhone

1. Join the same Wi-Fi on both devices. Find the Mac’s Wi-Fi IPv4 address in System Settings → Wi-Fi → Details → TCP/IP.
2. Use [mkcert](https://github.com/FiloSottile/mkcert) to create a certificate for that address. Replace the example address with yours. Keep these files outside the repo.

   ```sh
   mkcert -cert-file '/private/tmp/orbis-camera-cert.pem' -key-file '/private/tmp/orbis-camera-key.pem' '192.168.1.42'
   ```

3. AirDrop only `rootCA.pem` from the directory printed by `mkcert -CAROOT` to your iPhone. Install the profile and [enable full trust](https://support.apple.com/en-us/102390). Keep both private keys on the Mac.
4. Leave Next running on its default loopback address and start the phone listener in a second terminal.

   ```sh
   npm run camera:lan -- '192.168.1.42' '/private/tmp/orbis-camera-cert.pem' '/private/tmp/orbis-camera-key.pem'
   ```

   If Next is already running on a different port, set `CAMERA_STUDIO_PORT` to that port before launching the listener.

5. Start the camera on the Mac, choose **Open on iPhone**, enter the same IP, and select **New link**. Scan the QR code using the iPhone’s Camera app and open it in Safari. If Wi-Fi disconnects, create a new link. The Mac keeps your finished ink.

The link expires after two minutes and pairs with one phone. The phone receives the live composition and sends touch input over the local network. The listener exposes the phone page, static assets, and pairing traffic. Browser tracking loads the bundled MediaPipe Hand, Pose Lite, and Face Landmarker models locally. Generating an accessory uses the Gemini project’s image generation quota.

## Looks

Open **Looks**, add a named garment, and draw a closed outline on the blank
canvas or a frozen webcam frame. **Prepare prompt** creates an editable image
prompt. **Plan together** adds up to three follow-up questions, with typed or
Gemini Live voice replies. Review the prompt and choose from three generated
candidates. Each garment has its own layer and can be replaced or reordered.
You can also transfer a frame and reference sketch from Camera Studio.

Choose **Animate look** to review the Orbis motion prompt and start a take in
Looks or hand it off to **Live Studio**. During a take, choose **Speak** and say
an edit. Clear edits apply to the running take. An ambiguous target gets one
follow-up. **Preview as still** on a garment edit can update the assembled look
while the current video continues.

The look lives in the current tab and clears on reload. Image requests send the
base and outline guide to Gemini. Voice planning and steering use a short-lived
Gemini Live token. Animation sends the flattened still to Gemini for prompt
preparation and to Orbis for video.

## Live Studio

Open **Live Studio** for the live camera, drawing canvas, Orbis render, and
steering chat. Select **Start camera** in the preview. Draw on the feed with the pointer or
pinch your thumb and index finger. **Follow**, **Open on iPhone**, and
**Pop out** share the Camera Studio controls and pairing setup above. The
separate blank canvas is ready as soon as the page opens.
With **Drive Orbis** enabled, wait for **Motion tracking ready**. Enter a
starting prompt to describe your character and setting. When motion tracking
is ready, you can leave the prompt blank to use the default scene. You can
capture the camera, prepare a sketch as a 16:9 starting image, or bring in a
prepared look from Looks. Select **Start scene** to connect and start rendering.

Keep your face, shoulders, and hands in frame. **Drive Orbis** reads body and
face landmarks locally and sends the latest stable pose to Orbis as a prompt.
Raise an arm, turn your head, or move across the frame. Orbis applies changes
at roughly 1.8-second chunk boundaries, so motion is approximate.

Turn on **Live sketch**, select **Enable microphone**, and allow microphone
access. Once the button reads **Microphone ready**, pinch to draw and speak
when **Listening…** appears. Release to steer Orbis with the
sketch and description. If live captions are delayed, the recording is
transcribed after release. You can still draw with the pointer and use
**Speak** for a separate spoken edit.

Turn on **Generate images** to have Gemini make a cutout from each described
pinch sketch. Select **Use image** to replace the visible stroke with an image
that follows the subject in the camera, Orbis render, and OBS. **Use sketch**
restores the stroke. When Follow is Off, images follow the face. Undo or clear
the source stroke to remove its image.

For OBS, choose **OBS ↗** to open the render-only window. On macOS, add a
**macOS Screen Capture** source, choose **Window Capture**, and select
**Live Studio Render**. The window shares the current session's video.
