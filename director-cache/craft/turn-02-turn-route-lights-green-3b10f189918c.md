# Sky run: Turn route lights green

- Film: Sky run (`craft`)
- Branch: Bring in the storm → Turn route lights green
- Cached: 2026-11-15T23:17:21.865Z

Delete this file to have the director write this turn again.

## What happens

The player turns the tower route lights green, clearing a fast lane down the main avenue, but the green corridor paints a path Voss can read through the storm. Two interceptors drop onto the craft's tail.

Story purpose: The cleared lane speeds the run but betrays the craft's position, and Iris shows Kade the proof only to reveal his own name may be on it.

## Dialogue

- **Iris:** Green lights all the way. Someone's helping us, or setting us up.
- **Voss:** Thank you, Kade. A lit lane in a storm. Interceptors, close in.
- **Iris:** The burn order has two signatures. Look at the second one, Kade.
- **Kade:** That's my clearance code. I never signed that.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between green-lit towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and green tower lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the signature
- investigate: Scan the interceptors
- manipulate: Kill the billboards
- manipulate: Turn lights red
- intervene: Cut through the gap
- intervene: Jam their guns

## Data

```json
{
  "narration": "The player turns the tower route lights green, clearing a fast lane down the main avenue, but the green corridor paints a path Voss can read through the storm. Two interceptors drop onto the craft's tail.",
  "storyPurpose": "The cleared lane speeds the run but betrays the craft's position, and Iris shows Kade the proof only to reveal his own name may be on it.",
  "whatNext": "Kade could break off the lit lane into a narrow gap between towers, or stay fast on the avenue and outrun the interceptors before they open fire.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Green lights all the way. Someone's helping us, or setting us up."
    },
    {
      "speaker": "Voss",
      "line": "Thank you, Kade. A lit lane in a storm. Interceptors, close in."
    },
    {
      "speaker": "Iris",
      "line": "The burn order has two signatures. Look at the second one, Kade."
    },
    {
      "speaker": "Kade",
      "line": "That's my clearance code. I never signed that."
    }
  ],
  "onScreen": "Lights on the towers beside Kade's craft turn green as two black interceptors slide in close behind it.",
  "offScreen": "In the precinct control room, Voss's operators trace the line of green route lights through the storm and vector the interceptors along it.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between green-lit towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and green tower lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races down a corridor of green tower lights through the storm, two black interceptors with blue engine glow locked close on its tail.",
  "weather": "Full storm, heavy rain",
  "lighting": "Green route lights, lightning",
  "security": "Route lane exposes craft",
  "threatLevel": 3,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Shaken to find his own clearance code on the burn order; needs to know if he was used",
      "trust": 60
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Reach the harbor by dawn; testing whether Kade will stand by her now that his name is on the proof",
      "trust": 38
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; now has the craft located and pursued",
      "trust": 30
    }
  ],
  "keyEvent": "Kade's clearance code appears as the second signature on the order that burned Iris's unit, and two interceptors are now on the craft's tail.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the signature",
        "detail": "Pull the precinct authorization logs to find who used Kade's clearance code on the burn order."
      },
      {
        "label": "Scan the interceptors",
        "detail": "Read the interceptors' transponders to learn their pilots and their rules of engagement."
      }
    ],
    "manipulate": [
      {
        "label": "Kill the billboards",
        "detail": "Black out the holographic billboards along the towers so the craft vanishes into darkness and rain."
      },
      {
        "label": "Turn lights red",
        "detail": "Flip the route lights red behind the craft to force the interceptors to brake and divert."
      }
    ],
    "intervene": [
      {
        "label": "Cut through the gap",
        "detail": "Guide Kade off the avenue through a narrow gap between two towers where the interceptors cannot follow side by side."
      },
      {
        "label": "Jam their guns",
        "detail": "Lock the interceptors' weapon systems before they can open fire on the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
