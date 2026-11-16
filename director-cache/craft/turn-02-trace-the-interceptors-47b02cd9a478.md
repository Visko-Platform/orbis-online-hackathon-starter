# Sky run: Trace the interceptors

- Film: Sky run (`craft`)
- Branch: Thread the tower gap → Trace the interceptors
- Cached: 2026-11-15T23:17:22.904Z

Delete this file to have the director write this turn again.

## What happens

The launch logs reveal Voss sent his two best pilots under a kill order, not an arrest, and the two interceptors catch the craft between the towers. Kade now knows the offer to forget tonight was a lie.

Story purpose: The logs expose Voss's offer as a trap, hardening Kade and earning a first sliver of Iris's trust.

## Dialogue

- **Iris:** Read it. Kill order, signed an hour before he offered you home.
- **Kade:** Rennick and Holt. He sent his best. No arrest code.
- **Voss:** Those orders are standard, Kade. Land and they'll be rescinded.
- **Kade:** You signed it before you called me. We're done talking.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Scan the proof
- investigate: Profile the pilots
- manipulate: Unleash the storm
- manipulate: Kill billboard lights
- intervene: Jam their guns
- intervene: Dive past billboards

## Data

```json
{
  "narration": "The launch logs reveal Voss sent his two best pilots under a kill order, not an arrest, and the two interceptors catch the craft between the towers. Kade now knows the offer to forget tonight was a lie.",
  "storyPurpose": "The logs expose Voss's offer as a trap, hardening Kade and earning a first sliver of Iris's trust.",
  "whatNext": "Kade could turn the kill order against Voss on an open channel, or the interceptors could open fire before he gets the chance.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Read it. Kill order, signed an hour before he offered you home."
    },
    {
      "speaker": "Kade",
      "line": "Rennick and Holt. He sent his best. No arrest code."
    },
    {
      "speaker": "Voss",
      "line": "Those orders are standard, Kade. Land and they'll be rescinded."
    },
    {
      "speaker": "Kade",
      "line": "You signed it before you called me. We're done talking."
    }
  ],
  "onScreen": "Two black interceptors with blue engine glow close in right behind Kade's craft as it races between the towers.",
  "offScreen": "At the precinct, Voss locks the launch logs, but the copy Kade pulled is already aboard the craft.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races between rain-slick towers with two black interceptors glowing blue close on its tail. Storm clouds keep thickening over the billboards.",
  "weather": "Heavy rain, storm building",
  "lighting": "Dusk, billboard glow",
  "security": "Interceptors locked on",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Knows Voss's offer was a lie; the pull of his old life is fading into anger",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof against Voss; beginning to believe Kade will hold firm",
      "trust": 44
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; his kill order is now exposed",
      "trust": 24
    }
  ],
  "keyEvent": "Kade holds a copy of Voss's kill order for the interceptor pilots Rennick and Holt, signed before Voss offered to forget tonight.",
  "actions": {
    "investigate": [
      {
        "label": "Scan the proof",
        "detail": "Open Iris's encrypted proof file to see exactly what it shows and whose names are on it."
      },
      {
        "label": "Profile the pilots",
        "detail": "Pull Rennick and Holt's service records to find whether either served with Kade."
      }
    ],
    "manipulate": [
      {
        "label": "Unleash the storm",
        "detail": "Push the weather grid to drive the storm into full lightning between the towers, blinding targeting but buffeting the craft."
      },
      {
        "label": "Kill billboard lights",
        "detail": "Black out the holographic billboards along the route so the craft's silhouette vanishes, though it also flies half blind."
      }
    ],
    "intervene": [
      {
        "label": "Jam their guns",
        "detail": "Scramble the interceptors' weapon systems so they cannot fire for a short window."
      },
      {
        "label": "Dive past billboards",
        "detail": "Steer the craft low past the giant holographic billboards, where reflections confuse the interceptors' sensors."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
