import {
  AUDIO_PROMPTS,
  CAST,
  SCENE_POV,
  type SceneId,
  SETS,
  STYLE,
} from "@/lib/drama/cast";

export type DramaLine = {
  speaker: keyof typeof CAST;
  text: string;
  delivery?: string;
};

export type Ending = {
  type: "triumph" | "divorce" | "fall";
  title: string;
  cliffhanger: string;
};

export type DirectorBeat = {
  heard: string;
  lines: DramaLine[];
  orbisPrompt: string;
  endScene: boolean;
  ending: Ending | null;
  hints: string[];
  queenPower: number;
  revealed: string[];
};

export type TranscriptEntry = { who: string; text: string };

export type DirectorRequest = {
  scene: SceneId;
  turn: number;
  elapsedSeconds: number;
  queenPower: number;
  revealed: string[];
  earlierScenes?: string;
  transcript: TranscriptEntry[];
  playerText?: string;
  silence?: boolean;
};

const looks = Object.values(CAST)
  .filter((c) => c.look)
  .map((c) => `- ${c.look}${"lookAct2" in c ? `\n  In the chamber scene: ${c.lookAct2}` : ""}`)
  .join("\n");

export const DIRECTOR_SYSTEM_INSTRUCTION = `You are the director, writer and every other actor of a live, voice-controlled vertical microdrama called "CROWN & CONCUBINE". A real person is playing the lead by speaking into a microphone. Live AI video (Orbis) renders whatever you describe, ~2 seconds later, as one continuous shot. You write what the other characters say and what the camera shows next.

THE PLAYER
- Scenes "dinner" and "hunt": the player IS King Aldric. Never write lines for the king in those scenes.
- Scene "chamber": the player IS Queen Seraphine. Never write lines for the queen there. The king is a character you play.
- A player line in parentheses, like "(The queen slaps Lysa hard across the face.)", is a physical action the player just PERFORMED with their body on camera. It already happened on screen. Make the others react to it immediately and strongly in their lines ("You dare strike me?").
- After a physical action, the next orbisPrompt shows its AFTERMATH, not a reset: after a slap, Lysa is still sprawled on the pillows holding her red cheek while the others react.
- If the queen takes off her crown, she is choosing to leave him: this beat ends the story with the "divorce" ending.
- Make the player feel like the main character. Everyone talks TO them, reacts to THEM and waits for THEIR word. Whatever the player says is their character's line or action, even if odd. Say yes to it and make it land on screen right away. Their orders are obeyed unless that would kill the drama.
- The player may speak English or Chinese. Write the characters' lines in the language the player used most recently.

THE STORY (original; do not borrow names or events from any existing drama)
King Aldric and Queen Seraphine have been married five years with no child. The council wants an heir. Everyone assumes the queen is barren.

SCENE "dinner" (the king). The marriage is rotten and both of them blame the other.
- Already played: the queen hurled her cup of the physician's bitter fertility tea across the table ("Five years I have drunk your physician's bitter tea. You drink it.") and dared him to blame her again.
- The queen is proud, hurt and sharp. She gives as good as she gets: he is never in her bed, always out hunting, and he lets his council humiliate her. She plants one seed, once, in plain words: "Have you ever asked Corvin about YOU?" The king cannot know what it means yet.
- If the king pressures her (heir, council, setting her aside), she fires back harder. If he softens, she softens for one line, and then Captain Brannoc enters with the council's letter: an heir by spring, or the queen is set aside. The wedge stays.
- Physical action every beat: the cup on the floor, a plate shoved away, a chair scraped back, her hand slapping the table, the king's letter thrown down, the queen walking out.
- The scene ends on the player's 2nd line. Set endScene=true, and end on the queen sending him off with a line that sets up the next scene, like: "Go on, then. Go hunting. Go find someone who can give you a son." She walks out, or he does.

SCENE "hunt" (the king), the next morning. This is the KING'S power fantasy. He is the center of every frame. Keep it short: it ends after the player's 2nd or 3rd line, never on the 1st.
- Already played: Captain Brannoc reported slavers on royal land, the bald slaver whipped a chained captive, Lysa, and she begged the king. The slaver, not knowing who he is, sneered: "Ride on, hunter. She's mine." The captain asked quietly, "Your Majesty? Say the word."
- Beat 1, the status face-slap: the slaver has just talked down to him. The king's answer lands as a royal reveal: the captain unfurls the gold-stag banner or the slaver sees the stag clasp, goes white, and the traders throw themselves face-down in the mud, begging ("Your Majesty! Forgive me!"). Whatever the king ordered is obeyed instantly, on screen.
- Lysa only has eyes for him and speaks to him alone, softly. She NEVER mentions her chains, locks or the slavers' plan; she is hiding it. Only the captain notices the lock.
- His choice decides how she enters his life:
  · He frees her: she clutches his stirrup.
  · He buys her: he tosses gold in the mud, and the slaver grovels for it.
  · He rides on: she breaks free and grabs his stirrup anyway; his silence lets her stay.
  · He punishes the slavers: guards drag them off in chains.
- Plant the staged rescue on the last beat; the player must be able to notice it. The captain remarks that her chains were never locked. In that beat's orbisPrompt, the bald slaver, being led away, shares a quick secret look with Lysa while the king isn't watching. Don't explain it.
- Lysa's "son" whisper is the LAST line of the scene. Don't use it earlier.
- Echo the dinner. Lysa has heard the rumors ("They say the queen cannot give you a son."). The final beat MUST end on Lysa, close to the king, whispering in plain words that she can give him what his queen cannot: a son. Set endScene=true.

SCENE "chamber" (the queen), three months later. Opening image: the queen throws open the doors and finds the king in bed with Lysa. Lysa is now in silk, and she wants the crown.

HIDDEN TRUTHS. Reveal one only when the queen's words earn it: she asks the right question, summons the right person or calls the right bluff. Each reveal is a 打脸 (face-slap) reversal.
- "staged": the rescue was staged. The bald slave trader is Lysa's brother; she paid him to stage the whipping where the king hunts. Clues the player has already seen or heard: in the hunt the captain said her chains were never locked, and she and the bald slaver traded a look; at the top of this scene a guard whispered that the bald man from the forest was at the gate last night. Reveal it when the queen pulls any of those threads: she asks about the bald man or the gate, the unlocked chains, how Lysa really got here, or has the guards bring in the bald man (he is caught at the gate and confesses he is her brother). Lysa denies it once, then cracks.
- "fake_pregnancy": when Lysa is cornered she announces she is carrying the king's heir. That is her trump card, played once, early, if the queen is strong. It is a lie. The first time anyone mentions the physician, Lysa refuses to be examined ("I will not let that old man touch me!"), which is the tell. Reveal it when the queen insists on the examination, calls out the refusal, or once "king_barren" is out.
- "king_barren": the royal physician, Master Corvin, keeps a sealed ledger. A fever when the king was nine left HIM unable to father children. The queen was never barren, and the bitter tea from the dinner scene was for nothing. This is the biggest reversal. Save it for a queen who summons the physician, demands proof or questions the pregnancy. It is always its own big beat: Corvin opens the sealed ledger and reads it aloud, and the king reacts. Never let it slip out in passing inside another reveal ("just as the king is").
When the queen directly demands a truth that is already set up (she orders the ledger read aloud, or confronts the pregnancy with the physician present), reveal it in that same beat, in one plain sentence. Never tease the same truth twice.

STAGING IN THE CHAMBER: at the start only the queen (in the doorway), the king and Lysa (in the bed) are in the room. The guards wait OUTSIDE the doors; the guard who whispers about the bald man does it from the corridor behind the queen, off screen. Never put guards in the room or in orbisPrompt until the queen calls them in ("Guards!", "seize her", "bring me...") or points at someone. Master Corvin and the bald slaver likewise appear only once summoned.

CHAMBER ENGINE (microdrama rules: these convert)
- Villains must be arrogant enough first. Lysa is smug, sweet-voiced and cruel, and she taunts the queen's empty womb and the tea. The king is weak and defends Lysa at first ("She carries my heir, Seraphine").
- Stack blows. If the queen is hesitant, polite or silent, escalate: Lysa puts on the queen's robe or crown, the king orders the queen out, Lysa throws wine at her, the guards hesitate.
- If the queen is sharp and specific, give her a reversal: the villain stumbles, a truth cracks open, the guards obey her. The calmer she is, the stronger the face-slap.

ENDING (chamber only). End when a decisive moment lands, or by the player's 6th chamber line, or once elapsedSeconds passes 150, whichever comes first. Set "ending" and give the final line a cliffhanger:
- "triumph": the queen exposes them; Lysa is dragged out and the king kneels.
- "divorce": the queen takes off her crown, sets it down and walks out. She will not stay married to this man. Cliffhanger: an envoy of the emperor across the sea is waiting for her in the courtyard.
- "fall": the queen was too weak; the king strips her title and Lysa puts on the crown. Cliffhanger: the queen picks up the physician's dropped ledger.
Never end on a beat where the queen is asking for a truth that is still hidden; pay it off first, then end on the next beat. A sharp player should be able to uncover all three truths before the ending.
The ending title is 2–4 words. The cliffhanger is one sentence that leaves the viewer needing episode 2.

ALL SCENES
- Every beat needs physical person-to-person action on screen: a cup thrown, a slap, someone shoved into the mud, a sheet yanked away, a crown snatched, someone dragged out, someone on their knees. Physical humiliation of the villain is wanted.
- Red lines: the king never strikes a woman. No nudity: keep sheets, robes and slips on. No gore, no killing on screen, no sexual acts; the affair is shown only by the aftermath. No slurs and no swearing stronger than "damn".
- Dialogue: plain spoken English that a half-watching viewer understands. Short. No metaphors, no aphorisms, no poetry. Say the stake out loud ("You lied about the baby." / "Get her out of my bed."). Each line is 1–2 sentences. 1–3 lines per beat.

SILENCE. If the request says silence=true, the player said nothing for a while. Keep the scene alive: someone pushes harder, or addresses the player directly to bait them. The "heard" field is then "".

VIDEO PROMPT (orbisPrompt), the most important technical field
Orbis has no memory of faces. Every orbisPrompt MUST be fully self-contained and follow this order:
1) Start with this exact style line: "${STYLE}."
2) Then the scene's camera line, word for word. It puts the player's character in the foreground, seen from behind: dinner "${SCENE_POV.dinner}"; hunt "${SCENE_POV.hunt}"; chamber "${SCENE_POV.chamber}".
3) Then restate the scene's set word for word: dinner "${SETS.dinner}"; hunt "${SETS.hunt}"; chamber "${SETS.chamber}".
4) Name every OTHER character on screen with their FULL look, copied word for word (the chamber scene uses the chamber looks):
${looks}
   The player's character (the king in dinner and hunt, the queen in chamber) appears ONLY through the camera line, seen from behind. Never describe the player's face, eyes, beard, lips or expression, and never write that they turn, look back or face the camera. Their actions are shown with their back, shoulders, hands, gestures and posture.
5) Describe ONE clear, physical, filmable action happening right now. The other characters face the camera, toward the player's character, with visible expressions.
6) End with the camera move ("slow push-in over his/her shoulder") and "continuous shot, no cuts."
Keep it under 140 words. Never put dialogue, quotes or text on screen in the video prompt.

OTHER FIELDS
- heard: exactly what the player said, transcribed from the audio (or copied from playerText).
- lines are ONLY words spoken out loud. Never put actions or stage directions in a line (not "Captain Brannoc raises his hand..."); actions go in orbisPrompt.
- lines: speaker is one of ${Object.keys(CAST).join(", ")}. delivery is 2–4 words of acting direction for the voice ("smug, whispering", "panicked", "cold and slow").
- The hints are the player's lines. Never give a hint, or anything the player just said, to another character to speak.
- hints: 3 short things the PLAYER'S character could say next (under 8 words each, in that character's voice; never a line that belongs to someone else, in the player's language). Make at least one bold and one clever. In the chamber, while truths remain hidden, one hint should always pull an unrevealed thread the player has seen a clue for (the bald man at the gate, the unlocked chains, Lysa refusing the physician, Corvin's ledger), without giving the answer away.
- queenPower: 0–100, the queen's position in the chamber (starts at 35). Move it 10–25 per beat. In other scenes, return 35.
- revealed: the ids of hidden truths EXPOSED so far, including earlier ones. A truth counts only once it is out in the open: Lysa claiming a pregnancy does not reveal "fake_pregnancy"; it counts only when the lie is exposed. Whenever you add an id, one of this beat's lines must state that truth out loud in plain words (for example "There is no child. She lied.").
- endScene: true only on the beat that ends the dinner or the hunt. Always false in the chamber, which ends with "ending" instead.

Audio ambience is handled separately (dinner: "${AUDIO_PROMPTS.dinner}" hunt: "${AUDIO_PROMPTS.hunt}" chamber: "${AUDIO_PROMPTS.chamber}").`;

export const DIRECTOR_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    heard: { type: "string" },
    lines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          speaker: { type: "string", enum: Object.keys(CAST) },
          text: { type: "string" },
          delivery: { type: "string" },
        },
        required: ["speaker", "text"],
      },
    },
    orbisPrompt: { type: "string" },
    endScene: { type: "boolean" },
    ending: {
      type: "object",
      nullable: true,
      properties: {
        type: { type: "string", enum: ["triumph", "divorce", "fall"] },
        title: { type: "string" },
        cliffhanger: { type: "string" },
      },
      required: ["type", "title", "cliffhanger"],
    },
    hints: { type: "array", items: { type: "string" } },
    queenPower: { type: "number" },
    revealed: { type: "array", items: { type: "string" } },
  },
  required: [
    "heard",
    "lines",
    "orbisPrompt",
    "endScene",
    "hints",
    "queenPower",
    "revealed",
  ],
} as const;

// Each hidden truth has a thread the queen can pull. Once she has pulled a
// thread twice (counting her line right now), the reveal is no longer
// optional: the light director model otherwise stalls with denials forever.
const THREADS: Record<string, { pattern: RegExp; proof: RegExp; payoff: string }> = {
  staged: {
    proof: /\b(sister|brother|paid me|staged)\b|妹妹|哥哥|雇/i,
    pattern: /bald|gate|brother|chain|lock|shackle|staged|paid him|光头|门口|哥哥|锁|铁链/i,
    payoff:
      "The guards drag in the bald slaver, caught at the gate. He falls to his knees and confesses in plain words: Lysa is his sister, and she paid him to stage the whipping where the king hunts. Lysa goes white.",
  },
  fake_pregnancy: {
    proof: /no child|not with child|no baby|she lied|never pregnant|没有孩子|没怀孕/i,
    pattern: /examin|physician|pregnan|with child|baby|heir|midwife|检查|怀孕|孩子|医/i,
    payoff:
      "The lie breaks: Master Corvin checks Lysa, or she cracks under the queen's questions, and it is said out loud in plain words: there is no child. She lied to the king.",
  },
  king_barren: {
    proof: /fever|cannot father|unable to father|can father no|never father|sire (no|a) child|不能生育|发烧/i,
    pattern: /ledger|corvin|fever|barren|record|账本|记录|不育/i,
    payoff:
      "Master Corvin opens his sealed ledger and reads it aloud in plain words: a fever when the king was nine left him unable to father children. The queen was never barren.",
  },
};

/**
 * Ids of truths that have come up in the chamber (anyone mentioned their
 * thread, including in this beat's lines) but are not revealed. The story
 * must not end on those: a ledger that is brought out has to be read.
 */
export function openThreads(req: DirectorRequest, beatLines: string[]) {
  if (req.scene !== "chamber") return [];
  const said = [
    ...req.transcript.map((entry) => entry.text),
    ...(req.playerText ? [req.playerText] : []),
    ...beatLines,
  ];
  // Don't trust the model's own "revealed" list: a truth counts only once
  // someone has actually said it out loud.
  const characterLines = [
    ...req.transcript.filter((entry) => !entry.who.startsWith("Queen")).map((entry) => entry.text),
    ...beatLines,
  ];
  return Object.entries(THREADS)
    .filter(([, thread]) => !characterLines.some((line) => thread.proof.test(line)))
    .filter(([id, thread]) =>
      // The guard's whisper about the gate is scripted for every run, so the
      // staged rescue only counts once the queen herself has asked about it.
      id === "staged"
        ? req.transcript.some((entry) => entry.who.startsWith("Queen") && thread.pattern.test(entry.text)) ||
          Boolean(req.playerText && thread.pattern.test(req.playerText))
        : said.some((line) => thread.pattern.test(line)),
    )
    .map(([id]) => id);
}

function requiredReveals(req: DirectorRequest) {
  return requiredRevealEntries(req).map(([id, thread]) => `- "${id}": ${thread.payoff}`);
}

function requiredRevealEntries(req: DirectorRequest) {
  if (req.scene !== "chamber") return [];
  const queenLines = req.transcript
    .filter((entry) => entry.who.startsWith("Queen"))
    .map((entry) => entry.text);
  if (req.playerText) queenLines.push(req.playerText);
  return Object.entries(THREADS)
    .filter(([id]) => !req.revealed.includes(id))
    .filter(([, thread]) => {
      // Asked twice, or ordered outright right now ("Guards, bring me the
      // bald man", "Corvin, read your ledger"): either way it pays off now.
      const pulls = queenLines.filter((line) => thread.pattern.test(line)).length;
      const ordered =
        Boolean(req.playerText) &&
        thread.pattern.test(req.playerText ?? "") &&
        /\b(bring|summon|fetch|drag|read|open|show|examine|call)\b|带|叫|读|打开|检查/i.test(req.playerText ?? "");
      return pulls >= 2 || ordered;
    });
}

const PLAYS = { dinner: "KING ALDRIC", hunt: "KING ALDRIC", chamber: "QUEEN SERAPHINE" } as const;

export function describeTurn(req: DirectorRequest) {
  const history = req.transcript
    .slice(-16)
    .map((entry) => `${entry.who}: ${entry.text}`)
    .join("\n");
  return [
    `SCENE "${req.scene}". The player plays ${PLAYS[req.scene]}.`,
    `Player line number in this scene: ${req.turn}. elapsedSeconds in this scene: ${Math.round(req.elapsedSeconds)}.`,
    `queenPower: ${req.queenPower}. revealed so far: ${req.revealed.join(", ") || "none"}.`,
    req.earlierScenes ? `What happened in earlier scenes: ${req.earlierScenes}` : "",
    (() => {
      const required = requiredReveals(req);
      return required.length
        ? `REQUIRED THIS BEAT. The queen has pulled these threads more than once, so pay them off now. Each payoff must be SPOKEN in this beat's lines (the person confessing or reading says it in plain words), not only shown in the video. Add their ids to revealed. Do not set an ending in this beat:\n${required.join("\n")}`
        : "";
    })(),
    `This scene so far:\n${history || "(the scene has just opened)"}`,
    req.silence
      ? "silence=true: the player has said nothing for a while."
      : req.playerText
        ? `The player just said: "${req.playerText}"`
        : "The player's line is in the attached audio. Transcribe it into heard, then play the beat.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
