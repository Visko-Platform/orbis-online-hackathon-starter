# Night market: Open Iris's file

- Film: Night market (`market`)
- Branch: Open Iris's file
- Cached: 2026-11-15T00:30:58.959Z

Delete this file to have the director write this turn again.

## What happens

The sealed file opens on Kade's scanner: Iris's unit was ordered decommissioned by Voss himself, and the record lists her as escaped, not dead. Voss sees the access flag on the grid.

Story purpose: Kade learns Voss signed the order that destroyed Iris's unit, and Voss learns Kade is digging.

## Dialogue

- **Kade:** Your signature's on her unit's purge order. She escaped. You knew.
- **Voss:** That file is sealed for a reason. Close it, Detective.
- **Kade:** It says she was last pinged three stalls from here.
- **Voss:** Then stop reading and go finish it.

## Orbis prompts

Change: The man in the trench coat stops in the middle of the street and raises a glowing handheld scanner to read it.

Hand-back: The man in the long brown leather trench coat stands still in the street, studying a glowing handheld scanner and pressing two fingers to his ear. Steam drifts from the food stalls along the street ahead. Medium shot from directly behind him at eye level.

## Next choices

- investigate: Trace last ping
- investigate: Check grid logs
- manipulate: Cut stall lights
- manipulate: Thicken the steam
- intervene: Jam the earpiece
- intervene: Flush the crowd

## Data

```json
{
  "narration": "The sealed file opens on Kade's scanner: Iris's unit was ordered decommissioned by Voss himself, and the record lists her as escaped, not dead. Voss sees the access flag on the grid.",
  "storyPurpose": "Kade learns Voss signed the order that destroyed Iris's unit, and Voss learns Kade is digging.",
  "whatNext": "Kade could confront Voss over the lie, or the file's last known location could lead him straight to Iris.",
  "together": "Kade is alone in the street; Voss speaks to him through his earpiece.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "Your signature's on her unit's purge order. She escaped. You knew."
    },
    {
      "speaker": "Voss",
      "line": "That file is sealed for a reason. Close it, Detective."
    },
    {
      "speaker": "Kade",
      "line": "It says she was last pinged three stalls from here."
    },
    {
      "speaker": "Voss",
      "line": "Then stop reading and go finish it."
    }
  ],
  "onScreen": "Kade stops in the street and reads a glowing handheld scanner while arguing with Voss through his earpiece.",
  "offScreen": "At the precinct, Voss flags Kade's access to the sealed file and quietly reroutes the district grid cameras onto him.",
  "transitionPrompt": "The man in the trench coat stops in the middle of the street and raises a glowing handheld scanner to read it.",
  "holdPrompt": "The man in the long brown leather trench coat stands still in the street, studying a glowing handheld scanner and pressing two fingers to his ear. Steam drifts from the food stalls along the street ahead. Medium shot from directly behind him at eye level.",
  "scenePrompt": "In the rain-slicked night market, the man in the long brown leather trench coat stands still mid-street, reading a glowing handheld scanner, steam and neon around him.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Grid cameras tracking Kade",
  "threatLevel": 3,
  "objective": "Find Iris before Voss's grid closes in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Now knows Voss ordered Iris's unit purged and lied about her death; wants to hear her side before deciding anything",
      "trust": 65
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant hiding somewhere in the crowd",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 20
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight; now suspects Kade knows too much and is watching him through the grid",
      "trust": 30
    }
  ],
  "keyEvent": "Kade read the sealed file: Voss signed the purge order for Iris's unit, and Iris escaped rather than died.",
  "actions": {
    "investigate": [
      {
        "label": "Trace last ping",
        "detail": "Follow the file's last location ping to the stall where Iris was detected."
      },
      {
        "label": "Check grid logs",
        "detail": "See which cameras Voss has turned toward Kade and the market."
      }
    ],
    "manipulate": [
      {
        "label": "Cut stall lights",
        "detail": "Black out the stall lamps on this block to hide Kade from the grid cameras."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's heat exchangers to flood the street with steam."
      }
    ],
    "intervene": [
      {
        "label": "Jam the earpiece",
        "detail": "Scramble Kade's earpiece so Voss can no longer hear or speak to him."
      },
      {
        "label": "Flush the crowd",
        "detail": "Trigger a vendor alarm so the crowd scatters and Iris is exposed."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
