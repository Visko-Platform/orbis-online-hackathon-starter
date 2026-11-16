# Night market: Run down a side alley.

- Film: Night market (`market`)
- Branch: Run down a side alley.
- Cached: 2026-11-15T18:30:17.748Z

Delete this file to have the director write this turn again.

## What happens

Kade breaks from the main street and runs into a side alley, slipping out of the grid's best camera coverage. Voss loses his feed for a moment and does not like it.

Story purpose: Kade defies Voss's pacing and drops out of the grid's sight, and Voss starts to suspect he is going rogue.

## Dialogue

- **Voss:** You just dropped off my cameras. Where are you going, Kade?
- **Kade:** Where she'd go. Somewhere your grid can't see.
- **Voss:** Stay in my sight, or I send the drones in after you.

## Orbis prompts

Change: The man in the trench coat turns and breaks into a run down a narrow side alley between steaming food stalls.

Hand-back: The man in the long brown leather trench coat presses two fingers to his ear and speaks as he hurries down the alley. Steam drifts from the cramped stalls along the narrow alley ahead. Medium shot from directly behind him at eye level.

## Next choices

- investigate: Scan alley stalls
- investigate: Trace Voss's tip
- manipulate: Cut alley lights
- manipulate: Thicken the steam
- intervene: Divert Voss's drones
- intervene: Flag a sighting

## Data

```json
{
  "narration": "Kade breaks from the main street and runs into a side alley, slipping out of the grid's best camera coverage. Voss loses his feed for a moment and does not like it.",
  "storyPurpose": "Kade defies Voss's pacing and drops out of the grid's sight, and Voss starts to suspect he is going rogue.",
  "whatNext": "Kade could catch a glimpse of Iris down the alley, or Voss could send drones to find him first.",
  "together": "Kade is alone, running down a narrow side alley; Voss speaks to him through his earpiece.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "You just dropped off my cameras. Where are you going, Kade?"
    },
    {
      "speaker": "Kade",
      "line": "Where she'd go. Somewhere your grid can't see."
    },
    {
      "speaker": "Voss",
      "line": "Stay in my sight, or I send the drones in after you."
    }
  ],
  "onScreen": "Kade runs down a narrow side alley lined with steaming stalls, pressing his earpiece as Voss demands to know where he is.",
  "offScreen": "At the precinct, Voss reroutes two camera drones toward the alley where Kade vanished.",
  "transitionPrompt": "The man in the trench coat turns and breaks into a run down a narrow side alley between steaming food stalls.",
  "holdPrompt": "The man in the long brown leather trench coat presses two fingers to his ear and speaks as he hurries down the alley. Steam drifts from the cramped stalls along the narrow alley ahead. Medium shot from directly behind him at eye level.",
  "scenePrompt": "Kade hurries down a narrow side alley off the night market, cramped stalls steaming under dim lamps and dripping cables. Light rain falls and fewer neon signs glow here.",
  "weather": "Light rain, drifting steam",
  "lighting": "Dim alley, scattered stall lamps",
  "security": "Grid coverage gap",
  "threatLevel": 2,
  "objective": "Find Iris before Voss's drones find Kade",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 62
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant hiding somewhere in the crowd",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 22
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 35
    }
  ],
  "keyEvent": "Kade slipped into a side alley outside the grid's camera coverage, and Voss now doubts him.",
  "actions": {
    "investigate": [
      {
        "label": "Scan alley stalls",
        "detail": "Run a thermal sweep of the alley stalls to find anyone hiding behind them."
      },
      {
        "label": "Trace Voss's tip",
        "detail": "Pull the records to learn who gave Voss the tip that Iris is in the market."
      }
    ],
    "manipulate": [
      {
        "label": "Cut alley lights",
        "detail": "Kill the lamps in the alley so neither drones nor cameras can see Kade."
      },
      {
        "label": "Thicken the steam",
        "detail": "Overload the stall vents to fill the alley with dense steam."
      }
    ],
    "intervene": [
      {
        "label": "Divert Voss's drones",
        "detail": "Send the rerouted camera drones back toward the harbor on a false alert."
      },
      {
        "label": "Flag a sighting",
        "detail": "Ping Kade's scanner with a sighting of a grey hooded raincoat just ahead."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
