import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { DirectorTurn, PlayerAction, Scenario, StoryState } from "@/lib/story";

// Director turns are cached as Markdown files, one per branch of the story.
// A branch is the film plus the exact run of choices that led to this point,
// so replaying the same choices skips the model call entirely.
//
// The file name carries the branch in words and a short hash. The hash covers
// the story state, the action and the director's instructions, so a changed
// rule or a different history never reuses a stale turn.

const CACHE_ROOT = path.join(process.cwd(), "director-cache");

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "action";

export function cachePathFor(
  scenario: Scenario,
  instructions: string,
  state: StoryState,
  action: PlayerAction,
) {
  const hash = createHash("sha256")
    .update(JSON.stringify([scenario.id, instructions, state, action]))
    .digest("hex")
    .slice(0, 12);
  const branch = [...state.decisions, action.label];
  // Keep names short: the turn number, the latest choice, then the hash.
  const name = `turn-${String(state.turn + 1).padStart(2, "0")}-${slug(action.label)}-${hash}.md`;
  return { file: path.join(CACHE_ROOT, scenario.id, name), branch, hash };
}

export async function readCachedTurn(file: string) {
  try {
    const text = await fs.readFile(file, "utf8");
    const match = text.match(/```json\n([\s\S]*?)\n```\s*$/);
    if (!match) return null;
    return JSON.parse(match[1]) as DirectorTurn;
  } catch {
    // Missing or unreadable: treat as not cached.
    return null;
  }
}

export async function writeCachedTurn(
  file: string,
  scenario: Scenario,
  branch: string[],
  turn: DirectorTurn,
) {
  const lines = [
    `# ${scenario.name}: ${branch[branch.length - 1]}`,
    "",
    `- Film: ${scenario.name} (\`${scenario.id}\`)`,
    `- Branch: ${branch.join(" → ")}`,
    `- Cached: ${new Date().toISOString()}`,
    "",
    "Delete this file to have the director write this turn again.",
    "",
    "## What happens",
    "",
    turn.narration,
    "",
    `Story purpose: ${turn.storyPurpose}`,
    "",
    "## Dialogue",
    "",
    ...(turn.dialogue.length
      ? turn.dialogue.map((entry) => `- **${entry.speaker}:** ${entry.line}`)
      : ["(none)"]),
    "",
    "## Orbis prompts",
    "",
    `Change: ${turn.transitionPrompt}`,
    "",
    `Hand-back: ${turn.holdPrompt}`,
    "",
    "## Next choices",
    "",
    ...Object.entries(turn.actions).flatMap(([category, options]) =>
      options.map((option) => `- ${category}: ${option.label}`),
    ),
    "",
    "## Data",
    "",
    "```json",
    JSON.stringify(turn, null, 2),
    "```",
    "",
  ];
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, lines.join("\n"));
  } catch (caught) {
    // A failed write only costs speed next time.
    console.error("Could not write the director cache", caught);
  }
}
