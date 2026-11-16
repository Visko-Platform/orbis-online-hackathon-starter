# Night market: Scan Iris's bag

- Film: Night market (`market`)
- Branch: Deploy drones → Scan Iris's bag
- Cached: 2026-11-15T23:15:56.923Z

Delete this file to have the director write this turn again.

## What happens

The drone's scanner sweeps Iris's satchel and reads an encrypted drive tagged with Voss's own command codes; spooked by the beam, she bolts straight into Kade, and they end up face to face. Voss now knows exactly what she carries.

Story purpose: The scan reveals Iris carries Voss's own sealed orders to retire her unit, Kade and Iris finally meet, and Voss learns his secret is exposed.

## Dialogue

- **Voss:** That drive is stolen precinct property. Take it from her, Kade. Now.
- **Iris:** It's his signature on our retirement order. Yours was on the list too.
- **Kade:** Three years I mourned you. Show me, or I do what he says.
- **Iris:** Let go of my wrist and I'll show you everything.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A bright white beam and pink neon light their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Decrypt the drive
- investigate: Trace Kade's file
- manipulate: Kill the searchlight
- manipulate: Thicken the steam
- intervene: Cut Voss's feed
- intervene: Block the exits

## Data

```json
{
  "narration": "The drone's scanner sweeps Iris's satchel and reads an encrypted drive tagged with Voss's own command codes; spooked by the beam, she bolts straight into Kade, and they end up face to face. Voss now knows exactly what she carries.",
  "storyPurpose": "The scan reveals Iris carries Voss's own sealed orders to retire her unit, Kade and Iris finally meet, and Voss learns his secret is exposed.",
  "whatNext": "Kade could demand Iris show him the orders, or Voss could order him to take the drive before she says another word.",
  "together": "Kade and Iris stand face to face at the edge of the noodle stall, his hand closed around her wrist under the awning.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "That drive is stolen precinct property. Take it from her, Kade. Now."
    },
    {
      "speaker": "Iris",
      "line": "It's his signature on our retirement order. Yours was on the list too."
    },
    {
      "speaker": "Kade",
      "line": "Three years I mourned you. Show me, or I do what he says."
    },
    {
      "speaker": "Iris",
      "line": "Let go of my wrist and I'll show you everything."
    }
  ],
  "onScreen": "Kade catches Iris by the wrist as she tries to run, and the two of them stand face to face in the drone's white light by the noodle stall.",
  "offScreen": "At the precinct, Voss locks the scan file and quietly reroutes the ground units to the market's exits.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A bright white beam and pink neon light their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under the dripping awning of the noodle stall, the man in the long brown leather trench coat holds the wrist of the pale-haired woman in the grey hooded raincoat, both lit by the drone's white beam. Steam and light rain drift around them.",
  "weather": "Light rain, drifting steam",
  "lighting": "Neon, drone searchlight",
  "security": "Drone scan, exits being sealed",
  "threatLevel": 3,
  "objective": "Learn the truth from Iris before Voss's units close in",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with Iris",
      "motivation": "Ordered to retire Iris before dawn; now told Voss signed her unit's death and his own name is on the list, he needs proof before choosing a side",
      "trust": 60
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, caught by Kade at the noodle stall",
      "motivation": "Carries Voss's signed retirement order for her unit on an encrypted drive; must reach the off-world transport at the harbor by dawn and needs Kade to believe her",
      "trust": 12
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Now knows the scan exposed what Iris carries; wants the drive recovered and Iris silenced, and is sealing the market exits",
      "trust": 42
    }
  ],
  "keyEvent": "The drone scan revealed Iris carries an encrypted drive with Voss's signed retirement order for her unit, and Voss knows it was seen.",
  "actions": {
    "investigate": [
      {
        "label": "Decrypt the drive",
        "detail": "Use the city grid to crack the drive's encryption and display the order's contents on Kade's handheld."
      },
      {
        "label": "Trace Kade's file",
        "detail": "Search precinct records for whether Kade's own name is on Voss's retirement list."
      }
    ],
    "manipulate": [
      {
        "label": "Kill the searchlight",
        "detail": "Cut the drone's searchlight and the stall lamps so the pair can talk unseen."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's steam lines to blind the grid cameras around the noodle stall."
      }
    ],
    "intervene": [
      {
        "label": "Cut Voss's feed",
        "detail": "Jam Kade's earpiece so Voss cannot hear what Iris says next."
      },
      {
        "label": "Block the exits",
        "detail": "Lock the market's gates to delay Voss's ground units, trapping everyone inside."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
