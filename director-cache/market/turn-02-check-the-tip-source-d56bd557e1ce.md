# Night market: Check the tip source

- Film: Night market (`market`)
- Branch: Grapple up a building → Check the tip source
- Cached: 2026-11-15T18:33:52.302Z

Delete this file to have the director write this turn again.

## What happens

The grid logs show the tip came from Voss's own precinct terminal, routed through a dead informant's ID. Kade drops from the ledge and reaches Iris in the crowd, and she turns to face him.

Story purpose: Kade learns Voss planted the tip himself, and comes face to face with Iris knowing he was used as bait.

## Dialogue

- **Kade:** The tip came from your own terminal, Voss. You set this up.
- **Voss:** I sent the right man. Finish it.
- **Iris:** Hello, Kade. Did he tell you I was dead too?
- **Kade:** He told me a lot of things. Tonight I want yours.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the neon glow around them. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Pull her old file
- manipulate: Jam the earpiece
- manipulate: Thicken the steam
- intervene: Divert the drones
- intervene: Fake a sighting

## Data

```json
{
  "narration": "The grid logs show the tip came from Voss's own precinct terminal, routed through a dead informant's ID. Kade drops from the ledge and reaches Iris in the crowd, and she turns to face him.",
  "storyPurpose": "Kade learns Voss planted the tip himself, and comes face to face with Iris knowing he was used as bait.",
  "whatNext": "Iris could run before Kade explains, or Kade could tell her Voss sent him and ask for the truth.",
  "together": "Kade and Iris stand face to face between two steaming stalls, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "The tip came from your own terminal, Voss. You set this up."
    },
    {
      "speaker": "Voss",
      "line": "I sent the right man. Finish it."
    },
    {
      "speaker": "Iris",
      "line": "Hello, Kade. Did he tell you I was dead too?"
    },
    {
      "speaker": "Kade",
      "line": "He told me a lot of things. Tonight I want yours."
    }
  ],
  "onScreen": "Kade and Iris stand face to face in the rain between the market stalls as she pulls back her hood.",
  "offScreen": "At the precinct, Voss sees the log query flagged and seals the tip record.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the neon glow around them. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Kade and Iris stand face to face between steaming neon-lit stalls in light rain, her hood pulled back, her hand on his sleeve.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Grid active, logs flagged",
  "threatLevel": 3,
  "objective": "Learn Iris's truth before Voss closes in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with Iris",
      "motivation": "Knows Voss used him as bait; wants the truth about three years ago before deciding Iris's fate",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant confronting her former partner",
      "motivation": "Carries proof of what Voss did to her unit; must reach the harbor transport by dawn and must judge whether Kade will help or kill her",
      "trust": 28
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight; knows Kade has discovered the planted tip and is losing patience",
      "trust": 30
    }
  ],
  "keyEvent": "Kade discovered Voss planted the tip himself, and Kade and Iris are now face to face in the market.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Read what is on the data drive Iris carries without her knowing."
      },
      {
        "label": "Pull her old file",
        "detail": "Open Iris's sealed unit record from three years ago to see how her death was logged."
      }
    ],
    "manipulate": [
      {
        "label": "Jam the earpiece",
        "detail": "Flood Kade's earpiece channel with static so Voss cannot hear the conversation."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall boilers to wrap the pair in dense steam against grid cameras."
      }
    ],
    "intervene": [
      {
        "label": "Divert the drones",
        "detail": "Send the district patrol drones to the far end of the market, away from the pair."
      },
      {
        "label": "Fake a sighting",
        "detail": "Plant a false sighting of Iris at the harbor gate to pull Voss's units away."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
