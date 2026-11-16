# Sky run: Lock tower guns

- Film: Sky run (`craft`)
- Branch: Thread the tower gap → Lock tower guns
- Cached: 2026-11-15T23:17:35.670Z

Delete this file to have the director write this turn again.

## What happens

The player jams the tower gun batteries along the route, and their targeting lights die one by one beside the craft. But the silence tells Voss someone inside the city's systems is helping Kade, and his two interceptors close in to do what the guns cannot.

Story purpose: Jamming the guns protects the craft but reveals an unseen ally to Voss, and Iris begins to wonder whether Kade arranged it.

## Dialogue

- **Voss:** The tower guns just went dark. Who's in my grid, Kade?
- **Iris:** Someone's helping us. Did you set this up before the market?
- **Kade:** I didn't. Whoever it is, they just bought us the avenue.
- **Voss:** Guns or no guns, my interceptors are on your tail now.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-slick towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Trace interceptor orders
- investigate: Scan Iris's proof
- manipulate: Summon the storm
- manipulate: Flood billboard light
- intervene: Route through billboards
- intervene: Jam interceptor guns

## Data

```json
{
  "narration": "The player jams the tower gun batteries along the route, and their targeting lights die one by one beside the craft. But the silence tells Voss someone inside the city's systems is helping Kade, and his two interceptors close in to do what the guns cannot.",
  "storyPurpose": "Jamming the guns protects the craft but reveals an unseen ally to Voss, and Iris begins to wonder whether Kade arranged it.",
  "whatNext": "Kade could swear he has no idea who is helping them, or Iris could decide the hidden hand is Voss's trap.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Voss",
      "line": "The tower guns just went dark. Who's in my grid, Kade?"
    },
    {
      "speaker": "Iris",
      "line": "Someone's helping us. Did you set this up before the market?"
    },
    {
      "speaker": "Kade",
      "line": "I didn't. Whoever it is, they just bought us the avenue."
    },
    {
      "speaker": "Voss",
      "line": "Guns or no guns, my interceptors are on your tail now."
    }
  ],
  "onScreen": "Two black interceptors with blue engine glow slide in close behind Kade's craft, while the gun lights on the towers beside it go dark.",
  "offScreen": "At precinct control, technicians find the gun batteries locked out by an unknown access code and report it to Voss.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft between the rain-slick towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft races between rain-slick towers whose gun turrets sit dark and silent, while two black interceptors with blue engine glow lock in close behind it.",
  "weather": "Heavy rain, storm building",
  "lighting": "Dusk, billboard glow",
  "security": "Tower guns jammed, interceptors pursuing",
  "threatLevel": 4,
  "objective": "Shake the interceptors and reach the harbor transport",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Grateful for the unseen help but uneasy that Iris now suspects him",
      "trust": 68
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Guards the proof against Voss and suspects the hidden helper may be a trap or Kade's doing",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, a voice on the radio with interceptors at his command",
      "motivation": "Wants the proof destroyed and now hunts the intruder in his grid as well as the craft",
      "trust": 25
    }
  ],
  "keyEvent": "The tower gun batteries along the route are jammed, and Voss knows an unknown ally is inside the city's systems.",
  "actions": {
    "investigate": [
      {
        "label": "Trace interceptor orders",
        "detail": "Pull the interceptors' command log to learn whether Voss authorized lethal force."
      },
      {
        "label": "Scan Iris's proof",
        "detail": "Read the data Iris carries to see whose names are on the burn order."
      }
    ],
    "manipulate": [
      {
        "label": "Summon the storm",
        "detail": "Push the weather grid to unleash heavy rain and lightning that blinds the interceptors' sensors."
      },
      {
        "label": "Flood billboard light",
        "detail": "Overload the giant holographic billboards so their glare masks the craft's heat signature."
      }
    ],
    "intervene": [
      {
        "label": "Route through billboards",
        "detail": "Turn the tower lights green along the low billboard corridor to guide Kade through it."
      },
      {
        "label": "Jam interceptor guns",
        "detail": "Lock the interceptors' weapons systems so they cannot open fire on the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
