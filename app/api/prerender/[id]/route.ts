import { NextResponse } from "next/server";

import { isRunning, parseCombo, readManifest, startPrerender } from "@/lib/server/prerender";
import { resolveDemo } from "@/lib/server/registry";

export const runtime = "nodejs";

// GET: pre-render status + URLs for a demo id (static demo id or Lifecast plan id).
// Starts the job lazily if nothing exists yet (?start=0 to only peek).
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const combo = parseCombo(id);
  const demo = resolveDemo(combo ? combo.demoId : id);
  const valid =
    !combo ||
    (demo?.subjects.some((x) => x.id === combo.subjectId) && combo.optionIds.every((o) => demo?.options.some((x) => x.id === o)));
  if (!valid) return NextResponse.json({ id, status: "unknown", shots: {} });
  let m = await readManifest(id);
  const peek = new URL(request.url).searchParams.get("start") === "0";
  if (demo && !peek && (!m || m.status === "error") && !isRunning(id)) {
    startPrerender(id, demo, combo ?? undefined);
    m = m ?? (await readManifest(id));
  }
  if (!m) return NextResponse.json({ id, status: demo ? "queued" : "unknown", shots: {} }, { headers: { "Cache-Control": "no-store" } });
  const url = (f: string) => `/api/prerender/${id}/${f}`;
  return NextResponse.json(
    {
      id,
      status: isRunning(id) && m.status !== "done" ? "running" : m.status,
      subjectId: m.subjectId,
      optionIds: m.optionIds,
      hero: m.hero ? { url: url(m.hero.file), model: m.hero.model, prompt: m.hero.prompt } : undefined,
      shots: Object.fromEntries(Object.entries(m.shots).map(([k, v]) => [k, { url: url(v.file), model: v.model, cutPrompt: v.cutPrompt }])),
      total: m.total,
      errors: m.errors,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
