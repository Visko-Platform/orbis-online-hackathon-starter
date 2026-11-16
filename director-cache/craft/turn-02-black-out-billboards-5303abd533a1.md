# Sky run: Black out billboards

- Film: Sky run (`craft`)
- Branch: Bring in the storm → Black out billboards
- Cached: 2026-11-15T23:17:21.165Z

Delete this file to have the director write this turn again.

## What happens

The billboards along the craft's path die one after another, and the craft slips into storm darkness. But the blackout traces a dark line through the lit city, and Voss reads it like a map: two interceptors are on its tail.

Story purpose: The blackout hides the craft from the eye but betrays its route, bringing two interceptors onto its tail just as Iris refuses to show Kade the proof.

## Dialogue

- **Iris:** Not yet. If you see your name, you'll turn us around.
- **Kade:** My name? Iris, what's on that drive?
- **Voss:** Dark billboards make a fine arrow, Kade. Interceptors are on you.
- **Kade:** Hold on. They found the hole we cut in the light.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the dark rain-lashed towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Scan the proof
- investigate: Trace interceptor pilots
- manipulate: Flood billboards bright
- manipulate: Jam their guns
- intervene: Take the narrow gap
- intervene: Open tower guns

## Data

```json
{
  "narration": "The billboards along the craft's path die one after another, and the craft slips into storm darkness. But the blackout traces a dark line through the lit city, and Voss reads it like a map: two interceptors are on its tail.",
  "storyPurpose": "The blackout hides the craft from the eye but betrays its route, bringing two interceptors onto its tail just as Iris refuses to show Kade the proof.",
  "whatNext": "Kade could make a break through a narrow gap between towers to shake the interceptors, or Iris could finally reveal whose name is on the proof.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "Not yet. If you see your name, you'll turn us around."
    },
    {
      "speaker": "Kade",
      "line": "My name? Iris, what's on that drive?"
    },
    {
      "speaker": "Voss",
      "line": "Dark billboards make a fine arrow, Kade. Interceptors are on you."
    },
    {
      "speaker": "Kade",
      "line": "Hold on. They found the hole we cut in the light."
    }
  ],
  "onScreen": "Kade's craft rushes on through the storm past darkened billboards, with two black interceptors closing in right behind it.",
  "offScreen": "In the precinct tower, Voss's operators trace the line of dead billboards across the city grid and vector two interceptors along it.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the dark rain-lashed towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The craft races through the storm past a strip of blacked-out billboards, lightning flaring off its hull, as two black interceptors with blue engine glow lock in close behind.",
  "weather": "Full storm, heavy lightning",
  "lighting": "Darkened billboards, lightning flashes",
  "security": "Interceptors following blackout trail",
  "threatLevel": 3,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Running from Voss but shaken that his own name may be on Iris's proof",
      "trust": 58
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Reach the harbor transport by dawn; keeping the proof from Kade until she knows he won't turn back",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced; would rather buy Kade back than shoot him down",
      "trust": 30
    }
  ],
  "keyEvent": "The billboard blackout left a dark trail that let Voss send two interceptors onto the craft's tail, and Iris hinted Kade's own name is on the proof.",
  "actions": {
    "investigate": [
      {
        "label": "Scan the proof",
        "detail": "Read the data signature of Iris's drive through the craft's systems to see whose names it carries."
      },
      {
        "label": "Trace interceptor pilots",
        "detail": "Pull the interceptors' flight orders to learn whether they are cleared to fire."
      }
    ],
    "manipulate": [
      {
        "label": "Flood billboards bright",
        "detail": "Light every billboard around the craft at full blaze to dazzle the interceptor pilots."
      },
      {
        "label": "Jam their guns",
        "detail": "Overload the interceptors' targeting links so their weapons cannot lock."
      }
    ],
    "intervene": [
      {
        "label": "Take the narrow gap",
        "detail": "Steer the craft hard through a tight gap between two towers where interceptors must slow."
      },
      {
        "label": "Open tower guns",
        "detail": "Turn a tower's defense guns on the interceptors, at the risk of fire close to the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
