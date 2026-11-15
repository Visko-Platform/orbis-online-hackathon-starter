import Link from "next/link";

import { STORIES, withStory } from "@/lib/shop";

export const metadata = { title: "Lifecast demo storefront" };

export default function ShopIndex() {
  return (
    <main className="shop-main">
      <h1>Lifecast demo stories</h1>
      <p>
        Fictional stores for deterministic demos. Install the Lifecast extension, sign in inside its panel once, clear your
        interests, then follow one story:
      </p>
      <div className="car-grid">
        {STORIES.map((s) => (
          <Link key={s.id} href={withStory(s.steps[0].href, s.id)} className="car-card story-card">
            <h3>
              {s.emoji} {s.name}
            </h3>
            <p>
              <b>{s.persona}.</b> {s.pitch}
            </p>
            <ol>
              {s.steps.map((x) => (
                <li key={x.href}>{x.label}</li>
              ))}
            </ol>
          </Link>
        ))}
      </div>
    </main>
  );
}
