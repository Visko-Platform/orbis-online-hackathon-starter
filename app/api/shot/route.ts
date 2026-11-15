import { NextResponse } from "next/server";

import { resolveDemo } from "@/lib/server/registry";
import { profile } from "@/lib/server/profile";
import { renderShot } from "@/lib/server/render";

export const runtime = "nodejs";
export const maxDuration = 120;

// POST multipart: demoId, hero (File), shotId OR instruction, fast ("1" = flash model)
// Generates a new angle / scenario of the hero still with the frontier image model.
export async function POST(request: Request) {
  const done = profile("api.shot");
  const form = await request.formData();
  const demo = resolveDemo(String(form.get("demoId") ?? ""));
  const hero = form.get("hero");
  if (!demo || !(hero instanceof File) || !hero.type.startsWith("image/")) {
    return NextResponse.json({ error: "demoId and hero image are required" }, { status: 400 });
  }

  const shot = demo.shots.find((s) => s.id === form.get("shotId"));
  const instruction = shot?.instruction ?? String(form.get("instruction") ?? "").trim();
  if (!instruction) {
    return NextResponse.json({ error: "A shot or instruction is required" }, { status: 400 });
  }
  const fast = form.get("fast") === "1";

  try {
    const out = await renderShot(demo, { buf: Buffer.from(await hero.arrayBuffer()), mime: hero.type || "image/jpeg" }, instruction, fast);
    done({ demo: demo.id, shot: shot?.id ?? "custom", model: out.model });
    return new Response(new Uint8Array(out.data), {
      headers: {
        "Content-Type": out.mimeType,
        "Cache-Control": "no-store",
        "X-Image-Model": out.model,
      },
    });
  } catch (caught) {
    console.error("shot generation failed", caught);
    done({ ok: false, demo: demo.id, shot: shot?.id ?? "custom" });
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Shot generation failed" },
      { status: 502 },
    );
  }
}
