// Starship Window: destinations and prompts.
//
// Prompts describe ONLY the view straight ahead. Never mention a cockpit,
// window or ship, or Orbis may paint its own over ours.

export type Destination = {
  id: string;
  name: string;
  era: string;
  /** Log line written on arrival. */
  log: string;
  /**
   * The world straight ahead, as layered scene text (foreground, midground,
   * background, a landmark). Never camera motion: the helm adds that.
   * Hand-written views are fragments ("a vast glowing nebula of …");
   * director views are complete sentences.
   */
  view: string;
  /** Written by the director (complete-sentence view). */
  generated?: boolean;
  /** Six-word hook shown on the console key. */
  teaser?: string;
  /** Pre-generated 16:9 opening frame (public path): image-anchored launch. */
  opener?: string;
  /** This route carries the mission forward. */
  mission?: boolean;
  /** What we hope to find there (mission routes only). */
  clue?: string;
  /** The mission resolves here. */
  finale?: boolean;
};

// ---- Helm: throttle and bank turn into the motion clause of every prompt.

export type Throttle = "reverse" | "drift" | "cruise" | "boost";
export const THROTTLES: Throttle[] = ["reverse", "drift", "cruise", "boost"];
/** What the helm can select. Reverse is reserved for the Impactor finale:
 *  it's a flight game, so normal flight always moves forward. */
export const HELM_THROTTLES: Throttle[] = ["drift", "cruise", "boost"];
export type Bank = -1 | 0 | 1;
export type Helm = { throttle: Throttle; bank: Bank };

const MOTION: Record<Throttle, string> = {
  reverse:
    "The camera flies steadily backward, the scene receding away from it while new detail slides in from the edges of the frame.",
  drift:
    "The camera glides slowly forward, a gentle steady push-in, the ground drifting toward and beneath it.",
  cruise:
    "The camera flies forward at cruising speed low over the ground, terrain rushing toward the camera and streaming beneath it.",
  boost:
    "The camera races forward at high speed just above the surface, the ground rushing toward the lens and blurring beneath it.",
};

const BANK: Record<Bank, string> = {
  [-1]: " It banks into a smooth sweeping turn to the left, the horizon tilting.",
  0: "",
  1: " It banks into a smooth sweeping turn to the right, the horizon tilting.",
};

export function motionClause(helm: Helm) {
  return MOTION[helm.throttle] + BANK[helm.bank];
}

/** Scene text for a destination (no motion). */
export function sceneOf(destination: Destination) {
  const view = destination.view.trim().replace(/[.\s]+$/, "");
  return destination.generated ? `${view}.` : `Straight ahead lies ${view}.`;
}

/**
 * The full Orbis prompt, in the style Visko's own curated presets use:
 * explicit camera, layered detail, "a single unbroken take". Never mention
 * a cockpit, window or ship, or Orbis may paint its own over ours.
 */
export function composePrompt(scene: string, helm: Helm) {
  // Orbis weighs the start of a prompt most, so the direction of travel
  // leads. Without it, scene-first prompts sometimes drift backward.
  // Video models know camera language: "FPV drone shot", "push-in", "dolly
  // forward". Forward motion leads AND closes every prompt.
  const reverse = helm.throttle === "reverse";
  const lead = reverse
    ? "Reverse flight, the camera pulling backward away from the scene."
    : "FPV drone shot flying forward: the camera pushes continuously forward into the scene, everything ahead growing larger and closer as it approaches, the horizon drawing nearer.";
  const close = reverse
    ? "Cinematic and photorealistic, a single unbroken take."
    : "Continuous forward camera motion throughout, a dolly-forward push that never stops. Cinematic and photorealistic, a single unbroken take.";
  return [lead, scene.trim(), motionClause(helm), "Rich, sharp detail near and far.", close].join(" ");
}

/** Step one of every jump; the destination follows a few seconds later. */
export const JUMP_PROMPT =
  "The camera accelerates forward through space as the stars stretch into long streaks of white and blue light rushing toward the edges of the frame, a brilliant glow at the centre. A single unbroken take.";

// ---- Missions: a goal threaded through the flight. The director makes one
// route per scan carry it forward; the fourth mission world is the finale.

export type Mission = {
  id: string;
  title: string;
  goal: string;
  /** A scripted finale played at the final mission world. */
  finale?: "detonate";
};
export const MISSION_STAGES = 4;

export const MISSIONS: Mission[] = [
  {
    id: "impactor",
    title: "Impactor",
    goal: "An asteroid is on a collision course with Earth. Follow its trail back through time, find it, plant a charge on its surface, then back away at full reverse before it blows.",
    finale: "detonate",
  },
  {
    id: "lantern",
    title: "The Lantern Signal",
    goal: "Trace a faint, repeating light signal that has been calling the ship across time, and find who or what is sending it.",
  },
  {
    id: "seed",
    title: "The Last Seed",
    goal: "Find the place and time where the last seed of a vanished world-forest was hidden, so it can be carried home.",
  },
  {
    id: "echo",
    title: "The Echo",
    goal: "Follow a recorded message addressed to the captain by name, left somewhere in history, back to whoever recorded it.",
  },
];

export const ORIGIN: Destination = {
  id: "nebula",
  name: "Cassia Nebula",
  era: "Drift",
  log: "Holding in the Cassia Nebula. Drive warm, star map live.",
  view: "a vast nebula in deep space: wisps of glowing teal gas curling close in the foreground, towering amber and rose cloud pillars lit from within in the midground, and a distant blue-white star cluster blazing through the gaps, scattered stars drifting past",
  opener: "/worlds/nebula.jpg",
};

export const DESTINATIONS: Destination[] = [
  {
    id: "cretaceous",
    name: "Cretaceous Earth",
    era: "66,000,000 BC",
    log: "Late Cretaceous. Herds in the river valley, volcano active to the north.",
    view: "a misty Cretaceous river valley from just above the treetops: giant fern fronds and conifer crowns close below, a broad braided river where herds of long-necked dinosaurs wade in the midground, and a smoking volcano on the far horizon under warm golden late-afternoon light",
    opener: "/worlds/cretaceous.jpg",
  },
  {
    id: "alexandria",
    name: "Alexandria",
    era: "250 BC",
    log: "Alexandria. The lighthouse is lit. Sailing ships in the harbour.",
    view: "the ancient harbour of Alexandria from low above the water: sunlit turquoise waves and the white sails of wooden ships close below, a curving quay of marble colonnades in the midground, and a towering stone lighthouse with a fire burning at its peak dominating the horizon",
    opener: "/worlds/alexandria.jpg",
  },
  {
    id: "megacity",
    name: "Neon Megacity",
    era: "2199 AD",
    log: "2199. Acid rain, heavy traffic far below. Keep altitude.",
    view: "a canyon between colossal rain-soaked skyscrapers at night: rain streaks and drifting mist close ahead, walls of glowing magenta and cyan holographic billboards in the midground, and rivers of light trails far below converging toward a giant illuminated tower in the distance",
    opener: "/worlds/megacity.jpg",
  },
  {
    id: "europa",
    name: "Europa",
    era: "2471 AD",
    log: "Europa. Minus 160 outside. Geysers venting along the ridge.",
    view: "the frozen surface of Europa from low above the ice: cracked blue-white ice plates and rust-red fissures close below, plumes of water vapour erupting from a long ridge in the midground, and the enormous banded disc of Jupiter filling the black sky on the horizon",
    opener: "/worlds/europa.jpg",
  },
  {
    id: "vey",
    name: "Glass Dunes of Vey",
    era: "3120 AD",
    log: "Vey. Twin suns, crystal dunes. Glare filters on.",
    view: "an alien desert of translucent crystal dunes: sharp glassy ridges scattering rainbow light close below, rolling dunes glittering in the midground, and two suns hanging low over a jagged crystal mesa on the horizon under a pale violet sky",
    opener: "/worlds/vey.jpg",
  },
  {
    id: "lastsunset",
    name: "The Last Sunset",
    era: "1,000,000 AD",
    log: "One million AD. The sun is red and enormous. Ocean to every horizon.",
    view: "a calm endless ocean at the end of time: long slow swells glinting crimson close below, a lone dark rock arch rising from the water in the midground, and a swollen deep-red sun filling a third of the sky on the horizon",
    opener: "/worlds/lastsunset.jpg",
  },
];

/**
 * The rest of the pre-rendered library (high-quality opening frames in
 * public/worlds). The director prefers these, so most jumps can cut straight
 * to a pre-rendered frame. DESTINATIONS (above) are the charted keys.
 */
export const LIBRARY_EXTRA: Destination[] = [
  {
    id: "impactor",
    name: "The Impactor",
    era: "2183 AD",
    log: "Contact. A mountain of rock on course for Earth.",
    view: "a vast cratered asteroid from just above its surface: jagged grey boulders and dust close below, deep impact craters and ridges stretching across the midground, and the small blue disc of Earth hanging in the black sky beyond its curved horizon",
    opener: "/worlds/impactor.jpg",
  },
  {
    id: "saturn",
    name: "Rings of Saturn",
    era: "2390 AD",
    log: "Inside the rings. Ice everywhere. Shields up.",
    view: "the inside of Saturn's rings: glittering chunks of ice tumbling close ahead, bright bands of ring particles stretching away in the midground, and the colossal golden curve of Saturn filling the horizon",
    opener: "/worlds/saturn.jpg",
  },
  {
    id: "atlantis",
    name: "Atlantis",
    era: "9600 BC",
    log: "Atlantis, intact. Nobody will ever believe this.",
    view: "the island city of Atlantis from low above the sea: turquoise water and white surf close below, concentric rings of canals and white marble terraces in the midground, and a golden-domed temple on a central hill against a bright sky",
    opener: "/worlds/atlantis.jpg",
  },
  {
    id: "giza",
    name: "Giza Plateau",
    era: "2560 BC",
    log: "Giza, mid-construction. The capstone is still gold.",
    view: "the Giza plateau from low above the desert: rippled golden sand and work ramps close below, the bright limestone faces of the great pyramids in the midground, and the green ribbon of the Nile on the horizon under a hazy sun",
    opener: "/worlds/giza.jpg",
  },
  {
    id: "iceage",
    name: "Ice Age Tundra",
    era: "20,000 BC",
    log: "Last glacial maximum. Mammoths, minus thirty, no regrets.",
    view: "a frozen ice-age steppe from low above the snow: wind-blown snow and tufts of grass close below, a herd of woolly mammoths trudging across the midground, and towering blue-white glaciers on the horizon under a pale sky",
    opener: "/worlds/iceage.jpg",
  },
  {
    id: "titan",
    name: "Titan",
    era: "3010 AD",
    log: "Titan. Methane rain, orange sky. Lovely, in a toxic way.",
    view: "the surface of Titan from low above a methane shoreline: dark glassy liquid and icy pebbles close below, a winding black lake and orange dunes in the midground, and a dim ringed Saturn behind thick amber haze on the horizon",
    opener: "/worlds/titan.jpg",
  },
  {
    id: "deepreef",
    name: "The Deep Reef",
    era: "2300 AD",
    log: "Underwater. Bioluminescence everywhere. Hull is holding.",
    view: "a deep ocean reef glowing in the dark: bioluminescent corals and drifting jellyfish close ahead, towering kelp and glowing reef walls in the midground, and the faint blue shafts of a distant surface far above",
    opener: "/worlds/deepreef.jpg",
  },
  {
    id: "venice",
    name: "Venice at Carnival",
    era: "1750 AD",
    log: "Venice, carnival night. We are underdressed.",
    view: "the canals of Venice on carnival night from just above the water: dark rippling water and moored gondolas close below, lantern-lit palazzi and crowds in masks along the canal in the midground, and the dome of a great basilica glowing against fireworks on the horizon",
    opener: "/worlds/venice.jpg",
  },
  {
    id: "mars",
    name: "Terraformed Mars",
    era: "2600 AD",
    log: "Mars, two centuries into terraforming. The canyons are green.",
    view: "a terraformed Martian canyon from low above the valley floor: red rock and a winding river close below, terraced green farms and glass domes along the canyon walls in the midground, and the vast slope of Olympus Mons on the horizon under a pink sky",
    opener: "/worlds/mars.jpg",
  },
  {
    id: "aurora",
    name: "Aurora Fjord",
    era: "1000 AD",
    log: "A northern fjord, Viking age. The sky is on fire, politely.",
    view: "a deep northern fjord at night from low above the water: still black water reflecting the sky close below, steep snowy cliffs and a small village of longhouses with glowing fires in the midground, and green curtains of aurora rippling above the mountains on the horizon",
    opener: "/worlds/aurora.jpg",
  },
  {
    id: "clockwork",
    name: "Clockwork City",
    era: "1890 AD",
    log: "A city of brass and steam. Everything ticks.",
    view: "a sprawling steam-age city of brass from low above the rooftops: copper pipes and venting steam close below, giant turning clock towers and gear-driven bridges in the midground, and a colossal clockwork spire glowing amber at sunset on the horizon",
    opener: "/worlds/clockwork.jpg",
  },
  {
    id: "dyson",
    name: "The Dyson Swarm",
    era: "50,000 AD",
    log: "A star wrapped in machinery. Someone was very ambitious.",
    view: "a megastructure around a star: glinting hexagonal solar panels drifting close ahead, vast curving rings of machinery in the midground, and a blazing white star half-enclosed by a lattice shell on the horizon",
    opener: "/worlds/dyson.jpg",
  },
  {
    id: "skyisles",
    name: "The Sky Isles",
    era: "4400 AD",
    log: "Floating islands, no visible means of support. Rude.",
    view: "a sea of clouds with floating islands from just above the cloud tops: billowing white clouds close below, grassy floating islands trailing waterfalls in the midground, and a giant island crowned with a white citadel against a golden sunrise on the horizon",
    opener: "/worlds/skyisles.jpg",
  },
];

/** The whole pre-rendered library: charted keys plus the extras. */
export const LIBRARY: Destination[] = [...DESTINATIONS, ...LIBRARY_EXTRA];

/** A course the crew types in: "Venice during Carnival, 1750". */
export function plottedCourse(text: string): Destination {
  const place = text.trim().replace(/[.\s]+$/, "");
  return {
    id: `plot-${Date.now()}`,
    name: place.length > 28 ? `${place.slice(0, 27)}…` : place,
    era: "Plotted",
    log: `Arrived: ${place}. Uncharted, logging everything.`,
    view: `${place}, from low above it: rich detail close below, the heart of the place in the midground, and a striking landmark on the horizon in atmospheric light`,
  };
}

// ---- The Impactor finale: three scripted scenes, sent in order.

export const IMPACTOR = {
  /** Shown once the crew plants the charge. */
  charge:
    "The same vast cratered asteroid fills the view, its grey rock surface close below. A heavy metal charge is clamped to the rock in the foreground, a red light on it blinking fast, thin vapour venting from its seams, the black star field beyond.",
  /** Backing away, the charge still blinking. */
  retreat:
    "The same cratered asteroid, now shrinking into the distance against the black star field, a tiny red light blinking on its surface as it falls away.",
  /** The detonation. */
  blast:
    "The distant asteroid erupts in a blinding white-orange explosion, splitting into huge glowing fragments that tumble apart and scatter away in every direction, a ring of debris and fire expanding against the stars.",
  /** Seconds on the countdown after FULL REVERSE. */
  countdown: 10,
};

/** Points: exploring pays, the mission pays more. */
export const POINTS = { world: 100, clue: 250, finale: 500, earthSaved: 1000 };
