# Night market: Bring them together

- Film: Night market (`market`)
- Branch: Bring them together
- Cached: 2026-11-15T00:30:59.756Z

Delete this file to have the director write this turn again.

## What happens

A stall lamp stutters on and off, and Kade follows it straight to Iris crouched beneath the awning. Through the grid, Voss sees the flicker and starts asking who is touching his lights.

Story purpose: Kade finds Iris alive and face to face, and Voss notices someone tampering with the grid.

## Dialogue

- **Iris:** Hello, Kade. They said you'd be the one they sent.
- **Kade:** I buried you. Three years, Iris. Who was in that grave?
- **Voss:** Kade, that lamp is flickering on my grid. Is she there? Answer me.
- **Iris:** Ask him what he did to my unit. Then decide.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A single stall lamp above them flickers amber light across their faces, and light rain drips from the awning edge. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's drive
- investigate: Trace Voss's order
- manipulate: Black out stall
- manipulate: Thicken the steam
- intervene: Cut Kade's earpiece
- intervene: Spoof Kade's location

## Data

```json
{
  "narration": "A stall lamp stutters on and off, and Kade follows it straight to Iris crouched beneath the awning. Through the grid, Voss sees the flicker and starts asking who is touching his lights.",
  "storyPurpose": "Kade finds Iris alive and face to face, and Voss notices someone tampering with the grid.",
  "whatNext": "Iris could run before Kade decides, or Kade could lower his weapon and ask what happened three years ago.",
  "together": "Kade and Iris stand face to face beneath a flickering stall awning, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Hello, Kade. They said you'd be the one they sent."
    },
    {
      "speaker": "Kade",
      "line": "I buried you. Three years, Iris. Who was in that grave?"
    },
    {
      "speaker": "Voss",
      "line": "Kade, that lamp is flickering on my grid. Is she there? Answer me."
    },
    {
      "speaker": "Iris",
      "line": "Ask him what he did to my unit. Then decide."
    }
  ],
  "onScreen": "Kade and Iris stand face to face under a stall awning whose lamp flickers on and off across their faces.",
  "offScreen": "At the precinct, Voss orders a trace on whoever triggered the stall lamp fault.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A single stall lamp above them flickers amber light across their faces, and light rain drips from the awning edge. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dripping stall awning, the man in the trench coat and the pale-haired woman in the grey hooded raincoat face each other in stuttering amber lamplight. Steam and neon fill the market around them.",
  "weather": "Light rain, drifting steam",
  "lighting": "Flickering amber stall lamp",
  "security": "Grid tracing a fault",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss locates them",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 65
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, now face to face with Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 25
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 35
    }
  ],
  "keyEvent": "Kade and Iris are face to face, and Voss suspects someone is manipulating the market grid.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's drive",
        "detail": "Use the grid to read what data Iris is carrying on her."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Dig into precinct records to find who signed Iris's death report three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Black out stall",
        "detail": "Kill every light around the pair so Voss's cameras lose them."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall steam lines to fog the street around them."
      }
    ],
    "intervene": [
      {
        "label": "Cut Kade's earpiece",
        "detail": "Jam Voss's channel so Kade and Iris can talk unheard."
      },
      {
        "label": "Spoof Kade's location",
        "detail": "Feed Voss false tracking that puts Kade three streets away."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
