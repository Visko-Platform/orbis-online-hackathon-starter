# Night market: Kill the stall lights

- Film: Night market (`market`)
- Branch: Intensify the storm → Kill the stall lights
- Cached: 2026-11-15T23:15:29.561Z

Delete this file to have the director write this turn again.

## What happens

The stall lamps and neon die along Iris's path, and the dark lets Kade close the distance unseen until he catches her sleeve under a dead awning. Voss loses the last of his eyes on that row and knows someone cut it.

Story purpose: The blackout lets Kade reach Iris face to face, but Voss realizes the grid failure was deliberate and starts to doubt Kade.

## Dialogue

- **Voss:** That row just went black. Rain doesn't cut breakers, Kade.
- **Iris:** Kade. They told me you'd be the one they sent.
- **Kade:** They told me you burned three years ago. Who lied?
- **Iris:** Both of us were lied to. Let go, and I'll show you.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awning around them, and only a faint blue glow lights their faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Trace Voss's order
- manipulate: Loop the earpiece
- manipulate: Flood the alley fog
- intervene: Divert the units
- intervene: Open harbor route

## Data

```json
{
  "narration": "The stall lamps and neon die along Iris's path, and the dark lets Kade close the distance unseen until he catches her sleeve under a dead awning. Voss loses the last of his eyes on that row and knows someone cut it.",
  "storyPurpose": "The blackout lets Kade reach Iris face to face, but Voss realizes the grid failure was deliberate and starts to doubt Kade.",
  "whatNext": "Iris could tell Kade what really happened three years ago, or Voss could send units into the dark row to find out who killed the lights.",
  "together": "Kade and Iris stand face to face under a darkened stall awning, his hand on her sleeve.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "That row just went black. Rain doesn't cut breakers, Kade."
    },
    {
      "speaker": "Iris",
      "line": "Kade. They told me you'd be the one they sent."
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned three years ago. Who lied?"
    },
    {
      "speaker": "Iris",
      "line": "Both of us were lied to. Let go, and I'll show you."
    }
  ],
  "onScreen": "The lights go dark around them as Kade catches Iris by the sleeve, and the two face each other under a dead awning lit by faint blue glow.",
  "offScreen": "At the precinct, Voss flags the market power cut as manual sabotage and pulls Kade's location log.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awning around them, and only a faint blue glow lights their faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dead stall awning in the blacked-out row, the man in the long brown leather trench coat holds the sleeve of the pale-haired woman in a grey hooded raincoat. Rain pours around them and only a faint blue glow lights their faces.",
  "weather": "Heavy downpour, thick steam",
  "lighting": "Blackout, faint blue glow",
  "security": "Grid blind on dark row",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss sends units",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, now caught by Kade in the dark row",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 28
    }
  ],
  "keyEvent": "Kade and Iris are face to face in a blacked-out stall row, and Voss knows the blackout was deliberate.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Read the data signature of what Iris carries to learn what proof she holds."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Pull the precinct records to see who signed Iris's death report three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Loop the earpiece",
        "detail": "Feed Voss a looped audio track so he cannot hear the conversation."
      },
      {
        "label": "Flood the alley fog",
        "detail": "Vent steam from the market vents to hide the dark row from approaching units."
      }
    ],
    "intervene": [
      {
        "label": "Divert the units",
        "detail": "Send Voss's dispatched units to a false sighting on the far side of the market."
      },
      {
        "label": "Open harbor route",
        "detail": "Unlock the service gates toward Kade's parked craft for a fast exit."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
