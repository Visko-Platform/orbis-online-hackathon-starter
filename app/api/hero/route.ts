import { NextResponse } from "next/server";

import { resolveDemo } from "@/lib/server/registry";
import { profile } from "@/lib/server/profile";
import { renderHero } from "@/lib/server/render";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 12 * 1024 * 1024;

// POST multipart: demoId, subject (File), optionIds (comma list), optionImages (Files, optional)
// Returns the high-resolution hero still (16:9) as an image body.
export async function POST(request: Request) {
  const done = profile("api.hero");
  const form = await request.formData();
  const demo = resolveDemo(String(form.get("demoId") ?? ""));
  if (!demo) return NextResponse.json({ error: "Unknown demo" }, { status: 400 });

  const subject = form.get("subject");
  const subjectText = String(form.get("subjectText") ?? "").trim().slice(0, 120);
  const hasSubject = subject instanceof File && subject.type.startsWith("image/") && subject.size <= MAX_BYTES;
  if (!hasSubject && !(subjectText && demo.subjectFromText)) {
    return NextResponse.json({ error: "A subject image (max 12 MB) is required" }, { status: 400 });
  }

  const optionIds = String(form.get("optionIds") ?? "").split(",").filter(Boolean);
  const optionFiles = form
    .getAll("optionImages")
    .filter((f): f is File => f instanceof File && f.type.startsWith("image/") && f.size <= MAX_BYTES);
  const toAsset = async (f: File) => ({ buf: Buffer.from(await f.arrayBuffer()), mime: f.type || "image/jpeg" });

  try {
    const out = await renderHero(demo, {
      subject: hasSubject ? await toAsset(subject as File) : undefined,
      subjectKind: String(form.get("subjectKind") ?? ""),
      subjectText,
      optionIds,
      optionImages: await Promise.all(optionFiles.map(toAsset)),
      custom: String(form.get("custom") ?? "").trim(),
      fast: form.get("fast") === "1",
    });
    done({ demo: demo.id, model: out.model, kind: hasSubject ? String(form.get("subjectKind") ?? "asset") : "text", options: optionIds.length });
    return new Response(new Uint8Array(out.data), {
      headers: {
        "Content-Type": out.mimeType,
        "Cache-Control": "no-store",
        "X-Image-Model": out.model,
      },
    });
  } catch (caught) {
    console.error("hero generation failed", caught);
    done({ ok: false, demo: demo.id });
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Hero generation failed" },
      { status: 502 },
    );
  }
}
