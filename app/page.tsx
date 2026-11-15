import Link from "next/link";

import { DEMOS } from "@/lib/demos";

export default function Home() {
  return (
    <main className="landing">
      <header>
        <p className="eyebrow">Visko Orbis · live, steerable video</p>
        <h1>Direct the ad while it plays.</h1>
        <p className="lede">
          A high-resolution hero still, a frontier image model that writes the shot list, and Orbis
          turning each shot into live video you can steer, swap, and export.
        </p>
      </header>
      <Link href="/omni" className="demo-card omni-card-link" style={{ ["--accent" as string]: "#ff6a3d", marginBottom: 20 }}>
        <div className="card-body">
          <span className="industry">The product · Chrome extension</span>
          <h2>Lifecast</h2>
          <p>
            Try it on before you buy anything, from that ski jacket to your dream house. Lifecast casts you in a live, steerable video of your life with it, merging your
            shopping trends: the SUV you&apos;re eyeing, on snowy roads, with you in the snowboard jacket you browsed.
          </p>
        </div>
      </Link>
      <div className="demo-cards">
        {DEMOS.map((demo) => (
          <Link key={demo.id} href={`/${demo.id}`} className="demo-card" style={{ ["--accent" as string]: demo.accent }}>
            <div className="card-art">
              <img src={demo.subjects[0]?.src} alt="" />
            </div>
            <div className="card-body">
              <span className="industry">{demo.industry}</span>
              <h2>{demo.title}</h2>
              <p>{demo.tagline}</p>
              <ul>
                {demo.pitch.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>
      <footer>
        <span>Pipeline: Nano Banana Pro hero still → shot list → Orbis cut / morph → export</span>
        <Link href="/starter">Original starter</Link>
      </footer>
    </main>
  );
}
