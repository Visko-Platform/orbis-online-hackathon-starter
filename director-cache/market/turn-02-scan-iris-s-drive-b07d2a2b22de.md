# Night market: Scan Iris's drive

- Film: Night market (`market`)
- Branch: Bring them together → Scan Iris's drive
- Cached: 2026-11-15T23:15:58.495Z

Delete this file to have the director write this turn again.

## What happens

The director reaches through the grid and reads the drive sewn into Iris's coat: field logs showing Voss ordered her unit purged and her death faked. The scan pings the network, and Voss sees the data surface.

Story purpose: Kade learns Voss ordered the purge of Iris's unit and faked her death, and Voss learns the proof has been read.

## Dialogue

- **Iris:** That's the purge order. His signature. Eleven of us, and my grave.
- **Kade:** Voss signed it. He made me bury an empty box.
- **Voss:** Someone just opened that file on my grid. Bring me the drive, Kade.
- **Kade:** Not until you tell me why.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering amber lamp lights their faces and light rain drips off the awning around them. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Trace Voss's orders
- investigate: Check Kade's badge
- manipulate: Cut the market lights
- manipulate: Copy the drive
- intervene: Jam the earpiece
- intervene: Divert precinct units

## Data

```json
{
  "narration": "The director reaches through the grid and reads the drive sewn into Iris's coat: field logs showing Voss ordered her unit purged and her death faked. The scan pings the network, and Voss sees the data surface.",
  "storyPurpose": "Kade learns Voss ordered the purge of Iris's unit and faked her death, and Voss learns the proof has been read.",
  "whatNext": "Kade could take the drive and turn on Voss, or Voss could threaten Kade into finishing the job now.",
  "together": "Kade and Iris stand face to face beneath the flickering stall awning, his hand closed over hers around the drive.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "That's the purge order. His signature. Eleven of us, and my grave."
    },
    {
      "speaker": "Kade",
      "line": "Voss signed it. He made me bury an empty box."
    },
    {
      "speaker": "Voss",
      "line": "Someone just opened that file on my grid. Bring me the drive, Kade."
    },
    {
      "speaker": "Kade",
      "line": "Not until you tell me why."
    }
  ],
  "onScreen": "Iris holds out a small glowing drive and Kade closes his hand over hers as they argue under the flickering awning.",
  "offScreen": "At the precinct, Voss locks the market's grid node and quietly flags Kade's badge for review.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering amber lamp lights their faces and light rain drips off the awning around them. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under the dripping awning, Kade's hand closes over Iris's around a small glowing blue drive, their faces lit by stuttering amber lamplight and steam drifting past.",
  "weather": "Light rain, drifting steam",
  "lighting": "Flickering amber lamp, blue glow",
  "security": "Grid node locked by Voss",
  "threatLevel": 3,
  "objective": "Decide what to do with Iris's proof before Voss acts",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now holding proof against his commander",
      "motivation": "Shaken to learn Voss faked Iris's death and ordered her unit purged; wants Voss to answer before he decides anything",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, showing Kade her proof",
      "motivation": "Must reach the off-world transport at the harbor by dawn with the drive; testing whether Kade will side with her",
      "trust": 35
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Knows the proof has been read and wants the drive recovered and Iris silenced tonight, by Kade or without him",
      "trust": 25
    }
  ],
  "keyEvent": "Iris's drive holds Voss's signed order purging her unit and faking her death, and Voss knows it has been read.",
  "actions": {
    "investigate": [
      {
        "label": "Trace Voss's orders",
        "detail": "Search precinct records for what Voss has ordered for the market tonight."
      },
      {
        "label": "Check Kade's badge",
        "detail": "Look into the flag Voss just placed on Kade's credentials."
      }
    ],
    "manipulate": [
      {
        "label": "Cut the market lights",
        "detail": "Black out the stall lamps around them to blind the grid cameras."
      },
      {
        "label": "Copy the drive",
        "detail": "Mirror the drive's contents to a hidden server outside Voss's reach."
      }
    ],
    "intervene": [
      {
        "label": "Jam the earpiece",
        "detail": "Cut Voss's channel so Kade and Iris can speak without him listening."
      },
      {
        "label": "Divert precinct units",
        "detail": "Send any approaching units to a false alarm across the city."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
