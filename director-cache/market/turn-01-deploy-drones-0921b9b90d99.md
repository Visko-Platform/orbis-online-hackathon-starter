# Night market: Deploy drones

- Film: Night market (`market`)
- Branch: Deploy drones
- Cached: 2026-11-15T00:30:59.365Z

Delete this file to have the director write this turn again.

## What happens

A search drone sweeps the market ahead of Kade, its light catching a pale-haired woman in a grey hooded raincoat at a noodle stall. Voss sees her through the drone feed too, and now he knows exactly where she is.

Story purpose: The drone finds Iris for Kade, but it also hands her location to Voss, who orders Kade to close in now.

## Dialogue

- **Voss:** Drone has her. Grey raincoat, noodle stall, forty meters ahead.
- **Kade:** Pull the drone back. You'll make her run.
- **Voss:** Then don't let her. Units roll in ten minutes either way.

## Orbis prompts

Change: One large black quadcopter drone with a bright white searchlight hovers low over the street directly in front of the man in the trench coat.

Hand-back: The man in the long brown leather trench coat presses two fingers to his ear and speaks. One large black quadcopter drone with a bright white searchlight hovers low over the street ahead, its beam on a stall. A pale-haired woman in a grey hooded raincoat stands frozen at the noodle stall ahead, lit by the white beam. Medium shot from directly behind him at eye level.

## Next choices

- investigate: Scan Iris's bag
- investigate: Trace Voss's order
- manipulate: Kill the searchlight
- manipulate: Thicken the steam
- intervene: Block the stall exits
- intervene: Delay ground units

## Data

```json
{
  "narration": "A search drone sweeps the market ahead of Kade, its light catching a pale-haired woman in a grey hooded raincoat at a noodle stall. Voss sees her through the drone feed too, and now he knows exactly where she is.",
  "storyPurpose": "The drone finds Iris for Kade, but it also hands her location to Voss, who orders Kade to close in now.",
  "whatNext": "Kade could reach Iris before Voss's units do, or the drone could spook her into running.",
  "together": "Kade is alone in the street; Iris stands at a stall ahead of him, and Voss speaks through his earpiece.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Drone has her. Grey raincoat, noodle stall, forty meters ahead."
    },
    {
      "speaker": "Kade",
      "line": "Pull the drone back. You'll make her run."
    },
    {
      "speaker": "Voss",
      "line": "Then don't let her. Units roll in ten minutes either way."
    }
  ],
  "onScreen": "A large black drone with a white searchlight hovers low over the street ahead of Kade, and its beam lands on Iris at a stall.",
  "offScreen": "At the precinct, Voss marks Iris's position and quietly readies a ground unit to move on the market.",
  "transitionPrompt": "One large black quadcopter drone with a bright white searchlight hovers low over the street directly in front of the man in the trench coat.",
  "holdPrompt": "The man in the long brown leather trench coat presses two fingers to his ear and speaks. One large black quadcopter drone with a bright white searchlight hovers low over the street ahead, its beam on a stall. A pale-haired woman in a grey hooded raincoat stands frozen at the noodle stall ahead, lit by the white beam. Medium shot from directly behind him at eye level.",
  "scenePrompt": "A large black quadcopter drone hovers low over the rain-slicked market street ahead of the man in the long brown leather trench coat, its white searchlight pinning a pale-haired woman in a grey hooded raincoat at a steaming noodle stall. Neon and stall lamps glow through light rain and steam.",
  "weather": "Light rain, drifting steam",
  "lighting": "Neon, drone searchlight",
  "security": "Drone tracking target",
  "threatLevel": 3,
  "objective": "Reach Iris before Voss's units arrive",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 58
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, pinned by the drone light at a noodle stall",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 15
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 50
    }
  ],
  "keyEvent": "A search drone located Iris at a noodle stall, and Voss now has her position and has readied ground units.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's bag",
        "detail": "Point the drone's scanner at the satchel Iris clutches to learn what proof she carries."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Pull the precinct log to see who signed Iris's death report three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Kill the searchlight",
        "detail": "Switch off the drone's beam so Iris is no longer pinned and Voss loses his clear view."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall boilers so steam fills the street between Kade and Iris."
      }
    ],
    "intervene": [
      {
        "label": "Block the stall exits",
        "detail": "Drop the stall shutters around Iris so she cannot run before Kade reaches her."
      },
      {
        "label": "Delay ground units",
        "detail": "Reroute the precinct vans into gridlock to buy Kade time with Iris."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
