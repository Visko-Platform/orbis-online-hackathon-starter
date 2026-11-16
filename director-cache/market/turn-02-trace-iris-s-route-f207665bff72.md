# Night market: Trace Iris's route

- Film: Night market (`market`)
- Branch: Grapple up a building → Trace Iris's route
- Cached: 2026-11-15T18:33:52.763Z

Delete this file to have the director write this turn again.

## What happens

The traced feeds show Iris cutting toward the harbor stairs, and Kade drops from the ledge to block her path at the last noodle stall. Voss sees the same trace on the grid and learns Kade lied.

Story purpose: Kade and Iris come face to face for the first time in three years, and Voss learns Kade hid her location from him.

## Dialogue

- **Iris:** Three years, Kade. Did you come to finish it?
- **Kade:** They told me you burned with the unit. I mourned you.
- **Voss:** Harbor stairs. You saw her an hour ago. Do it now.
- **Iris:** He's listening. Choose before he chooses for you.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips off the awning around them in the neon glow. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Check unit records
- manipulate: Cut market power
- manipulate: Thicken the steam
- intervene: Jam Kade's earpiece
- intervene: Reroute patrol drones

## Data

```json
{
  "narration": "The traced feeds show Iris cutting toward the harbor stairs, and Kade drops from the ledge to block her path at the last noodle stall. Voss sees the same trace on the grid and learns Kade lied.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, and Voss learns Kade hid her location from him.",
  "whatNext": "Iris could trust Kade enough to tell him what she carries, or Voss could move on them both before she speaks.",
  "together": "Kade and Iris stand face to face under a dripping noodle stall awning, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Did you come to finish it?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned with the unit. I mourned you."
    },
    {
      "speaker": "Voss",
      "line": "Harbor stairs. You saw her an hour ago. Do it now."
    },
    {
      "speaker": "Iris",
      "line": "He's listening. Choose before he chooses for you."
    }
  ],
  "onScreen": "Kade stands face to face with Iris under a noodle stall awning as she grabs his wrist.",
  "offScreen": "At the precinct, Voss overlays the traced route on the grid and flags Kade's channel as compromised.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips off the awning around them in the neon glow. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a steaming noodle stall awning near the harbor stairs, Kade and Iris stand face to face in light rain, her hand clamped on his wrist, neon spilling over them.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Grid tracking, Kade flagged",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss closes in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, face to face with Iris",
      "motivation": "Ordered to retire Iris before dawn; he was told she died and wants the truth before he pulls the trigger",
      "trust": 64
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, cornered by Kade near the harbor stairs",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport by dawn and is testing whether Kade will help or kill her",
      "trust": 24
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and now knows Kade lied to him",
      "trust": 30
    }
  ],
  "keyEvent": "Kade met Iris face to face at the harbor stairs, and Voss knows Kade concealed sighting her.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Read the data on whatever Iris is carrying to see the proof against Voss."
      },
      {
        "label": "Check unit records",
        "detail": "Pull the sealed file on the fire that supposedly killed Iris's unit three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Cut market power",
        "detail": "Black out the stall lamps and neon around the harbor stairs to blind the grid cameras."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's steam lines to shroud the pair from overhead feeds."
      }
    ],
    "intervene": [
      {
        "label": "Jam Kade's earpiece",
        "detail": "Cut Voss off from Kade's channel so he can talk to Iris unheard."
      },
      {
        "label": "Reroute patrol drones",
        "detail": "Send the district drones away from the harbor stairs toward the far end of the market."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
