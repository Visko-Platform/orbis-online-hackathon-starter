# Night market: Drop Kade down

- Film: Night market (`market`)
- Branch: Grapple up a building → Drop Kade down
- Cached: 2026-11-15T18:33:52.477Z

Delete this file to have the director write this turn again.

## What happens

Kade rappels off the ledge and lands in the wet street directly in Iris's path, and for the first time in three years they stand face to face. Voss hears the line whine on the open channel and knows Kade has found her.

Story purpose: Kade and Iris meet face to face for the first time since her supposed death, and Voss hears it happen.

## Dialogue

- **Iris:** Kade. They sent you. Of course they sent you.
- **Kade:** They told me you burned with the unit. I mourned you.
- **Iris:** Voss burned the unit. I'm the one who walked out.
- **Voss:** Kade, I hear her voice. Do your job. Now.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the neon glow around them. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her coat
- investigate: Trace Voss's feed
- manipulate: Cut market power
- manipulate: Thicken the steam
- intervene: Mute Kade's earpiece
- intervene: Draw drones away

## Data

```json
{
  "narration": "Kade rappels off the ledge and lands in the wet street directly in Iris's path, and for the first time in three years they stand face to face. Voss hears the line whine on the open channel and knows Kade has found her.",
  "storyPurpose": "Kade and Iris meet face to face for the first time since her supposed death, and Voss hears it happen.",
  "whatNext": "Iris could run or trust him long enough to talk, and Voss could listen quietly or send the grid down on them both.",
  "together": "Kade and Iris stand face to face in the rain between two steaming stalls, her hand gripping his coat sleeve.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Kade. They sent you. Of course they sent you."
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned with the unit. I mourned you."
    },
    {
      "speaker": "Iris",
      "line": "Voss burned the unit. I'm the one who walked out."
    },
    {
      "speaker": "Voss",
      "line": "Kade, I hear her voice. Do your job. Now."
    }
  ],
  "onScreen": "Kade and Iris stand face to face in the rain between steaming stalls as she grips his sleeve.",
  "offScreen": "At the precinct, Voss flags Kade's channel and pulls up the market's camera grid.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the neon glow around them. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Kade has dropped into the market street and stands face to face with Iris between neon-lit steaming stalls, light rain falling around them as she holds his sleeve.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Grid active, Voss watching cameras",
  "threatLevel": 3,
  "objective": "Learn Iris's truth before Voss closes in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, face to face with his former partner",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 64
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, cornered by Kade in the market",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 26
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 30
    }
  ],
  "keyEvent": "Kade and Iris are face to face in the market, and Voss heard her voice on Kade's channel.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her coat",
        "detail": "Run a covert grid scan on Iris to find what proof she is carrying."
      },
      {
        "label": "Trace Voss's feed",
        "detail": "Check which market cameras Voss is watching them through."
      }
    ],
    "manipulate": [
      {
        "label": "Cut market power",
        "detail": "Black out the neon and stall lamps around them to blind Voss's cameras."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall boilers so steam hides the pair from the grid."
      }
    ],
    "intervene": [
      {
        "label": "Mute Kade's earpiece",
        "detail": "Cut Voss off from Kade's channel so the two can talk freely."
      },
      {
        "label": "Draw drones away",
        "detail": "Send the district's drones to a false alarm across the market."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
