# Sky run: Trace the ID use

- Film: Sky run (`craft`)
- Branch: Read the proof → Trace the ID use
- Cached: 2026-11-15T23:16:26.141Z

Delete this file to have the director write this turn again.

## What happens

The precinct logs show Kade's hunter ID was entered from Voss's own office terminal on a night Kade was on patrol across the city. The search trips an alarm, and two interceptors lock onto the craft.

Story purpose: The trace proves Voss entered Kade's ID himself, winning back some of Iris's trust, but the search gives away the craft and brings two interceptors onto its tail.

## Dialogue

- **Iris:** Voss's office terminal entered your ID. You were on patrol that night.
- **Kade:** He used my name so I'd be the one who burned them.
- **Voss:** You just lit up every log in the precinct. Interceptors are on you.
- **Iris:** Then fly, Kade. I believe you. For now.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-soaked towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Identify interceptor pilots
- investigate: Copy wiped log
- manipulate: Black out billboards
- manipulate: Intensify the storm
- intervene: Thread tower gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The precinct logs show Kade's hunter ID was entered from Voss's own office terminal on a night Kade was on patrol across the city. The search trips an alarm, and two interceptors lock onto the craft.",
  "storyPurpose": "The trace proves Voss entered Kade's ID himself, winning back some of Iris's trust, but the search gives away the craft and brings two interceptors onto its tail.",
  "whatNext": "Kade could dive for the narrow gaps between the towers to shake the interceptors, or Voss could open fire now that he knows the proof can sink him.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Voss's office terminal entered your ID. You were on patrol that night."
    },
    {
      "speaker": "Kade",
      "line": "He used my name so I'd be the one who burned them."
    },
    {
      "speaker": "Voss",
      "line": "You just lit up every log in the precinct. Interceptors are on you."
    },
    {
      "speaker": "Iris",
      "line": "Then fly, Kade. I believe you. For now."
    }
  ],
  "onScreen": "Two sleek black interceptors with blue engine glow sweep in close behind Kade's craft as it races through the rain between the towers.",
  "offScreen": "In the precinct, a records officer flags the search, and Voss orders the log entry wiped.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-soaked towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races through heavy rain between glowing towers with two black interceptors with blue engine glow close on its tail.",
  "weather": "Heavy rain, storm building",
  "lighting": "Dusk, flickering tower lights",
  "security": "Interceptors locked on craft",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor with the proof",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Now knows Voss framed him; wants Voss exposed and Iris safe",
      "trust": 63
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Must reach the transport by dawn; is starting to believe Kade again",
      "trust": 48
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Knows the frame is exposed; must stop the craft before the proof leaves the city",
      "trust": 25
    }
  ],
  "keyEvent": "Precinct logs prove Voss entered Kade's hunter ID from his own office terminal; the search alerted the precinct and two interceptors are now chasing the craft.",
  "actions": {
    "investigate": [
      {
        "label": "Identify interceptor pilots",
        "detail": "Pull the interceptors' flight records to learn who is flying them and what their orders are."
      },
      {
        "label": "Copy wiped log",
        "detail": "Recover the terminal log before Voss's deletion finishes and attach it to the proof."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the route so the craft vanishes into the dark rain."
      },
      {
        "label": "Intensify the storm",
        "detail": "Push the weather grid to drive lightning and sheets of rain between the towers to blind pursuit."
      }
    ],
    "intervene": [
      {
        "label": "Thread tower gap",
        "detail": "Guide Kade through a narrow gap between two towers that the interceptors are too wide to follow."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Spoof the interceptors' targeting so their guns cannot lock onto the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
