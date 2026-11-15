import { NextResponse } from "next/server";

import { resolveDemo } from "@/lib/server/registry";
import {
  CHANGE_SYSTEM,
  fileToPart,
  generateText,
  OPENING_SYSTEM,
  SHOT_STEER_SYSTEM,
} from "@/lib/server/gemini";
import { profile } from "@/lib/server/profile";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST multipart:
//   mode = "opening" | "change" | "shot" | "swap"
//   demoId, image (File; required for opening/shot), request (text),
//   scene (current opening prompt), recent (JSON array of recent prompts),
//   optionId (for swap)
export async function POST(request: Request) {
  const done = profile("api.prompt");
  const form = await request.formData();
  const mode = String(form.get("mode") ?? "");
  const demo = resolveDemo(String(form.get("demoId") ?? ""));
  if (!demo) return NextResponse.json({ error: "Unknown demo" }, { status: 400 });

  const image = form.get("image");
  const hasImage = image instanceof File && image.type.startsWith("image/");
  const req = String(form.get("request") ?? "").trim();
  const scene = String(form.get("scene") ?? "").trim();
  let recent: string[] = [];
  try {
    recent = JSON.parse(String(form.get("recent") ?? "[]"));
  } catch {
    recent = [];
  }
  const withRules = (system: string) =>
    demo.directorRules ? `${system}\nScene rules for this demo (always follow): ${demo.directorRules}` : system;
  const context =
    (scene ? `Current scene (opening prompt): ${scene}\n` : "") +
    (recent.length ? `Recent directions, oldest first:\n- ${recent.slice(-4).join("\n- ")}\n` : "");

  try {
    let prompt: string;
    if (mode === "opening") {
      if (!hasImage) throw new Error("opening needs an image");
      prompt = await generateText(withRules(OPENING_SYSTEM), [
        { text: `Requested motion: ${req || demo.openingMotion}` },
        await fileToPart(image),
      ]);
    } else if (mode === "shot") {
      if (!hasImage) throw new Error("shot needs an image");
      prompt = await generateText(withRules(SHOT_STEER_SYSTEM), [
        { text: `${context}${req ? `Intended motion in the new shot: ${req}` : ""}` },
        await fileToPart(image),
      ]);
    } else if (mode === "swap") {
      const option = demo.options.find((o) => o.id === form.get("optionId"));
      if (!option) throw new Error("unknown option");
      const parts = [
        {
          text:
            `${context}The director wants to swap in: ${option.label} (${option.text}).\n` +
            `${demo.swapGuidance}` +
            (hasImage ? "\nThe attached image shows the new product; describe it accurately." : ""),
        },
        ...(hasImage ? [await fileToPart(image)] : []),
      ];
      prompt = await generateText(withRules(CHANGE_SYSTEM), parts);
    } else if (mode === "change") {
      if (!req) throw new Error("change needs a request");
      prompt = await generateText(withRules(CHANGE_SYSTEM), [
        { text: `${context}Director's request: ${req}` },
      ]);
    } else {
      return NextResponse.json({ error: "Unknown mode" }, { status: 400 });
    }
    done({ demo: demo.id, mode, words: prompt.split(/\s+/).length });
    return NextResponse.json({ prompt }, { headers: { "Cache-Control": "no-store" } });
  } catch (caught) {
    console.error("prompt writing failed", caught);
    done({ ok: false, demo: demo.id, mode });
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Prompt writing failed" },
      { status: 502 },
    );
  }
}
