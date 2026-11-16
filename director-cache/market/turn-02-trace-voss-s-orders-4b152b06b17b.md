# Night market: Trace Voss's orders

- Film: Night market (`market`)
- Branch: Disable security → Trace Voss's orders
- Cached: 2026-11-15T23:15:40.377Z

Delete this file to have the director write this turn again.

## What happens

The precinct logs show Captain Voss signed Iris's death certificate three years ago, a day before her unit was wiped. Kade reads it on his scanner just as Iris steps out of the crowd and faces him.

Story purpose: Kade learns Voss personally faked Iris's death, and Iris reaches him at last, forcing their first face-to-face exchange.

## Dialogue

- **Kade:** Voss signed your death order. A day before your unit vanished.
- **Iris:** He didn't just sign it, Kade. He ran the wipe himself.
- **Voss:** Kade, you've gone quiet. Who's with you?
- **Iris:** Tell him the truth and we're both dead before dawn.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain falls around them and neon glow shines on their wet faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's drive
- investigate: Trace archive alert
- manipulate: Cut earpiece feed
- manipulate: Thicken the steam
- intervene: Erase access record
- intervene: Send false report

## Data

```json
{
  "narration": "The precinct logs show Captain Voss signed Iris's death certificate three years ago, a day before her unit was wiped. Kade reads it on his scanner just as Iris steps out of the crowd and faces him.",
  "storyPurpose": "Kade learns Voss personally faked Iris's death, and Iris reaches him at last, forcing their first face-to-face exchange.",
  "whatNext": "Kade could confront Voss with the log over the earpiece, or hide it and hear Iris's side first.",
  "together": "Kade and Iris stand face to face between two steaming food stalls, her hand on his scanner.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "Voss signed your death order. A day before your unit vanished."
    },
    {
      "speaker": "Iris",
      "line": "He didn't just sign it, Kade. He ran the wipe himself."
    },
    {
      "speaker": "Voss",
      "line": "Kade, you've gone quiet. Who's with you?"
    },
    {
      "speaker": "Iris",
      "line": "Tell him the truth and we're both dead before dawn."
    }
  ],
  "onScreen": "Iris steps up to Kade and grips his wrist as he holds the scanner showing Voss's signed order.",
  "offScreen": "At the precinct, a flag trips on the archive: someone has opened Voss's sealed file on Iris's unit.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain falls around them and neon glow shines on their wet faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "In the rain-washed night market under dark cameras, Kade and Iris stand face to face between steaming stalls, her hand on the scanner that shows Voss's signature.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon, cameras dark",
  "security": "Grid offline, archive breach flagged",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss traces the archive breach",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter now face to face with his old partner",
      "motivation": "Ordered to retire Iris, but now holds proof Voss faked her death and wants the rest of the truth",
      "trust": 70
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant confronting Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the harbor transport by dawn and needs Kade not to report her",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, blind to the market",
      "motivation": "Wants Iris silenced tonight and senses Kade slipping away",
      "trust": 25
    }
  ],
  "keyEvent": "Kade has seen precinct logs proving Voss signed Iris's false death order and ran the wipe of her unit, and the archive access is flagged at the precinct.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's drive",
        "detail": "Query what Iris is carrying to see what proof she holds against Voss."
      },
      {
        "label": "Trace archive alert",
        "detail": "Find out who at the precinct is responding to the flagged archive access."
      }
    ],
    "manipulate": [
      {
        "label": "Cut earpiece feed",
        "detail": "Jam Kade's earpiece so Voss cannot hear the conversation."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall boilers to wrap the pair in a cloud of steam."
      }
    ],
    "intervene": [
      {
        "label": "Erase access record",
        "detail": "Delete the archive flag before Voss learns Kade read his file."
      },
      {
        "label": "Send false report",
        "detail": "Feed Voss a fake sighting of Iris at the far end of the market."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
