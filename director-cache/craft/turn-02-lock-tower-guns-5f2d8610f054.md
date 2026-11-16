# Sky run: Lock tower guns

- Film: Sky run (`craft`)
- Branch: Tap Voss's channel → Lock tower guns
- Cached: 2026-11-15T23:16:39.914Z

Delete this file to have the director write this turn again.

## What happens

The tower gun batteries along the route lock down, their barrels frozen, but the lockdown trips a precinct alarm that hands Voss the craft's position. Two interceptors drop in close behind the craft.

Story purpose: Locking the guns saves the craft from the towers but betrays its position, and Voss turns from false mercy to open threat as Iris starts to trust the unseen hand helping them.

## Dialogue

- **Iris:** The tower guns just went dead. Someone in the system is helping us.
- **Voss:** Gun lockdown on your route, Kade. Thank you for showing me where you are.
- **Kade:** Two interceptors on our tail. Iris, hold on to that proof.
- **Iris:** Whoever you are out there, don't stop now.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the proof
- investigate: Identify the pilots
- manipulate: Summon the storm
- manipulate: Black out billboards
- intervene: Thread the gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The tower gun batteries along the route lock down, their barrels frozen, but the lockdown trips a precinct alarm that hands Voss the craft's position. Two interceptors drop in close behind the craft.",
  "storyPurpose": "Locking the guns saves the craft from the towers but betrays its position, and Voss turns from false mercy to open threat as Iris starts to trust the unseen hand helping them.",
  "whatNext": "Kade could break for the narrow gap between two towers to shake the interceptors, or Voss could order them to open fire before the craft reaches the pyramids.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "The tower guns just went dead. Someone in the system is helping us."
    },
    {
      "speaker": "Voss",
      "line": "Gun lockdown on your route, Kade. Thank you for showing me where you are."
    },
    {
      "speaker": "Kade",
      "line": "Two interceptors on our tail. Iris, hold on to that proof."
    },
    {
      "speaker": "Iris",
      "line": "Whoever you are out there, don't stop now."
    }
  ],
  "onScreen": "Two sleek black interceptor craft with blue engine glow fly in close behind Kade's craft among the towers.",
  "offScreen": "In the precinct, the gun lockdown alarm flashes on Voss's board and marks the craft's route for his pilots.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races through rain between towers whose gun batteries sit frozen, two black interceptors with blue engine glow locked close on its tail. Storm clouds press low over the towers.",
  "weather": "Heavy rain, storm building",
  "lighting": "Dusk, red warning lights",
  "security": "Tower guns locked, interceptors pursuing",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Knows Voss means to kill him; now flying to keep Iris and the proof alive",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof that Voss ordered her unit burned; must reach the off-world transport by dawn",
      "trust": 50
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors at his command",
      "motivation": "Wants the proof destroyed and everyone aboard silenced, and now knows someone inside the system is helping them",
      "trust": 20
    }
  ],
  "keyEvent": "The tower gun batteries along the route are locked and cannot fire, but the lockdown revealed the craft's position and two interceptors are now on its tail.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the proof",
        "detail": "Scan the data Iris carries to see what it shows and whose names are on the burn order."
      },
      {
        "label": "Identify the pilots",
        "detail": "Pull the interceptor pilots' records from Voss's channel to learn who flies them and what orders they hold."
      }
    ],
    "manipulate": [
      {
        "label": "Summon the storm",
        "detail": "Trigger the weather grid to unleash heavy rain and lightning between the towers to blind the interceptors."
      },
      {
        "label": "Black out billboards",
        "detail": "Kill the giant holographic billboards along the route so the craft vanishes into darkness."
      }
    ],
    "intervene": [
      {
        "label": "Thread the gap",
        "detail": "Guide Kade through the narrow gap between two towers to force the interceptors to break off."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Use the tapped channel to lock the interceptors' weapons before Voss orders them to fire."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
