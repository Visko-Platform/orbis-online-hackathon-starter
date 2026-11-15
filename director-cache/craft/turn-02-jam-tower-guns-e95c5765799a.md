# Sky run: Jam tower guns

- Film: Sky run (`craft`)
- Branch: Bring in the storm → Jam tower guns
- Cached: 2026-11-15T23:17:21.661Z

Delete this file to have the director write this turn again.

## What happens

The player scrambles the tower guns along the route, and the turrets swing blind in the storm. Voss answers by scrambling two interceptors, and they find the craft between the towers.

Story purpose: With his tower guns jammed, Voss sends interceptors instead, and Iris starts to show Kade the proof under pressure.

## Dialogue

- **Voss:** Someone's in my guns. Fine. Interceptors are up, Kade. Last chance.
- **Iris:** The proof is on my wrist. The burn order has two signatures.
- **Kade:** Whose is the second one, Iris?
- **Iris:** Lose them first. Then I'll tell you.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft through the heavy rain. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between the towers, rain and lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace the signature
- investigate: Scan interceptor pilots
- manipulate: Black out billboards
- manipulate: Jam interceptor guns
- intervene: Take the narrow gap
- intervene: Fly the billboard row

## Data

```json
{
  "narration": "The player scrambles the tower guns along the route, and the turrets swing blind in the storm. Voss answers by scrambling two interceptors, and they find the craft between the towers.",
  "storyPurpose": "With his tower guns jammed, Voss sends interceptors instead, and Iris starts to show Kade the proof under pressure.",
  "whatNext": "Kade could try to shake the interceptors in the storm, or Iris could reveal that Kade's own name is on the proof.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Someone's in my guns. Fine. Interceptors are up, Kade. Last chance."
    },
    {
      "speaker": "Iris",
      "line": "The proof is on my wrist. The burn order has two signatures."
    },
    {
      "speaker": "Kade",
      "line": "Whose is the second one, Iris?"
    },
    {
      "speaker": "Iris",
      "line": "Lose them first. Then I'll tell you."
    }
  ],
  "onScreen": "Two interceptors close in behind Kade's craft in the storm while the tower gun turrets beside it spin uselessly.",
  "offScreen": "At air control, the tower gun network reports a targeting fault along the whole route, and Voss's technicians cannot clear it in the storm.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft through the heavy rain. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between the towers, rain and lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark angular craft weaves through the storm between the towers, two black interceptors with blue engine glow close on its tail, while the jammed gun turrets on the towers swing aimlessly in the rain.",
  "weather": "Full storm, heavy lightning",
  "lighting": "Lightning flashes, blue engine glow",
  "security": "Tower guns jammed",
  "threatLevel": 3,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Committed to running, but needs to know whose second signature is on the burn order",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Reach the harbor transport by dawn; holding back the second signature until Kade proves himself",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; now suspects someone inside the city systems is helping Kade",
      "trust": 22
    }
  ],
  "keyEvent": "The tower guns along the route are jammed, Voss has launched two interceptors, and the burn order on Iris's proof bears a second signature.",
  "actions": {
    "investigate": [
      {
        "label": "Trace the signature",
        "detail": "Pull the burn order's archive record to reveal who signed it alongside Voss."
      },
      {
        "label": "Scan interceptor pilots",
        "detail": "Read the interceptors' flight IDs to learn who Voss sent and their rules of engagement."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the route so the craft vanishes into darkness between lightning strikes."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Scramble the interceptors' weapon lock so they cannot open fire on the craft."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Route the craft through a tight gap between two towers where the interceptors must follow single file."
      },
      {
        "label": "Fly the billboard row",
        "detail": "Send the craft low past the giant holographic billboards to hide its heat signature in their glare."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
