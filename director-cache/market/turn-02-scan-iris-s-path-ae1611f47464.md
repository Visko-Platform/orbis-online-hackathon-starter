# Night market: Scan Iris's path

- Film: Night market (`market`)
- Branch: Disable security → Scan Iris's path
- Cached: 2026-11-15T23:15:40.557Z

Delete this file to have the director write this turn again.

## What happens

Stall terminal logs show Iris bought a harbor transit chit and paid a noodle vendor to hold a message for Kade. She stops running and waits for him at the stall, and the hunter and his old partner finally meet face to face.

Story purpose: The terminal trail reveals Iris has been waiting for Kade, not fleeing him, and the two meet face to face for the first time in three years.

## Dialogue

- **Kade:** You bought a harbor chit and left a message for me.
- **Iris:** I needed you to find me before Voss did.
- **Voss:** Kade, you've gone quiet. Do you have eyes on her?
- **Kade:** Not yet.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips from the awning around them, and neon glow lights their faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Verify her proof
- investigate: Trace Voss's orders
- manipulate: Wipe terminal logs
- manipulate: Thicken the steam
- intervene: Jam Kade's earpiece
- intervene: Divert harbor patrols

## Data

```json
{
  "narration": "Stall terminal logs show Iris bought a harbor transit chit and paid a noodle vendor to hold a message for Kade. She stops running and waits for him at the stall, and the hunter and his old partner finally meet face to face.",
  "storyPurpose": "The terminal trail reveals Iris has been waiting for Kade, not fleeing him, and the two meet face to face for the first time in three years.",
  "whatNext": "Iris could hand Kade the proof that Voss buried her unit, or Kade could raise his weapon before she gets the chance.",
  "together": "Kade and Iris stand face to face under a noodle stall awning, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "You bought a harbor chit and left a message for me."
    },
    {
      "speaker": "Iris",
      "line": "I needed you to find me before Voss did."
    },
    {
      "speaker": "Voss",
      "line": "Kade, you've gone quiet. Do you have eyes on her?"
    },
    {
      "speaker": "Kade",
      "line": "Not yet."
    }
  ],
  "onScreen": "Kade and Iris stand face to face under a noodle stall awning in the rain, and she grips his sleeve as they talk.",
  "offScreen": "At the precinct, Voss pulls the same terminal records and sees a harbor transit purchase in Iris's trail.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips from the awning around them, and neon glow lights their faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dripping noodle stall awning, Kade and Iris stand close, face to face, lit by neon in the light rain. The dead camera lights along the awnings stay dark.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon, cameras dark",
  "security": "Grid offline, terminals logging",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss traces the terminals",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his target",
      "motivation": "Ordered to retire Iris before dawn; she was his partner and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant who sought Kade out",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn and is gambling that Kade will help",
      "trust": 38
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, blind to the market",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 25
    }
  ],
  "keyEvent": "Kade lied to Voss about seeing Iris, and Voss has her harbor transit purchase from the terminal logs.",
  "actions": {
    "investigate": [
      {
        "label": "Verify her proof",
        "detail": "Scan the drive Iris carries to confirm what it records about Voss and her unit."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Pull precinct records for who ordered Iris's unit retired three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Wipe terminal logs",
        "detail": "Erase the stall payment records so Voss cannot follow Iris's trail to the harbor."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's steam lines to hide the pair under a dense fog."
      }
    ],
    "intervene": [
      {
        "label": "Jam Kade's earpiece",
        "detail": "Cut Voss's channel so Kade and Iris can talk without being heard."
      },
      {
        "label": "Divert harbor patrols",
        "detail": "Send precinct patrol units to a false alarm away from the harbor transport."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
