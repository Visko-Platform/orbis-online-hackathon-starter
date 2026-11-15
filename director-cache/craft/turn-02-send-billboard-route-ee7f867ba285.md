# Sky run: Send billboard route

- Film: Sky run (`craft`)
- Branch: Arm the tower guns → Send billboard route
- Cached: 2026-11-15T23:16:54.922Z

Delete this file to have the director write this turn again.

## What happens

Kade drops the craft low along the giant holographic billboards, and their glare blinds the interceptors' sights. The tower guns lose their lock, but in the flicker Iris admits Kade's name is on the burn order too.

Story purpose: The billboard glare shakes the guns loose, and Iris reveals that Kade's own name is on the proof as the officer who signed off the burn.

## Dialogue

- **Iris:** The proof has a second signature on it, Kade. Yours.
- **Kade:** I never signed a burn order. Never.
- **Voss:** Tell him, Iris. Tell him whose code cleared the strike.
- **Iris:** I didn't believe it either. That's why I'm still in this seat.

## Orbis prompts

Change: The dark flying craft drops low and skims past a row of giant glowing holographic billboards on the towers beside it. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies fast and low past bright billboards, towers and lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Giant holographic billboards blaze with bright light right beside it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace Kade's code
- investigate: Scan interceptor pilots
- manipulate: Flood thermal noise
- manipulate: Black out billboards
- intervene: Take the narrow gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "Kade drops the craft low along the giant holographic billboards, and their glare blinds the interceptors' sights. The tower guns lose their lock, but in the flicker Iris admits Kade's name is on the burn order too.",
  "storyPurpose": "The billboard glare shakes the guns loose, and Iris reveals that Kade's own name is on the proof as the officer who signed off the burn.",
  "whatNext": "Kade could demand to see the proof and risk losing the lead, or push on toward the harbor and trust Iris blindly.",
  "together": "Two interceptors trail behind the craft, half-blinded by the billboard glare.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "The proof has a second signature on it, Kade. Yours."
    },
    {
      "speaker": "Kade",
      "line": "I never signed a burn order. Never."
    },
    {
      "speaker": "Voss",
      "line": "Tell him, Iris. Tell him whose code cleared the strike."
    },
    {
      "speaker": "Iris",
      "line": "I didn't believe it either. That's why I'm still in this seat."
    }
  ],
  "onScreen": "Kade's craft skims low past huge glowing billboards, their glare washing over it as the guns' tracer fire falls behind.",
  "offScreen": "In the precinct, Voss orders the interceptors to switch to thermal tracking to see through the billboard glare.",
  "transitionPrompt": "The dark flying craft drops low and skims past a row of giant glowing holographic billboards on the towers beside it. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies fast and low past bright billboards, towers and lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Giant holographic billboards blaze with bright light right beside it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft skims low past enormous blazing holographic billboards in the rain, their glare flooding the air around it, the interceptors' outlines blurred in the light behind it.",
  "weather": "Steady rain, storm building",
  "lighting": "Blinding billboard glare",
  "security": "Guns lost lock",
  "threatLevel": 3,
  "objective": "Learn the truth of the proof and reach the harbor",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Shaken to learn his own clearance code may be on Iris's burn order; needs to know if he was used",
      "trust": 56
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Must reach the harbor by dawn; has told Kade his code is on the order and is watching what he does with it",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and is using Kade's signature to split him from Iris",
      "trust": 42
    }
  ],
  "keyEvent": "Iris has revealed that Kade's clearance code appears on the order that burned her unit.",
  "actions": {
    "investigate": [
      {
        "label": "Trace Kade's code",
        "detail": "Pull the precinct logs to learn when and from where Kade's clearance code cleared the strike."
      },
      {
        "label": "Scan interceptor pilots",
        "detail": "Identify who is flying the two interceptors and what orders they carry."
      }
    ],
    "manipulate": [
      {
        "label": "Flood thermal noise",
        "detail": "Overload the towers' heat vents with steam so thermal tracking goes blind."
      },
      {
        "label": "Black out billboards",
        "detail": "Kill the billboards ahead to plunge the route into darkness and hide the craft."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Send the craft banking through a tight gap between two towers to shake the interceptors."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Scramble the interceptors' weapon systems before they can fire."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
