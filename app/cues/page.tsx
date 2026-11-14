import type { Metadata } from "next";
import Link from "next/link";

import { CueStudio } from "@/components/cue-studio";

export const metadata: Metadata = {
  title: "Orbis cue progression",
  description: "Queue images and move a live Orbis shot through them.",
};

export default function CuesPage() {
  return (
    <main>
      <header>
        <Link className="eyebrow" href="/">
          ← Orbis starter
        </Link>
        <h1>Cue progression</h1>
        <p>
          Queue images in order. The first opens a live Orbis shot; fire each
          next one to morph the shot toward it, or cut to it exactly.
        </p>
      </header>
      <CueStudio />
    </main>
  );
}
