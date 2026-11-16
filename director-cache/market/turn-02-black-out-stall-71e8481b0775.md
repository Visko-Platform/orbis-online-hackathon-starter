# Night market: Black out stall

- Film: Night market (`market`)
- Branch: Bring them together → Black out stall
- Cached: 2026-11-15T23:16:11.690Z

Delete this file to have the director write this turn again.

## What happens

The director kills every lamp around the stall, and Voss's cameras go blind on the pair. In the dark, Iris tells Kade what Voss did to her unit, but the sudden blackout tells Voss exactly where to send units.

Story purpose: In the blackout Iris reveals Voss ordered her unit purged and faked her death, while Voss reads the dead zone as a confession.

## Dialogue

- **Iris:** Voss burned my unit alive and wrote me down as dead.
- **Kade:** Why would he fake your death and send me after you?
- **Iris:** Because I filmed it. And you're the one he trusts to finish it.
- **Voss:** A blind spot, Kade? Units are coming to that stall now.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. The stall lamps and neon signs around them are dark, and only a faint blue glow lights their faces in the light rain. Medium close-up of the two of them at eye level.

## Next choices

- investigate: See her proof
- investigate: Trace Voss's order
- manipulate: Flood the street
- manipulate: Spoof the grid
- intervene: Stall the vans
- intervene: Cut Voss's line

## Data

```json
{
  "narration": "The director kills every lamp around the stall, and Voss's cameras go blind on the pair. In the dark, Iris tells Kade what Voss did to her unit, but the sudden blackout tells Voss exactly where to send units.",
  "storyPurpose": "In the blackout Iris reveals Voss ordered her unit purged and faked her death, while Voss reads the dead zone as a confession.",
  "whatNext": "Kade could believe Iris and ask to see her proof, or Voss's units could reach the dark stall before he decides.",
  "together": "Kade and Iris stand face to face in the dark beneath the stall awning, her hand on his wrist.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Voss burned my unit alive and wrote me down as dead."
    },
    {
      "speaker": "Kade",
      "line": "Why would he fake your death and send me after you?"
    },
    {
      "speaker": "Iris",
      "line": "Because I filmed it. And you're the one he trusts to finish it."
    },
    {
      "speaker": "Voss",
      "line": "A blind spot, Kade? Units are coming to that stall now."
    }
  ],
  "onScreen": "The stall lamps around Kade and Iris go dark, leaving them face to face in faint blue light as she grips his wrist and talks.",
  "offScreen": "At the precinct, Voss marks the dark sector and dispatches two armored vans toward the market.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. The stall lamps and neon signs around them are dark, and only a faint blue glow lights their faces in the light rain. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dark, dripping stall awning, the man in the trench coat and the pale-haired woman stand close in a faint blue glow, her hand on his wrist. The surrounding stalls are dark, with light rain and drifting steam.",
  "weather": "Light rain, drifting steam",
  "lighting": "Blackout, faint blue glow",
  "security": "Cameras blind, units dispatched",
  "threatLevel": 4,
  "objective": "Decide whether to believe Iris before Voss's units arrive",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, face to face with Iris in the dark",
      "motivation": "Ordered to retire Iris before dawn; now hears Voss faked her death and wants proof before choosing a side",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, confiding in Kade in the blackout",
      "motivation": "Carries footage of Voss burning her unit; must reach the off-world transport at the harbor by dawn and needs Kade to believe her",
      "trust": 35
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, blinded by the blackout",
      "motivation": "Wants Iris silenced tonight before her footage gets out, and now suspects Kade is protecting her",
      "trust": 25
    }
  ],
  "keyEvent": "The stall lights are blacked out, Iris has accused Voss of burning her unit, and Voss has sent units to the dark stall.",
  "actions": {
    "investigate": [
      {
        "label": "See her proof",
        "detail": "Have Iris play the footage she carries so Kade sees what happened to her unit."
      },
      {
        "label": "Trace Voss's order",
        "detail": "Search the precinct records for who signed Iris's death certificate three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Flood the street",
        "detail": "Burst the market's steam mains to fill the street with thick fog against the approaching units."
      },
      {
        "label": "Spoof the grid",
        "detail": "Make the security grid show the pair at a stall on the far side of the market."
      }
    ],
    "intervene": [
      {
        "label": "Stall the vans",
        "detail": "Lock the traffic barriers to hold Voss's armored vans outside the market."
      },
      {
        "label": "Cut Voss's line",
        "detail": "Jam Kade's earpiece so Voss can no longer hear or command him."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
