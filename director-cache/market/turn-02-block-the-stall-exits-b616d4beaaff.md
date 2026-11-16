# Night market: Block the stall exits

- Film: Night market (`market`)
- Branch: Deploy drones → Block the stall exits
- Cached: 2026-11-15T00:33:11.049Z

Delete this file to have the director write this turn again.

## What happens

The stall shutters slam down around the noodle stall, boxing Iris in just as Kade reaches her. Cornered, she turns to face the partner who was told she was dead.

Story purpose: Kade and Iris come face to face for the first time in three years, and she learns he was sent to kill her.

## Dialogue

- **Iris:** Three years, Kade. And you come back with a gun.
- **Kade:** They told me you burned with the rest of the unit.
- **Iris:** Voss burned them. I have the proof right here.
- **Voss:** Don't listen to her. Do your job, Kade.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Lowered metal shutters and drifting steam surround them in the light rain, lit by warm stall lamps and a white searchlight glow. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her proof
- investigate: Trace Voss's order
- manipulate: Cut the market lights
- manipulate: Jam the earpiece
- intervene: Delay the units
- intervene: Recall the drone

## Data

```json
{
  "narration": "The stall shutters slam down around the noodle stall, boxing Iris in just as Kade reaches her. Cornered, she turns to face the partner who was told she was dead.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, and she learns he was sent to kill her.",
  "whatNext": "Iris could try to bargain with the proof she carries, or Kade could obey Voss before the units arrive.",
  "together": "Kade and Iris stand face to face inside the shuttered noodle stall, an arm's length apart.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Three years, Kade. And you come back with a gun."
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned with the rest of the unit."
    },
    {
      "speaker": "Iris",
      "line": "Voss burned them. I have the proof right here."
    },
    {
      "speaker": "Voss",
      "line": "Don't listen to her. Do your job, Kade."
    }
  ],
  "onScreen": "Kade and Iris stand face to face under the noodle stall awning, shutters closed around them, as she confronts him.",
  "offScreen": "At the precinct, Voss sees the shutters drop on the grid and orders his units to move early.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Lowered metal shutters and drifting steam surround them in the light rain, lit by warm stall lamps and a white searchlight glow. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Inside a shuttered noodle stall, the man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat face each other in steam and lamplight. Light rain drips from the awning edge.",
  "weather": "Light rain, drifting steam",
  "lighting": "Stall lamps, searchlight glow",
  "security": "Stall shutters locked down",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss's units arrive",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with Iris",
      "motivation": "Ordered to retire Iris before dawn; she was his partner and he wants the truth before he pulls the trigger",
      "trust": 60
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, trapped in the shuttered stall with Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the harbor transport by dawn, and does not know whether Kade will help her or kill her",
      "trust": 10
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 52
    }
  ],
  "keyEvent": "Iris is trapped with Kade inside the shuttered noodle stall and has told him Voss burned their unit.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her proof",
        "detail": "Read the device Iris carries through the market network to see what it holds."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Pull the precinct logs to find who ordered the unit destroyed three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Cut the market lights",
        "detail": "Black out the stall lamps and neon so the grid cameras lose them."
      },
      {
        "label": "Jam the earpiece",
        "detail": "Flood Kade's earpiece with static so Voss cannot hear them."
      }
    ],
    "intervene": [
      {
        "label": "Delay the units",
        "detail": "Reroute Voss's ground vans into a gridlocked side street."
      },
      {
        "label": "Recall the drone",
        "detail": "Pull the searchlight drone away from the stall to the harbor."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
