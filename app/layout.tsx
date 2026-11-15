import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./styles.css";
import "./studio.css";
import "./life-sim.css";

export const metadata: Metadata = {
  title: "Orbis Live Ad Studio",
  description: "A Reactor client starter for Visko Orbis Stable.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
