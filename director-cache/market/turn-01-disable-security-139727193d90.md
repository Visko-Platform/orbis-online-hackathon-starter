# Night market: Disable security

- Film: Night market (`market`)
- Branch: Disable security
- Cached: 2026-11-15T00:30:59.848Z

Delete this file to have the director write this turn again.

## What happens

The district grid and its cameras go dark across the market, blinding Voss's eyes on the street. Kade is alone with the crowd now, but so is anyone else who wanted the cameras off.

Story purpose: Voss loses his view of the market and grows suspicious of Kade, while the dead cameras let Iris move openly toward him.

## Dialogue

- **Voss:** My grid just died over your sector. Did you do that, Kade?
- **Kade:** Wasn't me. Maybe someone doesn't want you watching.
- **Voss:** Then you're my only eyes. Report everything, or I send units.
- **Kade:** There. Grey raincoat, pale hair. She's looking right at me.

## Orbis prompts

Change: The small red camera lights mounted along the stall awnings blink out one after another down the street ahead.

Hand-back: The man in the long brown leather trench coat stops and presses two fingers to his ear. A pale-haired woman in a grey hooded raincoat stands still in the crowd ahead, looking back toward him. Medium shot from directly behind him at eye level.

## Next choices

- investigate: Trace Voss's orders
- investigate: Scan Iris's path
- manipulate: Jam Kade's earpiece
- manipulate: Thicken the steam
- intervene: Guide Iris to Kade
- intervene: Stall Voss's drones

## Data

```json
{
  "narration": "The district grid and its cameras go dark across the market, blinding Voss's eyes on the street. Kade is alone with the crowd now, but so is anyone else who wanted the cameras off.",
  "storyPurpose": "Voss loses his view of the market and grows suspicious of Kade, while the dead cameras let Iris move openly toward him.",
  "whatNext": "Iris could use the blind spot to approach Kade herself, or Voss could send something unwatched into the market to see for him.",
  "together": "Kade is alone in the street; Voss speaks to him through his earpiece.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "My grid just died over your sector. Did you do that, Kade?"
    },
    {
      "speaker": "Kade",
      "line": "Wasn't me. Maybe someone doesn't want you watching."
    },
    {
      "speaker": "Voss",
      "line": "Then you're my only eyes. Report everything, or I send units."
    },
    {
      "speaker": "Kade",
      "line": "There. Grey raincoat, pale hair. She's looking right at me."
    }
  ],
  "onScreen": "The security camera lights along the stalls blink out, and Kade stops, touching his ear, as Iris pauses in the crowd ahead looking back at him.",
  "offScreen": "At the precinct, Voss's monitor wall for the market sector goes black and he quietly readies a drone unit off the grid.",
  "transitionPrompt": "The small red camera lights mounted along the stall awnings blink out one after another down the street ahead.",
  "holdPrompt": "The man in the long brown leather trench coat stops and presses two fingers to his ear. A pale-haired woman in a grey hooded raincoat stands still in the crowd ahead, looking back toward him. Medium shot from directly behind him at eye level.",
  "scenePrompt": "The rain-slicked night market glows with neon and stall lamps, but the camera lights along the awnings are dark. Kade stands still with a hand at his ear while Iris, hood up, watches him from the crowd ahead.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon, cameras dark",
  "security": "District grid offline",
  "threatLevel": 3,
  "objective": "Reach Iris before Voss finds another way to watch",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 65
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant hiding somewhere in the crowd",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, now blind to the market",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 30
    }
  ],
  "keyEvent": "The district security grid and cameras over the market are offline, leaving Voss blind and suspicious of Kade.",
  "actions": {
    "investigate": [
      {
        "label": "Trace Voss's orders",
        "detail": "Search precinct logs for who ordered Iris declared dead three years ago."
      },
      {
        "label": "Scan Iris's path",
        "detail": "Check stall payment terminals for where Iris has been tonight."
      }
    ],
    "manipulate": [
      {
        "label": "Jam Kade's earpiece",
        "detail": "Scramble the channel so Voss cannot hear what Kade says next."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall exhaust lines to fill the street with dense steam."
      }
    ],
    "intervene": [
      {
        "label": "Guide Iris to Kade",
        "detail": "Flash a stall sign to lead Iris toward Kade through the crowd."
      },
      {
        "label": "Stall Voss's drones",
        "detail": "Lock the precinct drone bay doors before Voss can launch them."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
