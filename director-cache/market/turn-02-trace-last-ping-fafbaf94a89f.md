# Night market: Trace last ping

- Film: Night market (`market`)
- Branch: Open Iris's file → Trace last ping
- Cached: 2026-11-15T23:15:15.344Z

Delete this file to have the director write this turn again.

## What happens

Kade follows the ping to a noodle stall three stalls down and finds Iris waiting under the awning, hood up. She has been watching him come, and Voss hears the ping trace light up on his grid.

Story purpose: Kade and Iris come face to face for the first time in three years, and Voss learns exactly where they both are.

## Dialogue

- **Iris:** You followed the ping. Voss planted it so you'd find me.
- **Kade:** He told me you were dead, Iris.
- **Iris:** He told my whole unit we were safe. Then he burned us.
- **Voss:** You've got her, Kade. Do it now.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips off the awning around them and neon light glows on their faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Ask about proof
- investigate: Scan the earpiece
- manipulate: Blind the stall camera
- manipulate: Thicken the steam
- intervene: Cut the earpiece
- intervene: Stall the drone unit

## Data

```json
{
  "narration": "Kade follows the ping to a noodle stall three stalls down and finds Iris waiting under the awning, hood up. She has been watching him come, and Voss hears the ping trace light up on his grid.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, and Voss learns exactly where they both are.",
  "whatNext": "Iris could bolt before Kade speaks, or she could gamble on the man who once hunted beside her unit.",
  "together": "Kade and Iris stand face to face under a noodle stall awning, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "You followed the ping. Voss planted it so you'd find me."
    },
    {
      "speaker": "Kade",
      "line": "He told me you were dead, Iris."
    },
    {
      "speaker": "Iris",
      "line": "He told my whole unit we were safe. Then he burned us."
    },
    {
      "speaker": "Voss",
      "line": "You've got her, Kade. Do it now."
    }
  ],
  "onScreen": "Kade and Iris stand face to face under a stall awning in the rain, and she grabs his wrist.",
  "offScreen": "In the precinct, Voss watches the ping trace converge on the stall and orders a drone unit to stand by.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips off the awning around them and neon light glows on their faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dripping noodle stall awning, the man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, her hand on his wrist, neon and steam around them.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Grid locked on stall",
  "threatLevel": 3,
  "objective": "Hear Iris out before Voss's drones move in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his target",
      "motivation": "Wants Iris's side of the purge before deciding whether to obey Voss",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant confronting Kade at the stall",
      "motivation": "Carries proof of the purge; needs the harbor transport by dawn and is testing whether Kade will help or kill her",
      "trust": 25
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the grid",
      "motivation": "Wants Iris silenced tonight and is ready to move drones if Kade hesitates",
      "trust": 28
    }
  ],
  "keyEvent": "Kade and Iris meet face to face at the noodle stall; Iris believes Voss planted the ping to lead Kade to her.",
  "actions": {
    "investigate": [
      {
        "label": "Ask about proof",
        "detail": "Prompt Kade to ask Iris what she is carrying that Voss fears."
      },
      {
        "label": "Scan the earpiece",
        "detail": "Check whether Voss is recording everything Kade's earpiece picks up."
      }
    ],
    "manipulate": [
      {
        "label": "Blind the stall camera",
        "detail": "Loop the grid camera over the noodle stall so Voss sees an empty awning."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's steam lines to hide the pair from the street."
      }
    ],
    "intervene": [
      {
        "label": "Cut the earpiece",
        "detail": "Kill the channel so Voss can no longer hear or speak to Kade."
      },
      {
        "label": "Stall the drone unit",
        "detail": "Send Voss's standby drones a false fault code to delay their launch."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
