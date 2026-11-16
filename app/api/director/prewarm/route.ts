import { NextResponse } from "next/server";

import { SCENARIOS } from "@/lib/scenarios";
import {
  ACTION_CATEGORIES,
  type ActionMenu,
  type DirectorTurn,
  type Scenario,
  type StoryState,
  nextStory,
} from "@/lib/story";

// Fills the director cache ahead of time by playing every choice from the
// start of each film, down to a given number of turns. Each turn goes through
// the normal /api/director route, which writes it to director-cache/.
//
//   curl -X POST localhost:3000/api/director/prewarm \
//     -H 'Content-Type: application/json' -d '{"depth": 2}'
//
// Depth 1 is 6 turns per film, depth 2 is 42, depth 3 is 258. Turns that are
// already cached cost nothing, so it is safe to run again.

const MAX_DEPTH = 3;
const CONCURRENCY = 6;

type Node = { state: StoryState; actions: ActionMenu };

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Cache warming is only available in development" },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    depth?: unknown;
    scenario?: unknown;
  } | null;
  const depth = Math.min(MAX_DEPTH, Math.max(1, Number(body?.depth) || 1));
  const films = SCENARIOS.filter(
    (scenario) => !body?.scenario || scenario.id === body.scenario,
  );
  const directorUrl = new URL("/api/director", request.url);

  const summary = { generated: 0, alreadyCached: 0, failed: 0 };
  const failures: string[] = [];

  const play = async (
    scenario: Scenario,
    node: Node,
    category: (typeof ACTION_CATEGORIES)[number]["id"],
    index: number,
  ): Promise<Node | null> => {
    const option = node.actions[category][index];
    // Same shape and field order as the page sends.
    const action = { category, ...option };
    try {
      const response = await fetch(directorUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: node.state,
          action,
          scenario: scenario.id,
        }),
      });
      const result = (await response.json()) as DirectorTurn & {
        cached?: boolean;
        error?: string;
      };
      if (!response.ok || !result.scenePrompt) {
        throw new Error(result.error || `status ${response.status}`);
      }
      if (result.cached) summary.alreadyCached += 1;
      else summary.generated += 1;
      console.log(
        `[prewarm] ${scenario.id} turn ${node.state.turn + 1}: ${[...node.state.decisions, option.label].join(" → ")}${result.cached ? " (cached)" : ""}`,
      );
      return {
        state: nextStory(node.state, result, option.label),
        actions: result.actions,
      };
    } catch (caught) {
      summary.failed += 1;
      failures.push(
        `${scenario.id}: ${[...node.state.decisions, option.label].join(" → ")}: ${
          caught instanceof Error ? caught.message : String(caught)
        }`,
      );
      return null;
    }
  };

  for (const scenario of films) {
    let frontier: Node[] = [
      { state: scenario.initialStory, actions: scenario.initialActions },
    ];
    for (let level = 0; level < depth; level += 1) {
      const jobs = frontier.flatMap((node) =>
        ACTION_CATEGORIES.flatMap(({ id }) =>
          node.actions[id].map((_, index) => () => play(scenario, node, id, index)),
        ),
      );
      const next: Node[] = [];
      let cursor = 0;
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, async () => {
          while (cursor < jobs.length) {
            const job = jobs[cursor];
            cursor += 1;
            const node = await job();
            if (node) next.push(node);
          }
        }),
      );
      frontier = next;
    }
  }

  return NextResponse.json({ depth, ...summary, failures });
}
