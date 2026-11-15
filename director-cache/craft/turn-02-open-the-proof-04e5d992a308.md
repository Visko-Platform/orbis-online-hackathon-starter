# Sky run: Open the proof

- Film: Sky run (`craft`)
- Branch: Bring in the storm → Open the proof
- Cached: 2026-11-15T23:17:09.100Z

Delete this file to have the director write this turn again.

## What happens

The player decrypts Iris's file, and the burn order carries a second signature: Kade's own clearance code, used without his knowledge. Opening it sends a data burst through the city network, and Voss's interceptors lock onto the signal despite the storm.

Story purpose: The proof reveals Kade's own code co-signed the burn order, shaking Iris's trust in him, while the decryption burst betrays their position and brings two interceptors onto their tail.

## Dialogue

- **Iris:** Second signature on the burn order. That's your clearance code, Kade.
- **Kade:** I never signed that. Voss used my code. I swear it.
- **Voss:** There you are. You lit up the whole network. Interceptors are on you.
- **Voss:** Your name's on it too, Kade. Bring her in and we both stay clean.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft through the heavy rain. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace Kade's code
- investigate: Scan the interceptors
- manipulate: Kill tower lights
- manipulate: Flood false signals
- intervene: Cut through gap
- intervene: Jam their guns

## Data

```json
{
  "narration": "The player decrypts Iris's file, and the burn order carries a second signature: Kade's own clearance code, used without his knowledge. Opening it sends a data burst through the city network, and Voss's interceptors lock onto the signal despite the storm.",
  "storyPurpose": "The proof reveals Kade's own code co-signed the burn order, shaking Iris's trust in him, while the decryption burst betrays their position and brings two interceptors onto their tail.",
  "whatNext": "Kade could prove his innocence by shaking the interceptors in the towers, or Iris could decide he was part of it all along.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Second signature on the burn order. That's your clearance code, Kade."
    },
    {
      "speaker": "Kade",
      "line": "I never signed that. Voss used my code. I swear it."
    },
    {
      "speaker": "Voss",
      "line": "There you are. You lit up the whole network. Interceptors are on you."
    },
    {
      "speaker": "Voss",
      "line": "Your name's on it too, Kade. Bring her in and we both stay clean."
    }
  ],
  "onScreen": "Two sleek black interceptors with blue engine glow swoop in close behind Kade's craft through the storm between the towers.",
  "offScreen": "At air control, the decryption burst pinpoints the craft through the storm, and Voss scrambles two interceptors from the precinct tower.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft through the heavy rain. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark angular craft races through the lightning storm between the towers, now with two sleek black interceptors with blue engine glow locked close on its tail.",
  "weather": "Full storm, heavy lightning",
  "lighting": "Lightning flashes, flickering holograms",
  "security": "Signal trace locked on",
  "threatLevel": 3,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Desperate to prove to Iris his code was stolen, and furious at Voss for framing him",
      "trust": 58
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Must reach the harbor by dawn; now doubts Kade knew nothing of the burn order",
      "trust": 42
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; uses Kade's implicated code as leverage",
      "trust": 28
    }
  ],
  "keyEvent": "The proof shows Kade's clearance code co-signed the burn order beside Voss, and the decryption burst let two interceptors lock onto the craft.",
  "actions": {
    "investigate": [
      {
        "label": "Trace Kade's code",
        "detail": "Pull the access logs to show who actually entered Kade's clearance code on the burn order."
      },
      {
        "label": "Scan the interceptors",
        "detail": "Identify the pilots and their orders, whether to force down or to shoot."
      }
    ],
    "manipulate": [
      {
        "label": "Kill tower lights",
        "detail": "Black out the billboards and tower lights around the craft so the interceptors lose sight of it in the storm."
      },
      {
        "label": "Flood false signals",
        "detail": "Broadcast decoy copies of the decryption burst across the network to scatter the interceptors' lock."
      }
    ],
    "intervene": [
      {
        "label": "Cut through gap",
        "detail": "Guide Kade sharply through the narrow gap between two towers to shake the interceptors."
      },
      {
        "label": "Jam their guns",
        "detail": "Override the interceptors' weapon systems so they cannot open fire on the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
