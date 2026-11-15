// Each character's Gemini TTS voice. When every Gemini TTS model is out of
// quota, the browser's own voice takes over (lib/drama/audio.ts).

export const VOICES: Record<string, string> = {
  king: "Charon",
  queen: "Kore",
  lysa: "Aoede",
  slaver: "Fenrir",
  captain: "Orus",
  physician: "Iapetus",
  guard: "Algenib",
  narrator: "Sulafat",
};

export function voiceFor(speaker: string) {
  return VOICES[speaker] ?? VOICES.narrator;
}
