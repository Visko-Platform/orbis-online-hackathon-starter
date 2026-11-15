# Night market: Tap Voss's channel

- Film: Night market (`market`)
- Branch: Intensify the storm → Tap Voss's channel
- Cached: 2026-11-15T23:15:26.866Z

Delete this file to have the director write this turn again.

## What happens

On the tapped precinct channel, Voss quietly orders a retrieval team to the market with authority to retire Kade if he interferes. Kade overhears through his earpiece, then catches Iris at a fish stall, and the two finally stand face to face in the rain.

Story purpose: Kade learns Voss has authorized his own death, which pushes him to reach Iris first and meet her face to face.

## Dialogue

- **Voss:** Retrieval team to the market. If Kade interferes, retire him too.
- **Kade:** Iris. Don't run. He's coming for both of us now.
- **Iris:** Three years, Kade. Did he tell you I was dead?

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awning around them, and blurred neon light glows on their wet faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's drive
- investigate: Track retrieval team
- manipulate: Cut market power
- manipulate: Jam the earpiece
- intervene: Reroute the vans
- intervene: Leak Kade's location

## Data

```json
{
  "narration": "On the tapped precinct channel, Voss quietly orders a retrieval team to the market with authority to retire Kade if he interferes. Kade overhears through his earpiece, then catches Iris at a fish stall, and the two finally stand face to face in the rain.",
  "storyPurpose": "Kade learns Voss has authorized his own death, which pushes him to reach Iris first and meet her face to face.",
  "whatNext": "Iris could trust the man who once covered her back, or run from the hunter Voss sent to kill her.",
  "together": "Kade and Iris stand face to face under a dripping stall awning, his hand on her arm.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Retrieval team to the market. If Kade interferes, retire him too."
    },
    {
      "speaker": "Kade",
      "line": "Iris. Don't run. He's coming for both of us now."
    },
    {
      "speaker": "Iris",
      "line": "Three years, Kade. Did he tell you I was dead?"
    }
  ],
  "onScreen": "Kade catches Iris by the arm under a dripping stall awning, and they stand face to face in the downpour.",
  "offScreen": "At the precinct, an armored retrieval team loads into grey vans bound for the market, cleared to kill Kade.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Heavy rain pours off the awning around them, and blurred neon light glows on their wet faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dripping stall awning in the heavy downpour, the man in the long brown leather trench coat holds the arm of the pale-haired woman in the grey hooded raincoat as they face each other, blurred neon washing over them.",
  "weather": "Heavy downpour, thick steam",
  "lighting": "Night, neon blurred by rain",
  "security": "Grid cameras partly blinded",
  "threatLevel": 4,
  "objective": "Learn Iris's truth before Voss's retrieval team arrives",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now a target of his own precinct",
      "motivation": "Wants the truth from Iris now that Voss has ordered him retired too",
      "trust": 70
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, caught by Kade",
      "motivation": "Carries proof against Voss; must reach the harbor transport by dawn and must decide whether to trust Kade",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight and now treats Kade as expendable",
      "trust": 28
    }
  ],
  "keyEvent": "Voss has sent a retrieval team to the market with orders to retire Kade if he interferes, and Kade knows it.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's drive",
        "detail": "Read the data Iris carries to see what proof she holds against Voss."
      },
      {
        "label": "Track retrieval team",
        "detail": "Follow the grey vans on the traffic grid to learn how close they are."
      }
    ],
    "manipulate": [
      {
        "label": "Cut market power",
        "detail": "Black out the market's neon and stall lights to hide the pair from returning cameras."
      },
      {
        "label": "Jam the earpiece",
        "detail": "Flood Kade's earpiece channel with static so Voss cannot hear their conversation."
      }
    ],
    "intervene": [
      {
        "label": "Reroute the vans",
        "detail": "Divert the retrieval team's vans to the harbor with a false sighting."
      },
      {
        "label": "Leak Kade's location",
        "detail": "Feed Voss Kade's position to force Kade to decide quickly."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
