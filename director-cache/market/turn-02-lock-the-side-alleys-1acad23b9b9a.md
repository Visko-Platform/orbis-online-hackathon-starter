# Night market: Lock the side alleys

- Film: Night market (`market`)
- Branch: Intensify the storm → Lock the side alleys
- Cached: 2026-11-15T23:15:29.325Z

Delete this file to have the director write this turn again.

## What happens

The side gates slam shut across the market, and the woman in the grey hood, boxed in, turns back and runs straight into Kade. Voss logs the gate command and knows someone else is working his grid.

Story purpose: Sealing the alleys forces Kade and Iris face to face for the first time in three years, while Voss learns an unknown hand is inside his system.

## Dialogue

- **Iris:** The gates closed behind me. Was that you, Kade?
- **Kade:** They told me you burned with the unit.
- **Iris:** Voss burned the unit. I carried out the proof.
- **Voss:** Someone sealed my gates, Kade. Who's standing in front of you?

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awnings around them, and blurred neon glows on their wet faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Trace Voss's dispatch
- investigate: Scan Iris's proof
- manipulate: Kill the market lights
- manipulate: Jam Kade's earpiece
- intervene: Stall the van
- intervene: Reopen one gate

## Data

```json
{
  "narration": "The side gates slam shut across the market, and the woman in the grey hood, boxed in, turns back and runs straight into Kade. Voss logs the gate command and knows someone else is working his grid.",
  "storyPurpose": "Sealing the alleys forces Kade and Iris face to face for the first time in three years, while Voss learns an unknown hand is inside his system.",
  "whatNext": "Kade could lower his gun and hear Iris out, or Voss's units could reach the sealed gates before they finish talking.",
  "together": "Kade and Iris stand face to face in the rain between two dripping stalls, his hand on her arm.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "The gates closed behind me. Was that you, Kade?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned with the unit."
    },
    {
      "speaker": "Iris",
      "line": "Voss burned the unit. I carried out the proof."
    },
    {
      "speaker": "Voss",
      "line": "Someone sealed my gates, Kade. Who's standing in front of you?"
    }
  ],
  "onScreen": "Kade catches Iris by the arm in the pouring rain and they face each other, talking.",
  "offScreen": "At the precinct, Voss sees the gate lock order came from an unregistered user and dispatches a van to the market's north gate.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awnings around them, and blurred neon glows on their wet faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "In the heavy downpour, the man in the long brown leather trench coat holds the arm of a pale-haired woman in a grey hooded raincoat between two stalls, the side gates sealed behind them.",
  "weather": "Heavy downpour, thick steam",
  "lighting": "Night, neon blurred by rain",
  "security": "Side gates sealed, grid compromised",
  "threatLevel": 3,
  "objective": "Learn Iris's truth before Voss's units reach the gates",
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
      "role": "Fugitive replicant, now trapped face to face with Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 20
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 30
    }
  ],
  "keyEvent": "The market's side gates are sealed, Kade and Iris are face to face, and Voss knows an outsider is in his grid.",
  "actions": {
    "investigate": [
      {
        "label": "Trace Voss's dispatch",
        "detail": "Pull the precinct's dispatch log to see exactly who Voss is sending and when they arrive."
      },
      {
        "label": "Scan Iris's proof",
        "detail": "Read the data Iris carries to learn what Voss did to her unit three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Kill the market lights",
        "detail": "Black out the neon and stall lamps so the grid cameras see nothing around the pair."
      },
      {
        "label": "Jam Kade's earpiece",
        "detail": "Flood Kade's earpiece channel with static so Voss cannot hear what Iris says."
      }
    ],
    "intervene": [
      {
        "label": "Stall the van",
        "detail": "Lock down the van's route at a traffic gate to buy Kade and Iris time."
      },
      {
        "label": "Reopen one gate",
        "detail": "Unseal a single side gate so Iris has a way out if Kade lets her go."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
