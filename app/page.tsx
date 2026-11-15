import { Cormorant_Garamond } from "next/font/google";

import { CrownGame } from "@/components/crown-game";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--serif",
});

export default function Home() {
  return (
    <main className={`crown-page ${serif.variable}`}>
      <CrownGame />
    </main>
  );
}
