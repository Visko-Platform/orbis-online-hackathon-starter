# Sky run: Take the tower gap

- Film: Sky run (`craft`)
- Branch: Route to the harbor → Take the tower gap
- Cached: 2026-11-15T23:17:08.028Z

Delete this file to have the director write this turn again.

## What happens

Kade breaks off the green corridor through a narrow gap between two towers, throwing off Voss's prepared trap, but two interceptors catch his scent and slide in behind the craft.

Story purpose: Leaving the betrayed corridor proves Kade's choice to Iris, yet the interceptors arrive anyway and Voss turns his offer into a threat.

## Dialogue

- **Iris:** You left his corridor. Good. Maybe you meant it.
- **Voss:** Two interceptors are on you, Kade. The offer expires with your fuel.
- **Kade:** Then it expires. I'm not landing, Voss.
- **Iris:** They're right behind us. Find a way through.

## Orbis prompts

Change: The dark flying craft banks hard left through a narrow gap between two towers, rain streaming off its hull. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between the towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Scan interceptor pilots
- investigate: Open the proof
- manipulate: Unleash the storm
- manipulate: Kill billboard lights
- intervene: Jam their guns
- intervene: Dive past billboards

## Data

```json
{
  "narration": "Kade breaks off the green corridor through a narrow gap between two towers, throwing off Voss's prepared trap, but two interceptors catch his scent and slide in behind the craft.",
  "storyPurpose": "Leaving the betrayed corridor proves Kade's choice to Iris, yet the interceptors arrive anyway and Voss turns his offer into a threat.",
  "whatNext": "The interceptors could open fire in the tight gap, or Kade could use the towers to shake them before the chase truly begins.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "You left his corridor. Good. Maybe you meant it."
    },
    {
      "speaker": "Voss",
      "line": "Two interceptors are on you, Kade. The offer expires with your fuel."
    },
    {
      "speaker": "Kade",
      "line": "Then it expires. I'm not landing, Voss."
    },
    {
      "speaker": "Iris",
      "line": "They're right behind us. Find a way through."
    }
  ],
  "onScreen": "Kade's craft banks hard through a narrow gap between two towers, and two interceptors swing in close behind it.",
  "offScreen": "On the main avenue, Voss's tower guns train on an empty green corridor where the craft was meant to pass.",
  "transitionPrompt": "The dark flying craft banks hard left through a narrow gap between two towers, rain streaming off its hull. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between the towers, rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft threads a tight gap between rain-slick towers, two black interceptors with blue engine glow close on its tail. The green corridor lights fall behind.",
  "weather": "Rain, storm thickening",
  "lighting": "Holograms, tower glow",
  "security": "Interceptors in pursuit",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Has refused Voss aloud; now must outfly the interceptors to keep Iris alive",
      "trust": 67
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof against Voss; her doubt in Kade eases after he leaves the corridor",
      "trust": 44
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "His corridor trap failed; now hunts the craft directly with interceptors",
      "trust": 26
    }
  ],
  "keyEvent": "Kade abandoned the green corridor through a tower gap, refused Voss openly, and two interceptors now pursue the craft.",
  "actions": {
    "investigate": [
      {
        "label": "Scan interceptor pilots",
        "detail": "Pull the interceptors' flight records to learn who flies them and what orders Voss gave."
      },
      {
        "label": "Open the proof",
        "detail": "Decrypt Iris's proof file so Kade and Iris see exactly what it shows and whose names are on it."
      }
    ],
    "manipulate": [
      {
        "label": "Unleash the storm",
        "detail": "Push the weather grid to bring heavy rain and lightning down between the towers to blind the pursuers."
      },
      {
        "label": "Kill billboard lights",
        "detail": "Black out the holographic billboards along the craft's path to hide it from optical tracking."
      }
    ],
    "intervene": [
      {
        "label": "Jam their guns",
        "detail": "Scramble the interceptors' targeting systems so they cannot fire on the craft."
      },
      {
        "label": "Dive past billboards",
        "detail": "Send the craft low past the giant holographic billboards to lose the interceptors in the glare."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
