# Night market: Flush the crowd

- Film: Night market (`market`)
- Branch: Open Iris's file → Flush the crowd
- Cached: 2026-11-15T23:15:13.037Z

Delete this file to have the director write this turn again.

## What happens

A false vendor alarm shrieks through the market and the crowd scatters, leaving one pale-haired figure frozen beside a noodle stall. Kade reaches her first, and Voss sees the scatter on the grid and knows exactly where to look.

Story purpose: Kade and Iris come face to face for the first time in three years, and the flushed crowd hands Voss her location too.

## Dialogue

- **Iris:** Three years, and you still come when he whistles.
- **Kade:** I read the purge order. His name is on it.
- **Voss:** The grid has her, Kade. Hold her there.
- **Iris:** Then you know why I can't let him take me.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the steam and neon around them. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her coat
- investigate: Trace Voss's orders
- manipulate: Blind the grid
- manipulate: Thicken the steam
- intervene: Cut the earpiece
- intervene: Lock the gates

## Data

```json
{
  "narration": "A false vendor alarm shrieks through the market and the crowd scatters, leaving one pale-haired figure frozen beside a noodle stall. Kade reaches her first, and Voss sees the scatter on the grid and knows exactly where to look.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, and the flushed crowd hands Voss her location too.",
  "whatNext": "Iris could run or trust Kade with what she carries, while Voss's grid narrows on the emptied street.",
  "together": "Kade and Iris stand face to face beside a noodle stall, his hand on her wrist.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Three years, and you still come when he whistles."
    },
    {
      "speaker": "Kade",
      "line": "I read the purge order. His name is on it."
    },
    {
      "speaker": "Voss",
      "line": "The grid has her, Kade. Hold her there."
    },
    {
      "speaker": "Iris",
      "line": "Then you know why I can't let him take me."
    }
  ],
  "onScreen": "Kade and Iris stand face to face beside a noodle stall as he catches her wrist, the street emptied around them.",
  "offScreen": "In the precinct, Voss watches the crowd thin on the grid feed and marks the one figure who did not run.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the steam and neon around them. Medium close-up of the two of them at eye level.",
  "scenePrompt": "In the emptied, rain-slicked night market, the man in the long brown leather trench coat holds the wrist of the pale-haired woman in the grey hooded raincoat beside a steaming noodle stall under neon.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Grid cameras locked on both",
  "threatLevel": 4,
  "objective": "Learn Iris's side before Voss's grid closes in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now holding Iris",
      "motivation": "Knows Voss lied; wants Iris's side before deciding whether to bring her in",
      "trust": 63
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, caught by Kade",
      "motivation": "Must reach the harbor transport by dawn with her proof; testing whether Kade has changed",
      "trust": 22
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, voice in Kade's earpiece, watching through the grid",
      "motivation": "Wants Iris silenced tonight; now has her location and watches Kade's every move",
      "trust": 35
    }
  ],
  "keyEvent": "A false vendor alarm emptied the market, and Voss's grid now has Iris's exact location.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her coat",
        "detail": "Run Kade's scanner over Iris to find the proof she carries."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Pull the precinct dispatch log to see what Voss has sent toward the market."
      }
    ],
    "manipulate": [
      {
        "label": "Blind the grid",
        "detail": "Loop the market cameras so Voss sees an empty street."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall boilers to fill the street with cover."
      }
    ],
    "intervene": [
      {
        "label": "Cut the earpiece",
        "detail": "Jam Kade's earpiece so Voss can no longer hear them."
      },
      {
        "label": "Lock the gates",
        "detail": "Seal the market entrances to stall anything Voss sends."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
