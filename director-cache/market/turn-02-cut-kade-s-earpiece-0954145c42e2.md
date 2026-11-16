# Night market: Cut Kade's earpiece

- Film: Night market (`market`)
- Branch: Bring them together → Cut Kade's earpiece
- Cached: 2026-11-15T23:16:12.478Z

Delete this file to have the director write this turn again.

## What happens

The director jams the precinct channel and Kade's earpiece dies mid-word, leaving him and Iris truly alone for the first time in three years. Voss, suddenly deaf, reads the silence as betrayal.

Story purpose: With Voss cut off, Iris tells Kade the grave held a decommissioned copy and shows him she carries proof Voss purged her unit, while Voss starts treating Kade's silence as defection.

## Dialogue

- **Kade:** My earpiece just died. Nobody's listening now. Tell me about that grave.
- **Iris:** A copy of me. Voss retired my whole unit and buried one for you.
- **Kade:** Why would he fake your death for me?
- **Iris:** Because you'd have asked questions. It's all on this drive. Take it.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering amber stall lamp lights their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan the drive
- investigate: Trace Voss's orders
- manipulate: Black out stalls
- manipulate: Thicken the steam
- intervene: Restore Voss's channel
- intervene: Stall the vans

## Data

```json
{
  "narration": "The director jams the precinct channel and Kade's earpiece dies mid-word, leaving him and Iris truly alone for the first time in three years. Voss, suddenly deaf, reads the silence as betrayal.",
  "storyPurpose": "With Voss cut off, Iris tells Kade the grave held a decommissioned copy and shows him she carries proof Voss purged her unit, while Voss starts treating Kade's silence as defection.",
  "whatNext": "Kade could take the proof and believe her, or Voss could send units into the market to find out why his hunter went dark.",
  "together": "Kade and Iris stand face to face beneath the flickering stall awning, her hand on his wrist.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "My earpiece just died. Nobody's listening now. Tell me about that grave."
    },
    {
      "speaker": "Iris",
      "line": "A copy of me. Voss retired my whole unit and buried one for you."
    },
    {
      "speaker": "Kade",
      "line": "Why would he fake your death for me?"
    },
    {
      "speaker": "Iris",
      "line": "Because you'd have asked questions. It's all on this drive. Take it."
    }
  ],
  "onScreen": "Kade pulls the dead earpiece from his ear while Iris grips his wrist and holds up a small glowing drive between them.",
  "offScreen": "In the precinct, Voss loses Kade's channel and quietly orders two armored vans toward the market's east gate.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering amber stall lamp lights their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Beneath the dripping awning, the man in the trench coat holds a dead earpiece while the pale-haired woman offers a small glowing drive, both lit by stuttering amber lamplight in light rain and steam.",
  "weather": "Light rain, drifting steam",
  "lighting": "Flickering amber stall lamp",
  "security": "Precinct channel jammed",
  "threatLevel": 3,
  "objective": "Learn what the drive holds before Voss's units arrive",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now off Voss's channel and face to face with Iris",
      "motivation": "Wants the truth about the grave and Iris's unit before deciding whether to retire her",
      "trust": 70
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, offering Kade her proof",
      "motivation": "Must reach the off-world transport by dawn and needs Kade to believe the proof Voss purged her unit",
      "trust": 35
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, cut off from Kade's earpiece",
      "motivation": "Wants Iris silenced tonight and now suspects Kade of turning; sending units to find out",
      "trust": 25
    }
  ],
  "keyEvent": "Kade's earpiece is jammed, Voss cannot hear him, and Iris has revealed the grave held a copy and offered Kade a drive of proof.",
  "actions": {
    "investigate": [
      {
        "label": "Scan the drive",
        "detail": "Read the drive through a nearby stall terminal to reveal who signed the order to purge Iris's unit."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Tap the precinct dispatch log to learn exactly which units Voss sent and where."
      }
    ],
    "manipulate": [
      {
        "label": "Black out stalls",
        "detail": "Cut every lamp and neon sign on the street so the pair are hidden in darkness."
      },
      {
        "label": "Thicken the steam",
        "detail": "Open the market's steam vents fully to blanket the street in fog."
      }
    ],
    "intervene": [
      {
        "label": "Restore Voss's channel",
        "detail": "Reconnect the earpiece so Voss can speak to Kade and Iris can hear his lies."
      },
      {
        "label": "Stall the vans",
        "detail": "Lock the east gate's traffic barriers to hold back the incoming armored vans."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
