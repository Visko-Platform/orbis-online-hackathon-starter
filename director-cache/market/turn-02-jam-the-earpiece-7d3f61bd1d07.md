# Night market: Jam the earpiece

- Film: Night market (`market`)
- Branch: Open Iris's file → Jam the earpiece
- Cached: 2026-11-15T23:15:13.454Z

Delete this file to have the director write this turn again.

## What happens

The earpiece dissolves into static and Voss's voice is gone; in the sudden quiet Kade spots Iris three stalls ahead, and she sees him first.

Story purpose: Cut off from Voss, Kade finds Iris face to face, while Voss reads the silence as betrayal.

## Dialogue

- **Kade:** Voss? ...Gone. Iris, wait. Don't run.
- **Iris:** You're his hunter. Why is your earpiece dead?
- **Kade:** Someone cut him off. I want your side first.
- **Iris:** Then you have until the static ends, Kade.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the steam and neon around them. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's proof
- investigate: Trace Voss's orders
- manipulate: Kill the cameras
- manipulate: Thicken the steam
- intervene: Restore the earpiece
- intervene: Divert the patrol

## Data

```json
{
  "narration": "The earpiece dissolves into static and Voss's voice is gone; in the sudden quiet Kade spots Iris three stalls ahead, and she sees him first.",
  "storyPurpose": "Cut off from Voss, Kade finds Iris face to face, while Voss reads the silence as betrayal.",
  "whatNext": "Iris could bolt into the crowd, or the silence could give Kade the one honest conversation Voss never wanted them to have.",
  "together": "Kade and Iris stand face to face beside a steaming noodle stall, an arm's length apart.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "Voss? ...Gone. Iris, wait. Don't run."
    },
    {
      "speaker": "Iris",
      "line": "You're his hunter. Why is your earpiece dead?"
    },
    {
      "speaker": "Kade",
      "line": "Someone cut him off. I want your side first."
    },
    {
      "speaker": "Iris",
      "line": "Then you have until the static ends, Kade."
    }
  ],
  "onScreen": "Kade and Iris stand face to face beside a steaming noodle stall as she holds up a hand to keep him back.",
  "offScreen": "At the precinct, Voss loses Kade's channel and orders the grid cameras to lock onto his last position.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the steam and neon around them. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Beside a steaming noodle stall in the rainy neon market, the man in the long brown leather trench coat faces the pale-haired woman in the grey hooded raincoat, her hand raised between them.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Earpiece jammed, cameras searching",
  "threatLevel": 3,
  "objective": "Hear Iris's side before Voss's grid finds them",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Free of Voss's voice for now; wants the truth from Iris before deciding anything",
      "trust": 70
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, now face to face with Kade",
      "motivation": "Carries proof of what Voss did; must reach the harbor transport by dawn and is testing whether Kade will help or kill her",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, cut off from Kade's earpiece, watching through the grid",
      "motivation": "Reads the lost channel as betrayal and wants both Iris and Kade contained",
      "trust": 20
    }
  ],
  "keyEvent": "Kade's earpiece is jammed, Voss cannot hear him, and Kade and Iris have met face to face.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's proof",
        "detail": "Pull the data signature of what Iris carries to see what it proves about Voss."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Tap the precinct channel to learn what Voss is sending after the lost signal."
      }
    ],
    "manipulate": [
      {
        "label": "Kill the cameras",
        "detail": "Black out the grid cameras around the noodle stall so Voss cannot see them."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall boilers to fill the street with steam around the pair."
      }
    ],
    "intervene": [
      {
        "label": "Restore the earpiece",
        "detail": "Reopen Voss's channel so he hears whatever Kade says next."
      },
      {
        "label": "Divert the patrol",
        "detail": "Send the nearest patrol drones to a false sighting across the market."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
