# Night market: Kill the searchlight

- Film: Night market (`market`)
- Branch: Deploy drones → Kill the searchlight
- Cached: 2026-11-15T23:15:57.445Z

Delete this file to have the director write this turn again.

## What happens

The drone's searchlight dies and Iris, unpinned, stays rather than bolts, letting Kade reach her in the dark. Voss loses his clear view and suspects someone inside the grid is helping them.

Story purpose: Killing the light lets Kade reach Iris face to face, and Voss, blinded, starts to suspect Kade of protecting her.

## Dialogue

- **Voss:** I've lost the beam. Kade, did you touch that drone?
- **Iris:** You turned off the light. Why, Kade?
- **Kade:** Because they told me you burned with the others.
- **Iris:** Voss lit the fire. I carry the proof.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Pink and blue neon lights their faces through drifting steam and light rain. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Trace Voss's trace
- manipulate: Cut market power
- manipulate: Thicken the steam
- intervene: Delay ground units
- intervene: Jam the earpiece

## Data

```json
{
  "narration": "The drone's searchlight dies and Iris, unpinned, stays rather than bolts, letting Kade reach her in the dark. Voss loses his clear view and suspects someone inside the grid is helping them.",
  "storyPurpose": "Killing the light lets Kade reach Iris face to face, and Voss, blinded, starts to suspect Kade of protecting her.",
  "whatNext": "Iris could tell Kade what really happened three years ago, or Voss could find another way to see them.",
  "together": "Kade and Iris stand face to face beside the noodle stall, close enough to touch, in the steam and neon.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "I've lost the beam. Kade, did you touch that drone?"
    },
    {
      "speaker": "Iris",
      "line": "You turned off the light. Why, Kade?"
    },
    {
      "speaker": "Kade",
      "line": "Because they told me you burned with the others."
    },
    {
      "speaker": "Iris",
      "line": "Voss lit the fire. I carry the proof."
    }
  ],
  "onScreen": "The searchlight goes dark and Kade stands face to face with Iris by the noodle stall, lit only by neon and steam.",
  "offScreen": "At the precinct, Voss's monitor showing the drone feed goes black over the market and he orders a technician to trace who cut it.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Pink and blue neon lights their faces through drifting steam and light rain. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Kade and Iris stand face to face beside the steaming noodle stall, her hand on his sleeve, lit only by soft neon through steam and light rain; the drone hovers dark above the street.",
  "weather": "Light rain, drifting steam",
  "lighting": "Neon only, searchlight dark",
  "security": "Drone blind, grid suspicious",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss's units arrive",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his former partner",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 62
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, confronting Kade at the noodle stall",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 25
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, now blind over the stall",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 44
    }
  ],
  "keyEvent": "The drone searchlight was killed; Iris claims Voss set the fire that supposedly killed her three years ago, and Voss suspects Kade.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Pull a reading from the device Iris carries to see what proof it holds about Voss."
      },
      {
        "label": "Trace Voss's trace",
        "detail": "Check who Voss's technician is tracing through the grid and how close they are."
      }
    ],
    "manipulate": [
      {
        "label": "Cut market power",
        "detail": "Black out the market's neon and stall lamps to hide the pair from the grid cameras."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall boilers to fill the street with steam and blind any approaching units."
      }
    ],
    "intervene": [
      {
        "label": "Delay ground units",
        "detail": "Reroute Voss's ground units onto a closed road to buy the pair more time."
      },
      {
        "label": "Jam the earpiece",
        "detail": "Cut Voss's voice from Kade's ear so he can hear Iris without pressure."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
