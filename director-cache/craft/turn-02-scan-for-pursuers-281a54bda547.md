# Sky run: Scan for pursuers

- Film: Sky run (`craft`)
- Branch: Read the proof → Scan for pursuers
- Cached: 2026-11-15T23:16:26.284Z

Delete this file to have the director write this turn again.

## What happens

Air control feeds show Voss has launched two interceptors under a hunter's override code, the same one stamped on the burn order. They lock onto the craft's tail between the towers.

Story purpose: The scan reveals the interceptors were launched with Kade's own stolen ID, giving Kade his first evidence of innocence while bringing the hunters down on them.

## Dialogue

- **Iris:** Two interceptors launched. The launch code is your hunter ID, Kade.
- **Kade:** I'm right here flying. I can't be launching them. Someone's wearing my name.
- **Iris:** Then it isn't yours. Voss has a copy.
- **Voss:** Last chance, Kade. They're on you now. Land.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between the towers, rain and lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the clone
- investigate: Read interceptor orders
- manipulate: Black out billboards
- manipulate: Spoof the clone
- intervene: Cut through gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "Air control feeds show Voss has launched two interceptors under a hunter's override code, the same one stamped on the burn order. They lock onto the craft's tail between the towers.",
  "storyPurpose": "The scan reveals the interceptors were launched with Kade's own stolen ID, giving Kade his first evidence of innocence while bringing the hunters down on them.",
  "whatNext": "Kade could use the stolen code to fool the interceptors, or Voss could realize the scan exposed him and order them to fire.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Two interceptors launched. The launch code is your hunter ID, Kade."
    },
    {
      "speaker": "Kade",
      "line": "I'm right here flying. I can't be launching them. Someone's wearing my name."
    },
    {
      "speaker": "Iris",
      "line": "Then it isn't yours. Voss has a copy."
    },
    {
      "speaker": "Voss",
      "line": "Last chance, Kade. They're on you now. Land."
    }
  ],
  "onScreen": "Two black interceptors with blue engine glow fly in close behind Kade's craft between the rain-soaked towers.",
  "offScreen": "In the precinct tower, an air control officer flags that the interceptor launch used a hunter ID belonging to a pilot already airborne.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between the towers, rain and lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft weaves through heavy rain between glowing towers, two black interceptors with blue engine glow locked close on its tail.",
  "weather": "Heavy rain, storm thickening",
  "lighting": "Dusk, flickering tower lights",
  "security": "Interceptors launched, tracking craft",
  "threatLevel": 4,
  "objective": "Shake the interceptors and expose who cloned Kade's ID",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Prove he never signed the burn order; the cloned launch code is his first lead",
      "trust": 63
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Reach the transport by dawn; beginning to believe Kade was framed",
      "trust": 45
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Destroy the proof and bring Kade in before the cloned ID is traced to him",
      "trust": 27
    }
  ],
  "keyEvent": "The two interceptors were launched using a clone of Kade's hunter ID while Kade was airborne, evidence someone else uses his code.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the clone",
        "detail": "Follow the cloned ID's launch signal back to the terminal that issued it."
      },
      {
        "label": "Read interceptor orders",
        "detail": "Pull the interceptors' engagement orders to learn if Voss authorized lethal fire."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the route so the craft vanishes into the dark rain."
      },
      {
        "label": "Spoof the clone",
        "detail": "Broadcast Kade's cloned ID to the interceptors as a friendly recall order."
      }
    ],
    "intervene": [
      {
        "label": "Cut through gap",
        "detail": "Send the craft banking hard into a narrow gap between two towers to shake the pursuers."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Lock the interceptors' weapon systems so they cannot open fire."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
