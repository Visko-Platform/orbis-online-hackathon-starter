# Sky run: Kill corridor lights

- Film: Sky run (`craft`)
- Branch: Route to the harbor → Kill corridor lights
- Cached: 2026-11-15T23:17:06.764Z

Delete this file to have the director write this turn again.

## What happens

The green corridor goes dark tower by tower, and the craft vanishes into the storm-black avenue. But blacking out the lights confirms the helper to Voss, who scrambles two interceptors onto the craft's last known heading.

Story purpose: Killing the corridor hides the route but proves the inside helper, and Voss answers with interceptors while Iris presses Kade on whose name is in the proof.

## Dialogue

- **Voss:** Lights out won't hide you, Kade. Interceptors are already on you.
- **Iris:** Whoever's in the grid just saved us. And exposed themselves.
- **Kade:** Iris, the proof. Is my name on that burn order?
- **Iris:** Ask me again when we're not being hunted.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the dark towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Scan the proof
- investigate: Trace interceptor pilots
- manipulate: Summon lightning storm
- manipulate: Flare the billboards
- intervene: Route through gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The green corridor goes dark tower by tower, and the craft vanishes into the storm-black avenue. But blacking out the lights confirms the helper to Voss, who scrambles two interceptors onto the craft's last known heading.",
  "storyPurpose": "Killing the corridor hides the route but proves the inside helper, and Voss answers with interceptors while Iris presses Kade on whose name is in the proof.",
  "whatNext": "Kade could dive for a narrow gap between towers to shake the interceptors, or Iris could finally tell him what the proof says about him.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Lights out won't hide you, Kade. Interceptors are already on you."
    },
    {
      "speaker": "Iris",
      "line": "Whoever's in the grid just saved us. And exposed themselves."
    },
    {
      "speaker": "Kade",
      "line": "Iris, the proof. Is my name on that burn order?"
    },
    {
      "speaker": "Iris",
      "line": "Ask me again when we're not being hunted."
    }
  ],
  "onScreen": "The green lights on the towers beside Kade's craft go dark, and two interceptors swing in close behind it.",
  "offScreen": "In the precinct tower, Voss's technicians trace the blackout command to an unknown account inside the city grid.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the dark towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The corridor lights have died and the craft races through rain lit only by holographic billboards, two black interceptors with blue engine glow locked close on its tail.",
  "weather": "Heavy rain, storm building",
  "lighting": "Corridor dark, billboard glow only",
  "security": "Helper traced, interceptors launched",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Committed to the run now, but afraid the proof names him too",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof against Voss; withholding what it says about Kade until she trusts him",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; hunting the inside helper",
      "trust": 25
    }
  ],
  "keyEvent": "The green corridor was blacked out, two interceptors are on the craft's tail, and Voss is tracing the helper in the grid.",
  "actions": {
    "investigate": [
      {
        "label": "Scan the proof",
        "detail": "Read Iris's data file remotely to learn whether Kade's name is on the burn order."
      },
      {
        "label": "Trace interceptor pilots",
        "detail": "Pull the interceptors' flight logs to find who is flying them and their orders."
      }
    ],
    "manipulate": [
      {
        "label": "Summon lightning storm",
        "detail": "Push the storm cells to break over the towers, blinding the interceptors' sensors."
      },
      {
        "label": "Flare the billboards",
        "detail": "Turn every holographic billboard to blinding white to dazzle the pursuing pilots."
      }
    ],
    "intervene": [
      {
        "label": "Route through gap",
        "detail": "Guide Kade into the narrow gap between two towers where the interceptors can't follow abreast."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Lock the interceptors' weapons systems before they open fire."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
