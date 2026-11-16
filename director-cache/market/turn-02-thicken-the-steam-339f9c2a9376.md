# Night market: Thicken the steam

- Film: Night market (`market`)
- Branch: Disable security → Thicken the steam
- Cached: 2026-11-15T23:15:43.639Z

Delete this file to have the director write this turn again.

## What happens

Vented exhaust floods the street with dense white steam, and inside it Iris closes the distance and pulls Kade under an awning. Voss loses even Kade's description of the scene.

Story purpose: Kade and Iris come face to face for the first time in three years, hidden by the steam, while Voss hears his hunter go quiet.

## Dialogue

- **Iris:** Don't draw, Kade. Three years, and you still walk like a cop.
- **Kade:** They buried you. I stood at the incinerator.
- **Voss:** Kade, report. Why can't I hear the street anymore?
- **Iris:** Lie to him. Then hear what I carry before you decide.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Dense white steam swirls around them in diffuse neon light, with light rain dripping from the awning. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Trace Voss's order
- manipulate: Jam the earpiece
- manipulate: Kill the stall power
- intervene: Feed Voss false location
- intervene: Open the harbor gate

## Data

```json
{
  "narration": "Vented exhaust floods the street with dense white steam, and inside it Iris closes the distance and pulls Kade under an awning. Voss loses even Kade's description of the scene.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, hidden by the steam, while Voss hears his hunter go quiet.",
  "whatNext": "Kade could tell Voss he has lost her and listen to Iris, or report her position and end it here.",
  "together": "Kade and Iris stand face to face under a stall awning, wrapped in thick steam, her hand on his wrist.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Don't draw, Kade. Three years, and you still walk like a cop."
    },
    {
      "speaker": "Kade",
      "line": "They buried you. I stood at the incinerator."
    },
    {
      "speaker": "Voss",
      "line": "Kade, report. Why can't I hear the street anymore?"
    },
    {
      "speaker": "Iris",
      "line": "Lie to him. Then hear what I carry before you decide."
    }
  ],
  "onScreen": "Dense white steam fills the market around Kade and Iris as she grips his wrist and they talk face to face under an awning.",
  "offScreen": "At the precinct, Voss pulls Kade's earpiece audio and orders a technician to trace the exhaust vents that just opened.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Dense white steam swirls around them in diffuse neon light, with light rain dripping from the awning. Medium close-up of the two of them at eye level.",
  "scenePrompt": "The night market is swallowed in thick white steam glowing with diffuse neon. Kade and Iris stand close under a dripping awning, her hand on his wrist.",
  "weather": "Light rain, dense steam",
  "lighting": "Diffuse neon through steam",
  "security": "Grid offline, vents open",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss closes in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter face to face with his old partner",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 67
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant confronting Kade in the steam",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 38
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, blind and deaf to the market",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 25
    }
  ],
  "keyEvent": "Kade and Iris are face to face under a stall awning, hidden in dense steam from the vented exhaust lines.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Run a passive scan on the device Iris carries to reveal what proof it holds."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Pull the precinct logs to find who signed Iris's retirement order three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Jam the earpiece",
        "detail": "Flood Kade's earpiece channel with static so Voss cannot hear the conversation."
      },
      {
        "label": "Kill the stall power",
        "detail": "Cut power to the stalls so the steam-filled street falls into darkness."
      }
    ],
    "intervene": [
      {
        "label": "Feed Voss false location",
        "detail": "Spoof Kade's tracker to send Voss's attention to the far end of the market."
      },
      {
        "label": "Open the harbor gate",
        "detail": "Unlock a service gate toward the harbor so Iris has a way out."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
