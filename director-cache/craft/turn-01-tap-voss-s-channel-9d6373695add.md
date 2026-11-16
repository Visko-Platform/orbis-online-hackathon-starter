# Sky run: Tap Voss's channel

- Film: Sky run (`craft`)
- Branch: Tap Voss's channel
- Cached: 2026-11-15T00:31:14.476Z

Delete this file to have the director write this turn again.

## What happens

Tapping Voss's private channel exposes his real order: the interceptors are cleared to fire on the craft, Kade included, the moment the proof leaves the city. Iris hears it through the cockpit speaker, and Kade knows the offer to forget tonight was a lie.

Story purpose: The tapped channel proves Voss's mercy is a lie, and it pushes Kade further toward Iris.

## Dialogue

- **Voss:** Interceptors, weapons free on my word. Nobody aboard reaches the harbor.
- **Iris:** Weapons free, Kade. That includes you. He was never forgetting anything.
- **Kade:** I heard him. We're past turning around now.

## Orbis prompts

Change: Rows of red warning lights flash on along the towers right beside the dark flying craft. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Red warning lights flash along the towers beside it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the proof
- investigate: Locate the interceptors
- manipulate: Black out billboards
- manipulate: Thicken the storm
- intervene: Feed false course
- intervene: Lock tower guns

## Data

```json
{
  "narration": "Tapping Voss's private channel exposes his real order: the interceptors are cleared to fire on the craft, Kade included, the moment the proof leaves the city. Iris hears it through the cockpit speaker, and Kade knows the offer to forget tonight was a lie.",
  "storyPurpose": "The tapped channel proves Voss's mercy is a lie, and it pushes Kade further toward Iris.",
  "whatNext": "Kade could use the stolen channel to feed Voss's pilots a false course, or Voss could realize he is being heard and come at them openly.",
  "together": "The craft flies alone between the towers, with interceptors scrambling to find it.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Interceptors, weapons free on my word. Nobody aboard reaches the harbor."
    },
    {
      "speaker": "Iris",
      "line": "Weapons free, Kade. That includes you. He was never forgetting anything."
    },
    {
      "speaker": "Kade",
      "line": "I heard him. We're past turning around now."
    }
  ],
  "onScreen": "Lights on the towers right beside Kade's craft flash red as Voss's channel opens and the interceptors scramble.",
  "offScreen": "At the precinct roof, two interceptors lift off on Voss's private order to fire on sight.",
  "transitionPrompt": "Rows of red warning lights flash on along the towers right beside the dark flying craft. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Red warning lights flash along the towers beside it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races between rain-soaked towers while red warning lights pulse along the facades beside it, the city waking to a hunt. Storm clouds thicken above the towers.",
  "weather": "Rain thickening, storm building",
  "lighting": "Dusk, red warning lights",
  "security": "Interceptors scrambled, weapons free",
  "threatLevel": 3,
  "objective": "Reach the harbor before Voss's interceptors find the craft",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Now knows Voss means to kill him too; his doubts about Iris are fading",
      "trust": 65
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof that Voss ordered her unit burned; must reach the off-world transport by dawn",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and everyone aboard silenced, while pretending to offer Kade mercy",
      "trust": 30
    }
  ],
  "keyEvent": "Kade and Iris heard Voss secretly order weapons free on the craft, so his offer of mercy is known to be a lie, and the player holds an open tap on his channel.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the proof",
        "detail": "Scan the data Iris carries to see whose names are signed on the burn order."
      },
      {
        "label": "Locate the interceptors",
        "detail": "Pull air control tracking to find which towers the interceptors are coming from."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Cut the holographic billboards along the craft's path so it flies through darkness."
      },
      {
        "label": "Thicken the storm",
        "detail": "Push the weather grid to drive heavy rain and lightning between the towers to blind tracking."
      }
    ],
    "intervene": [
      {
        "label": "Feed false course",
        "detail": "Use the tapped channel to send the interceptor pilots a fake heading down the main avenue while the craft cuts through a narrow tower gap."
      },
      {
        "label": "Lock tower guns",
        "detail": "Jam the tower gun batteries along the route so they cannot fire on the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
