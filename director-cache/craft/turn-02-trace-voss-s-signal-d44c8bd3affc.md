# Sky run: Trace Voss's signal

- Film: Sky run (`craft`)
- Branch: Route to the harbor → Trace Voss's signal
- Cached: 2026-11-15T23:16:55.511Z

Delete this file to have the director write this turn again.

## What happens

The trace finds Voss broadcasting from an interceptor already airborne, his channel shared with two pilots and a precinct archivist erasing records. Before the trace closes, two interceptors drop in behind the craft.

Story purpose: The trace reveals Voss is personally hunting them and wiping records, and Iris realizes the proof is now the only copy left, binding her to Kade.

## Dialogue

- **Iris:** He's not at the precinct. He's in one of those interceptors.
- **Kade:** And someone on his channel is deleting archives. Every copy but yours.
- **Voss:** Your helper's sloppy, Kade. I hear them listening. Last chance to land.
- **Iris:** Then this proof is all that's left. Don't you dare stop now.

## Orbis prompts

Change: Two sleek black interceptor craft with blue engine glow drop in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

Hand-back: The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.

## Next choices

- investigate: Identify the archivist
- investigate: Scan the proof
- manipulate: Darken the billboards
- manipulate: Intensify the storm
- intervene: Jam their guns
- intervene: Cut through the gap

## Data

```json
{
  "narration": "The trace finds Voss broadcasting from an interceptor already airborne, his channel shared with two pilots and a precinct archivist erasing records. Before the trace closes, two interceptors drop in behind the craft.",
  "storyPurpose": "The trace reveals Voss is personally hunting them and wiping records, and Iris realizes the proof is now the only copy left, binding her to Kade.",
  "whatNext": "Kade could try to outrun Voss's interceptors down the green corridor, or use the open channel to turn Voss's own pilots against him.",
  "together": "Two interceptors hold close behind the craft, one carrying Voss himself.",
  "dialogue": [
    {
      "speaker": "Iris",
      "line": "He's not at the precinct. He's in one of those interceptors."
    },
    {
      "speaker": "Kade",
      "line": "And someone on his channel is deleting archives. Every copy but yours."
    },
    {
      "speaker": "Voss",
      "line": "Your helper's sloppy, Kade. I hear them listening. Last chance to land."
    },
    {
      "speaker": "Iris",
      "line": "Then this proof is all that's left. Don't you dare stop now."
    }
  ],
  "onScreen": "Two black interceptors with blue engine glow swoop in close behind Kade's craft as it races between the towers.",
  "offScreen": "At precinct headquarters, an archivist on Voss's channel purges the files on Iris's burned unit.",
  "transitionPrompt": "Two sleek black interceptor craft with blue engine glow drop in close behind the dark flying craft between the towers. The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "holdPrompt": "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers and rain streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Two sleek black interceptor craft with blue engine glow follow close behind it. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  "scenePrompt": "The dark craft streaks between green-lit towers in thickening rain, two black interceptors with blue engine glow now locked close on its tail.",
  "weather": "Heavy rain, storm building",
  "lighting": "Green corridor lights, holograms",
  "security": "Voss airborne, records being purged",
  "threatLevel": 4,
  "objective": "Shake Voss's interceptors and protect the last copy of proof",
  "characters": [
    {
      "name": "Kade",
      "look": "",
      "role": "Replicant hunter turned fugitive, flying the craft",
      "motivation": "Running with Iris; Voss's personal pursuit hardens him but the offer still lingers",
      "trust": 66
    },
    {
      "name": "Iris",
      "look": "",
      "role": "Fugitive replicant aboard the craft, Kade's former partner",
      "motivation": "Holds the only surviving proof against Voss; needs Kade to stay committed",
      "trust": 42
    },
    {
      "name": "Captain Voss",
      "look": "",
      "role": "Precinct commander flying in a pursuing interceptor",
      "motivation": "Wants Iris and the proof destroyed; knows a hidden helper is listening",
      "trust": 26
    }
  ],
  "keyEvent": "Voss is aboard one of the two pursuing interceptors, and his archivist is erasing every other copy of the proof.",
  "actions": {
    "investigate": [
      {
        "label": "Identify the archivist",
        "detail": "Trace the archivist on Voss's channel to learn who is purging the records and on whose orders."
      },
      {
        "label": "Scan the proof",
        "detail": "Read the proof Iris carries to see whose names are on the burn order."
      }
    ],
    "manipulate": [
      {
        "label": "Darken the billboards",
        "detail": "Cut the holographic billboards along the towers to blind the interceptors' optical tracking."
      },
      {
        "label": "Intensify the storm",
        "detail": "Push the weather systems to bring lightning and lashing rain between the towers."
      }
    ],
    "intervene": [
      {
        "label": "Jam their guns",
        "detail": "Lock out the interceptors' weapon systems through the precinct network before they open fire."
      },
      {
        "label": "Cut through the gap",
        "detail": "Open a route for Kade through the narrow gap between two towers off the corridor."
      }
    ]
  },
  "waitFor": "",
  "partnerLook": ""
}
```
