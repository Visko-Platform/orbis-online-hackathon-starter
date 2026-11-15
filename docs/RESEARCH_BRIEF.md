# Research brief: Visko Orbis hackathon (2026-11-14)

## The event
- **Build Day with Live Models | Visko x Google x Reactor**: Sat **2026-11-14, 10:00–19:00 PT**, Los Angeles, in person, ~100 builders.
  Source: https://curiousrefuge.com/all-events/visko-google-reactor-buildday
- Prizes: $4k / $2k / $1k cash ($15k pool); Google hardware for every member of the top 5 teams; AI on the Lot 2027 tickets raffled among winners.
- Suggested categories (open): film/TV, games, music, retail, education, robotics.
- Judging criteria (announced on the day): **Realtime, Creativity, Functionality**, 5 points each.
- An earlier "Visko Orbis Online Challenge (Sept 2026)" used this same starter. Forks from it show what entrants built:
  - `charchikasinha/living-storyboard`: film previz. Direct live, record to tape, branch takes, build a storyboard. The most polished; the bar to beat.
  - `restrepo-jose/...` "Sugoi Life Generator": sliders plus a bar timer that compose one prompt per bar.
  - `Paulos-ui/chainworld-orbis`, `Instators/proofgarden-orbis`: blockchain events steering a live world.
  - What they share: **the pitch is "a real-time steerable stream, which a clip model can't do."** Show steering live, mid-shot.

## Model in one paragraph
Orbis Stable (`reactor/visko-orbis-stable`) is a WebRTC session that streams `main_video` and `main_audio` continuously. `set_prompt` (+ optional `set_image`), then `start`; each new `set_prompt` morphs the picture at the next ~1.8 s chunk boundary (visible 2–4 s later). The first chunk has 0 frames; the first picture arrives ~3.7 s after start, but **cold start on a fresh pod can take minutes**. Runs can last up to ~61 min, but quality drifts after a few minutes, so `reset` + `start` to get a clean scene.

## Cost and limits
- **$0.0097/s ≈ $0.58/min ≈ $35/hr** while connected (ready → closed), whether or not it's generating. Dynamic is about 2.15× that.
- 5 concurrent sessions per account; 10 new per minute. 429 = rate limit or no GPU capacity → back off and retry. 402 = out of balance.
- Moderation can **terminate the session** on a flagged prompt or image. Keep demo prompts clean.
- A session only accepts the JWT that created it. Never re-mint mid-session (fails with 403).

## Prompt rules (prompt guide; the newest source wins over SKILL.md)
- Opening prompt: WHO + WHAT + WHERE + camera, 1–3 sentences, under ~100 words, one concrete main subject, fewer than 4 characters.
- Follow-ups: **one visible change per prompt**, phrased as a state transition. Don't restate the whole world (SKILL.md says the opposite; compromise with short anchor phrases).
- Bring subjects in or out through an action. Move between locations by travelling, not by jumping.
- No negation ("no people" adds people). No vague intent words ("cinematic"); describe the light and the camera.
- Don't send prompts faster than chunks land (~2 s). Debounce UI input.
- Text goes through a server-side prompt rewriter; `passthrough: true` sends it verbatim.
- Audio prompt: one sentence about sound only, or leave it empty (picture-driven audio measures best).
- Reference image: pre-crop to 16:9 (it's resized to 832×480 with no crop).

## SDK notes
- The starter uses the generic `@reactor-team/js-sdk@3.0.2` (`useReactor`, `sendCommand("set_prompt", …)`, `useReactorMessage`), not the typed `@reactor-models/visko-orbis-stable`.
- js-sdk 3.x: an awaited command returns its reply. Rejections resolve to `undefined` and show up as a `command_error` broadcast; they don't throw.
- Since 3.2.0, `state` no longer echoes the prompt, so the app must track what it sent.
- `requestClip(seconds)` returns a short-lived MP4/HLS link (useful for "save this moment" features).
- Several viewers can attach to one session and it counts as one slot (useful for audience or multiplayer demos).

## Sources
- Reactor docs: https://www.reactor.inc/models/visko-orbis-stable/api (prompt guide, schema, chunks and timing, auth, billing, rate limits, moderation)
- Reference app: https://github.com/reactor-team/create-reactor-app (typed SDK, token resolver)
