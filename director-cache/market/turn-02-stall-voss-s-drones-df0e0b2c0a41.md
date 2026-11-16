# Night market: Stall Voss's drones

- Film: Night market (`market`)
- Branch: Disable security → Stall Voss's drones
- Cached: 2026-11-15T23:15:44.338Z

Delete this file to have the director write this turn again.

## What happens

The precinct drone bay doors seal shut before Voss can launch, and with no eyes left in the market, Iris walks straight to Kade. Voss now suspects someone inside the system is helping them.

Story purpose: Kade and Iris come face to face for the first time in three years, while Voss, grounded and blind, realizes Kade has help.

## Dialogue

- **Voss:** My drone bay just locked itself. Someone's protecting you, Kade.
- **Iris:** Hello, Kade. They told you I burned, didn't they?
- **Kade:** I watched them seal your file. Why are you alive?
- **Iris:** Because Voss failed. Now ask why he wants me dead tonight.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips off the awning around them, and neon glow lights their faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Pull Iris's file
- investigate: Trace Voss's channel
- manipulate: Thicken the steam
- manipulate: Kill the neon
- intervene: Cut Kade's earpiece
- intervene: Release the drones

## Data

```json
{
  "narration": "The precinct drone bay doors seal shut before Voss can launch, and with no eyes left in the market, Iris walks straight to Kade. Voss now suspects someone inside the system is helping them.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, while Voss, grounded and blind, realizes Kade has help.",
  "whatNext": "Kade could demand the truth about her supposed death, or Voss could force the bay open and send drones after them both.",
  "together": "Kade and Iris stand face to face under a dripping stall awning, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "My drone bay just locked itself. Someone's protecting you, Kade."
    },
    {
      "speaker": "Iris",
      "line": "Hello, Kade. They told you I burned, didn't they?"
    },
    {
      "speaker": "Kade",
      "line": "I watched them seal your file. Why are you alive?"
    },
    {
      "speaker": "Iris",
      "line": "Because Voss failed. Now ask why he wants me dead tonight."
    }
  ],
  "onScreen": "Iris walks up to Kade and stops face to face with him under a stall awning in the light rain.",
  "offScreen": "At the precinct, the drone bay doors stay sealed while technicians try to override the lock on Voss's orders.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips off the awning around them, and neon glow lights their faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dripping neon-lit stall awning, Kade and Iris stand face to face in the light rain, her hood lowered. The camera lights along the awnings remain dark.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon, cameras dark",
  "security": "Grid offline, drones grounded",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss breaks the lock",
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
      "role": "Fugitive replicant who has stepped out to meet Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, blind and grounded",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 22
    }
  ],
  "keyEvent": "The precinct drone bay is locked, and Kade and Iris have met face to face in the market.",
  "actions": {
    "investigate": [
      {
        "label": "Pull Iris's file",
        "detail": "Open the sealed precinct record of Iris's reported death to see who signed it."
      },
      {
        "label": "Trace Voss's channel",
        "detail": "Track where Voss is calling from and who else is on his line."
      }
    ],
    "manipulate": [
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's steam pipes to wrap the stalls in dense fog."
      },
      {
        "label": "Kill the neon",
        "detail": "Cut power to the market's signs and stall lamps, leaving the street dark."
      }
    ],
    "intervene": [
      {
        "label": "Cut Kade's earpiece",
        "detail": "Jam Voss's channel so Kade and Iris can talk without him listening."
      },
      {
        "label": "Release the drones",
        "detail": "Unlock the drone bay and let Voss's drones fly toward the market."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
