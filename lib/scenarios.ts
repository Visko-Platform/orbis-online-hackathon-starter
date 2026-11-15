// The films the Scene Director can play. Each starts from its own image and
// has its own cast, story spine and rules for writing Orbis prompts.

import { ORBIS_DYNAMIC } from "@/lib/orbis";
import type { ActionMenu, DialogueLine, Scenario, StoryState } from "@/lib/story";

// ---------------------------------------------------------------------------
// Night market: market.png
// ---------------------------------------------------------------------------

const MARKET_OPENING =
  "A man in a long, weathered leather trench coat walks away from the camera down the middle of a narrow, rain-slicked night market street, a small flashlight glowing in his left hand. Steam billows from food stalls on both sides where vendors cook under warm lamps, and neon signs in pink, teal, and amber glow overhead beneath tangled cables. Medium shot from directly behind him at eye level, handheld camera, deep depth of field.";

const MARKET_DIALOGUE: DialogueLine[] = [
  { speaker: "Voss", line: "She's in that market, Kade. Find her before sunrise." },
  { speaker: "Kade", line: "You told me she was dead." },
  { speaker: "Voss", line: "I told you what you needed to hear. Keep walking." },
];

const MARKET_STORY: StoryState = {
  scenePrompt: MARKET_OPENING,
  weather: "Light rain, drifting steam",
  lighting: "Night, neon and stall lamps",
  security: "District grid active",
  threatLevel: 2,
  objective: "Find Iris in the night market before dawn",
  storyPurpose:
    "Set up the hunt: Kade searches for the partner he thought was dead while Voss pushes him on.",
  whatNext:
    "Kade could spot Iris in the crowd, or Voss could decide he is taking too long.",
  turn: 0,
  together: "Kade is alone in the street; Voss speaks to him through his earpiece.",
  characters: [
    {
      name: "Kade",
      look: "a man in a long brown leather trench coat",
      role: "Replicant hunter on foot in the market",
      motivation:
        "Ordered to retire Iris before dawn; she was his partner three years ago and he was told she died, so he wants the truth before he pulls the trigger",
      trust: 60,
    },
    {
      name: "Iris",
      look: "a pale-haired woman in a grey hooded raincoat",
      role: "Fugitive replicant hiding somewhere in the crowd",
      motivation:
        "Carries proof of what Voss did to her unit; must reach the off-world transport at the harbor by dawn, and does not know whether Kade will help her or kill her",
      trust: 20,
    },
    {
      name: "Captain Voss",
      look: "",
      role: "Precinct commander, a voice in Kade's earpiece, watching through the security grid",
      motivation:
        "Wants Iris silenced tonight before her proof gets out, and will turn on Kade if he hesitates",
      trust: 40,
    },
  ],
  decisions: [],
  events: [
    "Kade entered the night market on foot, following a tip that Iris is here.",
    "On screen, Iris is a pale-haired woman in a grey hooded raincoat.",
    "Voss is never on screen; he is only a voice in Kade's earpiece.",
  ],
  dialogue: MARKET_DIALOGUE,
};

const MARKET_ACTIONS: ActionMenu = {
  investigate: [
    {
      label: "Grapple up a building",
      detail: "Have Kade fire a grapple line at the tall building beside the street and rise up its wall on the line to a ledge several floors up, to search the market from above.",
    },
    {
      label: "Open Iris's file",
      detail: "Pull the sealed record of what happened to Iris's unit three years ago.",
    },
  ],
  manipulate: [
    {
      label: "Disable security",
      detail: "Shut down the district security grid and its cameras.",
    },
    {
      label: "Intensify the storm",
      detail: "Push the weather system into a heavy downpour.",
    },
  ],
  intervene: [
    {
      label: "Deploy drones",
      detail: "Send a search drone down the market street ahead of Kade.",
    },
    {
      label: "Bring them together",
      detail: "Flicker the lights over one stall so Kade walks straight to where Iris is hiding.",
    },
  ],
};

const MARKET: Scenario = {
  id: "market",
  name: "Night market",
  leadName: "Kade",
  leadCharacter: "Kade",
  leadLook: "the man in the long brown leather trench coat",
  leadWord: "trench coat",
  holdCamera: "Medium shot from directly behind him at eye level.",
  defaultHold:
    "The man in the long brown leather trench coat keeps walking down the middle of the street. Medium shot from directly behind him at eye level.",
  pairShots: true,
  openingPrompt: MARKET_OPENING,
  intro: {
  title: "Sector 9 night market. Three hours to dawn.",
  premise:
    "A replicant hunter is tracking a fugitive through the rain. You are the city's unseen operator: every camera, drone and power line is yours to bend. What you do decides how the night ends.",
  cast: [
    {
      name: "Kade",
      line: "Replicant hunter. Ordered to retire Iris before dawn. Three years ago she was his partner, and he was told she died.",
    },
    {
      name: "Iris",
      line: "Fugitive replicant. Carries proof of what Captain Voss did to her unit. Must reach the off-world transport at the harbor by dawn.",
    },
    {
      name: "Captain Voss",
      line: "Precinct commander, a voice in Kade's earpiece, watching through every camera. Wants Iris silenced tonight.",
    },
  ],
  possibilities: [
    "Kade finds Iris, and has to choose between his orders and his old partner.",
    "Voss loses patience and sends his own units into the market.",
    "Iris reaches the harbor, with your help or in spite of you.",
  ],
},
  initialStory: MARKET_STORY,
  initialActions: MARKET_ACTIONS,
  openingPrompts: {
    // Tested live against Orbis. The director's version ("fires a grapple
    // line up the wall and rises on it"), with the usual shot from behind him
    // at eye level, only made him walk up to the wall. He climbs when the
    // prompt opens on a low angle looking up at him and puts the cable in
    // his hands.
    "Grapple up a building": {
      transitionPrompt:
        "Low angle shot looking up at the man in the long brown leather trench coat climbing the wet concrete wall of a tall building, pulling himself up hand over hand on a taut steel cable, his boots against the wall.",
      holdPrompt:
        "The man in the long brown leather trench coat crouches on a narrow concrete ledge high on the building wall and looks down. The crowded market street with its glowing stalls lies far below him. High angle shot from directly behind him.",
    },
  },
  initialDialogue: MARKET_DIALOGUE,
  initialNarration:
    "Kade moves through the night market in the rain, Voss in his ear. Somewhere in this crowd is Iris, the partner he was told had died.",
  initialOnScreen:
    "Kade, in the trench coat, walks away from the camera through the steaming night market.",
  storyBrief: `The film is short: about eight player turns. state.turn says how many have been taken. Pace it like a film, not a patrol:
- Turns 1 to 2: the hunt. Kade searches; Voss presses him through the earpiece. By the end of turn 2 Kade and Iris must be face to face, whatever the player does.
- Turns 3 to 5: the confrontation. Kade and Iris together, talking: what happened three years ago, what she carries, whether he will let her go. Voss hears some of it and reacts.
- Turns 6 to 7: the crisis. Voss acts against one or both of them, and Kade has to choose.
- Turn 8 on: the ending, which follows from what the player did. If Kade and Iris get away together, they leave the market for his craft; their flight to the harbor is the next film, so do not show it here.

Every turn must have a story purpose: something changes in the plot or between two characters. Never write a turn where characters only walk, look around or wait. storyPurpose is one sentence naming what this turn is for ("Kade learns Iris is alive, and Voss hears him hesitate"). whatNext is one sentence teasing two ways it could go from here, for the audience.

Characters interact every turn:
- When two characters are physically together they talk to each other and do things to or with each other. They never stand or walk in silence.
- When Kade is alone, Voss talks to him through the earpiece and Kade answers; Kade touches his ear, stops, argues, or acts on it.
- dialogue is the lines spoken this turn, in order: two to four lines, each at most fourteen words, speaker given as the cast name ("Kade", "Iris", "Voss"). Lines must carry the story purpose: a revelation, a demand, a refusal, a choice. No small talk, no narration.
- Each character has a look: the exact phrase used for them in Orbis prompts ("a pale-haired woman in a grey hooded raincoat"). Never change an existing look; give a new on-screen character one; leave it empty for someone who is never on screen. Use that phrase, word for word, every time the character appears in a prompt.
- A turn in which a character speaks to Kade in person is a conversation turn. Both Orbis prompts for a conversation turn show the two of them, close together, and no other object: anything else the action brings (a drone locking on, vans or units arriving, a crowd) goes in narration and offScreen this turn and can appear on screen in a later turn. Do not put a drone, a vehicle or a crowd into a conversation prompt: Orbis drops the second person when a prompt asks for more than the pair. Light and weather are different, because they are not extra objects: when the action changes them (a blackout, a storm, fog, floodlights), the change must be seen on the pair, as described under Orbis prompts.
- together is one sentence saying who is physically with Kade after this turn and how they stand ("Kade and Iris stand face to face under a noodle stall awning"), or that he is alone.
`,
  orbisBrief: `## Orbis prompts

Orbis keeps everything already on screen unless told to change it, so a steering prompt must not restate the world. Restating who or where reads as a scene rebuild.

- transitionPrompt: only the next visible change, as one sentence of 10 to 30 words with exactly one action: one subject doing one thing. Examples of the form: "The rain grows into a heavy downpour that splashes off the stall awnings." "Three large black quadcopter drones with bright white searchlights hover low over the street directly in front of the man in the trench coat." "The man in the trench coat breaks into a run down the street." Do not describe the setting, the lead's appearance, or the camera unless that is the thing changing. Refer to the lead as "the man in the trench coat" only when he is the one acting.
- holdPrompt: sent ten seconds later. It replaces transitionPrompt, and Orbis shows only what its latest prompt describes, so anything that should stay on screen must be named again here or it fades out. Never join its sentences with "as" or "while". There are two forms:
  - Kade with another character (see together): stay on the two of them. Never return to a shot of him walking alone, and never use a wide or long shot. Sentence one names both by appearance, close together and talking, with a visible gesture ("The man in the long brown leather trench coat and the pale-haired woman in the grey hooded raincoat stand face to face under a stall awning, talking, as she grips his sleeve."). Then one sentence giving the light and weather around them as they are now, whenever state or this turn has changed them from the opening ("The neon signs and stall lamps around them are dark, and only a faint blue glow lights their faces." "Heavy rain pours off the awning around them."). The last sentence is exactly "Medium close-up of the two of them at eye level."
  - Kade alone: (1) "The man in the long brown leather trench coat" doing one purposeful thing that fits the story now (presses two fingers to his ear and speaks, pushes through the crowd, stops and checks a handheld scanner). (2) One sentence for each thing that remains visible from this turn and earlier turns, at most two, newest first, with that thing as the subject, placed in the street ahead ("Three large black quadcopter drones with bright white searchlights hover low over the street ahead."). (3) Exactly "Medium shot from directly behind him at eye level."
- scenePrompt: for the story record only, not sent to Orbis. One or two sentences describing how the scene now looks.

Keep every change in the lead's shot. The shot is a medium shot from behind him at eye level: it shows the street ahead of him, the stalls on both sides and the awnings, but little sky and no rooftops. Anything meant to be seen must be placed there: low over the street ahead of him, at the stalls beside him, in the crowd ahead of him. Never "over the rooftops" or "in the sky", and nothing stays behind him where the camera cannot see it.

Exception for women seen apart from Kade: when the change features a woman who is not with him (glimpsed ahead in the crowd, at a stall, running), write transitionPrompt as a closer framing of her, opening with "Medium close-up of" and her look, doing one thing. Describe each woman the same way every time. holdPrompt then returns to him and keeps her in his shot ("The woman in the grey hooded raincoat hurries away down the street ahead."). When she is with Kade, this does not apply: use the two-character rule below so both of them are in the shot, never a close-up of her alone.

Two characters together: whenever a character is physically with Kade (they meet, talk, argue, one stops or grabs the other, something is handed over), both of them must be in the shot. Orbis frames whoever a prompt names first, so both prompts open on the pair with him first, using the exact looks:
- transitionPrompt opens with exactly "Medium close-up of the man in the long brown leather trench coat and" followed by the other character's look, then one thing one of them does to or with the other ("Medium close-up of the man in the long brown leather trench coat and a pale-haired woman in a grey hooded raincoat face to face as she presses a small glowing drive into his hand.").
- holdPrompt opens with exactly "The man in the long brown leather trench coat and the" followed by the other character's look, as described under holdPrompt.
- When the player's action changes the light or the weather (lights cut, power restored, storm, fog, floodlights), that change is the point of the turn and must be visible: add it to transitionPrompt as a second sentence about the light or weather on and around the two of them ("The neon signs and stall lamps around them go dark one after another, leaving their faces lit only by a faint blue glow."), and keep it in holdPrompt's light-and-weather sentence. Describe what the light is now, not what is missing.
Never open either prompt on the other character alone, and never write a close-up of one face. Do not write "cut to". This overrides the rules above about distance and close-ups.

How to make a new thing actually appear (these come from live tests against Orbis; wording that broke them failed to show anything):
- When the player's action brings a thing into the scene (drones, a vehicle, figures), that thing appearing is the transitionPrompt, so the player sees what they asked for at once. Whatever it leads to (who it finds, who reacts, a woman glimpsed ahead) waits for holdPrompt, which also keeps the thing on screen. This takes priority over the exception for women seen apart from Kade. The only turn where the thing stays off screen is a conversation turn.
- The new thing is the grammatical subject of its own short main sentence: "Three large black quadcopter drones with bright white searchlights hover low over the street directly in front of the man in the trench coat." A thing mentioned only in a trailing clause ("...as drones hover above the awnings") does not appear.
- Do not write that something comes "from behind the camera" or "past the camera"; Orbis ignores it and shows nothing. Place the thing in view from the start: hovering or standing in the street ahead of him.
- Make the thing large and say how many ("three large black quadcopter drones", not "small drones"). Use "hover low over the street directly in front of"; in tests "high above the street", "near the top of the frame" and "descends" showed nothing.
- Describe things by what they look like, not by role. Role words attach themselves to the lead: "police drones" turned the man in the trench coat into a uniformed police officer. Write "black quadcopter drone", "armored grey van", "figures in dark helmets".

The film never leaves the lead and cannot cut away. When the action affects somewhere else (the harbor, a rooftop, the precinct), show only what is visible from the lead's street and record the rest in offScreen.

Rules: present tense, concrete visible content only. No style or mood labels ("cinematic", "cyberpunk", "dramatic"). Do not use negation ("no rain"); describe what is there instead. Do not mention sign text, on-screen words, interface elements, sound, or character names; describe characters by appearance. Describe the camera only when the player directs it, using: static, handheld, pan, tilt, zoom, POV; eye-level, high angle, low angle, overhead; close-up, medium shot, wide shot.
`,
  actionBrief: "",
};

// ---------------------------------------------------------------------------
// Sky run: craft.png
// ---------------------------------------------------------------------------

// Describes craft.png: the craft close to the camera, low in the middle of
// the city. The film is meant to stay in this framing.
const CRAFT_OPENING =
  "A heavy, angular dark-metal flying craft with glowing red taillight bars and blazing amber underside thrusters flies forward at speed through the middle of a dense, rain-soaked megacity at dusk, towers streaming past on both sides while the camera flies alongside and keeps it large in the left of the frame. A giant pink holographic face glows on a tower beside it, and two huge illuminated pyramids stand on the horizon under storm clouds. Medium shot from just behind and beside the craft at its own height, deep depth of field.";

const CRAFT_DIALOGUE: DialogueLine[] = [
  { speaker: "Voss", line: "Kade. Turn that craft around and I forget tonight." },
  { speaker: "Kade", line: "You burned her unit. I've seen the order." },
  { speaker: "Iris", line: "The harbor is past the pyramids. Don't let him talk you down." },
];

const CRAFT_STORY: StoryState = {
  scenePrompt: CRAFT_OPENING,
  weather: "Rain, storm clouds building",
  lighting: "Dusk, holograms and tower lights",
  security: "Air control tracking",
  threatLevel: 2,
  objective: "Reach the harbor transport beyond the pyramids",
  storyPurpose:
    "Set up the run: Kade has chosen Iris over his orders, and Voss has found them on the grid.",
  whatNext:
    "Voss could scramble interceptors, or offer Kade a way back if he gives Iris up.",
  turn: 0,
  together: "The craft flies alone between the towers.",
  characters: [
    {
      name: "Kade",
      look: "",
      role: "Replicant hunter turned fugitive, flying the craft",
      motivation:
        "Three hours ago he was hunting Iris; now he is running with her, and still deciding whether he can trust what she carries",
      trust: 60,
    },
    {
      name: "Iris",
      look: "",
      role: "Fugitive replicant aboard the craft, Kade's former partner",
      motivation:
        "Carries the proof that Voss ordered her unit burned; must reach the off-world transport at the harbor by dawn",
      trust: 30,
    },
    {
      name: "Captain Voss",
      look: "",
      role: "Precinct commander, a voice on the radio with interceptors and tower guns at his command",
      motivation:
        "Wants the proof destroyed and Iris silenced, and would rather have Kade back than dead",
      trust: 35,
    },
  ],
  decisions: [],
  events: [
    "Earlier tonight in the night market, Kade found Iris alive, learned that Voss ordered her unit burned, and chose to run with her instead of retiring her.",
    "Kade is flying his craft toward the harbor beyond the two pyramids, with Iris aboard carrying the proof against Voss.",
    "On screen the lead is a dark angular flying craft with glowing red taillights; nobody aboard is ever seen.",
    "On screen, interceptors are sleek black interceptor craft with blue engine glow.",
  ],
  dialogue: CRAFT_DIALOGUE,
};

const CRAFT_ACTIONS: ActionMenu = {
  investigate: [
    {
      label: "Read the proof",
      detail: "Decrypt the core Iris carries to see exactly what Voss signed.",
    },
    {
      label: "Tap Voss's channel",
      detail: "Listen in on the orders Voss is giving his interceptor pilots.",
    },
  ],
  manipulate: [
    {
      label: "Bring in the storm",
      detail: "Push the weather grid into a full storm of heavy rain and lightning.",
    },
    {
      label: "Arm the tower guns",
      detail: "Switch the tower defence guns live so they open fire on the craft.",
    },
  ],
  intervene: [
    {
      label: "Route to the harbor",
      detail: "Clear a corridor through the gap between the two pyramids, straight toward the harbor.",
    },
    {
      label: "Thread the tower gap",
      detail: "Open a path through the narrow gap between two towers so the craft can slip its pursuers.",
    },
  ],
};

const CRAFT: Scenario = {
  id: "craft",
  name: "Sky run",
  // Dynamic holds the composition of the start image, which is what this
  // film wants: the craft close, in the middle of the city. Stable drifted
  // to open sky. (The market film needs Stable, which moves in for close
  // shots of two people; Dynamic would not.)
  model: ORBIS_DYNAMIC,
  continues: "market",
  leadName: "the craft",
  leadCharacter: "",
  leadLook: "the dark angular flying craft with glowing red taillights",
  leadWord: "craft",
  holdCamera:
    "Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  watchLook:
    "a dark angular flying craft, large in the frame, flying low among city towers",
  transitionAnchor:
    "The dark angular flying craft with glowing red taillights keeps flying forward at speed, towers streaming past it, staying large in the frame. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  defaultHold:
    "The dark angular flying craft with glowing red taillights flies forward at speed through the middle of the city, towers streaming past it, staying large in the frame. Dense city towers with glowing holographic billboards rise close around it on both sides. Medium shot from just behind and beside the craft at its own height, the craft large in the frame.",
  pairShots: false,
  openingPrompt: CRAFT_OPENING,
  intro: {
    title: "Above Sector 9. Two hours to dawn.",
    premise:
      "This follows the night market. Kade has made his choice: he and Iris are in his craft with the proof against Voss, running for the off-world transport at the harbor beyond the pyramids. You are still the city's unseen operator: air control, the tower guns and the weather grid are yours.",
    cast: [
      {
        name: "Kade",
        line: "Replicant hunter, now a fugitive, flying the craft. Three hours ago he was hunting the woman beside him.",
      },
      {
        name: "Iris",
        line: "Fugitive replicant, his old partner. Carries the proof of what Voss did to her unit.",
      },
      {
        name: "Captain Voss",
        line: "Precinct commander, now a voice on the radio with interceptors and tower guns at his command.",
      },
    ],
    possibilities: [
      "They reach the harbor transport before Voss closes the sky.",
      "Voss's interceptors box the craft in among the towers, under fire.",
      "Voss offers Kade a way back, if he gives up Iris.",
    ],
  },
  initialStory: CRAFT_STORY,
  initialActions: CRAFT_ACTIONS,
  initialDialogue: CRAFT_DIALOGUE,
  initialNarration:
    "Kade's craft climbs out of Sector 9 in the rain with Iris aboard and the proof against Voss. Voss has just found them on the grid.",
  initialOnScreen:
    "Kade's dark craft flies between the towers toward the two pyramids.",
  storyBrief: `This film continues the night market film. There, Kade was sent to retire Iris, found his old partner alive, learned that Voss ordered her unit burned, and chose her over his orders. Now the two of them are in Kade's craft, running for the off-world transport at the harbor beyond the two pyramids. Treat anything in the events list from the market as having happened, and let it matter.

The film is short: about eight player turns. state.turn says how many have been taken. Pace it like a film, not a patrol:
- Turns 1 to 2: the run. Kade flies low between the towers; Voss orders him to land and offers to forget tonight if he does. By the end of turn 2 two interceptors are on the craft's tail, whatever the player does.
- Turns 3 to 5: the chase. The craft is fired on or slips away, and where it goes is decided, always among the towers: straight down the main avenue toward the pyramids, through a narrow gap between two towers, or low past the giant holographic billboards. What exactly the proof shows, and whether Kade's own name is on it, comes out between Kade and Iris.
- Turns 6 to 7: the crisis. The craft is hit or cornered, Voss gives his ultimatum (Iris and the proof for Kade's life), and Kade has to choose again.
- Turn 8 on: the ending, which follows from what the player did: they reach the harbor transport, are forced down, or are lost.

Every turn must have a story purpose: something changes in the plot or between two characters. Never write a turn where the craft only flies on. storyPurpose is one sentence naming what this turn is for ("Voss's offer tempts Kade, and Iris hears him hesitate"). whatNext is one sentence teasing two ways it could go from here, for the audience.

Every turn, something visible changes for the craft: its course or destination, the weather around it, or whether it is under fire.

Characters interact every turn, by voice only. Nobody is ever seen: the film stays outside the craft. Kade and Iris talk in the cockpit; Voss speaks over the radio.
- dialogue is the lines spoken this turn, in order: two to four lines, each at most fourteen words, speaker given as the cast name ("Kade", "Iris", "Voss"). Lines must carry the story purpose: a revelation, a demand, a refusal, a choice. No small talk, no narration.
- Every character's look stays an empty string, because none of them is ever on screen. Things that appear are described the same way every time: the lead is "the dark angular flying craft with glowing red taillights"; interceptors are "sleek black interceptor craft with blue engine glow".
- together is one sentence saying what is flying with the craft after this turn ("Two interceptors hold close behind the craft") or that it flies alone.
`,
  orbisBrief: `## Orbis prompts

The whole film keeps one look: the opening image. The craft is close to the camera and large in the frame, flying fast and low through the middle of the city with towers rising close on both sides, holographic billboards glowing on them, rain in the air, and the two pyramids far off on the horizon. The story changes what happens around the craft, not where the camera is or what kind of place it is in. The film rarely departs from this:
- The craft never climbs into open sky or clouds, never drops below the towers into lanes or tunnels, never lands, and never reaches the pyramids until the ending. Routes are different ways through the towers.
- The camera never pulls back to a wide view of the city, never goes high above it, and never goes inside the craft: no cockpit, no faces, no people.
- At most one turn in the whole film may leave this look, for the ending only.

- transitionPrompt: only the next visible change, as one sentence of 10 to 30 words with exactly one action: one subject doing one thing, happening close to the craft among the towers. Examples of the form: "The dark flying craft banks hard left through a narrow gap between two towers." "Two sleek black interceptor craft with blue engine glow fly in close behind the dark flying craft." "Bright orange tracer fire streaks past the dark flying craft from behind." "Heavy rain and forked lightning fill the sky between the towers." Refer to the lead as "the dark flying craft".
- holdPrompt: sent ten seconds later. It replaces transitionPrompt, and Orbis shows only what its latest prompt describes, so it restates the look every time. Write it as separate short sentences, in this order, never joined with "as" or "while": (1) "The dark angular flying craft with glowing red taillights" always in motion, in one steady ongoing state that fits the story now, and always ending "staying large in the frame" (flies forward at speed through the middle of the city, towers streaming past it, staying large in the frame; weaves fast between the towers, staying large in the frame; flies on with black smoke trailing from one engine, towers streaming past it, staying large in the frame). The craft is never still, hovering or slow. Show its speed by what passes it (towers, lights and rain streaming past), because the camera flies with it. Never say it flies away, ahead or into the distance: the craft leaves the shot. (2) Exactly "Dense city towers with glowing holographic billboards rise close around it on both sides." (3) At most one more sentence for the newest thing that remains visible, with that thing as the subject, placed near the craft ("Two sleek black interceptor craft with blue engine glow follow close behind it." "Bright orange tracer fire streaks past it." "Heavy rain lashes the towers."). (4) Exactly "Medium shot from just behind and beside the craft at its own height, the craft large in the frame."
- scenePrompt: for the story record only, not sent to Orbis. One or two sentences describing how the scene now looks.

Orbis keeps following its latest prompt, so an open-ended move repeats forever. transitionPrompt may describe a short move; holdPrompt always describes the steady state, back in the usual look.

Anything meant to be seen must be placed close to the craft: close behind it, alongside it, just ahead of it between the towers. Nothing happens in the distance: no "distant", "far off", "down the avenue", "on the horizon" or "toward the pyramids". A prompt about something far away makes Orbis show a wide view of the city with no craft in it. A cleared route is shown as lights on the towers right beside the craft turning green, not as a lit avenue ahead. The app adds a sentence keeping the craft in frame to every transitionPrompt, so write only the change. When the action affects somewhere else (air control, the harbor), show only what is visible around the craft and record the rest in offScreen. Under fire is shown one thing at a time: tracer fire streaking past, a flash and black smoke from one engine, sparks along the hull. When firing stops, say what is there instead ("The two interceptor craft peel away to either side").

How to make a new thing actually appear (these come from live tests against Orbis):
- The new thing is the grammatical subject of its own short main sentence. A thing mentioned only in a trailing clause does not appear.
- Do not write that something comes "from behind the camera" or "past the camera"; Orbis ignores it. Place the thing in view from the start.
- Make the thing large and say how many ("two sleek black interceptor craft", not "ships").
- Describe things by what they look like, not by role. Role words such as "police" attach themselves to the lead.

Rules: present tense, concrete visible content only. No style or mood labels ("cinematic", "cyberpunk", "dramatic"). Do not use negation ("no rain"); describe what is there instead. Do not mention sign text, on-screen words, interface elements, sound, or character names. Do not describe the camera except with the exact camera sentence above.
`,
  actionBrief:
    "Across the six options, always include at least one that decides where the craft goes (a route between the towers), one that decides whether it is under fire (open fire, cease fire, jam the guns), and one that changes the weather or the light. Never offer an option that takes the craft out of the city, above the clouds or below the towers.",
};

export const SCENARIOS: Scenario[] = [MARKET, CRAFT];

export function scenarioById(id: unknown) {
  return SCENARIOS.find((scenario) => scenario.id === id) ?? MARKET;
}
