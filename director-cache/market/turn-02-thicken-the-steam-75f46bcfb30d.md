# Night market: Thicken the steam

- Film: Night market (`market`)
- Branch: Grapple up a building → Thicken the steam
- Cached: 2026-11-15T18:33:57.758Z

Delete this file to have the director write this turn again.

## What happens

The stall vents overload and the street drowns in steam, blinding the grid cameras. Kade drops from the ledge and finds Iris in the white haze, face to face for the first time in three years.

Story purpose: Kade and Iris meet face to face inside the steam, and Voss, blinded, realizes Kade is hiding something.

## Dialogue

- **Voss:** Every vent on the block just blew. My cameras are blind, Kade.
- **Iris:** Three years, Kade. Did you come here to finish it?
- **Kade:** They told me you died. I want the truth first.
- **Iris:** Then switch off that earpiece. He's listening to every word.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Thick white steam surrounds them, glowing pink and blue in the neon light, and light rain drifts through it. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's coat
- investigate: Trace Voss's order
- manipulate: Jam the earpiece
- manipulate: Kill the neon
- intervene: Reroute ground unit
- intervene: Fake a sighting

## Data

```json
{
  "narration": "The stall vents overload and the street drowns in steam, blinding the grid cameras. Kade drops from the ledge and finds Iris in the white haze, face to face for the first time in three years.",
  "storyPurpose": "Kade and Iris meet face to face inside the steam, and Voss, blinded, realizes Kade is hiding something.",
  "whatNext": "Iris could trust Kade enough to tell him what she carries, or Voss could send units into the steam before she does.",
  "together": "Kade and Iris stand face to face in thick steam between two stalls, her hand pressed against his chest.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Every vent on the block just blew. My cameras are blind, Kade."
    },
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Did you come here to finish it?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you died. I want the truth first."
    },
    {
      "speaker": "Iris",
      "line": "Then switch off that earpiece. He's listening to every word."
    }
  ],
  "onScreen": "Kade and Iris stand face to face in thick glowing steam, her hand pressed against his chest.",
  "offScreen": "At the precinct, Voss orders a ground unit toward the market after the grid cameras go white.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Thick white steam surrounds them, glowing pink and blue in the neon light, and light rain drifts through it. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Dense white steam fills the market street, lit pink and blue by neon. Kade and Iris stand close between two stalls, her hand on his chest, the crowd vanished into haze.",
  "weather": "Light rain, thick vent steam",
  "lighting": "Neon diffused through steam",
  "security": "Cameras blinded, channel monitored",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss's unit arrives",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with Iris in the steam",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 65
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, cornered by Kade in the steam",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 28
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, now blind on the grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 30
    }
  ],
  "keyEvent": "The market's grid cameras are blinded by steam, and Kade and Iris have met face to face while Voss listens on the open channel.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's coat",
        "detail": "Run a passive scan on Iris to find what she is carrying."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Pull the precinct log to see who reported Iris dead three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Jam the earpiece",
        "detail": "Flood Kade's channel with static so Voss cannot hear the conversation."
      },
      {
        "label": "Kill the neon",
        "detail": "Black out the block's signs and lamps to deepen the cover around them."
      }
    ],
    "intervene": [
      {
        "label": "Reroute ground unit",
        "detail": "Send Voss's incoming unit to the wrong end of the market."
      },
      {
        "label": "Fake a sighting",
        "detail": "Plant a false grid sighting of Iris near the harbor gate."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
