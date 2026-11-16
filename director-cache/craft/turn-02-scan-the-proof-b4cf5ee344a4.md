# Sky run: Scan the proof

- Film: Sky run (`craft`)
- Branch: Thread the tower gap → Scan the proof
- Cached: 2026-11-15T23:17:33.297Z

Delete this file to have the director write this turn again.

## What happens

The craft's link reads Iris's file: Voss's burn order, countersigned by a second name, Kade's own badge number, logged as the officer who flagged her unit. Two interceptors drop in close behind the craft as the scan finishes.

Story purpose: The proof reveals Kade's badge on the burn order, shaking Iris's trust just as the interceptors arrive.

## Dialogue

- **Iris:** Your badge number is on the flag. You marked my unit, Kade.
- **Kade:** I never signed that. Someone used my code.
- **Voss:** Tell her who flagged them, Kade. Interceptors are on you now.
- **Iris:** Then prove it. Or I take the controls.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-slick towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace badge access
- investigate: Identify interceptor pilots
- manipulate: Black out billboards
- manipulate: Call down lightning
- intervene: Jam interceptor guns
- intervene: Dive past billboards

## Data

```json
{
  "narration": "The craft's link reads Iris's file: Voss's burn order, countersigned by a second name, Kade's own badge number, logged as the officer who flagged her unit. Two interceptors drop in close behind the craft as the scan finishes.",
  "storyPurpose": "The proof reveals Kade's badge on the burn order, shaking Iris's trust just as the interceptors arrive.",
  "whatNext": "Kade could swear he never flagged her unit and prove it, or Iris could start to believe Voss was right about him.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Your badge number is on the flag. You marked my unit, Kade."
    },
    {
      "speaker": "Kade",
      "line": "I never signed that. Someone used my code."
    },
    {
      "speaker": "Voss",
      "line": "Tell her who flagged them, Kade. Interceptors are on you now."
    },
    {
      "speaker": "Iris",
      "line": "Then prove it. Or I take the controls."
    }
  ],
  "onScreen": "Two sleek black interceptor craft with blue engine glow pull in close behind Kade's craft between the towers.",
  "offScreen": "At the precinct, an alert flags that Kade's badge credentials just accessed the sealed burn order file.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-slick towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races between rain-slick towers with two black interceptors glowing blue close on its tail. The storm thickens overhead as billboards blaze on both sides.",
  "weather": "Heavy rain, storm building",
  "lighting": "Dusk, billboard glow, blue engines",
  "security": "Interceptors locked on tail",
  "threatLevel": 4,
  "objective": "Shake the interceptors and convince Iris before the harbor",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Must prove to Iris his flagged badge was forged, while two interceptors close in",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Shaken to see Kade's badge on the burn order; deciding whether he betrayed her unit",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Using Kade's name on the order to split the fugitives apart",
      "trust": 26
    }
  ],
  "keyEvent": "The proof shows Kade's badge number flagged Iris's unit on Voss's burn order; Kade says it was forged.",
  "actions": {
    "investigate": [
      {
        "label": "Trace badge access",
        "detail": "Pull the precinct log to find who actually used Kade's badge code that night."
      },
      {
        "label": "Identify interceptor pilots",
        "detail": "Read the interceptors' transponders to learn who is flying them and under whose orders."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the towers to blind the interceptors' optical tracking."
      },
      {
        "label": "Call down lightning",
        "detail": "Overload the weather grid so storm lightning breaks over the towers around the chase."
      }
    ],
    "intervene": [
      {
        "label": "Jam interceptor guns",
        "detail": "Lock the interceptors' weapons systems before they can open fire on the craft."
      },
      {
        "label": "Dive past billboards",
        "detail": "Route the craft low past the giant holographic billboards to lose the interceptors in the glare."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
