# Night market: Spoof Kade's location

- Film: Night market (`market`)
- Branch: Bring them together → Spoof Kade's location
- Cached: 2026-11-15T23:16:11.610Z

Delete this file to have the director write this turn again.

## What happens

The director feeds Voss a ghost signal placing Kade three streets east, buying the pair a private moment. Iris uses it to tell Kade that Voss ordered her unit wiped, and that the grave held another replicant wearing her face.

Story purpose: Freed from Voss's ears, Iris reveals that Voss staged her death and wiped her unit, and Kade begins to believe her.

## Dialogue

- **Voss:** You're on Calder Street now? Why aren't you in the market?
- **Iris:** He can't hear us now. Voss ordered my whole unit wiped.
- **Kade:** And the body I buried?
- **Iris:** A copy wearing my face. He needed you to stop looking.

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering amber stall lamp lights their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's drive
- investigate: Trace Voss's orders
- manipulate: Thicken the steam
- manipulate: Kill the earpiece
- intervene: Divert the patrol
- intervene: Open a back route

## Data

```json
{
  "narration": "The director feeds Voss a ghost signal placing Kade three streets east, buying the pair a private moment. Iris uses it to tell Kade that Voss ordered her unit wiped, and that the grave held another replicant wearing her face.",
  "storyPurpose": "Freed from Voss's ears, Iris reveals that Voss staged her death and wiped her unit, and Kade begins to believe her.",
  "whatNext": "Kade could ask to see the proof she carries, or Voss could notice the signal is false and send units to the market.",
  "together": "Kade and Iris stand face to face beneath the flickering stall awning, her hand on his sleeve.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "You're on Calder Street now? Why aren't you in the market?"
    },
    {
      "speaker": "Iris",
      "line": "He can't hear us now. Voss ordered my whole unit wiped."
    },
    {
      "speaker": "Kade",
      "line": "And the body I buried?"
    },
    {
      "speaker": "Iris",
      "line": "A copy wearing my face. He needed you to stop looking."
    }
  ],
  "onScreen": "Kade and Iris stand close under the flickering amber awning as she grips his sleeve and tells him the truth.",
  "offScreen": "On the precinct grid, Kade's marker jumps three streets east, and Voss sends a single patrol there to check.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. A flickering amber stall lamp lights their faces through light rain and drifting steam. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Under the dripping awning, the pale-haired woman in the grey hooded raincoat grips the trench-coated man's sleeve and speaks low in stuttering amber light. Steam drifts through the rain around them.",
  "weather": "Light rain, drifting steam",
  "lighting": "Flickering amber stall lamp",
  "security": "Tracking spoofed three streets east",
  "threatLevel": 3,
  "objective": "Learn what proof Iris carries before Voss sees through the spoof",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, face to face with Iris",
      "motivation": "Ordered to retire Iris before dawn, but now suspects Voss lied about her death and wants proof",
      "trust": 70
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, confiding in Kade",
      "motivation": "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and is testing whether Kade will help her",
      "trust": 35
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      "motivation": "Wants Iris silenced tonight before her proof gets out, and is growing suspicious of Kade's false position",
      "trust": 30
    }
  ],
  "keyEvent": "Iris revealed that Voss ordered her unit wiped and buried a copy of her in her grave, while Voss tracks a false signal three streets east.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's drive",
        "detail": "Read the data Iris carries through a nearby stall terminal to verify her proof."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Dig into precinct archives for who signed the order to wipe Iris's unit."
      }
    ],
    "manipulate": [
      {
        "label": "Thicken the steam",
        "detail": "Vent the market's steam pipes to blanket the street and hide the pair from cameras."
      },
      {
        "label": "Kill the earpiece",
        "detail": "Jam Kade's earpiece so Voss loses his only direct line to Kade."
      }
    ],
    "intervene": [
      {
        "label": "Divert the patrol",
        "detail": "Reroute the patrol Voss sent east further away from the market."
      },
      {
        "label": "Open a back route",
        "detail": "Unlock a service gate behind the stalls so Kade and Iris have a way out."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
