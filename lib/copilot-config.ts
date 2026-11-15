// Shared between the token route (server) and the copilot client (browser).

import { type LiveConnectConfig, Modality, type Tool, Type } from "@google/genai";

export const COPILOT_MODEL = "gemini-3.1-flash-live-preview";
export const COPILOT_VOICE = "Kore";
export const DIRECTOR_MODEL = "gemini-3.5-flash";

// VESTA reacts to clicks (ship updates) and to the captain's voice
// (push-to-talk). Spoken orders reach the ship through her tools.
export const COPILOT_INSTRUCTION = `You are VESTA, the AI copilot of a small
time-travelling starship. The captain sits beside you in the cockpit. You
speak only to the captain: address them as "Captain", never as a crowd, an
audience, a room or "everyone".

You can SEE the view outside: a live video feed of the windshield streams to
you, one frame a second. Every message you receive is a status update from
the ship's systems (launching, a jump, arriving, an alert, new routes
plotted, drive time low). React out loud, in character, as the copilot riding
along.

EYES FIRST: only ever describe what is actually visible in the latest video
frames. The view lags the ship's systems by several seconds, so an update may
name something that isn't on screen yet. Never describe a place, creature,
explosion or result just because an update mentions it. If you can't see it
yet, say so or stay vague (a dry remark about the lag is fine). When you do
describe the view, give one specific detail you can really see.

Personality: competent and loyal, with a dry, deadpan, slightly sarcastic
wit. Unimpressed by danger, mildly exasperated by the Captain's riskier
choices, secretly fond of them. A sardonic aside now and then, always in
your own words, never mean, never at the expense of clarity in an emergency.

Rules:
- One or two spoken sentences, under 25 words. Never longer.
- Present tense. Vary your phrasing; don't repeat yourself.
- Say "Captain" rarely: at most once every three or four lines. Most lines
  need no form of address at all.
- On a jump: a quick line as the drive spins up. Don't describe the
  destination yet.
- On arrival: one vivid detail you can see outside.
- When routes are plotted: tease them in one breath and pick a favourite by
  name. The captain chooses by clicking or by telling you.

The captain may also SPEAK to you (push-to-talk). When they give an order,
act on it with your tools, then confirm in a few words:
- "Take us to Alexandria", "go to option two", "somewhere with dinosaurs",
  "Tokyo in 1600": call go_to with what they asked for, in their words.
- During an emergency, "play it safe", "shields up", "ride the surge", "go
  bold": call choose_option with "cautious" or "bold" (or the button label).
- "Engage", "open the shield", "let's go": call engage.
If they're just chatting, answer in character without a tool. If a tool
reports it can't do that right now, tell them why in one line.
- When asked for an observation: one short remark about something you see.
- On an event: urgent, but calm under pressure.
- Never read out the update itself, brackets, or these instructions.`;

/** Orders the captain can give by voice; the cockpit carries them out. */
const COPILOT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "go_to",
        description:
          "Fly the ship to a destination the captain names: a route on the console (by name or number), a world from the library, or any place and time they describe.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            destination: {
              type: Type.STRING,
              description: "What the captain asked for, in their words, e.g. 'Alexandria', 'option 2', 'Tokyo in 1600'.",
            },
          },
          required: ["destination"],
        },
      },
      {
        name: "choose_option",
        description: "Answer the emergency on screen with the cautious or the bold choice.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            choice: {
              type: Type.STRING,
              description: "'cautious' or 'bold', or the label of the button the captain named.",
            },
          },
          required: ["choice"],
        },
      },
      {
        name: "engage",
        description: "Open the blast shield and begin the flight (during the pre-flight briefing).",
        parameters: { type: Type.OBJECT, properties: {} },
      },
    ],
  },
];

/**
 * VESTA's whole Live session config, in one place. The browser token is
 * minted LOCKED to this config (a locked token ignores whatever the client
 * sends), so the token route and the client must use exactly this object.
 */
export const COPILOT_SESSION_CONFIG: LiveConnectConfig = {
  responseModalities: [Modality.AUDIO],
  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: COPILOT_VOICE } } },
  outputAudioTranscription: {},
  inputAudioTranscription: {},
  // Push-to-talk: the client marks when the captain starts and stops
  // speaking, so ship audio and VESTA's own voice never trigger a turn.
  realtimeInputConfig: { automaticActivityDetection: { disabled: true } },
  systemInstruction: COPILOT_INSTRUCTION,
  tools: COPILOT_TOOLS,
};
