# Night market: Jam Kade's earpiece

- Film: Night market (`market`)
- Branch: Disable security → Jam Kade's earpiece
- Cached: 2026-11-15T23:15:42.811Z

Delete this file to have the director write this turn again.

## What happens

The earpiece channel dissolves into static, and with Voss deaf as well as blind, Iris crosses the crowd and stops in front of Kade. For the first time in three years, they are face to face with no one listening.

Story purpose: Kade and Iris meet face to face, unheard, while Voss loses his last link to Kade and starts to treat the silence as betrayal.

## Dialogue

- **Voss:** Kade, your channel's breaking up. Answer me. Kade!
- **Iris:** He can't hear us now. That's the only reason I came.
- **Kade:** They buried an empty box, Iris. I stood at that grave.
- **Iris:** Voss buried the truth with it. I'm carrying it out tonight.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain falls past the awning around them, and pink and blue neon glows on their faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's coat
- investigate: Trace Voss's orders
- manipulate: Restore earpiece briefly
- manipulate: Thicken the steam
- intervene: Divert Voss's team
- intervene: Clear the harbor route

## Data

```json
{
  "narration": "The earpiece channel dissolves into static, and with Voss deaf as well as blind, Iris crosses the crowd and stops in front of Kade. For the first time in three years, they are face to face with no one listening.",
  "storyPurpose": "Kade and Iris meet face to face, unheard, while Voss loses his last link to Kade and starts to treat the silence as betrayal.",
  "whatNext": "Kade could demand the truth about three years ago, or Voss could decide the silence means betrayal and send units in blind.",
  "together": "Kade and Iris stand face to face beneath a dripping stall awning, close enough to touch.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Kade, your channel's breaking up. Answer me. Kade!"
    },
    {
      "speaker": "Iris",
      "line": "He can't hear us now. That's the only reason I came."
    },
    {
      "speaker": "Kade",
      "line": "They buried an empty box, Iris. I stood at that grave."
    },
    {
      "speaker": "Iris",
      "line": "Voss buried the truth with it. I'm carrying it out tonight."
    }
  ],
  "onScreen": "Iris steps out of the crowd and stops face to face with Kade under a stall awning, her hand on his arm, both lit by neon in the light rain.",
  "offScreen": "At the precinct, Voss hears only static and orders a team to stand ready at the edge of the market.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain falls past the awning around them, and pink and blue neon glows on their faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dripping stall awning in the neon-lit night market, Kade and Iris stand face to face in the light rain, her hand on his arm. The camera lights along the awnings stay dark.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon, cameras dark",
  "security": "Grid offline, earpiece jammed",
  "threatLevel": 3,
  "objective": "Learn what Iris carries before Voss acts blind",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his former partner",
      "motivation": "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant who has come to Kade while he is unheard",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, now blind and deaf to Kade",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      "trust": 22
    }
  ],
  "keyEvent": "Kade's earpiece is jammed, so Voss cannot hear Kade and Iris, and Voss has a team waiting at the market's edge.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's coat",
        "detail": "Run a passive scan on Iris to find out what proof she is carrying."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Pull the precinct logs to see who signed Iris's death record three years ago."
      }
    ],
    "manipulate": [
      {
        "label": "Restore earpiece briefly",
        "detail": "Unjam the channel for a moment so Voss overhears one thing Iris says."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the street's steam lines to hide the pair under a dense fog."
      }
    ],
    "intervene": [
      {
        "label": "Divert Voss's team",
        "detail": "Send a false alert that pulls the waiting precinct team toward the harbor."
      },
      {
        "label": "Clear the harbor route",
        "detail": "Open the service gates along the route from the market to Kade's craft."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
