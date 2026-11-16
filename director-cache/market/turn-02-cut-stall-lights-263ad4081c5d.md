# Night market: Cut stall lights

- Film: Night market (`market`)
- Branch: Open Iris's file → Cut stall lights
- Cached: 2026-11-15T23:15:14.455Z

Delete this file to have the director write this turn again.

## What happens

The stall lamps on the block die at once, blinding Voss's grid cameras, and in the sudden dark a pale-haired woman steps out from under an awning and pulls Kade aside. Voss loses his picture of Kade just as Kade finds Iris.

Story purpose: Kade and Iris finally meet face to face in the blackout, and Voss loses sight of his hunter at the worst possible moment.

## Dialogue

- **Voss:** Kade, your block just went dark. Talk to me.
- **Iris:** Don't answer him. You read the file, didn't you?
- **Kade:** Iris. He told me you burned with the others.
- **Iris:** He gave the order. I have the proof. Will you kill me?

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. The stall lamps around them are dark, a faint blue glow lights their faces, and light rain drips off the awning. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's proof
- investigate: Trace Voss's reroute
- manipulate: Thicken the steam
- manipulate: Jam the earpiece
- intervene: Divert the drones
- intervene: Open a back route

## Data

```json
{
  "narration": "The stall lamps on the block die at once, blinding Voss's grid cameras, and in the sudden dark a pale-haired woman steps out from under an awning and pulls Kade aside. Voss loses his picture of Kade just as Kade finds Iris.",
  "storyPurpose": "Kade and Iris finally meet face to face in the blackout, and Voss loses sight of his hunter at the worst possible moment.",
  "whatNext": "Iris might trust Kade enough to show him what she carries, or Voss might restore the grid and see them standing together.",
  "together": "Kade and Iris stand face to face under a dark stall awning, her hand gripping his coat sleeve.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Kade, your block just went dark. Talk to me."
    },
    {
      "speaker": "Iris",
      "line": "Don't answer him. You read the file, didn't you?"
    },
    {
      "speaker": "Kade",
      "line": "Iris. He told me you burned with the others."
    },
    {
      "speaker": "Iris",
      "line": "He gave the order. I have the proof. Will you kill me?"
    }
  ],
  "onScreen": "The stall lights go dark and Iris pulls Kade close under an awning, the two of them face to face in faint blue light.",
  "offScreen": "In the precinct, Voss's grid feed for the block goes black and he orders a technician to reroute power.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. The stall lamps around them are dark, a faint blue glow lights their faces, and light rain drips off the awning. Medium close-up of the two of them at eye level.",
  "scenePrompt": "The market block is dark except for a faint blue glow; under a dripping awning, the man in the long brown leather trench coat and the pale-haired woman in the grey hooded raincoat stand face to face, her hand on his sleeve.",
  "weather": "Light rain, drifting steam",
  "lighting": "Blackout, faint blue glow",
  "security": "Grid cameras blind on block",
  "threatLevel": 3,
  "objective": "Hear Iris out before Voss restores the grid",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his target",
      "motivation": "Wants Iris's side of the story before deciding whether to bring her in or let her go",
      "trust": 70
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant who revealed herself to Kade in the dark",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport by dawn and is testing whether Kade will help her",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, blind on this block",
      "motivation": "Wants Iris silenced tonight; growing suspicious that Kade cut his own eyes on purpose",
      "trust": 20
    }
  ],
  "keyEvent": "The stall lamps on Kade's block are blacked out, blinding Voss's grid cameras, and Kade and Iris are now face to face.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's proof",
        "detail": "Run Kade's handheld scanner over what Iris carries to verify it is real."
      },
      {
        "label": "Trace Voss's reroute",
        "detail": "Tap the precinct power network to see how long until Voss restores the block's cameras."
      }
    ],
    "manipulate": [
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's steam lines so a dense fog cloaks Kade and Iris when the lights return."
      },
      {
        "label": "Jam the earpiece",
        "detail": "Scramble Kade's earpiece so Voss cannot hear what Iris says next."
      }
    ],
    "intervene": [
      {
        "label": "Divert the drones",
        "detail": "Send the precinct's patrol drones to a false sighting at the far end of the market."
      },
      {
        "label": "Open a back route",
        "detail": "Unlock a service gate behind the stalls so Kade and Iris have a way out."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
