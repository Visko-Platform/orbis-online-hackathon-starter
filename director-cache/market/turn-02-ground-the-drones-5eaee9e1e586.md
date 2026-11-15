# Night market: Ground the drones

- Film: Night market (`market`)
- Branch: Intensify the storm → Ground the drones
- Cached: 2026-11-15T23:15:29.221Z

Delete this file to have the director write this turn again.

## What happens

The director locks Voss's drones in their bays, and Kade closes the distance until Iris turns on him beneath a dripping awning. Voss, blind and grounded, realizes someone inside the grid is working against him.

Story purpose: Kade and Iris come face to face for the first time in three years, and Voss learns his drones were grounded by someone he cannot see.

## Dialogue

- **Iris:** Three years, Kade. Did they send you to finish it?
- **Kade:** They told me you burned in the Sector Nine fire.
- **Voss:** My drones won't launch. Kade, who's in my grid?
- **Iris:** Someone's helping you. Or helping me. Decide which you are.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awning around them, and blurred neon glows through thick steam on their faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's drive
- investigate: Trace Sector Nine records
- manipulate: Cut market power
- manipulate: Jam Kade's earpiece
- intervene: Delay ground unit
- intervene: Unlock Kade's craft

## Data

```json
{
  "narration": "The director locks Voss's drones in their bays, and Kade closes the distance until Iris turns on him beneath a dripping awning. Voss, blind and grounded, realizes someone inside the grid is working against him.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, and Voss learns his drones were grounded by someone he cannot see.",
  "whatNext": "Iris could trust Kade enough to tell him what Voss did, or bolt the moment Voss's ground units arrive.",
  "together": "Kade and Iris stand face to face under a dripping noodle stall awning, her hand on the pistol in her pocket.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Did they send you to finish it?"
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned in the Sector Nine fire."
    },
    {
      "speaker": "Voss",
      "line": "My drones won't launch. Kade, who's in my grid?"
    },
    {
      "speaker": "Iris",
      "line": "Someone's helping you. Or helping me. Decide which you are."
    }
  ],
  "onScreen": "Kade catches up to Iris under a stall awning and she turns to face him in the pouring rain.",
  "offScreen": "At the precinct, Voss's drones sit locked in their bays, and he orders a ground unit into the market instead.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awning around them, and blurred neon glows through thick steam on their faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a rain-sheeted noodle stall awning, Kade and Iris stand face to face, her hand on his chest, neon blurred through steam around them.",
  "weather": "Heavy downpour, thick steam",
  "lighting": "Night, neon blurred by rain",
  "security": "Drones grounded, cameras partly blind",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss's ground unit arrives",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 67
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, now face to face with Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 32
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 26
    }
  ],
  "keyEvent": "Voss's drones are grounded in their bays, and Voss knows an unseen hand is in his grid; a ground unit is coming instead.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's drive",
        "detail": "Read the data signature of what Iris carries to learn what proof she holds against Voss."
      },
      {
        "label": "Trace Sector Nine records",
        "detail": "Pull the sealed file on the fire that supposedly killed Iris three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Cut market power",
        "detail": "Black out the neon and stall lamps so the arriving ground unit cannot see the pair."
      },
      {
        "label": "Jam Kade's earpiece",
        "detail": "Fill Voss's channel with static so Kade and Iris can talk unheard."
      }
    ],
    "intervene": [
      {
        "label": "Delay ground unit",
        "detail": "Reroute traffic signals to strand Voss's armored van outside the market."
      },
      {
        "label": "Unlock Kade's craft",
        "detail": "Power up Kade's parked craft at the market edge for a fast escape."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
