import Link from "next/link";

import { LifecastLogo } from "@/components/lifecast-logo";

import "./pitch.css";

export const metadata = { title: "Lifecast: try it on before you buy anything" };

// Keyframes rendered by the pipeline (Nano Banana Pro) from the demo presets; the live demo renders the same kind of frames of *you*.
const R = (name: string) => `/assets/results/${name}.jpg`;

const STRIP = [
  { src: "/assets/jacket-glacier.jpg", cap: "You open a jacket" },
  { src: R("tryon-glacier-hero"), cap: "…and you're wearing it on the ridge" },
  { src: R("tryon-glacier-carve"), cap: "carving in it" },
  { src: R("drive-suv-aerial"), cap: "…then you browse an SUV: drive up the pass" },
  { src: R("tryon-glacier-air"), cap: "you're riding Powder Peak" },
  { src: R("tryon-glacier-lodge"), cap: "après at the lodge" },
  { src: "/assets/home-alpine-chalet.jpg", cap: "…and your dream house" },
];

const STORIES = [
  { name: "🏂 Powder Day", who: "Weekend snowboarder", path: "Jacket → resort → AWD SUV → alpine chalet", imgs: [R("tryon-glacier-carve"), R("drive-suv-snow"), R("tryon-glacier-air")] },
  { name: "🏄 Surf Escape", who: "Cold-water surfer", path: "Wetsuit + board → surf town → 4x4 pickup", imgs: ["/assets/wetsuit-black.jpg", "/assets/stay-swell-bay.jpg", "/assets/car-pickup.jpg"] },
  { name: "🏙 City Move", who: "Moving downtown", path: "Trench coat → brick loft (move the furniture) → electric coupe", imgs: [R("tryon-trench-street"), R("staging-scandi-hero"), R("staging-scandi-layout-b")] },
];

export default function Pitch() {
  return (
    <div className="pitch">
      <nav className="p-nav">
        <LifecastLogo size={30} />
        <div className="p-nav-links">
          <a href="#how">How it works</a>
          <a href="#stories">Stories</a>
          <Link href="/shop" className="p-btn primary small">▶ Live demo</Link>
        </div>
      </nav>
      <section className="p-hero">
        <div className="p-hero-bg">
          {STRIP.map((s) => (
            <img key={s.src} src={s.src} alt="" />
          ))}
        </div>
        <div className="p-hero-text">
          <div className="p-wordmark">
            <LifecastLogo size={84} live />
          </div>
          <p className="p-eyebrow">Built on Visko Orbis · live, steerable video</p>
          <h1>
            Try it on before you buy anything, <em>from that ski jacket to your dream house.</em>
          </h1>
          <p className="p-lede">
            A Chrome extension that turns whatever you&apos;re shopping for into a <b>live, steerable video of your life with it</b>, starring you. Experience
            the thrill of buying and using stuff, without actually spending any money.
          </p>
          <div className="p-cta">
            <Link href="/shop" className="p-btn primary">▶ Live demo</Link>
            <Link href="/omni" className="p-btn">Open Lifecast</Link>
            <a href="/lifecast-extension.zip" className="p-btn">Get the extension</a>
          </div>
        </div>
      </section>

      <section className="p-strip">
        <h2>From that ski jacket to your dream house: one afternoon you can feel</h2>
        <div className="p-film">
          {STRIP.map((s, i) => (
            <figure key={s.src}>
              <img src={s.src} alt={s.cap} />
              <figcaption>
                <span>{i + 1}</span> {s.cap}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="p-pillars">
        <article>
          <span className="p-tag rt">Realtime</span>
          <h3>You drive it. Live.</h3>
          <ul>
            <li><b>Live 1080p video at 18 fps</b> from Visko Orbis, one continuous session for the whole shopping trip.</li>
            <li><b>Game controls written for each scene</b> (W/A/S/D/Space): surfing gets <i>Paddle · Catch wave</i>, the gondola gets <i>Lean · Wipe glass</i>.</li>
            <li><b>The shopping page is a controller:</b> tap a color swatch, a paint color, &ldquo;See it in snow&rdquo;, and the video changes.</li>
            <li><b>Browse to a new site</b> and the stream hard-cuts to you there.</li>
          </ul>
          <div className="p-stats">
            <div><b>2–3 s</b><span>input → changed frame</span></div>
            <div><b>~5 s</b><span>new site → live scene</span></div>
            <div><b>0.1 s</b><span>cached scene plan</span></div>
          </div>
        </article>
        <article>
          <span className="p-tag cr">Creativity</span>
          <h3>It remembers what you want</h3>
          <ul>
            <li><b>Trend merging:</b> a jacket + a resort + an SUV becomes a road trip to Powder Peak <i>in that jacket</i>.</li>
            <li><b>Journeys</b> cut through the moments that matter: get in, drive, arrive, ride.</li>
            <li><b>Life-sim game mode:</b> quests, XP, a budget wallet with real prices, an inventory of what you browsed, random life events.</li>
            <li>Works for <b>clothes, gear, trips, homes, and cars</b>: one product, every vertical.</li>
          </ul>
        </article>
        <article>
          <span className="p-tag fn">Functionality</span>
          <h3>A real product, end to end</h3>
          <ul>
            <li><b>Chrome extension (MV3)</b> reads any page (JSON-LD, Open Graph, keywords) and keeps a private, local interest history.</li>
            <li><b>Gemini</b> plans the scene and the journey; <b>Nano Banana Pro</b> renders identity-consistent keyframes of you.</li>
            <li><b>Orbis</b> animates every scene from a real image (<code>set_image</code> cuts) and takes text steers for live touches.</li>
            <li>Server-side <b>pre-rendering + cache</b>, so the demo never waits. Telemetry on every step.</li>
          </ul>
        </article>
      </section>

      <section className="p-stories" id="stories">
        <h2>Three shoppers, three lives</h2>
        <div className="p-story-grid">
          {STORIES.map((s) => (
            <article key={s.name}>
              <div className="p-thumbs">
                {s.imgs.map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
              </div>
              <h3>{s.name}</h3>
              <p>
                <b>{s.who}.</b> {s.path}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="p-how" id="how">
        <h2>How it works</h2>
        <div className="p-pipe">
          {[
            ["🛍", "Browse", "Any store, listing, resort, or dealer page"],
            ["🧩", "Read", "Extension extracts the product + your recent interests"],
            ["🧠", "Plan", "Gemini merges trends into a scene and a journey"],
            ["🎨", "Keyframes", "Nano Banana Pro renders you in it, shot by shot"],
            ["🎬", "Live", "Orbis streams it; cuts per scene, steers per input"],
            ["🎮", "Play", "Drive it, game it, export your clip"],
          ].map(([i, t, d]) => (
            <div key={t} className="p-step">
              <span className="p-ico">{i}</span>
              <b>{t}</b>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="p-biz">
        <h2>Every product page becomes a test drive</h2>
        <div className="p-biz-grid">
          <div><b>Retail & gear</b><span>Shoppers see it on themselves, in motion. More confident buys, fewer returns.</span></div>
          <div><b>Real estate</b><span>Walk the listing, move the furniture, live there for a minute.</span></div>
          <div><b>Auto</b><span>Test-drive the car on the roads you actually drive, in any weather.</span></div>
          <div><b>Travel</b><span>Arrive at the resort before you book it.</span></div>
        </div>
        <div className="p-signoff">
          <LifecastLogo size={110} />
        </div>
        <p className="p-mantra">Experience the thrill of buying and using stuff, without actually spending any money.</p>
        <div className="p-cta center">
          <Link href="/shop" className="p-btn primary">▶ Start the live demo</Link>
        </div>
      </section>
      <footer className="p-foot">
        <LifecastLogo size={20} />
        <span>Visko Orbis (live video) · Gemini 3.5 Flash · Nano Banana Pro · Reactor · Chrome MV3</span>
      </footer>
    </div>
  );
}
