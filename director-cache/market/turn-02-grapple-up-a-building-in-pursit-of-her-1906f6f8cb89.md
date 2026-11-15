# Night market: Grapple up. a building in pursit of her

- Film: Night market (`market`)
- Branch: Run down a side alley. → Grapple up. a building in pursit of her
- Cached: 2026-11-15T18:31:08.649Z

Delete this file to have the director write this turn again.

## What happens

Kade fires his grapple line up to a rusted walkway over the alley and lands directly in front of Iris as she flees across it. The climb lifts him back into the grid's cameras, and Voss now sees them both.

Story purpose: Kade and Iris come face to face for the first time in three years, and Voss sees it happen.

## Dialogue

- **Iris:** Three years, Kade. Did they send you to finish it?
- **Kade:** They told me you died. I want to know why.
- **Voss:** I have you both on camera. Retire her. Now.
- **Iris:** Ask him what happened to our unit first.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain falls around them and dim stall lamps glow below them. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Pull unit records
- manipulate: Kill walkway camera
- manipulate: Flood steam vents
- intervene: Jam the earpiece
- intervene: Fake a sighting

## Data

```json
{
  "narration": "Kade fires his grapple line up to a rusted walkway over the alley and lands directly in front of Iris as she flees across it. The climb lifts him back into the grid's cameras, and Voss now sees them both.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, and Voss sees it happen.",
  "whatNext": "Iris might trust Kade enough to tell him what she carries, or Voss might order Kade to fire before she can speak.",
  "together": "Kade and Iris stand face to face on a narrow rain-slick metal walkway above the alley, his hand clamped on her wrist.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Did they send you to finish it?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you died. I want to know why."
    },
    {
      "speaker": "Voss",
      "line": "I have you both on camera. Retire her. Now."
    },
    {
      "speaker": "Iris",
      "line": "Ask him what happened to our unit first."
    }
  ],
  "onScreen": "Kade and Iris stand face to face on a metal walkway, Kade gripping her wrist as they talk.",
  "offScreen": "Above the alley, a grid camera on the walkway swivels to track the pair and feeds Voss a live view.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain falls around them and dim stall lamps glow below them. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Kade and Iris stand close on a rusted metal walkway strung above the steaming alley, his hand on her wrist. Light rain falls and dim stall lamps glow below.",
  "weather": "Light rain, drifting steam",
  "lighting": "Dim lamps below walkway",
  "security": "Walkway camera tracking them",
  "threatLevel": 3,
  "objective": "Learn Iris's truth before Voss forces Kade's hand",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his former partner",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 64
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, caught by Kade on a walkway",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 24
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 30
    }
  ],
  "keyEvent": "Kade caught Iris on a walkway above the alley, back in grid camera view, and Voss has ordered him to retire her.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Scan Iris's coat for the data she carries and show Kade what it contains."
      },
      {
        "label": "Pull unit records",
        "detail": "Dig into the precinct archive for what really happened to Iris's unit three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Kill walkway camera",
        "detail": "Short out the grid camera tracking the walkway so Voss loses his live view."
      },
      {
        "label": "Flood steam vents",
        "detail": "Open the alley's steam vents to wrap the walkway in thick fog."
      }
    ],
    "intervene": [
      {
        "label": "Jam the earpiece",
        "detail": "Cut Voss's channel to Kade so he and Iris can talk without orders."
      },
      {
        "label": "Fake a sighting",
        "detail": "Plant a false Iris sighting at the harbor to pull Voss's drones away."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
