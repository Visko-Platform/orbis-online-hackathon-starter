# Sky run: Locate the interceptors

- Film: Sky run (`craft`)
- Branch: Tap Voss's channel → Locate the interceptors
- Cached: 2026-11-15T23:16:40.003Z

Delete this file to have the director write this turn again.

## What happens

Air control tracking shows two interceptors converging from the towers on both flanks, guided by a tower beacon fixed on the craft's own transponder. Before Kade can kill it, the interceptors lock on and slide in close behind.

Story purpose: The tracking reveals Voss has been following Kade's own transponder all along, and Iris realizes Kade's craft was never clean.

## Dialogue

- **Iris:** They're homing on your transponder, Kade. Precinct issue. You led them straight to us.
- **Kade:** Voss had it fitted after your unit burned. I never asked why.
- **Voss:** Two on your tail, Kade. Land now, or they take you down.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-soaked towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Read the proof
- investigate: Identify the pilots
- manipulate: Spoof the transponder
- manipulate: Kill the tower lights
- intervene: Dive the narrow gap
- intervene: Jam their guns

## Data

```json
{
  "narration": "Air control tracking shows two interceptors converging from the towers on both flanks, guided by a tower beacon fixed on the craft's own transponder. Before Kade can kill it, the interceptors lock on and slide in close behind.",
  "storyPurpose": "The tracking reveals Voss has been following Kade's own transponder all along, and Iris realizes Kade's craft was never clean.",
  "whatNext": "Kade could rip out the transponder and fly blind, or turn the beacon against Voss by feeding his pilots a false trail.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "They're homing on your transponder, Kade. Precinct issue. You led them straight to us."
    },
    {
      "speaker": "Kade",
      "line": "Voss had it fitted after your unit burned. I never asked why."
    },
    {
      "speaker": "Voss",
      "line": "Two on your tail, Kade. Land now, or they take you down."
    }
  ],
  "onScreen": "Two black interceptors with blue engine glow fly in close behind Kade's dark craft between the rain-soaked towers.",
  "offScreen": "In air control, Voss watches the craft's transponder beacon blink on his tracking board and routes two more interceptors toward the main avenue.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-soaked towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races between rain-lashed towers with two black interceptors glowing blue close on its tail. Red warning lights pulse along the facades beside them.",
  "weather": "Heavy rain, storm building",
  "lighting": "Dusk, red warning lights",
  "security": "Interceptors locked on, weapons free",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Ashamed his own craft betrayed them; determined to get Iris out",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof against Voss; newly wary of anything precinct-made, including Kade's craft",
      "trust": 45
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and everyone aboard silenced; trusts his transponder trace",
      "trust": 25
    }
  ],
  "keyEvent": "Kade's craft carries a precinct transponder that Voss is using to track it, and two interceptors are now on its tail.",
  "actions": {
    "investigate": [
      {
        "label": "Read the proof",
        "detail": "Scan Iris's data file through the craft's systems to see what it shows and whose names are on the burn order."
      },
      {
        "label": "Identify the pilots",
        "detail": "Pull the interceptor flight records to learn who is flying them and whether either might hesitate."
      }
    ],
    "manipulate": [
      {
        "label": "Spoof the transponder",
        "detail": "Use the tapped channel to feed Voss's board a false beacon heading through the narrow tower gap."
      },
      {
        "label": "Kill the tower lights",
        "detail": "Black out the holographic billboards along the craft's route so the interceptors lose sight in the storm."
      }
    ],
    "intervene": [
      {
        "label": "Dive the narrow gap",
        "detail": "Send the craft banking hard through the tight gap between two towers where interceptors must follow single file."
      },
      {
        "label": "Jam their guns",
        "detail": "Push a fault into the interceptors' fire control so they cannot shoot without manual override."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
