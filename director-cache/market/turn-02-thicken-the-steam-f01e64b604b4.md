# Night market: Thicken the steam

- Film: Night market (`market`)
- Branch: Open Iris's file → Thicken the steam
- Cached: 2026-11-15T23:15:17.989Z

Delete this file to have the director write this turn again.

## What happens

Vented heat exchangers flood the street with steam, blinding Voss's grid cameras. In the white haze, Iris steps out and grabs Kade's wrist before he can draw.

Story purpose: Kade and Iris come face to face for the first time in three years, hidden from Voss's cameras but not his suspicion.

## Dialogue

- **Voss:** My cameras just went white. Kade, talk to me.
- **Iris:** Don't answer him. You read the file, didn't you?
- **Kade:** I read it. Voss signed your unit's death.
- **Iris:** Then decide now, Kade. Arrest me, or listen.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Dense white steam drifts around them, lit soft pink and blue by the neon. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's satchel
- investigate: Trace Voss's sweep
- manipulate: Mute Kade's earpiece
- manipulate: Restore one camera
- intervene: Block the sweep team
- intervene: Send false sighting

## Data

```json
{
  "narration": "Vented heat exchangers flood the street with steam, blinding Voss's grid cameras. In the white haze, Iris steps out and grabs Kade's wrist before he can draw.",
  "storyPurpose": "Kade and Iris come face to face for the first time in three years, hidden from Voss's cameras but not his suspicion.",
  "whatNext": "Iris could trust Kade with the proof she carries, or Voss could guess why his cameras went blind and close in.",
  "together": "Kade and Iris stand face to face in the steam, her hand gripping his wrist.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "My cameras just went white. Kade, talk to me."
    },
    {
      "speaker": "Iris",
      "line": "Don't answer him. You read the file, didn't you?"
    },
    {
      "speaker": "Kade",
      "line": "I read it. Voss signed your unit's death."
    },
    {
      "speaker": "Iris",
      "line": "Then decide now, Kade. Arrest me, or listen."
    }
  ],
  "onScreen": "Thick steam fills the street as Iris grips Kade's wrist, the two of them face to face in a pink haze.",
  "offScreen": "At the precinct, Voss sees every market camera go white and orders a sweep team toward the steam vents.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Dense white steam drifts around them, lit soft pink and blue by the neon. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Dense white steam fills the night market, neon glowing through it in pink haze. The man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat stand face to face, her hand on his wrist.",
  "weather": "Light rain, dense steam",
  "lighting": "Neon diffused through steam",
  "security": "Grid cameras blinded",
  "threatLevel": 3,
  "objective": "Hear Iris out before Voss's sweep team arrives",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter on foot in the market",
      "motivation": "Face to face with Iris, out of Voss's sight; wants the truth before deciding whether to let her go",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, now confronting Kade in the steam",
      "motivation": "Carries proof of what Voss did to her unit; must reach the harbor transport by dawn and is testing whether Kade will help her",
      "trust": 30
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight; his cameras are blind and he suspects Kade is hiding something",
      "trust": 20
    }
  ],
  "keyEvent": "The steam blinded Voss's grid cameras, and Kade and Iris met face to face for the first time in three years.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's satchel",
        "detail": "Run a passive scan on what Iris carries to see the proof against Voss."
      },
      {
        "label": "Trace Voss's sweep",
        "detail": "Tap precinct dispatch to learn who Voss is sending and how soon."
      }
    ],
    "manipulate": [
      {
        "label": "Mute Kade's earpiece",
        "detail": "Cut the earpiece's audio feed so Voss can no longer hear the conversation."
      },
      {
        "label": "Restore one camera",
        "detail": "Bring a single decoy camera back online to show Voss an empty street."
      }
    ],
    "intervene": [
      {
        "label": "Block the sweep team",
        "detail": "Lock the market's service gates to slow Voss's team on their way in."
      },
      {
        "label": "Send false sighting",
        "detail": "Report Iris spotted at the far end of the market to draw Voss's units away."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
