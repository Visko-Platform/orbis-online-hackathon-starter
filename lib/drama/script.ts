import type { SceneId } from "@/lib/drama/cast";
import type { DramaLine } from "@/lib/drama/director";

// The running order. Each scene opens on scripted lines that play instantly,
// so nobody waits on the director to get hooked, then hands over to the player.

export type SceneConfig = {
  player: "king" | "queen";
  role: { title: string; tag: string };
  /** Shown full-screen while the scene's video starts. */
  card?: { eyebrow: string; title: string; body: string };
  opening: DramaLine[];
  hints: string[];
  maxTurns: number;
  next?: SceneId;
  /** The hook that must close the scene. Played if the director's last beat
   * doesn't already land it (matched by `closingMatch`). */
  closing?: DramaLine;
  closingMatch?: RegExp;
  /** Clues for later reveals, played on the scene's last beat (before the
   * closing hook) unless the director already said them (`clueMatch`). */
  clues?: DramaLine[];
  clueMatch?: RegExp;
};

export const FIRST_SCENE: SceneId = "dinner";

export const SCENES: Record<SceneId, SceneConfig> = {
  dinner: {
    player: "king",
    role: { title: "King Aldric", tag: "You are the King" },
    opening: [
      {
        speaker: "queen",
        text: "Five years I have drunk your physician's bitter tea. Five years! You drink it.",
        delivery: "furious, voice breaking",
      },
      {
        speaker: "queen",
        text: "Go on. Tell me again that it is my fault.",
        delivery: "cold, daring him",
      },
    ],
    hints: ["The council wants an heir by spring.", "Then what good are you to me?", "Sit down, Seraphine."],
    maxTurns: 2,
    next: "hunt",
    closing: {
      speaker: "queen",
      text: "Go on, then. Go hunting. Go find someone who can give you a son.",
      delivery: "bitter, walking out",
    },
    closingMatch: /\bson\b|儿子/i,
  },
  hunt: {
    player: "king",
    role: { title: "King Aldric", tag: "You are the King" },
    card: {
      eyebrow: "The next morning",
      title: "You ride out to hunt.",
      body: "Anything to get away from her.",
    },
    opening: [
      { speaker: "captain", text: "Your Majesty! Slavers, on royal land.", delivery: "urgent, alarmed" },
      { speaker: "lysa", text: "My lord, please. Only you can stop them.", delivery: "desperate, looking up at him" },
      { speaker: "slaver", text: "Ride on, hunter. She's mine. Unless you want a taste of the whip too.", delivery: "sneering, arrogant" },
      { speaker: "captain", text: "Your Majesty? Say the word.", delivery: "quiet, waiting for orders" },
    ],
    hints: ["Who dares hunt in my forest?", "Let her go. Now.", "How much for the girl?"],
    maxTurns: 3,
    next: "chamber",
    // Plants the "staged" truth: the lock was never shut.
    clues: [
      {
        speaker: "captain",
        text: "Strange. Her chains weren't even locked, Your Majesty.",
        delivery: "puzzled, low",
      },
    ],
    clueMatch: /\block|unlocked|锁/i,
    closing: {
      speaker: "lysa",
      text: "They say the queen cannot give you a son. I can.",
      delivery: "soft whisper, close to him",
    },
    closingMatch: /\bson\b|儿子/i,
  },
  chamber: {
    player: "queen",
    role: { title: "Queen Seraphine", tag: "You are the Queen" },
    card: {
      eyebrow: "Three months later",
      title: "Now you are the Queen.",
      body: "He stopped coming to dinner. Tonight, his door is locked.",
    },
    opening: [
      { speaker: "lysa", text: "Oh... Your Majesty. We didn't hear you knock.", delivery: "smug, fake-sweet" },
      { speaker: "king", text: "Seraphine. Close the door. We will talk in the morning.", delivery: "cold, irritated" },
      // Plants the "staged" truth: her accomplice is still around.
      {
        speaker: "guard",
        text: "Your Majesty... the bald man from the forest was at the gate again last night.",
        delivery: "low whisper from the corridor, to the queen",
      },
    ],
    hints: ["Get out of my bed.", "Guards! Drag her out.", "Who is the bald man at the gate?"],
    maxTurns: 8,
  },
};
