# Sky run: Jam the guns

- Film: Sky run (`craft`)
- Branch: Arm the tower guns → Jam the guns
- Cached: 2026-11-15T23:16:53.351Z

Delete this file to have the director write this turn again.

## What happens

The tower guns lose their lock and their fire sprays wide into the rain, but the same false signals blind the interceptors' friend-or-foe, and Voss reads the jamming as Kade's final answer.

Story purpose: Jamming the guns saves the craft, and Iris begins to trust Kade enough to tell him his own name is on the burn order.

## Dialogue

- **Iris:** The guns are firing blind. Someone in the grid is helping us.
- **Voss:** Jamming my towers is treason, Kade. My offer just expired.
- **Iris:** Kade, the order he burned us with. Your signature is on it.
- **Kade:** I never signed anything. Show me when we're clear.

## Orbis prompts

Change: Bright orange tracer fire swings wide of the dark flying craft and streaks harmlessly into the rain between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the signature
- investigate: Scan the interceptors
- manipulate: Kill tower lights
- manipulate: Intensify the storm
- intervene: Open the narrow gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The tower guns lose their lock and their fire sprays wide into the rain, but the same false signals blind the interceptors' friend-or-foe, and Voss reads the jamming as Kade's final answer.",
  "storyPurpose": "Jamming the guns saves the craft, and Iris begins to trust Kade enough to tell him his own name is on the burn order.",
  "whatNext": "Kade could thread a narrow gap between two towers to shake the interceptors, or run low past the billboards where their blinded sensors falter.",
  "together": "Two interceptors hold close behind the craft, their guns still cold.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "The guns are firing blind. Someone in the grid is helping us."
    },
    {
      "speaker": "Voss",
      "line": "Jamming my towers is treason, Kade. My offer just expired."
    },
    {
      "speaker": "Iris",
      "line": "Kade, the order he burned us with. Your signature is on it."
    },
    {
      "speaker": "Kade",
      "line": "I never signed anything. Show me when we're clear."
    }
  ],
  "onScreen": "Orange tracer fire from the tower guns now sprays wide of Kade's craft, streaking harmlessly into the rain between the towers, the two interceptors still close behind.",
  "offScreen": "In the precinct tower, Voss orders the interceptors to close and fire by hand now that the tower targeting is useless.",
  "transitionPrompt": "Bright orange tracer fire swings wide of the dark flying craft and streaks harmlessly into the rain between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races between rain-soaked towers as stray tracer fire scatters wide into the storm, two black interceptors with blue engine glow holding close behind it.",
  "weather": "Rain, storm thickening",
  "lighting": "Dusk, scattered tracer flashes",
  "security": "Tower guns jammed",
  "threatLevel": 3,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Must keep Iris alive and learn why his own name is on the burn order",
      "trust": 56
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof against Voss; must reach the transport by dawn and decide if Kade was complicit",
      "trust": 32
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; now treats Kade as a traitor",
      "trust": 38
    }
  ],
  "keyEvent": "The tower guns are jammed and firing wide, and Iris has revealed Kade's signature appears on the order that burned her unit.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the signature",
        "detail": "Pull the burn order's authorization logs to see whether Kade's signature was forged."
      },
      {
        "label": "Scan the interceptors",
        "detail": "Identify the interceptor pilots and what orders Voss has given them."
      }
    ],
    "manipulate": [
      {
        "label": "Kill tower lights",
        "detail": "Black out the tower lights and billboards beside the craft so the interceptors lose sight of it in the storm."
      },
      {
        "label": "Intensify the storm",
        "detail": "Push the weather grid to drive heavier rain and lightning between the towers."
      }
    ],
    "intervene": [
      {
        "label": "Open the narrow gap",
        "detail": "Clear a narrow gap between two towers for Kade to thread, too tight for the interceptors to follow side by side."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Extend the false signals to the interceptors' weapons so they cannot fire."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
