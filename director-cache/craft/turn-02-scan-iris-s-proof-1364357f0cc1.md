# Sky run: Scan Iris's proof

- Film: Sky run (`craft`)
- Branch: Arm the tower guns → Scan Iris's proof
- Cached: 2026-11-15T23:16:53.550Z

Delete this file to have the director write this turn again.

## What happens

The scan cracks Iris's proof open mid-flight: the burn order carries Voss's seal, and beneath it, Kade's own clearance code as the officer who signed off the target list. Kade banks hard into a narrow gap between two towers to shake the guns while the truth lands in the cockpit.

Story purpose: The proof reveals Kade's own code on the burn order, and Iris learns her rescuer helped mark her unit for death.

## Dialogue

- **Iris:** Your clearance code is on the target list, Kade. You signed us over.
- **Kade:** I signed a routine sweep. I never saw a burn order.
- **Voss:** Tell her the truth, Kade. You were always part of this.
- **Iris:** Then prove it. Get me to that harbor alive.

## Orbis prompts

Change: The dark flying craft banks hard left through a narrow gap between two towers, rain streaming off its hull. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between the towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the signature
- investigate: Identify interceptor pilots
- manipulate: Call the storm
- manipulate: Kill billboard lights
- intervene: Jam the guns
- intervene: Take the billboard run

## Data

```json
{
  "narration": "The scan cracks Iris's proof open mid-flight: the burn order carries Voss's seal, and beneath it, Kade's own clearance code as the officer who signed off the target list. Kade banks hard into a narrow gap between two towers to shake the guns while the truth lands in the cockpit.",
  "storyPurpose": "The proof reveals Kade's own code on the burn order, and Iris learns her rescuer helped mark her unit for death.",
  "whatNext": "Kade could swear he never signed it and fight to prove Voss forged his code, or Iris could stop trusting him just as the interceptors close in.",
  "together": "Two interceptors hold close behind the craft, following it into the gap.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Your clearance code is on the target list, Kade. You signed us over."
    },
    {
      "speaker": "Kade",
      "line": "I signed a routine sweep. I never saw a burn order."
    },
    {
      "speaker": "Voss",
      "line": "Tell her the truth, Kade. You were always part of this."
    },
    {
      "speaker": "Iris",
      "line": "Then prove it. Get me to that harbor alive."
    }
  ],
  "onScreen": "Kade's craft banks hard through a narrow gap between two towers, the two interceptors following close behind it.",
  "offScreen": "At precinct records, Voss's aide flags the file access and quietly copies Kade's signed sweep order to Voss's desk.",
  "transitionPrompt": "The dark flying craft banks hard left through a narrow gap between two towers, rain streaming off its hull. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between the towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft threads a narrow rain-soaked gap between two towers, the tower guns briefly blocked, two black interceptors with blue engine glow tight on its tail.",
  "weather": "Rain, storm building",
  "lighting": "Dusk, billboard glow",
  "security": "Tower guns blocked by towers",
  "threatLevel": 3,
  "objective": "Shake the interceptors and decide if Iris still trusts Kade",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "His own code is on the burn order; he must prove to Iris he was used, not complicit",
      "trust": 55
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Needs Kade to reach the harbor but now doubts the man who signed her unit's target list",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Using Kade's signature to split him from Iris and bring him back without a fight",
      "trust": 40
    }
  ],
  "keyEvent": "The proof shows Kade's clearance code signed the target list for Iris's unit, under Voss's burn order.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the signature",
        "detail": "Check the timestamp on Kade's code to see if Voss forged it after the sweep."
      },
      {
        "label": "Identify interceptor pilots",
        "detail": "Pull the pilot IDs of the two interceptors to learn who Voss sent."
      }
    ],
    "manipulate": [
      {
        "label": "Call the storm",
        "detail": "Push the storm grid to unleash heavy rain and lightning between the towers to blind the interceptors' sensors."
      },
      {
        "label": "Kill billboard lights",
        "detail": "Black out the holographic billboards along the route so the craft vanishes into shadow."
      }
    ],
    "intervene": [
      {
        "label": "Jam the guns",
        "detail": "Lock out the tower guns' targeting so they stop firing on the craft."
      },
      {
        "label": "Take the billboard run",
        "detail": "Steer the craft low past the giant holographic billboards where the glare hides it from pursuit."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
