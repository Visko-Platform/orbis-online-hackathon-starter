# Sky run: Trace Voss's channel

- Film: Sky run (`craft`)
- Branch: Bring in the storm → Trace Voss's channel
- Cached: 2026-11-15T23:17:19.572Z

Delete this file to have the director write this turn again.

## What happens

The trace finds Voss broadcasting from a gunship over the harbor itself, and he has quietly scrambled two interceptors on radar-only tracking. As turn two closes, they lock onto the craft's tail through the storm.

Story purpose: The trace reveals Voss is waiting at the harbor, not the precinct, and Iris admits the proof carries Kade's signature too.

## Dialogue

- **Iris:** His signal's from the harbor. He's not at the precinct, he's waiting for us.
- **Voss:** Radar doesn't care about rain, Kade. Two birds are on you now.
- **Kade:** How does he know the harbor, Iris? What's really on that proof?
- **Iris:** The burn order. Countersigned. Your name is on it, Kade.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft through the heavy rain. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Verify the signature
- investigate: Identify interceptor pilots
- manipulate: Flood radar with static
- manipulate: Black out billboards
- intervene: Thread the narrow gap
- intervene: Jam their guns

## Data

```json
{
  "narration": "The trace finds Voss broadcasting from a gunship over the harbor itself, and he has quietly scrambled two interceptors on radar-only tracking. As turn two closes, they lock onto the craft's tail through the storm.",
  "storyPurpose": "The trace reveals Voss is waiting at the harbor, not the precinct, and Iris admits the proof carries Kade's signature too.",
  "whatNext": "Kade could break for the narrow gaps to shake the interceptors, or confront Iris about what his name is doing on Voss's order.",
  "together": "Two interceptors hold close behind the craft.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "His signal's from the harbor. He's not at the precinct, he's waiting for us."
    },
    {
      "speaker": "Voss",
      "line": "Radar doesn't care about rain, Kade. Two birds are on you now."
    },
    {
      "speaker": "Kade",
      "line": "How does he know the harbor, Iris? What's really on that proof?"
    },
    {
      "speaker": "Iris",
      "line": "The burn order. Countersigned. Your name is on it, Kade."
    }
  ],
  "onScreen": "Two black interceptors with blue engine glow close in behind Kade's craft through the storm between the towers.",
  "offScreen": "Over the harbor, Voss's gunship circles above the off-world transport, his channel routed through it to hide where he is.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft through the heavy rain. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark angular craft races through the lightning storm between the towers with two black interceptors glowing blue close on its tail.",
  "weather": "Full storm, heavy lightning",
  "lighting": "Lightning flashes, flickering holograms",
  "security": "Radar tracking, optics blind",
  "threatLevel": 3,
  "objective": "Shake the interceptors and find a way past Voss's harbor",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Shaken to learn his own signature is on the burn order; needs to know if he was used",
      "trust": 64
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Reach the transport; she has confessed the proof implicates Kade and waits to see what he does",
      "trust": 40
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander, broadcasting from a gunship over the harbor",
      "motivation": "Destroy the proof and silence Iris; use Kade's signature to keep him in line",
      "trust": 25
    }
  ],
  "keyEvent": "Voss is waiting in a gunship over the harbor transport, two interceptors track the craft by radar, and the proof bears Kade's countersignature on the burn order.",
  "actions": {
    "investigate": [
      {
        "label": "Verify the signature",
        "detail": "Pull the archive record of the countersignature to see whether Kade truly signed or Voss forged it."
      },
      {
        "label": "Identify interceptor pilots",
        "detail": "Read the interceptors' transponders to learn who is flying them and what their orders are."
      }
    ],
    "manipulate": [
      {
        "label": "Flood radar with static",
        "detail": "Use the storm's lightning to overload the city's radar towers and blind the interceptors' tracking."
      },
      {
        "label": "Black out billboards",
        "detail": "Cut the holographic billboards along the route to plunge the tower canyons into darkness."
      }
    ],
    "intervene": [
      {
        "label": "Thread the narrow gap",
        "detail": "Guide Kade into a tight gap between two towers where the interceptors can't follow abreast."
      },
      {
        "label": "Jam their guns",
        "detail": "Lock the interceptors' weapon systems before they open fire on the craft."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
