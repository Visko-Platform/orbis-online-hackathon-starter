# Sky run: Jam tower guns

- Film: Sky run (`craft`)
- Branch: Read the proof → Jam tower guns
- Cached: 2026-11-15T23:16:26.611Z

Delete this file to have the director write this turn again.

## What happens

The tower guns along the route spin blind as their targeting scrambles, but the jamming lights up the city grid and Voss answers by launching two interceptors. Kade has no time to explain the ID before they close in.

Story purpose: Jamming the guns buys the craft safety from the towers but forces Voss to send interceptors, and Iris starts to wonder whether whoever spoofed Kade's ID could spoof the jam too.

## Dialogue

- **Voss:** You blinded my guns. Fine. Interceptors are on you now, Kade.
- **Iris:** Whoever jammed those guns has deep access. Same as whoever used your ID.
- **Kade:** Then help me find them. Check the authorization log on that order.
- **Iris:** If it leads back to you, I jump at the harbor alone.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-soaked towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace ID authorization
- investigate: Scan interceptor pilots
- manipulate: Black out billboards
- manipulate: Intensify the storm
- intervene: Thread the tower gap
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The tower guns along the route spin blind as their targeting scrambles, but the jamming lights up the city grid and Voss answers by launching two interceptors. Kade has no time to explain the ID before they close in.",
  "storyPurpose": "Jamming the guns buys the craft safety from the towers but forces Voss to send interceptors, and Iris starts to wonder whether whoever spoofed Kade's ID could spoof the jam too.",
  "whatNext": "Kade could try to lose the interceptors among the towers, or Iris could use the jam's trace to find who stole his code.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "You blinded my guns. Fine. Interceptors are on you now, Kade."
    },
    {
      "speaker": "Iris",
      "line": "Whoever jammed those guns has deep access. Same as whoever used your ID."
    },
    {
      "speaker": "Kade",
      "line": "Then help me find them. Check the authorization log on that order."
    },
    {
      "speaker": "Iris",
      "line": "If it leads back to you, I jump at the harbor alone."
    }
  ],
  "onScreen": "Two sleek black interceptors drop in close behind Kade's craft as it races through the rain between the towers.",
  "offScreen": "Across the tower grid, the gun turrets swing aimlessly, and air control flags the jamming signal's source for tracing.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-soaked towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races through heavy rain among the towers, two black interceptors with blue engine glow now locked close behind it while silent gun turrets swivel blindly on the tower walls.",
  "weather": "Heavy rain, storm thickening",
  "lighting": "Dusk, flickering tower lights",
  "security": "Tower guns jammed, interceptors launched",
  "threatLevel": 4,
  "objective": "Shake the interceptors and trace who used Kade's ID",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "His own ID is on the burn order; he must prove to Iris, and himself, he never signed it",
      "trust": 62
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Must reach the transport by dawn, now unsure whether the man flying her helped burn her unit",
      "trust": 42
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and now uses Kade's name on it as leverage to bring him back",
      "trust": 24
    }
  ],
  "keyEvent": "The tower guns are jammed, and Voss has sent two interceptors after the craft.",
  "actions": {
    "investigate": [
      {
        "label": "Trace ID authorization",
        "detail": "Pull the access log behind Kade's hunter ID on the burn order to see who entered it."
      },
      {
        "label": "Scan interceptor pilots",
        "detail": "Identify who is flying the two interceptors and whose orders they follow."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the route to plunge the towers into darkness around the craft."
      },
      {
        "label": "Intensify the storm",
        "detail": "Push the weather systems to drive lightning and sheeting rain between the towers to blind the pursuers."
      }
    ],
    "intervene": [
      {
        "label": "Thread the tower gap",
        "detail": "Guide Kade through a narrow gap between two towers where the interceptors must fall back."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Scramble the interceptors' weapons before they can open fire on the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
