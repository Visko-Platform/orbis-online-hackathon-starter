import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { scenarioById } from "@/lib/scenarios";
import {
  cachePathFor,
  readCachedTurn,
  writeCachedTurn,
} from "@/lib/server/director-cache";
import {
  type DirectorTurn,
  type PlayerAction,
  type Scenario,
  type StoryState,
  anchorTransition,
  applyOpeningPrompts,
  ensureTwoShot,
  holdPromptFor,
} from "@/lib/story";

// Gemini directs by default, with GEMINI_API_KEY. Claude directs instead
// when ANTHROPIC_API_KEY is set. Both get the same instructions and schema.
const DIRECTOR_MODEL = "claude-opus-5-5";
const GEMINI_DIRECTOR_MODEL = "gemini-3.5-flash";
const TIMEOUT_MS = 40_000;
const MAX_BODY_CHARS = 20_000;

const PROMPT_HEAD = `You are the narrative director of an interactive sci-fi film that is being generated live as continuous video by Orbis, a real-time video model. The player is an unseen director with access to the city's systems. They never appear on screen. Each turn they take one action, and you decide what happens next and how the film changes.

You receive the story state as JSON (the current scene, environment, characters with their motivations and trust in the player, earlier decisions, important events, threat level, objective) and the player's action.

`;

const GENERAL_STORY_RULES = `- Consequences are dynamic, not a fixed tree. Reason from the characters' motivations, the environment, and earlier decisions. Most actions should help in one way and cost something in another: disabling security during a storm might let a fugitive slip away, but also let an unidentified aircraft enter the city.
- Keep continuity. Never contradict the events list or undo an earlier decision without a reason in the story. Let earlier decisions come back to matter.
- Investigate actions reveal something concrete and new (an identity, a hidden passenger, who gave an order) and show it on screen through what characters visibly do or find. Manipulate actions change weather, lighting, security systems or other environmental conditions. Intervene actions change events directly (drones, an escape, an interception). A custom direction can be anything; honor it as far as it fits the world.
- Adjust threatLevel (1 calm to 5 critical) and each character's trust in the player (0 to 100) when the action warrants it, usually by a small step. Update the objective when the story moves on. You may introduce a new character when the story needs one, up to five in total.
- narration is one or two short sentences in present tense for the film's event log: what happened and what it means. No second-person instructions.
- onScreen is one plain sentence telling the player what they should now see in the video, using character names ("Drones fly low down the street ahead of Kade, heading for the harbor"). It must match transitionPrompt and scenePrompt.
- offScreen is one sentence about what happened somewhere the camera is not ("At the harbor, the patrol drones abandon the cargo docks"), or an empty string when everything happened in view.
- keyEvent is one sentence recording a lasting fact that future turns must remember, or an empty string when nothing lasting changed.
`;

const NEXT_ACTIONS = `## Next actions

Offer exactly two options in each of the three categories, specific to the situation right now and different from options already taken. label is two to four words in the imperative ("Disable security", "Deploy drones"). detail is one sentence saying what the player does.`;

function systemPromptFor(scenario: Scenario) {
  return [
    PROMPT_HEAD,
    "## Story\n",
    scenario.storyBrief,
    GENERAL_STORY_RULES,
    scenario.orbisBrief,
    NEXT_ACTIONS + (scenario.actionBrief ? ` ${scenario.actionBrief}` : ""),
  ].join("\n");
}

const optionList = {
  type: "array",
  items: {
    type: "object",
    properties: {
      label: { type: "string" },
      detail: { type: "string" },
    },
    required: ["label", "detail"],
    additionalProperties: false,
  },
};

const TURN_SCHEMA = {
  type: "object",
  properties: {
    narration: { type: "string" },
    storyPurpose: { type: "string" },
    whatNext: { type: "string" },
    together: { type: "string" },
    dialogue: {
      type: "array",
      items: {
        type: "object",
        properties: {
          speaker: { type: "string" },
          line: { type: "string" },
        },
        required: ["speaker", "line"],
        additionalProperties: false,
      },
    },
    onScreen: { type: "string" },
    offScreen: { type: "string" },
    transitionPrompt: { type: "string" },
    holdPrompt: { type: "string" },
    scenePrompt: { type: "string" },
    weather: { type: "string", description: "Two to five words." },
    lighting: { type: "string", description: "Two to five words." },
    security: { type: "string", description: "Two to five words." },
    threatLevel: { type: "integer", description: "1 (calm) to 5 (critical)." },
    objective: { type: "string", description: "At most twelve words." },
    characters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          look: { type: "string" },
          role: { type: "string" },
          motivation: { type: "string" },
          trust: { type: "integer", description: "0 to 100." },
        },
        required: ["name", "look", "role", "motivation", "trust"],
        additionalProperties: false,
      },
    },
    keyEvent: { type: "string" },
    actions: {
      type: "object",
      properties: {
        investigate: optionList,
        manipulate: optionList,
        intervene: optionList,
      },
      required: ["investigate", "manipulate", "intervene"],
      additionalProperties: false,
    },
  },
  required: [
    "narration",
    "storyPurpose",
    "whatNext",
    "together",
    "dialogue",
    "onScreen",
    "offScreen",
    "transitionPrompt",
    "holdPrompt",
    "scenePrompt",
    "weather",
    "lighting",
    "security",
    "threatLevel",
    "objective",
    "characters",
    "keyEvent",
    "actions",
  ],
  additionalProperties: false,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number(value) || min)));

export const runtime = "nodejs";

export async function POST(request: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!anthropicKey && !geminiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) {
    return NextResponse.json(
      { error: "The story state is too large" },
      { status: 413 },
    );
  }
  let body: {
    state?: StoryState;
    action?: PlayerAction;
    scenario?: string;
  } | null = null;
  try {
    body = JSON.parse(raw);
  } catch {
    // Handled below.
  }
  const state = body?.state;
  const action = body?.action;
  const scenario = scenarioById(body?.scenario);
  if (
    !state ||
    typeof state.scenePrompt !== "string" ||
    !Array.isArray(state.characters) ||
    !action ||
    typeof action.label !== "string" ||
    !action.label.trim()
  ) {
    return NextResponse.json(
      { error: "A story state and a player action are required" },
      { status: 400 },
    );
  }

  // Replaying a branch of the story that has been played before needs no
  // model call: the turn is read back from its Markdown file.
  const instructions = systemPromptFor(scenario);
  const cache = cachePathFor(scenario, instructions, state, action);
  const cached = await readCachedTurn(cache.file);
  if (cached) {
    // Re-apply the prompt safeguards, so a turn cached before they changed
    // still gets the current ones.
    cached.holdPrompt = holdPromptFor(scenario, cached.holdPrompt);
    ensureTwoShot(scenario, cached);
    cached.transitionPrompt = anchorTransition(
      scenario,
      cached.transitionPrompt,
    );
    applyOpeningPrompts(scenario, state, action, cached);
    return NextResponse.json(
      { ...cached, cached: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  try {
const userMessage = `Story state:\n${JSON.stringify(state, null, 2)}\n\nPlayer action (${action.category}): ${action.label}${
      action.detail ? `\n${action.detail}` : ""
    }`;
    let text: string;

    if (anthropicKey) {
      // A turn normally takes about 13 seconds. Give up at 40 instead of
      // leaving the scene frozen, and retry once at most.
      const client = new Anthropic({
        apiKey: anthropicKey,
        timeout: TIMEOUT_MS,
        maxRetries: 1,
      });
      // Streamed, then collected: the same request sent without streaming
      // hangs until the timeout instead of returning.
      const stream = client.messages.stream({
        model: DIRECTOR_MODEL,
        max_tokens: 6_000,
        output_config: {
          effort: "low",
          format: { type: "json_schema", schema: TURN_SCHEMA },
        },
        system: instructions,
        messages: [{ role: "user", content: userMessage }],
      });
      const response = await stream.finalMessage();

      if (response.stop_reason === "refusal") {
        return NextResponse.json(
          { error: "The director declined that action. Try a different one." },
          { status: 422 },
        );
      }
      if (response.stop_reason === "max_tokens") {
        return NextResponse.json(
          { error: "The director ran out of room before finishing the turn" },
          { status: 502 },
        );
      }
      text = response.content
        .flatMap((block) => (block.type === "text" ? [block.text] : []))
        .join("");
    } else {
      const ai = new GoogleGenAI({ apiKey: geminiKey! });
      const response = await ai.models.generateContent({
        model: GEMINI_DIRECTOR_MODEL,
        contents: userMessage,
        config: {
          systemInstruction: instructions,
          responseMimeType: "application/json",
          responseJsonSchema: TURN_SCHEMA,
          maxOutputTokens: 8_000,
          abortSignal: AbortSignal.timeout(TIMEOUT_MS),
        },
      });
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === "MAX_TOKENS") {
        return NextResponse.json(
          { error: "The director ran out of room before finishing the turn" },
          { status: 502 },
        );
      }
      text = response.text ?? "";
      if (!text.trim()) {
        return NextResponse.json(
          { error: "The director declined that action. Try a different one." },
          { status: 422 },
        );
      }
    }

    const turn = JSON.parse(text) as DirectorTurn;
    if (!turn.transitionPrompt?.trim() || !turn.scenePrompt?.trim()) {
      return NextResponse.json(
        { error: "The director returned no scene prompt" },
        { status: 502 },
      );
    }

    // Never send Orbis a prompt that drops the lead or the camera.
    turn.holdPrompt = holdPromptFor(scenario, turn.holdPrompt);
    turn.dialogue = (turn.dialogue ?? [])
      .filter((entry) => entry.speaker?.trim() && entry.line?.trim())
      .slice(0, 4);
    ensureTwoShot(scenario, turn);
    turn.transitionPrompt = anchorTransition(scenario, turn.transitionPrompt);
    applyOpeningPrompts(scenario, state, action, turn);

    // The schema cannot express numeric ranges, so enforce them here.
    turn.threatLevel = clamp(turn.threatLevel, 1, 5);
    turn.characters = turn.characters
      .slice(0, 5)
      .map((character) => ({ ...character, trust: clamp(character.trust, 0, 100) }));

    await writeCachedTurn(cache.file, scenario, cache.branch, turn);

    return NextResponse.json(turn, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (caught) {
    console.error("Director turn failed", caught);
    const name = caught instanceof Error ? caught.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      return NextResponse.json(
        { error: "The director took too long to answer. Choose again." },
        { status: 504 },
      );
    }
    if (caught instanceof Anthropic.APIConnectionTimeoutError) {
      return NextResponse.json(
        { error: "The director took too long to answer. Choose again." },
        { status: 504 },
      );
    }
    if (caught instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Anthropic rejected ANTHROPIC_API_KEY" },
        { status: 502 },
      );
    }
    if (caught instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The director is rate limited; try again in a moment" },
        { status: 429 },
      );
    }
    if (caught instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `The director request failed (${caught.status ?? "network"})` },
        { status: 502 },
      );
    }
    // Errors from the Gemini SDK carry an HTTP status.
    const status = Number((caught as { status?: unknown })?.status) || 0;
    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "Google rejected GEMINI_API_KEY" },
        { status: 502 },
      );
    }
    if (status === 402 || status === 429) {
      return NextResponse.json(
        {
          error:
            status === 402
              ? "The Gemini account is out of credits"
              : "The director is rate limited; try again in a moment",
        },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "The director could not resolve that action" },
      { status: 502 },
    );
  }
}
