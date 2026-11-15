# Night market: Stall Iris

- Film: Night market (`market`)
- Branch: Grapple up a building → Stall Iris
- Cached: 2026-11-15T18:33:52.693Z

Delete this file to have the director write this turn again.

## What happens

Shutters slam down around the noodle stall where Iris shelters, boxing her in, and Kade drops from the ledge to land in front of her. Voss sees the shutters move on the grid and knows someone is helping Kade reach her first.

Story purpose: Kade and Iris come face to face for the first time in three years, and Voss learns the shutters were locked for Kade, not for him.

## Dialogue

- **Iris:** Three years, Kade. Did he tell you I burned?
- **Kade:** He said there was nothing left to bury.
- **Voss:** Someone locked those shutters for you. Finish it, Kade. Now.
- **Iris:** Then finish it. Or ask me what I'm carrying.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts past the neon and stall lamps around them. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Trace Voss's order
- manipulate: Spoof the trace
- manipulate: Thicken the steam
- intervene: Cut Kade's earpiece
- intervene: Open one shutter

## Data

```json
{
  "narration": "Shutters slam down around the noodle stall where Iris shelters, boxing her in, and Kade drops from the ledge to land in front of her. Voss sees the shutters move on the grid and knows someone is helping Kade reach her first.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, and Voss learns the shutters were locked for Kade, not for him.",
  "whatNext": "Iris could tell Kade what Voss did to her unit, or she could run the moment he lowers his gun.",
  "together": "Kade and Iris stand face to face under the awning of a shuttered noodle stall, his hand on her arm.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Did he tell you I burned?"
    },
    {
      "speaker": "Kade",
      "line": "He said there was nothing left to bury."
    },
    {
      "speaker": "Voss",
      "line": "Someone locked those shutters for you. Finish it, Kade. Now."
    },
    {
      "speaker": "Iris",
      "line": "Then finish it. Or ask me what I'm carrying."
    }
  ],
  "onScreen": "Kade stands face to face with Iris under a stall awning, gripping her arm as she stares back at him.",
  "offScreen": "In the precinct, Voss flags the shutter override on the grid and orders a trace on whoever triggered it.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts past the neon and stall lamps around them. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Beneath a dripping noodle-stall awning, metal shutters sealed on either side, Kade holds Iris by the arm as they face each other in neon light and light rain.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Shutters locked, override being traced",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss traces the override",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, face to face with Iris",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 65
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, cornered at a shuttered stall",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 15
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 30
    }
  ],
  "keyEvent": "Stall shutters were locked around Iris, Kade reached her, and Voss is tracing who triggered the override.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Read the data signature of what Iris carries to learn what proof she holds."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Pull the precinct log to see who signed Iris's death report three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Spoof the trace",
        "detail": "Plant false logs so Voss's override trace points to a maintenance fault."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall boilers to fill the alley with steam around the pair."
      }
    ],
    "intervene": [
      {
        "label": "Cut Kade's earpiece",
        "detail": "Drop Voss's channel so Kade and Iris can speak unheard."
      },
      {
        "label": "Open one shutter",
        "detail": "Raise a single shutter behind Iris to give her a way out."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
