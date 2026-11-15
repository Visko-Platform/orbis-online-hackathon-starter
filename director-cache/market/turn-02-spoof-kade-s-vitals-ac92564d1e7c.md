# Night market: Spoof Kade's vitals

- Film: Night market (`market`)
- Branch: Grapple up a building → Spoof Kade's vitals
- Cached: 2026-11-15T18:33:52.860Z

Delete this file to have the director write this turn again.

## What happens

The grid now reads a steady resting pulse for Kade, and Voss's suspicion eases. But the spoof leaves a blind spot on the channel, and Kade uses it to drop into the market and catch Iris by the arm.

Story purpose: Kade reaches Iris face to face under cover of a faked calm pulse, while Voss notices the feed is too perfect.

## Dialogue

- **Voss:** Pulse sixty and flat. Good. Stay that calm when you find her.
- **Iris:** Kade. They sent you. Of course they sent you.
- **Kade:** They told me you burned with the unit. Who lied, Iris?
- **Iris:** Let go of my arm, and I'll show you.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the neon glow around them. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's drive
- investigate: Trace the flag
- manipulate: Mute the earpiece
- manipulate: Thicken the steam
- intervene: Reroute patrol units
- intervene: Fake a sighting

## Data

```json
{
  "narration": "The grid now reads a steady resting pulse for Kade, and Voss's suspicion eases. But the spoof leaves a blind spot on the channel, and Kade uses it to drop into the market and catch Iris by the arm.",
  "storyPurpose": "Kade reaches Iris face to face under cover of a faked calm pulse, while Voss notices the feed is too perfect.",
  "whatNext": "Iris could run or draw on Kade before he speaks, or Voss could trace the spoofed signal back to its source.",
  "together": "Kade and Iris stand face to face beside a steaming noodle stall, his hand on her arm.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Pulse sixty and flat. Good. Stay that calm when you find her."
    },
    {
      "speaker": "Iris",
      "line": "Kade. They sent you. Of course they sent you."
    },
    {
      "speaker": "Kade",
      "line": "They told me you burned with the unit. Who lied, Iris?"
    },
    {
      "speaker": "Iris",
      "line": "Let go of my arm, and I'll show you."
    }
  ],
  "onScreen": "Kade and Iris stand close together beside a steaming stall as he grips her arm and they talk.",
  "offScreen": "At the precinct, a grid technician flags Kade's pulse feed as too steady to be real and forwards it to Voss.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drifts through the neon glow around them. Medium close-up of the two of them at eye level.",
  "scenePrompt": "In the rainy neon market, Kade holds Iris by the arm beside a steaming noodle stall, the two of them face to face and speaking low.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Vitals spoofed, feed flagged",
  "threatLevel": 3,
  "objective": "Learn what Iris knows before Voss sees through the spoof",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with Iris",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, caught by Kade in the market",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 24
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 38
    }
  ],
  "keyEvent": "Kade's vitals feed is spoofed, and the precinct has flagged it as suspiciously steady.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's drive",
        "detail": "Read whatever data Iris carries from a distance to learn what proof she holds."
      },
      {
        "label": "Trace the flag",
        "detail": "Find out who at the precinct flagged the spoofed feed and what Voss ordered next."
      }
    ],
    "manipulate": [
      {
        "label": "Mute the earpiece",
        "detail": "Cut Voss's audio so Kade and Iris can talk without him listening."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the stall heaters to wrap the pair in dense steam against the cameras."
      }
    ],
    "intervene": [
      {
        "label": "Reroute patrol units",
        "detail": "Send nearby ground units to the far end of the district, away from the pair."
      },
      {
        "label": "Fake a sighting",
        "detail": "Report Iris spotted near the harbor gates to draw Voss's attention away."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
