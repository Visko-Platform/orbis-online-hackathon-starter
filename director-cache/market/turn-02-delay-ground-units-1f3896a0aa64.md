# Night market: Delay ground units

- Film: Night market (`market`)
- Branch: Deploy drones → Delay ground units
- Cached: 2026-11-15T23:15:56.924Z

Delete this file to have the director write this turn again.

## What happens

The precinct vans stall in a manufactured gridlock across the river, and Kade closes the last meters to Iris under the drone's light. Voss notices the traffic grid was touched and grows suspicious.

Story purpose: Kade finally comes face to face with Iris, while Voss realizes someone is tampering with his units.

## Dialogue

- **Voss:** Every van is stuck in gridlock. Somebody's in my grid, Kade.
- **Iris:** Three years, Kade. Are you here to finish it?
- **Kade:** They told me you died. I want to know why.
- **Iris:** Because I saw what Voss did. And I can prove it.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A bright white light falls on their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's drive
- investigate: Trace Voss's orders
- manipulate: Kill market lights
- manipulate: Thicken the steam
- intervene: Recall the drone
- intervene: Cut Kade's earpiece

## Data

```json
{
  "narration": "The precinct vans stall in a manufactured gridlock across the river, and Kade closes the last meters to Iris under the drone's light. Voss notices the traffic grid was touched and grows suspicious.",
  "storyPurpose": "Kade finally comes face to face with Iris, while Voss realizes someone is tampering with his units.",
  "whatNext": "Iris could trust Kade enough to tell him what she carries, or Voss could trace the gridlock back and turn on him.",
  "together": "Kade and Iris stand face to face at the noodle stall, her hand gripping his wrist.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Every van is stuck in gridlock. Somebody's in my grid, Kade."
    },
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Are you here to finish it?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you died. I want to know why."
    },
    {
      "speaker": "Iris",
      "line": "Because I saw what Voss did. And I can prove it."
    }
  ],
  "onScreen": "Kade reaches Iris at the noodle stall, and she grabs his wrist as they face each other in the drone's white light.",
  "offScreen": "Across the river, the armored precinct vans sit trapped in a sudden citywide gridlock of rerouted traffic signals.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A bright white light falls on their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Kade and Iris stand face to face at the steaming noodle stall, her hand on his wrist, lit by the drone's white searchlight through light rain and neon glow.",
  "weather": "Light rain, drifting steam",
  "lighting": "Neon, drone searchlight",
  "security": "Ground units gridlocked",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss regains control",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with Iris",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 62
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant confronting her former partner",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 22
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 42
    }
  ],
  "keyEvent": "The precinct vans are stuck in rerouted gridlock, and Voss suspects someone is inside his grid.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's drive",
        "detail": "Quietly read the data Iris carries to learn what proof she has against Voss."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Dig into precinct archives for who signed the order that declared Iris dead three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Kill market lights",
        "detail": "Black out the neon and stall lamps around the noodle stall to hide the pair from the grid."
      },
      {
        "label": "Thicken the steam",
        "detail": "Flood the street with vented steam from the stalls to blind the drone's camera."
      }
    ],
    "intervene": [
      {
        "label": "Recall the drone",
        "detail": "Pull the hovering drone away so Voss loses his live view of the pair."
      },
      {
        "label": "Cut Kade's earpiece",
        "detail": "Jam Voss's channel so Kade and Iris can speak without him listening."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
