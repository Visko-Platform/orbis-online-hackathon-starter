# Sky run: Darken the billboards

- Film: Sky run (`craft`)
- Branch: Thread the tower gap → Darken the billboards
- Cached: 2026-11-15T23:17:36.077Z

Delete this file to have the director write this turn again.

## What happens

The billboards along the next blocks go black, and the craft vanishes into the rain-dark between towers. But the two interceptors arrive anyway, hunting by heat, and in the dark Voss speaks only to Kade.

Story purpose: The blackout hides the craft but not from the interceptors, and Voss's private offer makes Iris wonder whether Kade's silence means yes.

## Dialogue

- **Voss:** Dark won't hide your engines, Kade. Hand her over, keep your badge.
- **Iris:** You're quiet. Are you weighing it?
- **Kade:** I'm weighing how close they are. Two, right on us.
- **Iris:** Then fly, and stop listening to him.

## Orbis prompts

Change: The glowing holographic billboards on the towers beside the dark flying craft flicker and go black one after another. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through shadowed towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Read the proof
- investigate: Trace interceptor orders
- manipulate: Vent tower steam
- manipulate: Call down lightning
- intervene: Jam their guns
- intervene: Dive past billboards

## Data

```json
{
  "narration": "The billboards along the next blocks go black, and the craft vanishes into the rain-dark between towers. But the two interceptors arrive anyway, hunting by heat, and in the dark Voss speaks only to Kade.",
  "storyPurpose": "The blackout hides the craft but not from the interceptors, and Voss's private offer makes Iris wonder whether Kade's silence means yes.",
  "whatNext": "Kade could break the interceptors' heat lock in the dark, or Voss's offer could split the cockpit before the first shot.",
  "together": "Two interceptors hold close behind the craft in the darkened blocks.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Dark won't hide your engines, Kade. Hand her over, keep your badge."
    },
    {
      "speaker": "Iris",
      "line": "You're quiet. Are you weighing it?"
    },
    {
      "speaker": "Kade",
      "line": "I'm weighing how close they are. Two, right on us."
    },
    {
      "speaker": "Iris",
      "line": "Then fly, and stop listening to him."
    }
  ],
  "onScreen": "The billboards around Kade's craft go dark, and two interceptors slide in close behind it in the shadow.",
  "offScreen": "At precinct control, Voss switches the interceptors from optical tracking to thermal sensors.",
  "transitionPrompt": "The glowing holographic billboards on the towers beside the dark flying craft flicker and go black one after another. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through shadowed towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The billboards on the nearest towers are dark, leaving the craft a red-lit shape in the rain. Two black interceptors with blue engine glow ride close on its tail.",
  "weather": "Heavy rain, storm building",
  "lighting": "Billboards blacked out nearby",
  "security": "Interceptors on thermal lock",
  "threatLevel": 4,
  "objective": "Shake the two interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Holding course, but Voss's private offer lingers in his silence",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof; suspects Kade's hesitation and wants him to commit",
      "trust": 38
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed; now working on Kade alone to split him from Iris",
      "trust": 28
    }
  ],
  "keyEvent": "Two interceptors are now on the craft's tail, tracking it by heat through the darkened blocks.",
  "actions": {
    "investigate": [
      {
        "label": "Read the proof",
        "detail": "Open Iris's file on the craft's display to see whose names are on the burn order."
      },
      {
        "label": "Trace interceptor orders",
        "detail": "Tap the interceptors' command channel to learn whether they're cleared to fire."
      }
    ],
    "manipulate": [
      {
        "label": "Vent tower steam",
        "detail": "Open the tower cooling vents to flood the air with hot steam and blind thermal sensors."
      },
      {
        "label": "Call down lightning",
        "detail": "Overload the storm grid so lightning strikes between the towers near the interceptors."
      }
    ],
    "intervene": [
      {
        "label": "Jam their guns",
        "detail": "Lock the interceptors' weapons systems with a precinct override before they fire."
      },
      {
        "label": "Dive past billboards",
        "detail": "Steer the craft low along the giant billboard towers where the sensor clutter is thickest."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
