# Sky run: Thicken the storm

- Film: Sky run (`craft`)
- Branch: Tap Voss's channel → Thicken the storm
- Cached: 2026-11-15T23:16:40.831Z

Delete this file to have the director write this turn again.

## What happens

The weather grid floods the tower canyons with heavy rain and lightning, scrambling tracking, but a lightning flash silhouettes the craft and two interceptors lock onto it anyway. Through the tapped channel, Kade learns the storm has also grounded the harbor's transport schedule.

Story purpose: The storm hides the craft from sensors but not from eyes, two interceptors find it by sight, and Iris admits the proof names Kade too.

## Dialogue

- **Voss:** Lost them on scope. Eyes only. Follow the lightning.
- **Iris:** Kade, the proof has your signature on the burn transfer. Forged or not.
- **Kade:** You knew that in the market and still let me choose.
- **Voss:** Contact. Two on its tail. Hold fire until I say.

## Orbis prompts

Change: Heavy rain and forked lightning fill the sky between the towers around the dark flying craft. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Verify Kade's signature
- investigate: Identify interceptor pilots
- manipulate: Black out billboards
- manipulate: Turn lights green
- intervene: Jam interceptor guns
- intervene: Feed false course

## Data

```json
{
  "narration": "The weather grid floods the tower canyons with heavy rain and lightning, scrambling tracking, but a lightning flash silhouettes the craft and two interceptors lock onto it anyway. Through the tapped channel, Kade learns the storm has also grounded the harbor's transport schedule.",
  "storyPurpose": "The storm hides the craft from sensors but not from eyes, two interceptors find it by sight, and Iris admits the proof names Kade too.",
  "whatNext": "Kade could dive through a narrow gap between towers to shake the interceptors, or Voss could use Kade's name on the proof to split him from Iris.",
  "together": "Two interceptors hold close behind the craft in the storm.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "Lost them on scope. Eyes only. Follow the lightning."
    },
    {
      "speaker": "Iris",
      "line": "Kade, the proof has your signature on the burn transfer. Forged or not."
    },
    {
      "speaker": "Kade",
      "line": "You knew that in the market and still let me choose."
    },
    {
      "speaker": "Voss",
      "line": "Contact. Two on its tail. Hold fire until I say."
    }
  ],
  "onScreen": "Heavy rain and forked lightning fill the towers around Kade's craft, and two interceptors slide in close behind it.",
  "offScreen": "At the harbor, storm alerts delay the off-world transport's departure, buying time but drawing extra patrols to the docks.",
  "transitionPrompt": "Heavy rain and forked lightning fill the sky between the towers around the dark flying craft. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, rain and towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "Lightning forks between the rain-lashed towers as the dark craft races through the storm, two black interceptors with blue engine glow locked close behind it.",
  "weather": "Heavy rain, forked lightning",
  "lighting": "Lightning flashes, red warnings",
  "security": "Tracking blinded, visual pursuit",
  "threatLevel": 4,
  "objective": "Shake the two interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Shaken to learn the proof bears his signature; wants to know why Iris hid it",
      "trust": 67
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Must reach the transport with the proof; fears Kade will turn now the truth is out",
      "trust": 45
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      "motivation": "Wants the proof destroyed and everyone aboard silenced; holding fire to herd the craft",
      "trust": 25
    }
  ],
  "keyEvent": "The proof carries Kade's signature on the order transferring Iris's unit to be burned, and Iris hid this until now.",
  "actions": {
    "investigate": [
      {
        "label": "Verify Kade's signature",
        "detail": "Run the proof's signature against precinct records to learn if Voss forged Kade's name."
      },
      {
        "label": "Identify interceptor pilots",
        "detail": "Pull the pilots' files through the tapped channel to find one who might hesitate."
      }
    ],
    "manipulate": [
      {
        "label": "Black out billboards",
        "detail": "Kill the holographic billboards along the towers to plunge the craft's path into darkness."
      },
      {
        "label": "Turn lights green",
        "detail": "Clear the tower beacons through a narrow gap between two towers to guide Kade into it."
      }
    ],
    "intervene": [
      {
        "label": "Jam interceptor guns",
        "detail": "Lock the interceptors' weapon systems through the tapped channel before Voss gives the word."
      },
      {
        "label": "Feed false course",
        "detail": "Broadcast Voss's voice ordering the interceptors down the main avenue while Kade cuts low past the billboards."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
