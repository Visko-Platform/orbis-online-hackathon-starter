# Night market: Intensify the storm

- Film: Night market (`market`)
- Branch: Intensify the storm
- Cached: 2026-11-15T00:31:00.593Z

Delete this file to have the director write this turn again.

## What happens

The district weather system breaks open into a heavy downpour, scattering the crowd and blinding half of Voss's grid cameras. Kade glimpses a grey hood slipping between the emptying stalls, but Voss notices the feeds failing and grows suspicious.

Story purpose: The storm blinds Voss's cameras and lets Kade glimpse Iris first, and Voss begins to suspect Kade is hiding something from him.

## Dialogue

- **Voss:** My cameras are drowning, Kade. Tell me what you see.
- **Kade:** Rain. Empty stalls. Nothing yet.
- **Voss:** You hesitated. Don't make me send units to see for you.

## Orbis prompts

Change: The rain grows into a heavy downpour that pours off the stall awnings and splashes across the street in front of the man in the trench coat.

Hand-back: The man in the long brown leather trench coat presses two fingers to his ear and speaks. A pale-haired woman in a grey hooded raincoat hurries away through the crowd in the street ahead. Heavy rain pours off the stall awnings and splashes across the street ahead. Medium shot from directly behind him at eye level.

## Next choices

- investigate: Track the grey hood
- investigate: Tap Voss's channel
- manipulate: Kill the stall lights
- manipulate: Lock the side alleys
- intervene: Ground the drones
- intervene: Block her path

## Data

```json
{
  "narration": "The district weather system breaks open into a heavy downpour, scattering the crowd and blinding half of Voss's grid cameras. Kade glimpses a grey hood slipping between the emptying stalls, but Voss notices the feeds failing and grows suspicious.",
  "storyPurpose": "The storm blinds Voss's cameras and lets Kade glimpse Iris first, and Voss begins to suspect Kade is hiding something from him.",
  "whatNext": "Kade could chase the grey hood before the rain swallows her, or Voss could restore his eyes and reach her first.",
  "together": "Kade is alone in the street; Voss speaks to him through his earpiece.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "My cameras are drowning, Kade. Tell me what you see."
    },
    {
      "speaker": "Kade",
      "line": "Rain. Empty stalls. Nothing yet."
    },
    {
      "speaker": "Voss",
      "line": "You hesitated. Don't make me send units to see for you."
    }
  ],
  "onScreen": "The rain becomes a heavy downpour pouring off the stall awnings, and a pale-haired woman in a grey hood hurries away through the thinning crowd ahead of Kade.",
  "offScreen": "At the precinct, half of the market's grid camera feeds blur into static under the rain, and Voss orders a technician to reroute power to the drones.",
  "transitionPrompt": "The rain grows into a heavy downpour that pours off the stall awnings and splashes across the street in front of the man in the trench coat.",
  "holdPrompt": "The man in the long brown leather trench coat presses two fingers to his ear and speaks. A pale-haired woman in a grey hooded raincoat hurries away through the crowd in the street ahead. Heavy rain pours off the stall awnings and splashes across the street ahead. Medium shot from directly behind him at eye level.",
  "scenePrompt": "A heavy downpour hammers the night market, sheeting off the awnings and thinning the crowd as vendors pull back under cover. Ahead of the man in the long brown leather trench coat, a pale-haired woman in a grey hooded raincoat hurries away between the stalls.",
  "weather": "Heavy downpour, thick steam",
  "lighting": "Night, neon blurred by rain",
  "security": "Grid cameras partly blinded",
  "threatLevel": 3,
  "objective": "Reach Iris before Voss's eyes return",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 64
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant hiding somewhere in the crowd",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 24
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 34
    }
  ],
  "keyEvent": "The storm has blinded half of Voss's grid cameras, and Kade lied to Voss about seeing nothing.",
  "actions": {
    "investigate": [
      {
        "label": "Track the grey hood",
        "detail": "Use the surviving street cameras to trace which way the hooded woman is heading."
      },
      {
        "label": "Tap Voss's channel",
        "detail": "Listen in on the precinct channel to learn what Voss is ordering behind Kade's back."
      }
    ],
    "manipulate": [
      {
        "label": "Kill the stall lights",
        "detail": "Cut power to the stall lamps and neon on Iris's path so she is only a shadow."
      },
      {
        "label": "Lock the side alleys",
        "detail": "Seal the market's side gates so the woman can only run straight toward Kade."
      }
    ],
    "intervene": [
      {
        "label": "Ground the drones",
        "detail": "Hold Voss's rerouted drones in their bays so they cannot enter the market."
      },
      {
        "label": "Block her path",
        "detail": "Drop a cargo shutter in front of the hooded woman so she stops face to face with Kade."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
