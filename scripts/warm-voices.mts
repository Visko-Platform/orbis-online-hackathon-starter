// Pre-generate every scripted line through /api/tts so the demo plays them
// from the disk cache. Run with the dev server up:
//   node --experimental-strip-types scripts/warm-voices.mts
import { SCENES } from "../lib/drama/script.ts";

const lines = Object.values(SCENES).flatMap((scene) => [
  ...scene.opening,
  ...(scene.clues ?? []),
  ...(scene.closing ? [scene.closing] : []),
]);
for (const line of lines) {
  const started = Date.now();
  const response = await fetch("http://localhost:3000/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: line.text, speaker: line.speaker, delivery: line.delivery }),
  });
  console.log(
    response.status,
    response.headers.get("x-tts-model"),
    `${Date.now() - started}ms`,
    `${line.speaker}: ${line.text.slice(0, 50)}`,
  );
}
