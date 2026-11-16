# Sky run: Black out billboards

- Film: Sky run (`craft`)
- Branch: Read the proof → Black out billboards
- Cached: 2026-11-15T23:16:25.800Z

Delete this file to have the director write this turn again.

## What happens

The billboards along Kade's route die at once, and the craft slips into the rain-dark between the towers. But Voss reads the blackout as a trail, and two interceptors lock onto the dark corridor anyway.

Story purpose: The blackout hides the craft but betrays its route, and Iris learns Kade's ID code was used from inside Voss's office.

## Dialogue

- **Voss:** A dark stripe across my city, Kade. You've drawn me a map.
- **Iris:** The signature timestamp. Your code was entered from his office terminal.
- **Kade:** Then he signed for me. Hold on, they're on us.
- **Iris:** If you're lying, I'll know before the harbor.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the darkened towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and dim towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the terminal log
- investigate: Scan the interceptors
- manipulate: Call down lightning
- manipulate: Relight the billboards
- intervene: Take the narrow gap
- intervene: Jam their guns

## Data

```json
{
  "narration": "The billboards along Kade's route die at once, and the craft slips into the rain-dark between the towers. But Voss reads the blackout as a trail, and two interceptors lock onto the dark corridor anyway.",
  "storyPurpose": "The blackout hides the craft but betrays its route, and Iris learns Kade's ID code was used from inside Voss's office.",
  "whatNext": "Kade could dive through a narrow gap to shake the interceptors, or Iris could transmit the proof now and risk giving away their position.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "A dark stripe across my city, Kade. You've drawn me a map."
    },
    {
      "speaker": "Iris",
      "line": "The signature timestamp. Your code was entered from his office terminal."
    },
    {
      "speaker": "Kade",
      "line": "Then he signed for me. Hold on, they're on us."
    },
    {
      "speaker": "Iris",
      "line": "If you're lying, I'll know before the harbor."
    }
  ],
  "onScreen": "The billboards around Kade's craft go dark, and two interceptors close in behind it through the rain.",
  "offScreen": "In the precinct tower, air control plots the line of dead billboards and vectors the interceptors along it.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the darkened towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and dim towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The billboards beside the craft are dark and rain sheets across the towers. Two black interceptors with blue engine glow ride close on its tail.",
  "weather": "Heavy driving rain",
  "lighting": "Billboards dark along route",
  "security": "Interceptors vectored onto blackout",
  "threatLevel": 4,
  "objective": "Shake the interceptors and prove Voss forged Kade's ID",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Prove to Iris that Voss entered his ID code himself",
      "trust": 60
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Reach the transport by dawn; half-believes Kade now that the timestamp points to Voss",
      "trust": 42
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Destroy the proof before anyone traces the forged co-authorization to his terminal",
      "trust": 26
    }
  ],
  "keyEvent": "The proof's metadata shows Kade's ID was entered from Voss's office terminal, and two interceptors are now on the craft's tail.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the terminal log",
        "detail": "Pull the precinct access log to show who sat at Voss's terminal that night."
      },
      {
        "label": "Scan the interceptors",
        "detail": "Identify the interceptor pilots and whether they know what Voss did."
      }
    ],
    "manipulate": [
      {
        "label": "Call down lightning",
        "detail": "Overload the storm grid so forked lightning blinds the interceptors' sensors."
      },
      {
        "label": "Relight the billboards",
        "detail": "Flood the towers with billboard glare to dazzle the pursuers behind the craft."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Guide Kade banking hard through a tight gap between two towers to shed the interceptors."
      },
      {
        "label": "Jam their guns",
        "detail": "Lock the interceptors' weapon systems before they open fire."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
