# Night market: Guide Iris to Kade

- Film: Night market (`market`)
- Branch: Disable security → Guide Iris to Kade
- Cached: 2026-11-15T23:15:43.106Z

Delete this file to have the director write this turn again.

## What happens

A stall sign flickers a path through the crowd, and Iris follows it straight to Kade. For the first time in three years they stand face to face, and Voss hears only Kade's silence.

Story purpose: Kade and Iris meet face to face, and Voss realizes Kade has stopped reporting.

## Dialogue

- **Iris:** Someone lit me a path to you. Was that you, Kade?
- **Kade:** They told me you burned with the unit. I mourned you.
- **Iris:** Voss burned the unit. I'm the one who walked out.
- **Voss:** Kade, you've gone quiet. Tell me what you're looking at.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering stall sign casts pulsing pink light on their faces in the light rain. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Trace Voss's orders
- manipulate: Cut Kade's earpiece
- manipulate: Thicken the steam
- intervene: Block the vans
- intervene: Feed Voss lies

## Data

```json
{
  "narration": "A stall sign flickers a path through the crowd, and Iris follows it straight to Kade. For the first time in three years they stand face to face, and Voss hears only Kade's silence.",
  "storyPurpose": "Kade and Iris meet face to face, and Voss realizes Kade has stopped reporting.",
  "whatNext": "Iris could tell Kade what Voss did three years ago, or Voss could send units into the blind market to find them both.",
  "together": "Kade and Iris stand face to face beside a flickering stall sign, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Someone lit me a path to you. Was that you, Kade?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned with the unit. I mourned you."
    },
    {
      "speaker": "Iris",
      "line": "Voss burned the unit. I'm the one who walked out."
    },
    {
      "speaker": "Voss",
      "line": "Kade, you've gone quiet. Tell me what you're looking at."
    }
  ],
  "onScreen": "Iris reaches Kade beside a flickering stall sign and they stand face to face, talking, as she grips his sleeve.",
  "offScreen": "At the precinct, Voss orders a van crew to stand by at the market's edge.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering stall sign casts pulsing pink light on their faces in the light rain. Medium close-up of the two of them at eye level.",
  "scenePrompt": "In the rain-slicked night market, Kade and Iris stand face to face beside a flickering stall sign, her hand on his sleeve. The camera lights along the awnings stay dark.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, flickering sign glow",
  "security": "Grid offline, units on standby",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss closes in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his former partner",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant who has come to Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 42
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, blind to the market",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 25
    }
  ],
  "keyEvent": "Kade and Iris are face to face, and Iris has told him Voss burned their unit.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Read the data Iris carries through the market's local network to see what proof she holds."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Pull precinct records from three years ago to find who ordered the unit destroyed."
      }
    ],
    "manipulate": [
      {
        "label": "Cut Kade's earpiece",
        "detail": "Jam Kade's earpiece channel so Voss can no longer hear their conversation."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's heating pipes to wrap the pair in dense steam cover."
      }
    ],
    "intervene": [
      {
        "label": "Block the vans",
        "detail": "Lock the district gates so Voss's standby van crew cannot enter the market."
      },
      {
        "label": "Feed Voss lies",
        "detail": "Send Voss a false sighting of Iris at the far end of the district."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
