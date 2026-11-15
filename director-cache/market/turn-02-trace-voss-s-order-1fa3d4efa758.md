# Night market: Trace Voss's order

- Film: Night market (`market`)
- Branch: Bring them together → Trace Voss's order
- Cached: 2026-11-15T23:16:09.549Z

Delete this file to have the director write this turn again.

## What happens

The precinct archive opens: Iris's death report three years ago was signed by Voss himself, filed hours before her unit was purged. Kade's handheld lights up with the record, and Iris sees him read it.

Story purpose: Kade learns Voss personally faked Iris's death, and Iris begins to believe he did not know.

## Dialogue

- **Kade:** Voss signed your death report. Same night your unit went dark.
- **Iris:** He signed all of them. I'm the one he missed.
- **Voss:** Someone's pulling sealed records on my code, Kade. Is that you?
- **Kade:** Show me what you carry, Iris. Everything.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering amber stall lamp and the pale glow of the screen light their faces in the light rain. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Open Iris's drive
- investigate: Identify the grave
- manipulate: Spoof the trace
- manipulate: Thicken the steam
- intervene: Cut Kade's earpiece
- intervene: Stall the patrol

## Data

```json
{
  "narration": "The precinct archive opens: Iris's death report three years ago was signed by Voss himself, filed hours before her unit was purged. Kade's handheld lights up with the record, and Iris sees him read it.",
  "storyPurpose": "Kade learns Voss personally faked Iris's death, and Iris begins to believe he did not know.",
  "whatNext": "Kade could confront Voss over the earpiece and tip his hand, or stay silent and let Iris show him what she carries.",
  "together": "Kade and Iris stand face to face under the flickering stall awning, his handheld screen glowing between them.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "Voss signed your death report. Same night your unit went dark."
    },
    {
      "speaker": "Iris",
      "line": "He signed all of them. I'm the one he missed."
    },
    {
      "speaker": "Voss",
      "line": "Someone's pulling sealed records on my code, Kade. Is that you?"
    },
    {
      "speaker": "Kade",
      "line": "Show me what you carry, Iris. Everything."
    }
  ],
  "onScreen": "Kade holds up a glowing handheld screen showing the record, and Iris leans in close to read it with him under the flickering amber lamp.",
  "offScreen": "At the precinct, an alert flags the sealed file access and Voss's terminal begins tracing its source.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering amber stall lamp and the pale glow of the screen light their faces in the light rain. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under the dripping awning, the man in the trench coat and the pale-haired woman lean together over a glowing handheld screen in stuttering amber lamplight, steam drifting around them.",
  "weather": "Light rain, drifting steam",
  "lighting": "Flickering amber, screen glow",
  "security": "Archive access flagged",
  "threatLevel": 3,
  "objective": "See Iris's proof before Voss traces the archive breach",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now holding proof his commander lied",
      "motivation": "Wants the truth about the grave he mourned, and is beginning to doubt his orders",
      "trust": 70
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, face to face with Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the harbor transport by dawn and is testing whether Kade will help",
      "trust": 35
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight and now suspects Kade is digging into the old file",
      "trust": 30
    }
  ],
  "keyEvent": "Precinct records show Voss personally signed Iris's false death report, and Voss knows someone accessed it.",
  "actions": {
    "investigate": [
      {
        "label": "Open Iris's drive",
        "detail": "Decrypt the drive Iris carries to see exactly what proof she holds against Voss."
      },
      {
        "label": "Identify the grave",
        "detail": "Search burial records to learn whose body lies in Iris's grave."
      }
    ],
    "manipulate": [
      {
        "label": "Spoof the trace",
        "detail": "Reroute the archive access trail to a terminal across the city to throw Voss off."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's heating lines to fill the stalls with dense steam around them."
      }
    ],
    "intervene": [
      {
        "label": "Cut Kade's earpiece",
        "detail": "Kill the earpiece channel so Voss can no longer hear Kade and Iris talk."
      },
      {
        "label": "Stall the patrol",
        "detail": "Send the nearest patrol drones on a false call to the far side of the district."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
