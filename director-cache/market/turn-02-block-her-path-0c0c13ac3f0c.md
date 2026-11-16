# Night market: Block her path

- Film: Night market (`market`)
- Branch: Intensify the storm → Block her path
- Cached: 2026-11-15T23:15:32.085Z

Delete this file to have the director write this turn again.

## What happens

A cargo shutter slams down across the lane, trapping Iris, and she turns to find Kade standing in the rain an arm's length away. For the first time in three years, they are face to face, and Voss is listening.

Story purpose: Kade and Iris meet face to face for the first time since her supposed death, and Voss hears the silence that follows.

## Dialogue

- **Iris:** Three years, Kade. Did he tell you I was dead?
- **Kade:** He told me. I buried an empty box.
- **Voss:** Why did your feed just stop moving, Kade? Answer me.
- **Iris:** If you're going to do it, do it now.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours around them, and blurred neon light shines on their wet faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Trace the shutter query
- manipulate: Cut the market lights
- manipulate: Spoof Kade's feed
- intervene: Mute Kade's earpiece
- intervene: Raise the shutter

## Data

```json
{
  "narration": "A cargo shutter slams down across the lane, trapping Iris, and she turns to find Kade standing in the rain an arm's length away. For the first time in three years, they are face to face, and Voss is listening.",
  "storyPurpose": "Kade and Iris meet face to face for the first time since her supposed death, and Voss hears the silence that follows.",
  "whatNext": "Kade could draw on the woman he once called partner, or listen to what she has carried out of Voss's precinct.",
  "together": "Kade and Iris stand face to face in the rain before the lowered shutter, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Did he tell you I was dead?"
    },
    {
      "speaker": "Kade",
      "line": "He told me. I buried an empty box."
    },
    {
      "speaker": "Voss",
      "line": "Why did your feed just stop moving, Kade? Answer me."
    },
    {
      "speaker": "Iris",
      "line": "If you're going to do it, do it now."
    }
  ],
  "onScreen": "Kade and Iris stand face to face in the pouring rain, close together, as she pulls back her hood to look at him.",
  "offScreen": "In the precinct, Voss notices the cargo shutter dropped on its own and orders a check of who triggered it.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours around them, and blurred neon light shines on their wet faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "In the heavy downpour, a lowered cargo shutter blocks the lane, and the man in the long brown leather trench coat stands face to face with the pale-haired woman in the grey hooded raincoat, her hood pulled back, her hand on his chest.",
  "weather": "Heavy downpour, thick steam",
  "lighting": "Night, neon blurred by rain",
  "security": "Grid cameras partly blinded",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss finds them",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his former partner",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, cornered by Kade at a lowered shutter",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 22
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 30
    }
  ],
  "keyEvent": "A cargo shutter dropped by the unseen director trapped Iris, and she and Kade are now face to face; Voss is investigating who triggered it.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Quietly read the data Iris carries to learn what proof she holds against Voss."
      },
      {
        "label": "Trace the shutter query",
        "detail": "Follow Voss's check on the shutter to see how close he is to finding the player's hand."
      }
    ],
    "manipulate": [
      {
        "label": "Cut the market lights",
        "detail": "Black out the neon and stall lamps around the pair to hide them from the remaining cameras."
      },
      {
        "label": "Spoof Kade's feed",
        "detail": "Loop Kade's earpiece location data so Voss thinks he is still searching elsewhere."
      }
    ],
    "intervene": [
      {
        "label": "Mute Kade's earpiece",
        "detail": "Cut Voss off so Kade and Iris can talk without being heard."
      },
      {
        "label": "Raise the shutter",
        "detail": "Lift the shutter again to give Iris a way out if Kade lets her go."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
