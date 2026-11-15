# Night market: Trace Voss's order

- Film: Night market (`market`)
- Branch: Deploy drones → Trace Voss's order
- Cached: 2026-11-15T23:15:54.830Z

Delete this file to have the director write this turn again.

## What happens

The precinct log shows Voss himself signed Iris's death report three years ago, the same night her unit was wiped. Kade reaches Iris under the drone light, and Voss hears the silence on the line.

Story purpose: Kade learns Voss forged Iris's death and reaches her face to face, while Voss realizes Kade has seen the log.

## Dialogue

- **Kade:** Voss signed your death report himself. Three years ago, the same night.
- **Iris:** He signed all of ours. I'm the only one who walked out.
- **Voss:** Who opened that log, Kade? Step away from her. Now.
- **Kade:** Not until she tells me what you did.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Bright white light falls on their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Track the units
- manipulate: Kill the searchlight
- manipulate: Jam the earpiece
- intervene: Recall the drone
- intervene: Delay the units

## Data

```json
{
  "narration": "The precinct log shows Voss himself signed Iris's death report three years ago, the same night her unit was wiped. Kade reaches Iris under the drone light, and Voss hears the silence on the line.",
  "storyPurpose": "Kade learns Voss forged Iris's death and reaches her face to face, while Voss realizes Kade has seen the log.",
  "whatNext": "Kade could demand the truth from Iris before the units arrive, or Voss could force his hand by moving the units in early.",
  "together": "Kade and Iris stand face to face at the noodle stall, close together in the drone's white light.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "Voss signed your death report himself. Three years ago, the same night."
    },
    {
      "speaker": "Iris",
      "line": "He signed all of ours. I'm the only one who walked out."
    },
    {
      "speaker": "Voss",
      "line": "Who opened that log, Kade? Step away from her. Now."
    },
    {
      "speaker": "Kade",
      "line": "Not until she tells me what you did."
    }
  ],
  "onScreen": "Kade reaches Iris at the noodle stall and they stand face to face in the drone's white searchlight as rain falls.",
  "offScreen": "At the precinct, Voss sees the log access flagged under Kade's credentials and tells the ground units to move faster.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Bright white light falls on their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.",
  "scenePrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face at the steaming noodle stall, lit by a hard white searchlight through light rain and neon glow.",
  "weather": "Light rain, drifting steam",
  "lighting": "Neon, white searchlight",
  "security": "Log access flagged",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss's units arrive",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with Iris",
      "motivation": "Knows Voss faked Iris's death; wants the whole truth before deciding whether to retire her",
      "trust": 63
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, cornered at the noodle stall",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and is testing whether Kade believes her",
      "trust": 25
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight and now suspects Kade knows he forged the report",
      "trust": 40
    }
  ],
  "keyEvent": "Kade discovered that Voss personally signed Iris's false death report, and Voss knows the log was opened.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Read what is on the proof Iris carries without taking it from her."
      },
      {
        "label": "Track the units",
        "detail": "Pull the dispatch feed to see how close Voss's ground units are and who leads them."
      }
    ],
    "manipulate": [
      {
        "label": "Kill the searchlight",
        "detail": "Cut the drone's searchlight so the pair stand in darkness and Voss loses visual."
      },
      {
        "label": "Jam the earpiece",
        "detail": "Fill Kade's earpiece channel with static so Voss cannot hear them talk."
      }
    ],
    "intervene": [
      {
        "label": "Recall the drone",
        "detail": "Order the drone back to the precinct, giving them privacy but freeing Voss to send something worse."
      },
      {
        "label": "Delay the units",
        "detail": "Reroute Voss's ground units through a false roadblock to buy the pair a few minutes."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
