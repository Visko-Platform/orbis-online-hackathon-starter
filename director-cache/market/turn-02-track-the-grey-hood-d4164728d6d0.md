# Night market: Track the grey hood

- Film: Night market (`market`)
- Branch: Intensify the storm → Track the grey hood
- Cached: 2026-11-15T23:15:26.573Z

Delete this file to have the director write this turn again.

## What happens

The surviving cameras trace the grey hood to a dead-end noodle stall, and Kade reaches her first; Iris turns, and three years collapse into one look. Voss sees the camera query and knows Kade found something.

Story purpose: Kade and Iris come face to face for the first time in three years, and Voss learns from the camera trace that Kade lied to him.

## Dialogue

- **Iris:** Three years, Kade. Did they send you to finish it?
- **Kade:** They told me you burned with the unit.
- **Voss:** You pulled my cameras onto her. Why didn't you tell me?
- **Iris:** He's listening. Decide now whose side you're on.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awning around them, and blurred neon glows through the steam. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan her drive
- investigate: Pull unit records
- manipulate: Cut the stall lights
- manipulate: Jam the earpiece
- intervene: Stall Voss's unit
- intervene: Open an escape route

## Data

```json
{
  "narration": "The surviving cameras trace the grey hood to a dead-end noodle stall, and Kade reaches her first; Iris turns, and three years collapse into one look. Voss sees the camera query and knows Kade found something.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, and Voss learns from the camera trace that Kade lied to him.",
  "whatNext": "Iris could tell Kade what Voss did to her unit, or Voss could send units to the stall before she says a word.",
  "together": "Kade and Iris stand face to face under a dripping noodle stall awning, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Did they send you to finish it?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned with the unit."
    },
    {
      "speaker": "Voss",
      "line": "You pulled my cameras onto her. Why didn't you tell me?"
    },
    {
      "speaker": "Iris",
      "line": "He's listening. Decide now whose side you're on."
    }
  ],
  "onScreen": "Kade and Iris face each other under a dripping stall awning in the heavy rain as she pulls back her hood.",
  "offScreen": "At the precinct, Voss sees Kade's camera query lock onto the stall and quietly readies a unit.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awning around them, and blurred neon glows through the steam. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dripping noodle stall awning, the man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, her hood pulled back. Heavy rain and steam surround them in blurred neon.",
  "weather": "Heavy downpour, thick steam",
  "lighting": "Night, neon blurred by rain",
  "security": "Voss tracking Kade's camera query",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss's units arrive",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant cornered at a noodle stall",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 22
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 28
    }
  ],
  "keyEvent": "Kade and Iris are face to face, and Voss knows Kade lied about seeing her.",
  "actions": {
    "investigate": [
      {
        "label": "Scan her drive",
        "detail": "Probe the device Iris carries to see what proof of Voss's crimes it holds."
      },
      {
        "label": "Pull unit records",
        "detail": "Search the precinct archive for the sealed report on the night Iris's unit burned."
      }
    ],
    "manipulate": [
      {
        "label": "Cut the stall lights",
        "detail": "Black out the neon around the stall so Voss's remaining cameras lose the pair."
      },
      {
        "label": "Jam the earpiece",
        "detail": "Fill Kade's earpiece with static so Voss cannot hear what Iris says."
      }
    ],
    "intervene": [
      {
        "label": "Stall Voss's unit",
        "detail": "Reroute the precinct unit Voss is readying to a false alarm across the city."
      },
      {
        "label": "Open an escape route",
        "detail": "Unlock a service gate behind the stall leading toward the harbor road."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
