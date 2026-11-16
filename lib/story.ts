// Story state for the Scene Director. It is plain JSON held in the browser
// and sent to /api/director with every player action; there is no database.

export type Character = {
  name: string;
  /**
   * How the character is described in Orbis prompts, e.g. "a pale-haired
   * woman in a grey hooded raincoat". Empty for someone never on screen.
   */
  look: string;
  role: string;
  motivation: string;
  /** 0–100: how much this character trusts the unseen director. */
  trust: number;
};

export type DialogueLine = {
  /** A cast member's name, e.g. "Kade". */
  speaker: string;
  line: string;
};

export type StoryState = {
  /** The settled Orbis prompt describing how the scene currently looks. */
  scenePrompt: string;
  weather: string;
  lighting: string;
  security: string;
  /** 1 (calm) to 5 (critical). */
  threatLevel: number;
  objective: string;
  characters: Character[];
  /** What this moment is for in the story, in one sentence. */
  storyPurpose: string;
  /** One sentence teasing where the story could go from here. */
  whatNext: string;
  /** How many player turns have been taken. A film runs about eight. */
  turn: number;
  /** Who is physically with the lead right now, and how they stand. */
  together: string;
  /** The most recent lines spoken, oldest first. */
  dialogue: DialogueLine[];
  /** Player decisions so far, oldest first. */
  decisions: string[];
  /** Important story events so far, oldest first. */
  events: string[];
};

export type ActionCategory = "investigate" | "manipulate" | "intervene";

export type ActionOption = {
  /** Short button text, e.g. "Disable security". */
  label: string;
  /** One sentence saying what the director does. */
  detail: string;
};

export type ActionMenu = Record<ActionCategory, ActionOption[]>;

export type PlayerAction = {
  category: ActionCategory | "custom";
  label: string;
  detail: string;
};

/** What /api/director returns for one player action. */
export type DirectorTurn = {
  /** One or two sentences for the narrative log. */
  narration: string;
  storyPurpose: string;
  whatNext: string;
  together: string;
  /** Lines spoken this turn, in order. */
  dialogue: DialogueLine[];
  /**
   * The look of the character who speaks to the lead in person this turn, or
   * "". The app holds the dialogue until this person is actually on screen.
   */
  waitFor: string;
  /** That character's look without an article, or "" when there is none. */
  partnerLook?: string;
  /** Plain words: what the viewer should now see in the video. */
  onScreen: string;
  /** What happened somewhere the camera is not, or "" if nothing did. */
  offScreen: string;
  /** Orbis prompt for the moment of change. */
  transitionPrompt: string;
  /** Orbis prompt for the scene once the change has played out. */
  scenePrompt: string;
  /**
   * Short follow-up that hands the film back to the lead. Orbis keeps
   * following its latest prompt, so if that prompt is about a vendor or a
   * drone, the camera wanders off to them.
   */
  holdPrompt: string;
  weather: string;
  lighting: string;
  security: string;
  threatLevel: number;
  objective: string;
  characters: Character[];
  /** A lasting story fact to remember, or "" if nothing important changed. */
  keyEvent: string;
  actions: ActionMenu;
};

export const ACTION_CATEGORIES: { id: ActionCategory; name: string }[] = [
  { id: "investigate", name: "Investigate" },
  { id: "manipulate", name: "Manipulate" },
  { id: "intervene", name: "Intervene" },
];

/** Everything that differs between one film and another. */
export type Scenario = {
  id: string;
  name: string;
  /** The Orbis model this film runs on, if not the app's default. */
  model?: string;
  /** The id of the film this one follows on from, if any. */
  continues?: string;
  /** Who the film follows, for labels: "Kade", "the craft". */
  leadName: string;
  /** The cast name of the lead when they are a character, else "". */
  leadCharacter: string;
  /** How the lead is described in Orbis prompts, starting with "the". */
  leadLook: string;
  /** A word every hand-back prompt must contain, e.g. "trench coat". */
  leadWord: string;
  /**
   * What the frame check looks for when deciding whether the film has drifted
   * away from the lead. Defaults to the lead's look.
   */
  watchLook?: string;
  /**
   * Sentences added to every change prompt so the lead stays in the shot
   * while the change plays. For films whose framing must not move.
   */
  transitionAnchor?: string;
  /** The camera sentence that ends a hand-back prompt. */
  holdCamera: string;
  /** Hand-back prompt used when the director's is unusable. */
  defaultHold: string;
  /** Whether characters meet the lead in person and need a two-shot. */
  pairShots: boolean;
  /** Describes the start image; Orbis drifts if the prompt does not match it. */
  openingPrompt: string;
  intro: {
    title: string;
    premise: string;
    cast: { name: string; line: string }[];
    possibilities: string[];
  };
  initialStory: StoryState;
  initialActions: ActionMenu;
  /**
   * Orbis prompts for opening choices, by label, that replace the director's.
   * For choices whose wording had to be found by trying it against Orbis.
   */
  openingPrompts?: Record<
    string,
    { transitionPrompt: string; holdPrompt: string }
  >;
  initialDialogue: DialogueLine[];
  initialNarration: string;
  initialOnScreen: string;
  /** Director instructions: the plot spine and how characters interact. */
  storyBrief: string;
  /** Director instructions: how to write Orbis prompts for this film. */
  orbisBrief: string;
  /** Director instructions: what the next actions must cover, or "". */
  actionBrief: string;
};

/** The intro as short passages for the read-aloud button. */
export function introNarration(scenario: Scenario) {
  return [
    scenario.intro.title,
    scenario.intro.premise,
    ...scenario.intro.cast.map((member) => `${member.name}. ${member.line}`),
    "It could go several ways.",
    ...scenario.intro.possibilities,
  ];
}

/** Keep the lead in a change prompt for films with a fixed framing. */
export function anchorTransition(scenario: Scenario, prompt: string) {
  const text = prompt.trim();
  if (!scenario.transitionAnchor || text.includes(scenario.transitionAnchor)) {
    return text;
  }
  return `${text} ${scenario.transitionAnchor}`;
}

/** Use the tested Orbis prompts for an opening choice that has them. */
export function applyOpeningPrompts(
  scenario: Scenario,
  state: StoryState,
  action: PlayerAction,
  turn: DirectorTurn,
) {
  const fixed = state.turn === 0 && scenario.openingPrompts?.[action.label];
  if (!fixed) return;
  turn.transitionPrompt = fixed.transitionPrompt;
  turn.holdPrompt = fixed.holdPrompt;
}

/** Guarantee a hand-back prompt is about the lead and has a camera line. */
export function holdPromptFor(scenario: Scenario, prompt: string | undefined) {
  const text = prompt?.trim();
  if (!text || !text.toLowerCase().includes(scenario.leadWord.toLowerCase())) {
    return scenario.defaultHold;
  }
  return /\bshot\b|close-up/i.test(text) ? text : `${text} ${scenario.holdCamera}`;
}

/** Whether a prompt has the pair running or walking, and the words for it. */
function pairMotion(prompt: string | undefined) {
  const text = prompt ?? "";
  if (/\b(run|runs|running|sprint\w*|flee\w*|dash\w*|bolt\w*|rac(e|es|ing)|hurr(y|ies|ying))\b/i.test(text)) {
    return { verb: "run", ing: "running" };
  }
  if (/\b(walk|walks|walking|strid(e|es|ing))\b/i.test(text)) {
    return { verb: "walk", ing: "walking" };
  }
  return null;
}

/**
 * Orbis often drops the second person from a conversation, leaving the lead
 * talking to nobody. When someone other than the lead speaks in person this
 * turn, make sure both prompts open on the pair, lead first; if the
 * director's prompt opens on anything else, replace it.
 */
export function ensureTwoShot(scenario: Scenario, turn: DirectorTurn) {
  turn.waitFor = "";
  turn.partnerLook = "";
  if (!scenario.pairShots) return;

  const speakers = new Set(
    turn.dialogue.map((entry) => entry.speaker.trim().toLowerCase()),
  );
  const partner = turn.characters.find(
    (character) =>
      character.look?.trim() &&
      character.name.trim().toLowerCase() !==
        scenario.leadCharacter.toLowerCase() &&
      [...speakers].some((speaker) =>
        character.name.toLowerCase().includes(speaker),
      ),
  );
  if (!partner) return;

  const lead = scenario.leadLook;
  const look = (partner.look ?? "").trim().replace(/^(a|an|the)\s+/i, "");
  turn.partnerLook = look;
  // The app holds the dialogue until a frame check sees both of them.
  turn.waitFor = `both ${lead.replace(/^the /i, "a ")} and a ${look}, together in the same frame`;

  // In live tests one plain sentence put both people on screen within ten
  // seconds, while the director's richer versions (a lamp flickering, a
  // drive changing hands) often left one of them out. So the change prompt
  // for a conversation is always this sentence, word for word.
  //
  // The one thing kept from the director's version is whether the pair is on
  // the move. Without it a direction to run away showed them standing and
  // talking, because this sentence replaced the running one.
  const changeMotion = pairMotion(turn.transitionPrompt);
  const holdMotion = pairMotion(turn.holdPrompt);
  turn.transitionPrompt = changeMotion
    ? `Medium shot of ${lead} and a ${look} ${changeMotion.ing} side by side down the street, close together.`
    : `Medium close-up of ${lead} and a ${look} standing face to face, close together, as they talk.`;

  // The hand-back keeps them there. It may carry one sentence about the
  // light or weather around them, taken from the director's version, since
  // by then both are already in the shot.
  const ambient = turn.holdPrompt
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(
      (sentence) =>
        sentence &&
        !/trench coat/i.test(sentence) &&
        !/\bshot\b|close-up/i.test(sentence) &&
        /light|lamp|neon|dark|glow|rain|storm|fog|steam|smoke|shadow/i.test(sentence),
    )[0];
  turn.holdPrompt = [
    holdMotion
      ? `${lead.charAt(0).toUpperCase()}${lead.slice(1)} and the ${look} ${holdMotion.verb} side by side down the street, close together.`
      : `${lead.charAt(0).toUpperCase()}${lead.slice(1)} and the ${look} stand face to face, close together, talking.`,
    ambient,
    holdMotion
      ? "Medium shot of the two of them at eye level."
      : "Medium close-up of the two of them at eye level.",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * The opening state for a film that follows another one the viewer has just
 * played: what happened there, the choices made, and how far each character
 * trusts the director all carry over.
 */
export function continueStory(next: Scenario, previous: StoryState): StoryState {
  const trust = new Map(
    previous.characters.map((character) => [character.name, character.trust]),
  );
  return {
    ...next.initialStory,
    characters: next.initialStory.characters.map((character) => ({
      ...character,
      trust: trust.get(character.name) ?? character.trust,
    })),
    decisions: previous.decisions.slice(-6),
    events: [
      ...previous.events.slice(-6).map((event) => `In the earlier film: ${event}`),
      ...next.initialStory.events,
    ],
  };
}

// How many decisions and events the story remembers.
const MAX_MEMORY = 12;

/**
 * The story state after a director turn. The page and the cache warmer both
 * use this, so a branch warmed ahead of time matches the one a viewer plays
 * (the cache key covers the whole state, field order included).
 */
export function nextStory(
  previous: StoryState,
  result: DirectorTurn,
  actionLabel: string,
): StoryState {
  return {
    scenePrompt: result.scenePrompt,
    weather: result.weather,
    lighting: result.lighting,
    security: result.security,
    threatLevel: result.threatLevel,
    objective: result.objective,
    storyPurpose: result.storyPurpose,
    whatNext: result.whatNext,
    together: result.together,
    turn: previous.turn + 1,
    dialogue: [...previous.dialogue, ...result.dialogue].slice(-8),
    characters: result.characters,
    decisions: [...previous.decisions, actionLabel].slice(-MAX_MEMORY),
    events: (result.keyEvent
      ? [...previous.events, result.keyEvent]
      : previous.events
    ).slice(-MAX_MEMORY),
  };
}
