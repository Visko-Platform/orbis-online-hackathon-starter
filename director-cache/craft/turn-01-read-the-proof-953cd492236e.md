# Sky run: Read the proof

- Film: Sky run (`craft`)
- Branch: Read the proof
- Cached: 2026-11-15T00:31:13.750Z

Delete this file to have the director write this turn again.

## What happens

The decrypted core shows Voss's signature on the burn order, and a second authorization beneath it: Kade's own hunter ID. Voss's offer to forget tonight suddenly sounds like a threat.

Story purpose: The proof reveals Kade's own ID co-signed the burn order, shaking Iris's trust in him just as Voss repeats his offer.

## Dialogue

- **Iris:** Your hunter ID is under his signature, Kade. You signed it.
- **Kade:** I never saw that order. Someone used my code.
- **Voss:** She'll never believe you now. Land, and your name disappears.
- **Iris:** Keep flying. Prove it to me.

## Orbis prompts

Change: Heavy rain sweeps across the towers beside the dark flying craft, and the tower lights flicker around it. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Heavy rain lashes the towers. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the ID use
- investigate: Scan for pursuers
- manipulate: Black out billboards
- manipulate: Jam tower guns
- intervene: Take the narrow gap
- intervene: Broadcast the proof

## Data

```json
{
  "narration": "The decrypted core shows Voss's signature on the burn order, and a second authorization beneath it: Kade's own hunter ID. Voss's offer to forget tonight suddenly sounds like a threat.",
  "storyPurpose": "The proof reveals Kade's own ID co-signed the burn order, shaking Iris's trust in him just as Voss repeats his offer.",
  "whatNext": "Kade could swear he never signed it and keep flying, or Voss could use the doubt to pull him home.",
  "together": "The craft flies alone between the towers.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Your hunter ID is under his signature, Kade. You signed it."
    },
    {
      "speaker": "Kade",
      "line": "I never saw that order. Someone used my code."
    },
    {
      "speaker": "Voss",
      "line": "She'll never believe you now. Land, and your name disappears."
    },
    {
      "speaker": "Iris",
      "line": "Keep flying. Prove it to me."
    }
  ],
  "onScreen": "The tower lights beside Kade's craft flicker as the grid traces the decryption, and the rain thickens around it.",
  "offScreen": "At precinct control, Voss sees the core was opened and quietly authorizes interceptors to prepare for launch.",
  "transitionPrompt": "Heavy rain sweeps across the towers beside the dark flying craft, and the tower lights flicker around it. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Heavy rain lashes the towers. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races through the rain-soaked towers as the downpour thickens and tower lights flicker beside it, holograms glowing through the rain.",
  "weather": "Heavy rain, storm thickening",
  "lighting": "Dusk, flickering tower lights",
  "security": "Air control tracing decryption",
  "threatLevel": 3,
  "objective": "Reach the harbor and find who used Kade's ID",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "His own ID is on the burn order; he must prove to Iris, and himself, he never signed it",
      "trust": 58
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Must reach the transport by dawn, now unsure whether the man flying her helped burn her unit",
      "trust": 38
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and now uses Kade's name on it as leverage to bring him back",
      "trust": 30
    }
  ],
  "keyEvent": "The proof shows Voss's signature on the burn order with Kade's hunter ID as co-authorization.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the ID use",
        "detail": "Search precinct logs for the terminal that entered Kade's hunter ID on the burn order."
      },
      {
        "label": "Scan for pursuers",
        "detail": "Check air control feeds to see which interceptors Voss is preparing to launch."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the route so the craft vanishes into the dark rain."
      },
      {
        "label": "Jam tower guns",
        "detail": "Scramble the targeting systems of the tower guns before Voss can order them to fire."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Route the craft through the tight gap between two towers to break air control's tracking."
      },
      {
        "label": "Broadcast the proof",
        "detail": "Push the decrypted order onto the billboards, exposing Voss and Kade's name with it."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
