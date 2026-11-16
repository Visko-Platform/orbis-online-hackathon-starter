# Night market: Thicken the steam

- Film: Night market (`market`)
- Branch: Bring them together → Thicken the steam
- Cached: 2026-11-15T23:16:12.462Z

Delete this file to have the director write this turn again.

## What happens

The stall steam lines vent at once, swallowing the street in white fog and blinding Voss's grid cameras around the pair. Hidden from the precinct, Iris tells Kade what Voss did to her unit, but the fog also hides whatever Voss is sending into the market.

Story purpose: Under cover of fog Iris reveals Voss ordered her unit wiped and staged her death, and Voss, blinded, stops trusting Kade.

## Dialogue

- **Iris:** Voss wiped my whole unit. I was the one who walked out.
- **Kade:** Then whose body did I bury?
- **Iris:** A decoy with my face. He needed you to stop looking.
- **Voss:** My cameras just went white, Kade. You did that, didn't you?

## Orbis prompts

Change: Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.

Hand-back: The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Thick white steam swirls around them, and a soft amber glow lights their faces. Medium close-up of the two of them at eye level.

## Next choices

- investigate: Scan Iris's proof
- investigate: Trace Voss's orders
- manipulate: Feed Voss false footage
- manipulate: Kill the market lights
- intervene: Patch Voss through
- intervene: Stall the unit

## Data

```json
{
  "narration": "The stall steam lines vent at once, swallowing the street in white fog and blinding Voss's grid cameras around the pair. Hidden from the precinct, Iris tells Kade what Voss did to her unit, but the fog also hides whatever Voss is sending into the market.",
  "storyPurpose": "Under cover of fog Iris reveals Voss ordered her unit wiped and staged her death, and Voss, blinded, stops trusting Kade.",
  "whatNext": "Kade could take the proof Iris carries and believe her, or answer Voss and buy time with a lie.",
  "together": "Kade and Iris stand close face to face inside thick white steam under the stall awning, her hand on his arm.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Voss wiped my whole unit. I was the one who walked out."
    },
    {
      "speaker": "Kade",
      "line": "Then whose body did I bury?"
    },
    {
      "speaker": "Iris",
      "line": "A decoy with my face. He needed you to stop looking."
    },
    {
      "speaker": "Voss",
      "line": "My cameras just went white, Kade. You did that, didn't you?"
    }
  ],
  "onScreen": "Thick white steam rolls around Kade and Iris under the awning as she grips his arm and tells him the truth.",
  "offScreen": "At the precinct, Voss loses every camera feed in the market and quietly orders a unit to the fogged sector.",
  "transitionPrompt": "Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat standing face to face, close together, as they talk.",
  "holdPrompt": "The man in the long brown leather trench coat and the pale-haired woman in a grey hooded raincoat stand face to face, close together, talking. Thick white steam swirls around them, and a soft amber glow lights their faces. Medium close-up of the two of them at eye level.",
  "scenePrompt": "Dense white steam fills the market street, hiding the stalls; under a dripping awning the man in the trench coat and the pale-haired woman stand close in a diffuse amber glow.",
  "weather": "Light rain, thick steam fog",
  "lighting": "Diffuse amber glow in fog",
  "security": "Cameras blinded by steam",
  "threatLevel": 3,
  "objective": "Decide whether to trust Iris before Voss's unit arrives",
  "characters": [
    {
      "name": "Kade",
      "look": "a man in a long brown leather trench coat",
      "role": "Replicant hunter, now hearing Iris's side",
      "motivation": "Wants the truth about the staged death, torn between orders and his former partner",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "a pale-haired woman in a grey hooded raincoat",
      "role": "Fugitive replicant, revealing what Voss did",
      "motivation": "Reach the harbor transport by dawn with her proof, and win Kade over or escape him",
      "trust": 35
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, voice in Kade's earpiece, now blind on the grid",
      "motivation": "Silence Iris tonight; increasingly suspects Kade and his hidden helper",
      "trust": 25
    }
  ],
  "keyEvent": "Iris reveals Voss wiped her unit and staged her death with a decoy; Voss knows Kade is hiding something.",
  "actions": {
    "investigate": [
      {
        "label": "Scan Iris's proof",
        "detail": "Read the data Iris carries through a nearby stall terminal to see what it shows about Voss."
      },
      {
        "label": "Trace Voss's orders",
        "detail": "Pull the precinct dispatch log to learn who Voss just sent into the fog."
      }
    ],
    "manipulate": [
      {
        "label": "Feed Voss false footage",
        "detail": "Loop old empty-street footage into Voss's restored camera feeds."
      },
      {
        "label": "Kill the market lights",
        "detail": "Cut every stall lamp and sign so the fog turns to darkness."
      }
    ],
    "intervene": [
      {
        "label": "Patch Voss through",
        "detail": "Route Voss's earpiece audio to a stall speaker so Iris hears him."
      },
      {
        "label": "Stall the unit",
        "detail": "Lock the market gate shutters to delay whoever Voss is sending."
      }
    ]
  },
  "waitFor": "both a man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat, together in the same frame",
  "partnerLook": "pale-haired woman in a grey hooded raincoat"
}
```
