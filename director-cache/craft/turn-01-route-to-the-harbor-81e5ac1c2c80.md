# Sky run: Route to the harbor

- Film: Sky run (`craft`)
- Branch: Route to the harbor
- Cached: 2026-11-15T00:31:13.375Z

Delete this file to have the director write this turn again.

## What happens

Tower lights along the main avenue flip to green as a corridor opens toward the pyramids. Air control logs the override, and Voss now knows exactly where Kade is going.

Story purpose: The cleared corridor speeds the run but betrays the destination, and Voss sweetens his offer while Iris hears Kade waver.

## Dialogue

- **Voss:** A green corridor to the harbor? Someone's helping you. Land, and your record stays clean.
- **Kade:** Clean. You'd give me my badge back for her?
- **Iris:** You paused. Three hours ago you'd have taken that deal.
- **Kade:** I'm still flying, aren't I?

## Orbis prompts

Change: Rows of lights on the towers right beside the dark flying craft turn bright green one after another. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Bright green lights glow along the towers beside it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace Voss's signal
- investigate: Scan Iris's proof
- manipulate: Thicken the storm
- manipulate: Kill corridor lights
- intervene: Take the tower gap
- intervene: Jam tower guns

## Data

```json
{
  "narration": "Tower lights along the main avenue flip to green as a corridor opens toward the pyramids. Air control logs the override, and Voss now knows exactly where Kade is going.",
  "storyPurpose": "The cleared corridor speeds the run but betrays the destination, and Voss sweetens his offer while Iris hears Kade waver.",
  "whatNext": "Kade could hold the straight corridor and race the interceptors, or break off it before Voss's trap closes.",
  "together": "The craft flies alone between the towers, for now.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "A green corridor to the harbor? Someone's helping you. Land, and your record stays clean."
    },
    {
      "speaker": "Kade",
      "line": "Clean. You'd give me my badge back for her?"
    },
    {
      "speaker": "Iris",
      "line": "You paused. Three hours ago you'd have taken that deal."
    },
    {
      "speaker": "Kade",
      "line": "I'm still flying, aren't I?"
    }
  ],
  "onScreen": "Kade's craft speeds down the main avenue as the tower lights beside it turn green.",
  "offScreen": "At precinct air control, Voss traces the corridor override and orders two interceptors launched toward the pyramids.",
  "transitionPrompt": "Rows of lights on the towers right beside the dark flying craft turn bright green one after another. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Bright green lights glow along the towers beside it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races down the main avenue in the rain, the towers on either side lit in rows of green guide lights. Storm clouds thicken overhead.",
  "weather": "Rain, storm thickening",
  "lighting": "Green corridor lights, holograms",
  "security": "Corridor overridden, Voss alerted",
  "threatLevel": 3,
  "objective": "Reach the harbor transport before Voss's interceptors close in",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Running with Iris, yet Voss's offer of his old life still pulls at him",
      "trust": 64
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof against Voss; must reach the harbor by dawn, and now doubts Kade's resolve",
      "trust": 36
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; now knows their route and suspects an inside helper",
      "trust": 30
    }
  ],
  "keyEvent": "The green corridor revealed the route to the harbor, and Voss knows someone in the city systems is helping Kade.",
  "actions": {
    "investigate": [
      {
        "label": "Trace Voss's signal",
        "detail": "Track where Voss is broadcasting from and who else is on his channel."
      },
      {
        "label": "Scan Iris's proof",
        "detail": "Read the file Iris carries to see whose names are on the burn order."
      }
    ],
    "manipulate": [
      {
        "label": "Thicken the storm",
        "detail": "Push the storm cells over the avenue to blind tracking with heavy rain and lightning."
      },
      {
        "label": "Kill corridor lights",
        "detail": "Black out the green corridor so the route no longer points to the harbor."
      }
    ],
    "intervene": [
      {
        "label": "Take the tower gap",
        "detail": "Send the craft off the avenue through a narrow gap between two towers."
      },
      {
        "label": "Jam tower guns",
        "detail": "Lock the tower gun batteries along the route before they can fire."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
