# Sky run: Take the narrow gap

- Film: Sky run (`craft`)
- Branch: Bring in the storm → Take the narrow gap
- Cached: 2026-11-15T23:17:21.660Z

Delete this file to have the director write this turn again.

## What happens

Kade threads the craft through a narrow gap between two towers, slipping off radar for a moment, but the gap's proximity beacons ping their transponder and two interceptors lock on behind them. In the cockpit, Iris finally shows Kade the proof.

Story purpose: The gap shakes radar but trips a tower beacon that brings two interceptors onto their tail, and Iris reveals the proof carries a hunter's authorization code.

## Dialogue

- **Iris:** Here. The burn order. Voss signed it, but a hunter confirmed it.
- **Kade:** Whose confirmation code is that, Iris?
- **Voss:** The gap beacons pinged you, Kade. Two interceptors are on you now.
- **Iris:** Fly first. Then you'll read the name.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow swing in close behind the dark flying craft between the rain-lashed towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between the towers through heavy rain, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the code
- investigate: Scan the interceptors
- manipulate: Black out billboards
- manipulate: Spoof tower beacons
- intervene: Jam their guns
- intervene: Take the billboard run

## Data

```json
{
  "narration": "Kade threads the craft through a narrow gap between two towers, slipping off radar for a moment, but the gap's proximity beacons ping their transponder and two interceptors lock on behind them. In the cockpit, Iris finally shows Kade the proof.",
  "storyPurpose": "The gap shakes radar but trips a tower beacon that brings two interceptors onto their tail, and Iris reveals the proof carries a hunter's authorization code.",
  "whatNext": "Kade could ask whose code is on the burn order, or turn and face the interceptors before Voss closes in.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Here. The burn order. Voss signed it, but a hunter confirmed it."
    },
    {
      "speaker": "Kade",
      "line": "Whose confirmation code is that, Iris?"
    },
    {
      "speaker": "Voss",
      "line": "The gap beacons pinged you, Kade. Two interceptors are on you now."
    },
    {
      "speaker": "Iris",
      "line": "Fly first. Then you'll read the name."
    }
  ],
  "onScreen": "Kade banks the craft through a narrow gap between two towers in the storm, and two black interceptors swing in close behind it.",
  "offScreen": "At the precinct, a tower proximity beacon in the gap logs Kade's transponder and Voss scrambles the nearest interceptor pair.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow swing in close behind the dark flying craft between the rain-lashed towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between the towers through heavy rain, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft weaves through tight tower gaps in the lightning storm, two black interceptors with blue engine glow locked close on its tail.",
  "weather": "Full storm, heavy lightning",
  "lighting": "Lightning flashes, flickering holograms",
  "security": "Tower beacons tracking craft",
  "threatLevel": 3,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Needs to know whose confirmation code is on the burn order, fearing it may be his own",
      "trust": 64
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Reach the harbor transport by dawn; withholding the hunter's name until Kade proves himself",
      "trust": 38
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; now has interceptors to force the issue",
      "trust": 28
    }
  ],
  "keyEvent": "Two interceptors are now on the craft's tail, and the proof shows a hunter's confirmation code on Iris's burn order.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the code",
        "detail": "Run the hunter confirmation code on the burn order through precinct records."
      },
      {
        "label": "Scan the interceptors",
        "detail": "Pull the interceptor pilots' identities and their standing orders from Voss."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the towers to plunge the route into darkness."
      },
      {
        "label": "Spoof tower beacons",
        "detail": "Feed the gap beacons false transponder echoes to scatter the interceptors' lock."
      }
    ],
    "intervene": [
      {
        "label": "Jam their guns",
        "detail": "Lock out the interceptors' weapon systems before they can open fire."
      },
      {
        "label": "Take the billboard run",
        "detail": "Guide Kade low past the giant holographic billboards to hide among their glare."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
