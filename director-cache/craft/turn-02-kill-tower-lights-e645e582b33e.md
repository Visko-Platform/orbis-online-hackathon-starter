# Sky run: Kill tower lights

- Film: Sky run (`craft`)
- Branch: Arm the tower guns → Kill tower lights
- Cached: 2026-11-15T23:16:54.399Z

Delete this file to have the director write this turn again.

## What happens

The towers around the craft go dark and the gunners lose their mark, but the blackout also blinds Kade, and the interceptors switch to their own searchlights. Iris uses the dark to tell Kade his name is on the proof.

Story purpose: The blackout silences the guns but in the dark Iris admits Kade's own name is in the proof, shaking his trust in her.

## Dialogue

- **Iris:** The guns stopped. Kade, before he finds us, you should know something.
- **Iris:** Your name is on the burn order. You signed the unit transfer.
- **Kade:** I signed paperwork. I never knew what it was for.
- **Voss:** She's told you, then. Land, and nobody ever reads that name.

## Orbis prompts

Change: The glowing holographic billboards and lights on the towers beside the dark flying craft flicker and go dark. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, dark towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it, shining bright white searchlights onto it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Read the proof
- investigate: Trace interceptor pilots
- manipulate: Summon the storm
- manipulate: Flood billboards bright
- intervene: Route through gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The towers around the craft go dark and the gunners lose their mark, but the blackout also blinds Kade, and the interceptors switch to their own searchlights. Iris uses the dark to tell Kade his name is on the proof.",
  "storyPurpose": "The blackout silences the guns but in the dark Iris admits Kade's own name is in the proof, shaking his trust in her.",
  "whatNext": "Kade could thread a narrow gap between two dark towers to lose the interceptors, or demand Iris show him exactly what the proof says about him.",
  "together": "Two interceptors hold close behind the craft, their white searchlights fixed on it.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "The guns stopped. Kade, before he finds us, you should know something."
    },
    {
      "speaker": "Iris",
      "line": "Your name is on the burn order. You signed the unit transfer."
    },
    {
      "speaker": "Kade",
      "line": "I signed paperwork. I never knew what it was for."
    },
    {
      "speaker": "Voss",
      "line": "She's told you, then. Land, and nobody ever reads that name."
    }
  ],
  "onScreen": "The holographic billboards and tower lights around Kade's craft go dark, the tracer fire stops, and the two interceptors behind it turn on bright white searchlights.",
  "offScreen": "In the precinct tower, Voss orders the interceptors to track the craft by searchlight and engine heat.",
  "transitionPrompt": "The glowing holographic billboards and lights on the towers beside the dark flying craft flicker and go dark. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, dark towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it, shining bright white searchlights onto it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The towers immediately around the craft have gone dark, only distant billboards still glowing through the rain. The tracer fire has ceased, and two black interceptors pin the craft in white searchlight beams.",
  "weather": "Heavy rain, storm building",
  "lighting": "Blackout, white searchlights",
  "security": "Tower guns blind",
  "threatLevel": 3,
  "objective": "Lose the interceptors and learn the truth of the proof",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Shaken to learn his signature is on the burn order; must decide if Iris used him or saved him",
      "trust": 56
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof against Voss, which also names Kade; needs him to keep flying anyway",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and now uses Kade's own name on it as leverage",
      "trust": 38
    }
  ],
  "keyEvent": "Iris revealed that Kade's signature is on the unit transfer behind the burn order, and the tower lights around the craft's route are blacked out.",
  "actions": {
    "investigate": [
      {
        "label": "Read the proof",
        "detail": "Open Iris's data file through the craft's systems to see exactly what Kade signed and who else is named."
      },
      {
        "label": "Trace interceptor pilots",
        "detail": "Pull the interceptors' flight records to learn who is flying them and what orders they carry."
      }
    ],
    "manipulate": [
      {
        "label": "Summon the storm",
        "detail": "Push the weather grid to unleash heavy rain and lightning that scatters the interceptors' searchlights."
      },
      {
        "label": "Flood billboards bright",
        "detail": "Turn the billboards ahead to full glare to blind the interceptor pilots behind the craft."
      }
    ],
    "intervene": [
      {
        "label": "Route through gap",
        "detail": "Guide Kade into a narrow gap between two dark towers where the interceptors must slow or collide."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Lock the interceptors' weapons before they open fire on the craft in the dark."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
