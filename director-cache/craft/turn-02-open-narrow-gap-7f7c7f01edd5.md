# Sky run: Open narrow gap

- Film: Sky run (`craft`)
- Branch: Arm the tower guns → Open narrow gap
- Cached: 2026-11-15T01:04:13.493Z

Delete this file to have the director write this turn again.

## What happens

The player clears the narrow gap between two close towers, and Kade banks through it out of the guns' line of fire. The interceptors follow into the tight passage, and in the sudden quiet Iris tells Kade his name is on the burn order too.

Story purpose: Escaping the guns buys a moment of quiet in which Iris reveals Kade's own name is on the proof, shaking his trust in what he has been fighting for.

## Dialogue

- **Iris:** The burn order has two signatures, Kade. Voss's, and yours.
- **Kade:** I never signed anything. He forged it, or he used my codes.
- **Voss:** She's showing you the file? Ask her who carried it out.
- **Iris:** He wants you doubting me. Fly, and we'll read it together.

## Orbis prompts

Change: The dark flying craft banks hard left through a narrow gap between two close towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between close towers, lights and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the signature
- investigate: Identify interceptor pilots
- manipulate: Summon the storm
- manipulate: Kill the billboards
- intervene: Jam interceptor guns
- intervene: Run the billboards

## Data

```json
{
  "narration": "The player clears the narrow gap between two close towers, and Kade banks through it out of the guns' line of fire. The interceptors follow into the tight passage, and in the sudden quiet Iris tells Kade his name is on the burn order too.",
  "storyPurpose": "Escaping the guns buys a moment of quiet in which Iris reveals Kade's own name is on the proof, shaking his trust in what he has been fighting for.",
  "whatNext": "Kade could demand to see the proof and risk losing time, or push deeper into the gaps while the interceptors squeeze in behind.",
  "together": "Two interceptors hold close behind the craft inside the narrow gap.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "The burn order has two signatures, Kade. Voss's, and yours."
    },
    {
      "speaker": "Kade",
      "line": "I never signed anything. He forged it, or he used my codes."
    },
    {
      "speaker": "Voss",
      "line": "She's showing you the file? Ask her who carried it out."
    },
    {
      "speaker": "Iris",
      "line": "He wants you doubting me. Fly, and we'll read it together."
    }
  ],
  "onScreen": "Kade's craft banks hard through a narrow gap between two close towers, the tracer fire falling away and the two interceptors squeezing in behind it.",
  "offScreen": "In the tower defence grid, the guns lose their firing line as the craft vanishes into the gap.",
  "transitionPrompt": "The dark flying craft banks hard left through a narrow gap between two close towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between close towers, lights and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft threads a tight gap between two rain-soaked towers, tower walls and holograms close on both sides, the tracer fire gone. Two black interceptors with blue engine glow squeeze in close behind it.",
  "weather": "Rain, storm clouds building",
  "lighting": "Dusk, hologram glow",
  "security": "Tower guns blinded",
  "threatLevel": 3,
  "objective": "Shake the interceptors and learn what the proof shows",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Must keep Iris alive while learning his own name is on the burn order he believed was only Voss's",
      "trust": 56
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof that Voss ordered her unit burned, with Kade's name on it; must reach the harbor transport by dawn",
      "trust": 32
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced, and now uses Kade's name on the order to split them",
      "trust": 40
    }
  ],
  "keyEvent": "Iris reveals the burn order carries Kade's signature alongside Voss's, and the craft has escaped the tower guns into the narrow tower gaps.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the signature",
        "detail": "Pull the precinct's authorization logs to see whether Kade's codes were used on the burn order without him."
      },
      {
        "label": "Identify interceptor pilots",
        "detail": "Scan the two interceptors' transponders to learn who is flying them and what orders they carry."
      }
    ],
    "manipulate": [
      {
        "label": "Summon the storm",
        "detail": "Push the building storm into heavy rain and lightning between the towers to blind the interceptors' sensors."
      },
      {
        "label": "Kill the billboards",
        "detail": "Black out the holographic billboards along the gap so the craft vanishes into the dark between towers."
      }
    ],
    "intervene": [
      {
        "label": "Jam interceptor guns",
        "detail": "Lock out the interceptors' weapon systems before they get a clear shot inside the gap."
      },
      {
        "label": "Run the billboards",
        "detail": "Route Kade out of the gap and low past the giant holographic billboards, where their glare hides the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
