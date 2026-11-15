// Scene directions offered by the HUD.
//
// Orbis has no camera, motion, or event command: the only live control is a
// steering prompt. Each action is therefore one short prompt describing a
// single visible change, which is how the Orbis guide says steering prompts
// should be written (a delta, one action, scene not restated).

export type DirectorAction = {
  label: string;
  /** `subject` is already phrased like "the red biplane". */
  prompt: (subject: string) => string;
  /**
   * A lasting change to the scene. Once the direction has played out, the HUD
   * returns Orbis to the scene prompt plus every active condition, so the
   * change sticks. `text: null` clears the group. Directions without a
   * condition are momentary: the scene settles back afterwards.
   */
  condition?: { group: string; text: string | null };
};

export type DirectorCategory = {
  id: string;
  name: string;
  actions: DirectorAction[];
};

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const DIRECTOR_CATEGORIES: DirectorCategory[] = [
  {
    id: "camera",
    name: "Camera",
    actions: [
      {
        label: "← Fly left",
        prompt: (s) =>
          `The camera glides steadily to the left, the scenery sliding past toward the right while ${s} stays in frame.`,
      },
      {
        label: "→ Fly right",
        prompt: (s) =>
          `The camera glides steadily to the right, the scenery sliding past toward the left while ${s} stays in frame.`,
      },
      {
        label: "↑ Fly up",
        prompt: (s) =>
          `The camera rises a little higher and looks down on ${s}, which stays large in the middle of the frame.`,
      },
      {
        label: "↓ Fly down",
        prompt: (s) =>
          `The camera sinks a little lower and looks up at ${s}, which stays large in the middle of the frame.`,
      },
      {
        label: "Fly forward",
        prompt: (s) =>
          `The camera levels out and glides straight ahead, following close behind ${s}.`,
      },
      {
        label: "Zoom in",
        prompt: (s) =>
          `The camera slowly pushes in toward ${s} until it fills the frame in a close shot.`,
      },
      {
        label: "Zoom out",
        prompt: (s) =>
          `The camera slowly pulls back from ${s} into a wide shot that takes in the surroundings.`,
      },
      {
        label: "Orbit left",
        prompt: (s) =>
          `The camera slowly orbits to the left around ${s}, keeping it centered as the background slides past.`,
      },
      {
        label: "Orbit right",
        prompt: (s) =>
          `The camera slowly orbits to the right around ${s}, keeping it centered as the background slides past.`,
      },
      {
        label: "Aerial sweep",
        prompt: () =>
          "The camera rises high above the scene and sweeps forward in a wide aerial shot, the whole environment spreading out below.",
      },
    ],
  },
  {
    id: "weather",
    name: "Weather",
    actions: [
      {
        label: "More rain",
        condition: {
          group: "rain",
          text: "Heavy rain pours down across the whole scene.",
        },
        prompt: () =>
          "The rain grows into a heavy downpour, thick sheets of water streaking through the air and splashing off every surface.",
      },
      {
        label: "Less rain",
        condition: {
          group: "rain",
          text: "Only a light drizzle falls.",
        },
        prompt: () =>
          "The rain thins to a light drizzle and the air clears, wet surfaces glistening as the clouds begin to lift.",
      },
      {
        label: "Lightning",
        prompt: () =>
          "A jagged bolt of lightning splits the sky and floods the whole scene with a brilliant white flash.",
      },
      {
        label: "← Push fog",
        condition: {
          group: "fog",
          text: "Thick fog drifts through the scene, softening the lights.",
        },
        prompt: () =>
          "A thick bank of fog rolls across the scene from right to left, softening the lights and swallowing distant shapes.",
      },
      {
        label: "Push fog →",
        condition: {
          group: "fog",
          text: "Thick fog drifts through the scene, softening the lights.",
        },
        prompt: () =>
          "A thick bank of fog rolls across the scene from left to right, softening the lights and swallowing distant shapes.",
      },
      {
        label: "Clear the air",
        condition: {
          group: "fog",
          text: null,
        },
        prompt: () =>
          "The fog and haze thin out and drift away, leaving the air clear and distant shapes sharp.",
      },
    ],
  },
  {
    id: "movement",
    name: "Movement",
    actions: [
      {
        label: "← Head left",
        prompt: (s) =>
          `${cap(s)} turns to the left and keeps moving, curving steadily leftward across the scene.`,
      },
      {
        label: "Head right →",
        prompt: (s) =>
          `${cap(s)} turns to the right and keeps moving, curving steadily rightward across the scene.`,
      },
      {
        label: "↑ Climb",
        prompt: (s) =>
          `${cap(s)} angles upward and climbs steadily higher above the scene.`,
      },
      {
        label: "↓ Descend",
        prompt: (s) =>
          `${cap(s)} angles downward and descends steadily lower toward the ground.`,
      },
      {
        label: "Stop",
        prompt: (s) =>
          `${cap(s)} slows to a complete stop and holds its position.`,
      },
      {
        label: "Go to doorway",
        prompt: (s) =>
          `${cap(s)} moves toward the nearest doorway and passes through it.`,
      },
      {
        label: "Scatter crowd",
        prompt: () =>
          "The crowd suddenly scatters, people running outward in every direction and leaving the middle of the scene empty.",
      },
    ],
  },
  {
    id: "events",
    name: "Events",
    actions: [
      {
        label: "Explosion",
        prompt: () =>
          "A huge explosion erupts in the middle of the scene, a fireball billowing upward as debris and smoke burst outward.",
      },
      {
        label: "← Building fire",
        condition: {
          group: "fire-left",
          text: "The building on the left is on fire, smoke pouring from its windows.",
        },
        prompt: () =>
          "The building on the left side of the scene catches fire, flames climbing its facade as smoke pours from the windows.",
      },
      {
        label: "Building fire →",
        condition: {
          group: "fire-right",
          text: "The building on the right is on fire, smoke pouring from its windows.",
        },
        prompt: () =>
          "The building on the right side of the scene catches fire, flames climbing its facade as smoke pours from the windows.",
      },
      {
        label: "Halt conflict",
        prompt: () =>
          "The fighting stops; everyone freezes in place and lowers their weapons as the smoke slowly drifts away.",
      },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    actions: [
      {
        label: "Sunrise",
        condition: {
          group: "time",
          text: "It is now bright daytime, warm sunlight across the whole scene.",
        },
        prompt: () =>
          "The sun rises above the horizon and the sky brightens to clear daylight, warm light spreading across the whole scene.",
      },
      {
        label: "Nightfall",
        condition: {
          group: "time",
          text: "It is now night under a deep blue sky, the scene lit by artificial lights.",
        },
        prompt: () =>
          "The sun sinks below the horizon and the sky darkens into night, lights flickering on across the scene under a deep blue sky.",
      },
      {
        label: "← Spotlight",
        prompt: () =>
          "A bright spotlight beam swings across to the left side of the scene, casting long shadows that stretch toward the right.",
      },
      {
        label: "Spotlight →",
        prompt: () =>
          "A bright spotlight beam swings across to the right side of the scene, casting long shadows that stretch toward the left.",
      },
    ],
  },
  {
    id: "story",
    name: "Story",
    actions: [
      {
        label: "← Left path",
        prompt: (s) =>
          `${cap(s)} turns and takes the path leading off to the left, heading away in that direction.`,
      },
      {
        label: "Right path →",
        prompt: (s) =>
          `${cap(s)} turns and takes the path leading off to the right, heading away in that direction.`,
      },
      {
        label: "Stay",
        prompt: (s) =>
          `${cap(s)} stops and stays exactly where it is, waiting and watching the surroundings.`,
      },
      {
        label: "Leave",
        prompt: (s) =>
          `${cap(s)} turns away and leaves, moving off into the distance until it is out of sight.`,
      },
      {
        label: "Encounter",
        prompt: (s) =>
          `Another figure approaches ${s} and the two come face to face, stopping an arm's length apart.`,
      },
    ],
  },
  {
    id: "world",
    name: "World",
    actions: [
      {
        label: "Raise buildings",
        condition: {
          group: "skyline",
          text: "The buildings are now extremely tall, towering high into the sky.",
        },
        prompt: () =>
          "New towers push up out of the ground and the existing buildings grow taller, rising high into the sky.",
      },
      {
        label: "Sink buildings",
        condition: {
          group: "skyline",
          text: "The buildings are now low, leaving an open landscape.",
        },
        prompt: () =>
          "The buildings sink slowly down into the ground, leaving a low, open landscape.",
      },
      {
        label: "← Move objects",
        prompt: () =>
          "The large objects in the foreground slide smoothly across the ground to the left side of the scene.",
      },
      {
        label: "Move objects →",
        prompt: () =>
          "The large objects in the foreground slide smoothly across the ground to the right side of the scene.",
      },
      {
        label: "Open passage",
        prompt: () =>
          "The structures in the middle of the scene slide apart to either side, opening a wide passage straight ahead.",
      },
      {
        label: "Overgrow",
        condition: {
          group: "nature",
          text: "Vines, moss, and trees cover every surface.",
        },
        prompt: () =>
          "Vines, moss, and trees spread rapidly over every surface, the environment turning green and overgrown.",
      },
    ],
  },
  {
    id: "intensity",
    name: "Intensity",
    actions: [
      {
        label: "Raise tension",
        prompt: (s) =>
          `The light dims and shadows deepen as the wind picks up; ${s} tenses and moves faster, glancing around warily.`,
      },
      {
        label: "Focus on character",
        prompt: (s) =>
          `The camera pushes in to a tight close-up on ${s}, the background falling into a soft blur.`,
      },
      {
        label: "De-escalate",
        prompt: (s) =>
          `The camera pulls back to a wide shot as the light softens and the wind dies down; ${s} relaxes and slows to a calm, easy pace.`,
      },
    ],
  },
];

/** "red biplane" -> "the red biplane"; empty -> "the main subject". */
export function subjectPhrase(subject: string) {
  const name = subject.trim() || "main subject";
  return /^(the|a|an)\s/i.test(name) ? name : `the ${name}`;
}
