// Fixed looks for every character and set. Orbis has no memory of faces, so
// every prompt we send restates these strings word for word. Change a look
// here and it changes everywhere (prompts, opening frames, director).

export const STYLE =
  "Cinematic live-action period drama, photorealistic, medieval European fantasy kingdom, shallow depth of field, rich film color grade, 16:9";

export const CAST = {
  king: {
    name: "King Aldric",
    look: "King Aldric (early 30s, tall, dark wavy shoulder-length hair, short trimmed dark beard, grey eyes, thin gold circlet, black fur-trimmed cloak fastened with a gold stag clasp, over dark leather riding armor)",
    // In the chamber scene.
    lookAct2:
      "King Aldric (early 30s, dark wavy shoulder-length hair, short trimmed dark beard, grey eyes, bare-chested, no circlet)",
    voice: "Charon",
  },
  queen: {
    name: "Queen Seraphine",
    look: "Queen Seraphine (late 20s, regal and beautiful, sleek black hair in a jeweled braided crown, dark eyes, red lips, midnight-blue velvet gown with gold embroidery, ruby necklace)",
    voice: "Kore",
  },
  lysa: {
    name: "Lysa",
    look: "Lysa (early 20s, strikingly beautiful, long copper-red hair, green eyes, pale freckled skin, torn ivory linen shift, iron shackles on her wrists)",
    lookAct2:
      "Lysa (early 20s, strikingly beautiful, long loose copper-red hair, green eyes, pale freckled skin, crimson silk slip, gold bangles on her wrists)",
    voice: "Aoede",
  },
  slaver: {
    name: "Slaver",
    look: "three rough slave traders in dirty leather and furs, the leader bald with a scarred face holding a coiled whip",
    voice: "Fenrir",
  },
  captain: {
    name: "Captain Brannoc",
    look: "Captain Brannoc of the king's guard (40s, grizzled, close-cropped grey hair, steel breastplate stamped with a gold stag, red cloak) on a grey horse beside the king, a royal banner with a gold stag on black behind him",
    voice: "Orus",
  },
  physician: {
    name: "Master Corvin",
    look: "Master Corvin the royal physician (old, long white beard, bald, grey wool robe, a heavy leather-bound ledger under his arm)",
    voice: "Iapetus",
  },
  guard: {
    name: "Guard",
    look: "two palace guards in steel half-plate and dark-blue tabards with spears",
    voice: "Algenib",
  },
  narrator: {
    name: "Narrator",
    look: "",
    voice: "Sulafat",
  },
} as const;

export type Speaker = keyof typeof CAST;

// The player's character stays in the foreground of every frame, seen from
// behind, and everyone else plays to them. Their face is never described:
// describing eyes and a beard invites the model to turn them to camera, which
// is how the framing used to drift a few beats into each scene.
export const KING_BACK =
  "King Aldric seen only from behind: fur-cloaked shoulders, the back of his dark wavy shoulder-length hair, a thin gold circlet";
export const QUEEN_BACK =
  "Queen Seraphine seen only from behind: the back of her sleek black hair in a jeweled braided crown, midnight-blue velvet shoulders";

export const KING_POV = `Over-the-shoulder shot from behind and slightly above the king on his black warhorse. In the left foreground, ${KING_BACK}. The camera stays behind him; everyone in the clearing below looks up at him`;
export const KING_DINNER_POV = `Over-the-shoulder shot from behind the king seated at the head of the table. In the left foreground, ${KING_BACK}. The camera stays behind him; the queen faces him across the corner of the table`;
export const QUEEN_POV = `Over-the-shoulder shot from behind the queen. In the left foreground, ${QUEEN_BACK}. The camera stays behind her; everyone in the room faces her`;

export type SceneId = "dinner" | "hunt" | "chamber";

export const SETS: Record<SceneId, string> = {
  dinner:
    "a long candlelit royal dining hall at night, a long dark oak table with silver plates and an untouched roast, tall stained-glass windows, a cold fireplace",
  hunt: "a misty autumn pine forest at dawn, a muddy clearing, the king's black warhorse and hunting hounds",
  chamber:
    "a candlelit royal bedchamber at night, a huge canopy bed with gold silk curtains, stone walls hung with tapestries, tall carved double doors",
};

export const SCENE_POV: Record<SceneId, string> = {
  dinner: KING_DINNER_POV,
  hunt: KING_POV,
  chamber: QUEEN_POV,
};

export const OPENING_PROMPTS: Record<SceneId, string> = {
  dinner: `${STYLE}. ${KING_DINNER_POV}. ${SETS.dinner}. ${CAST.queen.look} rises from her chair and hurls a silver cup of dark herbal tea across the table; it splashes over the king's plate and the cup clatters to the floor. Her eyes are wet and furious. Slow push-in over the king's shoulder onto the queen's face, continuous shot, no cuts.`,
  hunt: `${STYLE}. ${KING_POV}. ${SETS.hunt}. Below him in the mud, ${CAST.slaver.look} drag ${CAST.lysa.look} by her chains; the bald leader cracks his whip and she cries out, then lifts her face to the king. ${CAST.captain.look}. Slow push-in over the king's shoulder, continuous shot, no cuts.`,
  chamber: `${STYLE}. ${QUEEN_POV}. ${SETS.chamber}. She has just thrown open the carved doors and stands frozen in the doorway. In the canopy bed, ${CAST.king.lookAct2} and ${CAST.lysa.lookAct2} jolt apart, clutching the gold silk sheets, caught. Candlelight flickers. Slow push-in over the queen's shoulder, continuous shot, no cuts.`,
};

// Rendered to public/scenes/<scene>.jpg by scripts/generate-scenes.mjs. A scene
// without a frame starts from its text prompt alone.
export const OPENING_IMAGE_PROMPTS: Record<SceneId, string> = {
  dinner: `${STYLE}. ${SETS.dinner}. ${KING_DINNER_POV}. ${CAST.king.look}, seen from behind and in three-quarter profile, large in the left foreground. Across the corner of the table ${CAST.queen.look} half-rises from her chair, a silver cup of dark tea in her hand, glaring at the king with wet, furious eyes. Warm candlelight, cold blue moonlight through the stained glass.`,
  hunt: `${STYLE}. ${SETS.hunt}. ${KING_POV}. ${CAST.king.look}, seen from behind and in three-quarter profile, large in the left foreground, the gold stag clasp catching the light. Below him in the center of the clearing ${CAST.lysa.look} kneels in the mud with her chains pulled taut, looking straight up at the king, pleading. The bald leader of ${CAST.slaver.look} stands over her with his whip raised, glaring up at the king. On the right ${CAST.captain.look}. Morning mist, dramatic light through the pines.`,
  chamber: `${STYLE}. ${SETS.chamber}. Over-the-shoulder shot from behind ${CAST.queen.look}, who stands in the open carved doorway in the foreground, seen from behind and in profile. In the canopy bed in the background ${CAST.king.lookAct2} and ${CAST.lysa.lookAct2} sit up startled, holding the gold silk sheets to their chests, caught. Warm candlelight, tension.`,
};

export const AUDIO_PROMPTS: Record<SceneId, string> = {
  dinner: "Echoing stone hall, a silver cup clattering on the floor, a fire that has gone cold.",
  hunt: "Cold forest wind, horses snorting, hounds whining, chains rattling in mud.",
  chamber: "Quiet stone chamber, candle flames crackling, heavy silence after a door slams.",
};

// The instant reaction shot: sent the moment the player stops talking, before
// the director has written anything, so the picture answers within one chunk
// (~2 s) instead of waiting ~4 s. Everyone stops and turns to the player.
export function reactionPrompt(
  scene: SceneId,
  present: { physician?: boolean; guards?: boolean } = {},
) {
  const others: Record<SceneId, string> = {
    dinner: `${CAST.queen.look} stops mid-gesture across the table and stares at the king, breath held, waiting for his next word`,
    hunt: `In the mud below, ${CAST.slaver.look} freeze, the whip hanging still; ${CAST.lysa.look} looks up at the king, holding her breath; ${CAST.captain.look} turns in his saddle, waiting for the king's order`,
    chamber: `In the canopy bed, ${CAST.king.lookAct2} and ${CAST.lysa.lookAct2} go still and stare at the queen${
      present.physician ? `; ${CAST.physician.look} stops beside the bed` : ""
    }${
      // Guards stay outside until the queen calls them in.
      present.guards ? `; ${CAST.guard.look} inside the doors straighten, waiting for her command` : ""
    }`,
  };
  return `${STYLE}. ${SCENE_POV[scene]}. ${SETS[scene]}. ${others[scene]}. A tense frozen beat, everyone's eyes on the ${
    scene === "chamber" ? "queen" : "king"
  }. Slow push-in over the ${scene === "chamber" ? "queen's" : "king's"} shoulder, continuous shot, no cuts.`;
}

// What each webcam gesture does in each scene: the shot Orbis gets instantly,
// the line shown on screen, and the action the director is told about so the
// characters react to it. Red line holds: the king never strikes a woman, so
// his "slap" hits the table or the slaver's whip, never the queen or Lysa.
export type GestureBeat = { prompt: string; label: string; action: string };

export function gestureBeat(
  scene: SceneId,
  gesture: "slap" | "point" | "crown",
): GestureBeat | null {
  const shot = (body: string) =>
    `${STYLE}. ${SCENE_POV[scene]}. ${SETS[scene]}. ${body} Fast push-in over the ${
      scene === "chamber" ? "queen's" : "king's"
    } shoulder, continuous shot, no cuts.`;

  const beats: Record<SceneId, Partial<Record<"slap" | "point" | "crown", GestureBeat>>> = {
    dinner: {
      slap: {
        prompt: shot(
          `The king's gloved hand slams down on the oak table; silver cups jump and wine spills. ${CAST.queen.look} flinches back in her chair, shocked.`,
        ),
        label: "You slam the table.",
        action: "(The king slams his hand down on the table so hard the cups jump.)",
      },
      point: {
        prompt: shot(
          `The king's arm points hard at the tall doors. ${CAST.queen.look} rises slowly from her chair, eyes blazing, humiliated.`,
        ),
        label: "You point her to the door.",
        action: "(The king points at the door: get out.)",
      },
    },
    hunt: {
      slap: {
        prompt: shot(
          `The king's riding crop lashes down and knocks the whip out of the hand of the bald leader of ${CAST.slaver.look}; the whip flies into the mud and he stumbles backward. ${CAST.lysa.look} gasps, looking up at the king.`,
        ),
        label: "You lash the whip from his hand.",
        action: "(The king lashes out with his riding crop and knocks the whip from the slaver's hand.)",
      },
      point: {
        prompt: shot(
          `The king points at the slavers. ${CAST.captain.look} and armored guards seize ${CAST.slaver.look} and force them face-down in the mud. ${CAST.lysa.look} watches the king in awe.`,
        ),
        label: "You point at the slavers. Seize them.",
        action: "(The king points at the slavers: seize them.)",
      },
    },
    chamber: {
      slap: {
        // Spelled out as a single physical moment with a clear before and
        // after: Orbis softens vague violence, but renders a described impact.
        prompt: shot(
          `Impact moment. The queen's open hand cracks hard across the cheek of ${CAST.lysa.lookAct2}. Lysa's head whips sharply to the side, her long red hair flying across her face, and she collapses back onto the pillows clutching a bright red cheek, mouth open in shock. ${CAST.king.lookAct2} jolts upright, stunned. Dramatic slow motion on the impact, then a quick push-in on Lysa's stunned face.`,
        ),
        label: "You slap Lysa.",
        action: "(The queen slaps Lysa hard across the face. Lysa falls back onto the pillows, holding her red cheek.)",
      },
      point: {
        prompt: shot(
          `The queen points at the bed. ${CAST.guard.look} stride in and seize ${CAST.lysa.lookAct2} by the arms, hauling her out of the bed, still in her slip. ${CAST.king.lookAct2} stares, frozen.`,
        ),
        label: "You point at Lysa. Seize her.",
        action: "(The queen points at Lysa: guards, seize her.)",
      },
      crown: {
        prompt: shot(
          `The queen lifts the jeweled crown from her own head with both hands and sets it down on the table beside the bed. ${CAST.king.lookAct2} goes pale, reaching toward her. ${CAST.lysa.lookAct2} stares at the crown.`,
        ),
        label: "You take off your crown.",
        action: "(The queen takes off her crown and sets it down. She is leaving him.)",
      },
    },
  };
  return beats[scene][gesture] ?? null;
}
