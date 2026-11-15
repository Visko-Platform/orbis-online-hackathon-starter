# Night market: Grapple up a building

- Film: Night market (`market`)
- Branch: Grapple up a building
- Cached: 2026-11-15T18:33:38.862Z

Delete this file to have the director write this turn again.

## What happens

Kade fires a grapple line and rises up the wall of a tower beside the market, scanning the crowd from a ledge. From above he spots a pale-haired woman in a grey raincoat slipping between stalls, but Voss sees through the grid that Kade has her and says nothing about it yet.

Story purpose: Kade finds Iris from above, and Voss learns Kade spotted her and stayed silent on the channel.

## Dialogue

- **Voss:** You're on the Hanzo ledge. What do you see, Kade?
- **Kade:** Steam and umbrellas. Nothing yet.
- **Voss:** The grid says your pulse just jumped. Don't lie to me.
- **Kade:** Then watch the grid and let me work.

## Orbis prompts

Change: The man in the trench coat fires a grapple line up the wall beside the street and rises on it toward a ledge several floors up.

Hand-back: The man in the long brown leather trench coat crouches on a high ledge and presses two fingers to his ear, looking down at the market. A pale-haired woman in a grey hooded raincoat hurries between the steaming stalls in the street far below him. Medium shot from directly behind him at eye level.

## Next choices

- investigate: Trace Iris's route
- investigate: Check the tip source
- manipulate: Spoof Kade's vitals
- manipulate: Thicken the steam
- intervene: Drop Kade down
- intervene: Stall Iris

## Data

```json
{
  "narration": "Kade fires a grapple line and rises up the wall of a tower beside the market, scanning the crowd from a ledge. From above he spots a pale-haired woman in a grey raincoat slipping between stalls, but Voss sees through the grid that Kade has her and says nothing about it yet.",
  "storyPurpose": "Kade finds Iris from above, and Voss learns Kade spotted her and stayed silent on the channel.",
  "whatNext": "Kade could drop down to reach Iris before Voss does, or Voss could send the grid after her first.",
  "together": "Kade is alone on a ledge above the market; Voss speaks to him through his earpiece.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "You're on the Hanzo ledge. What do you see, Kade?"
    },
    {
      "speaker": "Kade",
      "line": "Steam and umbrellas. Nothing yet."
    },
    {
      "speaker": "Voss",
      "line": "The grid says your pulse just jumped. Don't lie to me."
    },
    {
      "speaker": "Kade",
      "line": "Then watch the grid and let me work."
    }
  ],
  "onScreen": "Kade rises up the building wall on a grapple line, and from the ledge Iris is seen hurrying through the crowd below.",
  "offScreen": "At the precinct, Voss flags Kade's earpiece channel for recording.",
  "transitionPrompt": "The man in the trench coat fires a grapple line up the wall beside the street and rises on it toward a ledge several floors up.",
  "holdPrompt": "The man in the long brown leather trench coat crouches on a high ledge and presses two fingers to his ear, looking down at the market. A pale-haired woman in a grey hooded raincoat hurries between the steaming stalls in the street far below him. Medium shot from directly behind him at eye level.",
  "scenePrompt": "Kade crouches on a wet ledge several floors above the night market, a grapple line hanging beside him, while far below Iris weaves between steaming neon-lit stalls. Light rain drifts through the glow.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "District grid active, channel monitored",
  "threatLevel": 2,
  "objective": "Reach Iris in the market before Voss does",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now on a ledge above the market",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 62
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant moving through the crowd",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 20
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 36
    }
  ],
  "keyEvent": "Kade spotted Iris from the ledge and hid it from Voss, who now suspects him and records his channel.",
  "actions": {
    "investigate": [
      {
        "label": "Trace Iris's route",
        "detail": "Pull market camera feeds to predict where Iris is heading through the stalls."
      },
      {
        "label": "Check the tip source",
        "detail": "Search the grid logs for who sent the tip that brought Kade to this market."
      }
    ],
    "manipulate": [
      {
        "label": "Spoof Kade's vitals",
        "detail": "Feed the grid a calm pulse reading so Voss stops suspecting Kade."
      },
      {
        "label": "Thicken the steam",
        "detail": "Overload the stall vents to fill the street with steam that hides Iris from cameras."
      }
    ],
    "intervene": [
      {
        "label": "Drop Kade down",
        "detail": "Have Kade rappel straight down into Iris's path to cut her off."
      },
      {
        "label": "Stall Iris",
        "detail": "Lock the stall shutters ahead of Iris so she is trapped where Kade can reach her."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
