# Night market: Thicken the steam

- Film: Night market (`market`)
- Branch: Deploy drones → Thicken the steam
- Cached: 2026-11-15T23:15:57.446Z

Delete this file to have the director write this turn again.

## What happens

The stall boilers vent at once, and a wall of steam swallows the street, blinding the drone just as Iris bolts. Kade plunges through the white haze and catches her by the arm at the back of the noodle stall, face to face for the first time in three years.

Story purpose: The steam blinds Voss's drone and lets Kade reach Iris unseen, but it also cuts Voss off, and he grows suspicious of Kade's silence.

## Dialogue

- **Iris:** Kade. So he sent you. Are you here to finish it?
- **Kade:** They told me you burned with the unit. I mourned you.
- **Voss:** Drone's blind, Kade. Talk to me. Do you have her?
- **Iris:** Answer him, then. Tell him what you're going to do.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Thick white steam swirls around them, lit by a soft diffused pink and blue neon glow. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Trace Voss's order
- manipulate: Jam the earpiece
- manipulate: Kill market power
- intervene: Feed Voss false position
- intervene: Unlock back alley

## Data

```json
{
  "narration": "The stall boilers vent at once, and a wall of steam swallows the street, blinding the drone just as Iris bolts. Kade plunges through the white haze and catches her by the arm at the back of the noodle stall, face to face for the first time in three years.",
  "storyPurpose": "The steam blinds Voss's drone and lets Kade reach Iris unseen, but it also cuts Voss off, and he grows suspicious of Kade's silence.",
  "whatNext": "Iris could trust Kade enough to tell him what she carries, or Voss could send his units into the steam blind.",
  "together": "Kade and Iris stand face to face in thick steam behind the noodle stall, his hand on her arm.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Kade. So he sent you. Are you here to finish it?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned with the unit. I mourned you."
    },
    {
      "speaker": "Voss",
      "line": "Drone's blind, Kade. Talk to me. Do you have her?"
    },
    {
      "speaker": "Iris",
      "line": "Answer him, then. Tell him what you're going to do."
    }
  ],
  "onScreen": "Thick steam fills the street, and Kade and Iris stand face to face in the haze as he holds her arm.",
  "offScreen": "In the precinct, Voss loses the drone feed to the steam and orders ground units to the market's edges.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Thick white steam swirls around them, lit by a soft diffused pink and blue neon glow. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Dense steam from the vented boilers fills the market street, hiding the drone's searchlight in a white glow. Kade holds Iris by the arm behind the noodle stall, the two of them face to face in the haze.",
  "weather": "Light rain, thick steam",
  "lighting": "Diffused neon glow",
  "security": "Drone blinded by steam",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss's units arrive",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with Iris in the steam",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 62
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, caught by Kade in the steam",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 22
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, now blind to the scene",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 42
    }
  ],
  "keyEvent": "Kade and Iris are face to face in the steam, hidden from the drone, and Voss has lost visual contact.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Use the city grid to read what's on the device Iris carries."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Pull precinct records on who signed the order that declared Iris dead three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Jam the earpiece",
        "detail": "Scramble Kade's earpiece so Voss hears only static while they talk."
      },
      {
        "label": "Kill market power",
        "detail": "Black out the market's lights to slow the arriving ground units."
      }
    ],
    "intervene": [
      {
        "label": "Feed Voss false position",
        "detail": "Send the drone's last fix to a distant street to draw the units away."
      },
      {
        "label": "Unlock back alley",
        "detail": "Open a service gate behind the noodle stall as an escape route."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
