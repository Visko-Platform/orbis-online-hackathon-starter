# Night market: Check grid logs

- Film: Night market (`market`)
- Branch: Open Iris's file → Check grid logs
- Cached: 2026-11-15T23:15:14.677Z

Delete this file to have the director write this turn again.

## What happens

The grid logs show Voss has pulled every market camera onto Kade, and one camera three stalls ahead has been looping the same footage for an hour. Kade follows the blind spot and finds Iris hiding inside it.

Story purpose: Kade discovers Voss is surveilling him rather than Iris, and the camera blind spot leads him face to face with Iris.

## Dialogue

- **Kade:** Every camera's on me, except one that's been looping. That's yours.
- **Iris:** Hello, Kade. Did he send you to finish what he started?
- **Kade:** He sent me. I haven't decided what I'm finishing.
- **Voss:** Kade, your feed just went quiet. Report your position.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips off the awning around them, and neon glow lights their faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's proof
- investigate: Trace Voss's technician
- manipulate: Extend the loop
- manipulate: Thicken the steam
- intervene: Cut Kade's earpiece
- intervene: Feed Voss false position

## Data

```json
{
  "narration": "The grid logs show Voss has pulled every market camera onto Kade, and one camera three stalls ahead has been looping the same footage for an hour. Kade follows the blind spot and finds Iris hiding inside it.",
  "storyPurpose": "Kade discovers Voss is surveilling him rather than Iris, and the camera blind spot leads him face to face with Iris.",
  "whatNext": "Iris could trust Kade enough to show what she carries, or Voss could notice the looped camera and close the grid on both of them.",
  "together": "Kade and Iris stand face to face beneath a dripping stall awning, her hand gripping his wrist.",
  "dialogue": [
    {
      "speaker": "Kade",
      "line": "Every camera's on me, except one that's been looping. That's yours."
    },
    {
      "speaker": "Iris",
      "line": "Hello, Kade. Did he send you to finish what he started?"
    },
    {
      "speaker": "Kade",
      "line": "He sent me. I haven't decided what I'm finishing."
    },
    {
      "speaker": "Voss",
      "line": "Kade, your feed just went quiet. Report your position."
    }
  ],
  "onScreen": "Kade stands face to face with Iris under a stall awning as she grips his wrist.",
  "offScreen": "At the precinct, Voss sees Kade's camera feed freeze on a looping frame and orders a technician to trace it.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Light rain drips off the awning around them, and neon glow lights their faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under a dripping stall awning in the neon-lit night market, the man in the long brown leather trench coat stands face to face with the pale-haired woman in the grey hooded raincoat, her hand on his wrist.",
  "weather": "Light rain, drifting steam",
  "lighting": "Night, neon and stall lamps",
  "security": "Looped camera hides them",
  "threatLevel": 3,
  "objective": "Hear Iris out before Voss traces the looped camera",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now face to face with his target",
      "motivation": "Knows Voss is watching him, not Iris; wants Iris's side before Voss forces his hand",
      "trust": 70
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant hiding in a camera blind spot she created",
      "motivation": "Must reach the harbor transport by dawn with her proof; testing whether Kade will help or kill her",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece",
      "motivation": "Wants Iris silenced; now alarmed that Kade's feed has gone dark",
      "trust": 25
    }
  ],
  "keyEvent": "Iris hacked a market camera into a loop, and Kade found her inside its blind spot while Voss lost his view of him.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's proof",
        "detail": "Run Kade's scanner over what Iris carries to see what evidence she holds against Voss."
      },
      {
        "label": "Trace Voss's technician",
        "detail": "Watch the precinct network to see how close Voss is to breaking the camera loop."
      }
    ],
    "manipulate": [
      {
        "label": "Extend the loop",
        "detail": "Spread Iris's looping footage to nearby cameras so Voss stays blind a little longer."
      },
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's steam lines to hide the pair beneath the awning."
      }
    ],
    "intervene": [
      {
        "label": "Cut Kade's earpiece",
        "detail": "Kill Kade's earpiece link so Voss cannot hear the conversation."
      },
      {
        "label": "Feed Voss false position",
        "detail": "Send Voss a fake location for Kade at the far end of the market."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
