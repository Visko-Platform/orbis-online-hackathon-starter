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
export type Bank = -1 | 0 | 1;
export type Helm = { throttle: Throttle; bank: Bank };

const MOTION: Record<Throttle, string> = {
  reverse:
    "The camera flies steadily backward, the scene receding away from it while new detail slides in from the edges of the frame.",
  drift: "The camera drifts slowly forward at a gentle, steady pace.",
  cruise:
    "The camera flies steadily forward at cruising speed, low over the terrain, the landscape streaming past beneath it.",
  boost:
    "The camera races forward at high speed, skimming just above the surface, foreground detail rushing past in a blur.",
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
  return [
    scene.trim(),
    motionClause(helm),
    "Rich, sharp detail in the foreground, midground and far background. Cinematic and photorealistic, a single unbroken take.",
  ].join(" ");
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
