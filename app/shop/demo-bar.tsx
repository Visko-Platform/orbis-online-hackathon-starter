import Link from "next/link";

import { getStory, withStory } from "@/lib/shop";

/** Presenter bar: where we are in the directed Lifecast story. */
export function DemoBar({ story, here }: { story?: string; here: string }) {
  const s = getStory(story);
  const step = Math.max(0, s.steps.findIndex((x) => x.href === here));
  const next = s.steps[step + 1];
  return (
    <div className="demo-bar">
      <span className="demo-tag">
        Lifecast · {s.emoji} {s.name}
      </span>
      {s.steps.map((x, i) => (
        <Link key={x.href} href={withStory(x.href, s.id)} className={i === step ? "on" : i < step ? "done" : ""}>
          {i + 1}. {x.label}
        </Link>
      ))}
      <span className="demo-hint">{s.steps[step]?.hint}</span>
      {next && (
        <Link className="demo-next" href={withStory(next.href, s.id)}>
          Next: {next.label} →
        </Link>
      )}
    </div>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
