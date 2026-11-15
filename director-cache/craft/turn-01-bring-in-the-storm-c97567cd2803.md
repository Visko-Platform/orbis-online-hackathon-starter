# Sky run: Bring in the storm

- Film: Sky run (`craft`)
- Branch: Bring in the storm
- Cached: 2026-11-15T00:31:14.543Z

Delete this file to have the director write this turn again.

## What happens

The weather grid breaks open and a full storm drowns the towers in rain and lightning, blinding air control's optics. Voss loses a clean lock and makes his offer again, softer, and Iris hears Kade go quiet.

Story purpose: The storm hides the craft from tracking, but Voss's renewed offer of amnesty tempts Kade and Iris hears him hesitate.

## Dialogue

- **Voss:** I can't see you in this, Kade. Land, and your record stays clean.
- **Kade:** Clean. You'd wipe the market off the logs?
- **Iris:** He's offering because he's scared of what I carry. Why are you listening?
- **Kade:** I'm not landing. But you're going to show me that proof.

## Orbis prompts

Change: Heavy rain and bright forked lightning fill the sky between the towers around the dark flying craft. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and tower lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Heavy rain and forked lightning lash the towers beside it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Open the proof
- investigate: Trace Voss's channel
- manipulate: Black out billboards
- manipulate: Turn route lights green
- intervene: Take the narrow gap
- intervene: Jam tower guns

## Data

```json
{
  "narration": "The weather grid breaks open and a full storm drowns the towers in rain and lightning, blinding air control's optics. Voss loses a clean lock and makes his offer again, softer, and Iris hears Kade go quiet.",
  "storyPurpose": "The storm hides the craft from tracking, but Voss's renewed offer of amnesty tempts Kade and Iris hears him hesitate.",
  "whatNext": "Kade could answer Voss and give their position away, or Iris could reveal why she doesn't trust him with the proof.",
  "together": "The craft flies alone through the storm between the towers.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "I can't see you in this, Kade. Land, and your record stays clean."
    },
    {
      "speaker": "Kade",
      "line": "Clean. You'd wipe the market off the logs?"
    },
    {
      "speaker": "Iris",
      "line": "He's offering because he's scared of what I carry. Why are you listening?"
    },
    {
      "speaker": "Kade",
      "line": "I'm not landing. But you're going to show me that proof."
    }
  ],
  "onScreen": "Heavy rain and forked lightning break over the towers around Kade's craft as it races on alone.",
  "offScreen": "In the precinct tower, air control's optical tracking drops to radar ghosts, and Voss quietly orders two interceptors to scramble on Kade's last heading.",
  "transitionPrompt": "Heavy rain and bright forked lightning fill the sky between the towers around the dark flying craft. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and tower lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Heavy rain and forked lightning lash the towers beside it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark angular craft races through a full storm between the rain-lashed towers, forked lightning flashing off its hull and the holographic billboards flickering in the downpour.",
  "weather": "Full storm, heavy lightning",
  "lighting": "Lightning flashes, flickering holograms",
  "security": "Optical tracking blinded",
  "threatLevel": 2,
  "objective": "Reach the harbor transport beyond the pyramids",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Tempted by Voss's offer of a clean record, but demanding to see Iris's proof before he commits fully",
      "trust": 62
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Must reach the harbor transport by dawn; now wary that Kade could still trade her for amnesty",
      "trust": 34
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; would rather buy Kade back than shoot him down",
      "trust": 30
    }
  ],
  "keyEvent": "The player turned the city's weather into a full storm, blinding air control's optical tracking, and Voss offered to erase Kade's record if he lands.",
  "actions": {
    "investigate": [
      {
        "label": "Open the proof",
        "detail": "Decrypt the file Iris carries and reveal who signed the burn order beside Voss."
      },
      {
        "label": "Trace Voss's channel",
        "detail": "Track where Voss's radio call originates and what units he is quietly dispatching."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the craft's path so it vanishes into storm darkness."
      },
      {
        "label": "Turn route lights green",
        "detail": "Override tower traffic lights beside the craft to clear a fast lane down the main avenue."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Guide Kade through a tight gap between two towers to shake any pursuit on radar."
      },
      {
        "label": "Jam tower guns",
        "detail": "Scramble the targeting of the tower guns along the route before Voss can use them."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
