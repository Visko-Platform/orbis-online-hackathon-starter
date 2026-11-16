# Sky run: Trace gun authorization

- Film: Sky run (`craft`)
- Branch: Arm the tower guns → Trace gun authorization
- Cached: 2026-11-15T23:16:52.674Z

Delete this file to have the director write this turn again.

## What happens

The gun authorization log shows Voss signed the order, but the countersignature is Kade's own access code, used an hour before the market. Iris now wonders whose side Kade was on when the night began.

Story purpose: The command log reveals Kade's code countersigned the arming order, and Iris's fragile trust in him cracks.

## Dialogue

- **Iris:** Your code is on this order. You armed the guns for me.
- **Kade:** Voss pulled my code. I never signed anything tonight.
- **Voss:** Tell her, Kade. You were hunting her an hour ago.
- **Iris:** Is your name on my unit's order too?

## Orbis prompts

Change: Bright orange tracer fire streaks just past the dark flying craft from behind, and the craft rolls hard to the right between two towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between the towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Open the proof
- investigate: Trace code use
- manipulate: Black out billboards
- manipulate: Revoke Kade's code
- intervene: Take the narrow gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The gun authorization log shows Voss signed the order, but the countersignature is Kade's own access code, used an hour before the market. Iris now wonders whose side Kade was on when the night began.",
  "storyPurpose": "The command log reveals Kade's code countersigned the arming order, and Iris's fragile trust in him cracks.",
  "whatNext": "Kade could prove himself by using his code to silence the guns, or Iris could turn the proof on him and demand the controls.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Your code is on this order. You armed the guns for me."
    },
    {
      "speaker": "Kade",
      "line": "Voss pulled my code. I never signed anything tonight."
    },
    {
      "speaker": "Voss",
      "line": "Tell her, Kade. You were hunting her an hour ago."
    },
    {
      "speaker": "Iris",
      "line": "Is your name on my unit's order too?"
    }
  ],
  "onScreen": "Kade's craft banks hard between the towers to dodge a burst of tracer fire, the two interceptors still close behind.",
  "offScreen": "In the precinct tower, the command log flags that someone aboard Kade's craft has opened the sealed authorization file.",
  "transitionPrompt": "Bright orange tracer fire streaks just past the dark flying craft from behind, and the craft rolls hard to the right between two towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between the towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft weaves between rain-soaked towers under bursts of orange tracer fire, two black interceptors with blue engine glow close behind. Holograms flicker on the towers on both sides.",
  "weather": "Rain thickening, storm building",
  "lighting": "Dusk, tracer flashes",
  "security": "Tower guns live",
  "threatLevel": 3,
  "objective": "Survive the guns and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Must convince Iris his code was stolen while keeping them alive under fire",
      "trust": 55
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof against Voss and now doubts whether Kade's name is on it too",
      "trust": 22
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced, and is using Kade's code to split them apart",
      "trust": 43
    }
  ],
  "keyEvent": "The tower gun arming order carries Kade's access code as countersignature, which Iris has now seen.",
  "actions": {
    "investigate": [
      {
        "label": "Open the proof",
        "detail": "Decrypt Iris's file to show whether Kade's name appears on the order burning her unit."
      },
      {
        "label": "Trace code use",
        "detail": "Check where Kade's access code was entered to prove whether Voss used it."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards around the craft to plunge the towers into darkness and blind the gunners."
      },
      {
        "label": "Revoke Kade's code",
        "detail": "Use the countersignature to shut down the tower guns, exposing Kade's code to Voss's trackers."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Guide the craft through a tight gap between two towers where the interceptors must fall back."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Scramble the interceptors' targeting so they cannot fire on the craft for a short time."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
