# Sky run: Take the narrow gap

- Film: Sky run (`craft`)
- Branch: Read the proof → Take the narrow gap
- Cached: 2026-11-15T23:16:25.800Z

Delete this file to have the director write this turn again.

## What happens

Kade threads the craft through a narrow gap between two towers and air control loses its trace for a moment, but two interceptors waiting on the far side lock onto his tail. Iris notices the interceptors were already in position, as if someone knew the route.

Story purpose: The gap breaks the trace but springs a waiting trap, and Iris begins to suspect Kade's code is still feeding Voss their position.

## Dialogue

- **Iris:** They were waiting on the other side. How did they know?
- **Voss:** Your craft reports to me, Kade. It always has.
- **Kade:** My ID is in the transponder. That's how they used it.
- **Iris:** Then rip it out, or I stop believing you.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow swing in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between the towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the co-signature
- investigate: Scan the interceptors
- manipulate: Black out billboards
- manipulate: Spoof the transponder
- intervene: Jam their guns
- intervene: Run the billboard row

## Data

```json
{
  "narration": "Kade threads the craft through a narrow gap between two towers and air control loses its trace for a moment, but two interceptors waiting on the far side lock onto his tail. Iris notices the interceptors were already in position, as if someone knew the route.",
  "storyPurpose": "The gap breaks the trace but springs a waiting trap, and Iris begins to suspect Kade's code is still feeding Voss their position.",
  "whatNext": "Kade could cut his own hunter ID from the craft to go dark, or Iris could decide he is the leak and turn on him.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "They were waiting on the other side. How did they know?"
    },
    {
      "speaker": "Voss",
      "line": "Your craft reports to me, Kade. It always has."
    },
    {
      "speaker": "Kade",
      "line": "My ID is in the transponder. That's how they used it."
    },
    {
      "speaker": "Iris",
      "line": "Then rip it out, or I stop believing you."
    }
  ],
  "onScreen": "Kade's craft squeezes through a narrow gap between two towers and two black interceptors swing in close behind it.",
  "offScreen": "In the precinct tower, Voss reroutes air control to follow the craft's hunter-ID transponder instead of radar.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow swing in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between the towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft has slipped through a tight gap between two rain-slick towers, and two black interceptors with blue engine glow now ride close on its tail amid the holograms.",
  "weather": "Heavy rain, gusting wind",
  "lighting": "Dusk, flickering tower lights",
  "security": "Tracking via Kade's transponder",
  "threatLevel": 4,
  "objective": "Shake the interceptors and stop Kade's ID betraying them",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Prove to Iris he never signed the order, and stop his own ID leading Voss to them",
      "trust": 60
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Reach the transport by dawn; suspects Kade's code is still serving Voss",
      "trust": 36
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed; tracks the craft through Kade's own hunter ID",
      "trust": 28
    }
  ],
  "keyEvent": "Two interceptors are on the craft's tail, guided by Kade's hunter-ID transponder.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the co-signature",
        "detail": "Pull the precinct log to see which terminal entered Kade's ID on the burn order."
      },
      {
        "label": "Scan the interceptors",
        "detail": "Identify who is flying the two interceptors and what orders they carry."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the towers so the craft vanishes into darkness and rain."
      },
      {
        "label": "Spoof the transponder",
        "detail": "Feed air control a false position for Kade's hunter ID."
      }
    ],
    "intervene": [
      {
        "label": "Jam their guns",
        "detail": "Lock the interceptors' weapons before they open fire on the craft."
      },
      {
        "label": "Run the billboard row",
        "detail": "Send the craft low past the giant holographic billboards to blind the interceptors' sensors."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
