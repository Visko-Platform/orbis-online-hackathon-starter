import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";

import { StarshipWindow } from "@/components/starship-window";

import "./window.css";

const hud = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hud",
});

export const metadata: Metadata = {
  title: "Starship Window",
  description: "Pick a destination, warp, and arrive at a live Orbis world.",
};

export default function WindowPage() {
  return (
    <div className={hud.variable}>
      <StarshipWindow />
    </div>
  );
}
