# Sky run: Black out billboards

- Film: Sky run (`craft`)
- Branch: Tap Voss's channel → Black out billboards
- Cached: 2026-11-15T23:16:39.716Z

Delete this file to have the director write this turn again.

## What happens

The billboards along Kade's path die in a rolling wave, and the craft vanishes into darkness between the towers. But the blackout draws a dark line across the city, and Voss reads it like a map: two interceptors lock onto the craft's tail.

Story purpose: The blackout hides the craft but traces its path for Voss, and in the dark Iris tells Kade his own name is on the burn order.

## Dialogue

- **Voss:** Follow the dead screens. Whoever cut them drew us a line.
- **Iris:** Kade, the burn order has a countersign. It's yours.
- **Kade:** I never signed that. Show me when we're clear.
- **Voss:** Interceptors have him. Last chance to land, Kade.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between darkened towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, dark towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Verify the countersign
- investigate: Identify interceptor pilots
- manipulate: Unleash the storm
- manipulate: Jam their guns
- intervene: Take the narrow gap
- intervene: Feed a false course

## Data

```json
{
  "narration": "The billboards along Kade's path die in a rolling wave, and the craft vanishes into darkness between the towers. But the blackout draws a dark line across the city, and Voss reads it like a map: two interceptors lock onto the craft's tail.",
  "storyPurpose": "The blackout hides the craft but traces its path for Voss, and in the dark Iris tells Kade his own name is on the burn order.",
  "whatNext": "Kade could turn on Iris for hiding his name, or use the tapped channel to shake the interceptors now closing in.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Follow the dead screens. Whoever cut them drew us a line."
    },
    {
      "speaker": "Iris",
      "line": "Kade, the burn order has a countersign. It's yours."
    },
    {
      "speaker": "Kade",
      "line": "I never signed that. Show me when we're clear."
    },
    {
      "speaker": "Voss",
      "line": "Interceptors have him. Last chance to land, Kade."
    }
  ],
  "onScreen": "The billboards beside Kade's craft go dark, and two interceptors close in behind it through the shadowed towers.",
  "offScreen": "At air control, Voss's officers plot the trail of dead billboards and send it to the interceptor pilots.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between darkened towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, dark towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The billboards nearest the craft are black, leaving a dark band through the rain-soaked towers. Two black interceptors with blue engine glow ride close on its tail.",
  "weather": "Heavy rain, storm building",
  "lighting": "Darkened billboards, red warnings",
  "security": "Interceptors on tail, weapons free",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Shaken to learn his countersign is on the burn order; needs to know if he was used",
      "trust": 60
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof, which bears Kade's countersign; had to tell him before the end",
      "trust": 45
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and everyone aboard silenced; now has interceptors on their tail",
      "trust": 25
    }
  ],
  "keyEvent": "Iris reveals that the proof carries Kade's countersign on the burn order, which Kade denies signing, and two interceptors are now on the craft's tail.",
  "actions": {
    "investigate": [
      {
        "label": "Verify the countersign",
        "detail": "Pull the precinct's signature logs to learn whether Kade's countersign was forged."
      },
      {
        "label": "Identify interceptor pilots",
        "detail": "Read the interceptors' transponders through the tapped channel to learn who is flying them."
      }
    ],
    "manipulate": [
      {
        "label": "Unleash the storm",
        "detail": "Trigger the weather grid to break the storm open with lightning between the towers."
      },
      {
        "label": "Jam their guns",
        "detail": "Spoof the interceptors' targeting so their guns cannot lock onto the craft."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Guide Kade through a tight gap between two towers that the interceptors may not fit."
      },
      {
        "label": "Feed a false course",
        "detail": "Send Voss's pilots a fake heading over the tapped channel to split them off."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
