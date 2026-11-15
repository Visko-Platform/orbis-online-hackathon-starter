# Sky run: Arm the tower guns

- Film: Sky run (`craft`)
- Branch: Arm the tower guns
- Cached: 2026-11-15T00:31:14.419Z

Delete this file to have the director write this turn again.

## What happens

The tower defence guns go live along the craft's path and open fire, turning the city itself against Kade. Voss uses the barrage as leverage, and two interceptors scramble to close the net.

Story purpose: The guns firing on them convince Iris that Kade cannot go back, while Voss frames the fire as Kade's last chance to land.

## Dialogue

- **Voss:** Those guns are a courtesy, Kade. Land now and they go quiet.
- **Iris:** He's not bargaining. He's shooting at both of us.
- **Kade:** Then he already decided what I am. Hold on.

## Orbis prompts

Change: Bright orange tracer fire streaks past the dark flying craft from the towers on both sides. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights weaves fast between the towers, rain and lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace gun authorization
- investigate: Scan Iris's proof
- manipulate: Kill tower lights
- manipulate: Jam the guns
- intervene: Open narrow gap
- intervene: Send billboard route

## Data

```json
{
  "narration": "The tower defence guns go live along the craft's path and open fire, turning the city itself against Kade. Voss uses the barrage as leverage, and two interceptors scramble to close the net.",
  "storyPurpose": "The guns firing on them convince Iris that Kade cannot go back, while Voss frames the fire as Kade's last chance to land.",
  "whatNext": "Kade could dive into the tower gaps to escape the guns, or answer Voss and buy time while the interceptors close in.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Those guns are a courtesy, Kade. Land now and they go quiet."
    },
    {
      "speaker": "Iris",
      "line": "He's not bargaining. He's shooting at both of us."
    },
    {
      "speaker": "Kade",
      "line": "Then he already decided what I am. Hold on."
    }
  ],
  "onScreen": "Orange tracer fire from the tower guns streaks past Kade's craft, and two sleek black interceptors close in behind it.",
  "offScreen": "In precinct air control, Voss signs the order releasing two interceptors from the harbor patrol.",
  "transitionPrompt": "Bright orange tracer fire streaks past the dark flying craft from the towers on both sides. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights weaves fast between the towers, rain and lights streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft weaves between rain-soaked towers under orange tracer fire from the tower guns, two black interceptors with blue engine glow closing behind it. Holograms glow on the towers on both sides.",
  "weather": "Rain, storm clouds building",
  "lighting": "Dusk, tracer fire flashes",
  "security": "Tower guns live",
  "threatLevel": 3,
  "objective": "Survive the guns and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Voss's guns have answered whether he can go back; now he must keep Iris alive and decide whether to trust what she carries",
      "trust": 52
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Carries the proof that Voss ordered her unit burned; must reach the off-world transport at the harbor by dawn",
      "trust": 25
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and Iris silenced, and would rather have Kade back than dead",
      "trust": 45
    }
  ],
  "keyEvent": "The tower defence guns are live and firing on Kade's craft, and two interceptors are now on its tail.",
  "actions": {
    "investigate": [
      {
        "label": "Trace gun authorization",
        "detail": "Pull the command log to see who signed the order arming the tower guns."
      },
      {
        "label": "Scan Iris's proof",
        "detail": "Read the data Iris carries to see whose names are on the burn order."
      }
    ],
    "manipulate": [
      {
        "label": "Kill tower lights",
        "detail": "Black out the tower lights and billboards around the craft so the gunners lose their target."
      },
      {
        "label": "Jam the guns",
        "detail": "Flood the tower gun targeting with false signals so their fire goes wide."
      }
    ],
    "intervene": [
      {
        "label": "Open narrow gap",
        "detail": "Clear the gap between two close towers so Kade can bank through it, out of the guns' line."
      },
      {
        "label": "Send billboard route",
        "detail": "Guide the craft low past the giant holographic billboards where the glare blinds the interceptors."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
