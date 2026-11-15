# Sky run: Scan Iris's proof

- Film: Sky run (`craft`)
- Branch: Route to the harbor → Scan Iris's proof
- Cached: 2026-11-15T23:17:05.486Z

Delete this file to have the director write this turn again.

## What happens

The scan of Iris's file shows Voss's seal on the burn order, and beneath it a countersignature: Kade's own field authorization code. As the truth lands in the cockpit, two interceptors drop in close behind the craft.

Story purpose: The proof reveals Kade's own code on the burn order, shattering Iris's trust just as Voss's interceptors arrive.

## Dialogue

- **Iris:** Your authorization code is on the burn order, Kade. Under his.
- **Kade:** I never signed that. He used my code, Iris.
- **Voss:** Tell her the truth, Kade. You were always part of it.
- **Iris:** Two interceptors behind us. Prove it by not slowing down.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the code entry
- investigate: Identify interceptor pilots
- manipulate: Unleash the storm
- manipulate: Kill the green lights
- intervene: Cut through tower gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The scan of Iris's file shows Voss's seal on the burn order, and beneath it a countersignature: Kade's own field authorization code. As the truth lands in the cockpit, two interceptors drop in close behind the craft.",
  "storyPurpose": "The proof reveals Kade's own code on the burn order, shattering Iris's trust just as Voss's interceptors arrive.",
  "whatNext": "Kade could swear he never signed it and fight to win Iris back, or Voss could use the code to turn them against each other.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Your authorization code is on the burn order, Kade. Under his."
    },
    {
      "speaker": "Kade",
      "line": "I never signed that. He used my code, Iris."
    },
    {
      "speaker": "Voss",
      "line": "Tell her the truth, Kade. You were always part of it."
    },
    {
      "speaker": "Iris",
      "line": "Two interceptors behind us. Prove it by not slowing down."
    }
  ],
  "onScreen": "Two sleek black interceptor craft with blue engine glow fly in close behind Kade's craft as it races between the towers.",
  "offScreen": "At precinct command, Voss wipes the access log that would show who entered Kade's code into the burn order.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft streaks through the rain between the towers, the green corridor lights still burning, now with two black interceptors glowing blue close on its tail.",
  "weather": "Rain, storm thickening",
  "lighting": "Green corridor lights, holograms",
  "security": "Interceptors in pursuit",
  "threatLevel": 4,
  "objective": "Shake the interceptors and keep Iris trusting Kade",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Must prove to Iris he never signed the burn order, while Voss's offer still pulls",
      "trust": 60
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof; now sees Kade's code on it and questions whether to trust him at all",
      "trust": 42
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; uses Kade's code to split them apart",
      "trust": 28
    }
  ],
  "keyEvent": "The proof shows Kade's authorization code countersigning Voss's burn order, which Kade says was used without his knowledge.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the code entry",
        "detail": "Search precinct logs for the terminal and time Kade's code was entered on the burn order."
      },
      {
        "label": "Identify interceptor pilots",
        "detail": "Read the transponders of the two interceptors to learn who flies them and their orders."
      }
    ],
    "manipulate": [
      {
        "label": "Unleash the storm",
        "detail": "Trigger the weather grid so heavy rain and lightning fill the gaps between the towers."
      },
      {
        "label": "Kill the green lights",
        "detail": "Shut off the corridor guide lights so the towers around the craft go dark."
      }
    ],
    "intervene": [
      {
        "label": "Cut through tower gap",
        "detail": "Guide the craft hard left into a narrow gap between two towers off the main avenue."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Scramble the interceptors' targeting systems so they cannot fire on the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
