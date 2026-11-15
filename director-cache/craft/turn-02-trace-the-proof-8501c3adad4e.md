# Sky run: Trace the proof

- Film: Sky run (`craft`)
- Branch: Tap Voss's channel → Trace the proof
- Cached: 2026-11-15T23:16:39.572Z

Delete this file to have the director write this turn again.

## What happens

The scan of Iris's proof shows Kade's own authorization code countersigned beneath Voss's on the burn order. Iris has known all along, and two interceptors lock onto the craft's tail.

Story purpose: The proof reveals Kade's code on the burn order, and Iris admits she knew, cracking the trust just as the interceptors find them.

## Dialogue

- **Kade:** That's my code under his. I never signed a burn order.
- **Iris:** I know. I found it the night they came. I still came to you.
- **Voss:** Ask her why she kept that from you. Interceptors, you have them.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow swing in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace Kade's code
- investigate: Identify the pilots
- manipulate: Summon the storm
- manipulate: Kill billboard lights
- intervene: Take the narrow gap
- intervene: Jam their guns

## Data

```json
{
  "narration": "The scan of Iris's proof shows Kade's own authorization code countersigned beneath Voss's on the burn order. Iris has known all along, and two interceptors lock onto the craft's tail.",
  "storyPurpose": "The proof reveals Kade's code on the burn order, and Iris admits she knew, cracking the trust just as the interceptors find them.",
  "whatNext": "Kade could insist his code was stolen and fight on beside Iris, or Voss could use the revelation over the radio to split them apart.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "That's my code under his. I never signed a burn order."
    },
    {
      "speaker": "Iris",
      "line": "I know. I found it the night they came. I still came to you."
    },
    {
      "speaker": "Voss",
      "line": "Ask her why she kept that from you. Interceptors, you have them."
    }
  ],
  "onScreen": "Two black interceptors with blue engine glow close in right behind Kade's dark craft between the rain-soaked towers.",
  "offScreen": "In the precinct tower, Voss's techs notice the scan pinging the burn order archive and learn the proof is aboard and intact.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow swing in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races through the rain between towers pulsing with red warning lights, two black interceptors with blue engine glow now locked close on its tail.",
  "weather": "Heavy rain, storm building",
  "lighting": "Dusk, red warning lights",
  "security": "Interceptors on tail, weapons free",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Shaken to find his own code on the burn order; needs to know if he was used or complicit",
      "trust": 60
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof naming both Voss and Kade's code; hid it hoping Kade would choose her anyway",
      "trust": 45
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Now knows the proof is aboard; wants to turn Kade against Iris before shooting them down",
      "trust": 25
    }
  ],
  "keyEvent": "The burn order bears Kade's authorization code beneath Voss's, and Iris knew before the market.",
  "actions": {
    "investigate": [
      {
        "label": "Trace Kade's code",
        "detail": "Search the precinct logs for who actually entered Kade's authorization on the burn order."
      },
      {
        "label": "Identify the pilots",
        "detail": "Pull the interceptor transponders to learn who is flying the two craft behind them."
      }
    ],
    "manipulate": [
      {
        "label": "Summon the storm",
        "detail": "Push the weather grid to unleash lightning and blinding rain between the towers."
      },
      {
        "label": "Kill billboard lights",
        "detail": "Black out the holographic billboards along the route to blind the interceptors' optics."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Guide Kade through the tight gap between two towers where interceptors must fly single file."
      },
      {
        "label": "Jam their guns",
        "detail": "Use the tapped channel to lock out the interceptors' weapons for a few seconds."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
