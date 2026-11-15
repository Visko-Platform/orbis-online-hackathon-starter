import Link from "next/link";

import { Crumbs, I, Shell, Stars, StoreFooter, StoreHeader } from "@/app/shop/chrome";
import { DemoBar, JsonLd } from "@/app/shop/demo-bar";
import { brandOf, PRODUCTS, type ShopItem, SITE, withStory } from "@/lib/shop";

const NOUN: Record<string, string> = { "glacier-jacket": "jacket", "tidal-wetsuit": "wetsuit", "seafoam-egg": "surfboard", "camel-trench": "coat" };

/** A page control that also steers the live Lifecast video (the extension forwards the click). */
function LiveBtn({ prompt, label, className, children }: { prompt: string; label: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={`live-btn ${className ?? ""}`} data-lifecast-prompt={prompt} data-lifecast-label={label}>
      {children}
    </button>
  );
}

const money = (p?: string, cents = true) =>
  p ? `$${Number(p).toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}` : "";

/** Product / destination / home listing page with the structured data the extension reads. */
export function ItemPage({ item, here, story }: { item: ShopItem; here: string; story?: string }) {
  const ld =
    item.kind === "apparel"
      ? {
          "@type": "Product", name: item.name, brand: { "@type": "Brand", name: item.brand }, category: item.crumbs,
          offers: { "@type": "Offer", price: item.price, priceCurrency: "USD", availability: "https://schema.org/InStock" },
          ...(item.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: item.rating, reviewCount: item.reviews } } : {}),
        }
      : item.kind === "travel"
        ? { "@type": item.id === "powder-peak" ? "SkiResort" : "TouristDestination", name: item.name, amenityFeature: item.bullets }
        : {
            "@type": ["RealEstateListing", item.id === "alpine-chalet" ? "SingleFamilyResidence" : "Apartment"], name: item.name, numberOfBedrooms: item.home?.beds ?? 2,
            floorSize: { "@type": "QuantitativeValue", value: item.home?.sqft ?? 1480, unitCode: "FTK" },
            offers: { "@type": "Offer", price: item.price, priceCurrency: "USD" },
          };
  return (
    <>
      <DemoBar story={story} here={here} />
      {item.kind === "apparel" ? <ApparelPage item={item} story={story} /> : item.kind === "travel" ? <StayPage item={item} /> : <HomePage item={item} />}
      <JsonLd data={{ "@context": "https://schema.org", ...ld, description: item.description, image: [`${SITE}${item.image}`] }} />
    </>
  );
}

function ApparelPage({ item, story }: { item: ShopItem; story?: string }) {
  const brand = brandOf(item.brand);
  const related = (item.related ?? []).map((id) => PRODUCTS.find((p) => p.id === id)).filter((p): p is ShopItem => !!p);
  return (
    <Shell theme={brand.theme}>
      <StoreHeader brand={brand} />
      <Crumbs items={["Home", ...item.crumbs.split(" · ")]} />
      <main className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-thumbs">
            {[item.image, ...(item.alt ?? [])].map((src, i) => (
              <img key={src} src={src} alt="" className={i === 0 ? "on" : ""} />
            ))}
          </div>
          <div className="pdp-main">
            <img src={item.image} alt={item.name} />
            <span className="pdp-badge">{item.brand === "Fold & Field" ? "New season" : "Best seller"}</span>
          </div>
        </div>
        <section className="pdp-info">
          <p className="pdp-brand">{item.brand}</p>
          <h1>{item.name}</h1>
          {item.rating && <Stars rating={item.rating} reviews={item.reviews} />}
          <p className="pdp-price">{money(item.price)}</p>
          <p className="pdp-klarna">or 4 interest-free payments of {money(String(Number(item.price) / 4))}</p>
          {item.colors && (
            <div className="opt">
              <span className="opt-label">
                Color: <b>{item.colors[0].name}</b>
              </span>
              <div className="swatches">
                {item.colors.map((c, i) => (
                  <span
                    key={c.name}
                    className={`swatch ${i === 0 ? "on" : ""}`}
                    style={{ background: c.hex }}
                    title={c.name}
                    data-lifecast-prompt={`The person's ${NOUN[item.id] ?? "outfit"} changes color to ${c.name.toLowerCase()}.`}
                    data-lifecast-label={`${c.name} ${NOUN[item.id] ?? ""}`.trim()}
                  />
                ))}
              </div>
            </div>
          )}
          {item.sizes && (
            <div className="opt">
              <span className="opt-label">
                Size <a className="size-guide">Size guide</a>
              </span>
              <div className="size-grid">
                {item.sizes.map((sz, i) => (
                  <span key={sz} className={i === 2 ? "on" : i === item.sizes!.length - 1 ? "out" : ""}>
                    {sz}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="pdp-actions">
            <button className="buy">Add to bag</button>
            <button className="wish" aria-label="Save">
              <I name="heart" />
            </button>
          </div>
          <ul className="perks">
            <li>
              <I name="truck" /> Free shipping, arrives Tue, Nov 18
            </li>
            <li>
              <I name="return" /> Free returns within 60 days
            </li>
            <li>
              <I name="pin" /> In stock at 3 stores near you
            </li>
          </ul>
          <p className="pdp-desc">{item.description}</p>
          {(item.sections ?? [{ title: "Highlights", items: item.bullets }]).map((sec, i) => (
            <details key={sec.title} className="acc" open={i === 0}>
              <summary>{sec.title}</summary>
              <ul>
                {sec.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </details>
          ))}
        </section>
      </main>
      {related.length > 0 && (
        <section className="related">
          <h2>You may also like</h2>
          <div className="related-row">
            {related.map((r) => (
              <Link key={r.id} href={story ? withStory(`/shop/p/${r.id}`, story) : `/shop/p/${r.id}`} className="related-card">
                <img src={r.image} alt="" />
                <span className="r-brand">{r.brand}</span>
                <span className="r-name">{r.name}</span>
                <b>{money(r.price)}</b>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="reviews">
        <h2>Reviews</h2>
        {item.rating && <Stars rating={item.rating} reviews={item.reviews} />}
        <div className="review-list">
          {[
            ["Worth every penny", "Fits true to size and looks even better in person. Used it all last season."],
            ["Great quality", "Well made, warm, and the color is exactly like the photos."],
          ].map(([t, b]) => (
            <article key={t}>
              <Stars rating={5} />
              <h4>{t}</h4>
              <p>{b}</p>
              <span className="verified">Verified buyer</span>
            </article>
          ))}
        </div>
      </section>
      <StoreFooter brand={brand} />
    </Shell>
  );
}

function StayPage({ item }: { item: ShopItem }) {
  const brand = brandOf(item.brand);
  const peak = item.id === "powder-peak";
  const stats = peak
    ? [['18"', "24-hr snow"], ["112", "runs open"], ["9 / 9", "lifts"], ["24°F", "summit temp"]]
    : [["4–5 ft", "surf"], ["Offshore", "wind until noon"], ["61°F", "water"], ["6:52 pm", "sunset"]];
  const offers = peak
    ? [["1-Day Lift Ticket", "from $139", "Save 25% when you buy 7+ days ahead"], ["3-Day Pass", "from $389", "Any 3 days this season"], ["Ski-in Lodge", "from $249/night", "Steps from the gondola"]]
    : [["Beach Cottage", "from $189/night", "Two blocks to the break"], ["Surf Lesson", "$85 / 2 hrs", "Boards & suits included"], ["Board Rental", "$35 / day", "Soft tops to performance boards"]];
  return (
    <Shell theme={brand.theme}>
      <StoreHeader brand={brand} cart={false} />
      <section className="stay-hero" style={{ backgroundImage: `url(${item.image})` }}>
        <div className="stay-hero-text">
          <p className="kicker">{peak ? "Winter 2026/27" : "Swell season is on"}</p>
          <h1>{peak ? "Powder Peak Resort" : "Swell Bay"}</h1>
          <p>{peak ? "3,400 vertical feet of powder, groomers and glades." : "Clean peeling waves, salty mornings, golden evenings."}</p>
          <button className="buy">{peak ? "Buy lift tickets" : "Plan your trip"}</button>
        </div>
        <div className="conditions">
          <div className="live-row">
            <span>Live conditions</span>
            {(peak
              ? [["Bluebird", "The sky clears to deep blue and bright sunshine sparkles on the snow."], ["Snowstorm", "Heavy snow begins falling, with big flakes swirling through the air."], ["Golden hour", "The light turns warm golden hour with long shadows across the snow."], ["Night", "Night falls and floodlights light up the slopes."]]
              : [["Glassy", "The ocean turns glassy and calm with clean small waves."], ["Big swell", "Bigger waves roll in and break with white spray."], ["Sunset", "The sky turns into a glowing orange sunset over the water."], ["Fog", "A soft coastal fog rolls in over the beach."]]
            ).map(([l, p]) => (
              <LiveBtn key={l} prompt={p} label={l}>
                {l}
              </LiveBtn>
            ))}
          </div>
          <h3>{peak ? "Snow report" : "Surf report"} · today</h3>
          <div className="cond-grid">
            {stats.map(([v, l]) => (
              <div key={l}>
                <b>{v}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <main className="stay-main">
        <section className="stay-intro">
          <h2>{item.name}</h2>
          <p>{item.description}</p>
        </section>
        <section className="offer-row">
          {offers.map(([t, p, d]) => (
            <article key={t} className="offer">
              <h3>{t}</h3>
              <b>{p}</b>
              <p>{d}</p>
              <a className="offer-link">{peak ? "Book now →" : "Reserve →"}</a>
            </article>
          ))}
        </section>
        <section className="stay-info">
          <div>
            <h3>Getting here</h3>
            <p>{peak ? "2.5 hours from the city via the mountain highway; chains or AWD required during storms." : "Scenic coastal highway, 90 minutes from downtown. Free beach parking before 9 am."}</p>
          </div>
          <div>
            <h3>{peak ? "Mountain info" : "Good to know"}</h3>
            <ul>
              {item.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <StoreFooter brand={brand} cols={{ Plan: ["Lodging", "Getting here", "Deals", "Groups"], Explore: peak ? ["Trail map", "Terrain parks", "Village"] : ["Surf spots", "Boardwalk", "Tide chart"], Info: ["Contact", "Accessibility", "Careers"] }} />
    </Shell>
  );
}

function HomePage({ item }: { item: ShopItem }) {
  const brand = brandOf(item.brand);
  const price = Number(item.price);
  const monthly = Math.round(((price * 0.8 * (0.0675 / 12)) / (1 - Math.pow(1 + 0.0675 / 12, -360)) + 540 + (price * 0.011) / 12) / 10) * 10;
  return (
    <Shell theme={brand.theme}>
      <StoreHeader brand={brand} cart={false} />
      <div className="listing-search">
        <span className="search-box wide">
          <I name="search" /> <span>Downtown, Harbor District, 94107</span>
        </span>
        {["For sale", "Price", "Beds & baths", "Home type", "More"].map((f) => (
          <span key={f} className="pill">{f} ▾</span>
        ))}
      </div>
      <main className="listing">
        <div className="mosaic">
          <img className="m-main" src={item.image} alt={item.name} />
          {(item.alt ?? []).map((src) => (
            <img key={src} src={src} alt="" />
          ))}
          <span className="photo-count">See all 24 photos</span>
        </div>
        <div className="listing-body">
          <section>
            <span className="status-dot">● For sale</span>
            <div className="listing-price">{money(item.price, false)}</div>
            <div className="facts">
              <span><b>{item.home?.beds ?? 2}</b> bd</span>
              <span><b>{item.home?.baths ?? 2}</b> ba</span>
              <span><b>{(item.home?.sqft ?? 1480).toLocaleString("en-US")}</b> sqft</span>
            </div>
            <p className="address">{item.home?.address ?? "410 Harbor St #5B, Downtown Harbor District"}</p>
            <p className="est">Est. payment: <b>${monthly.toLocaleString("en-US")}/mo</b> · <a>Get pre-qualified</a></p>
            <div className="live-row light">
              <span>Try a look</span>
              {[
                ["Scandinavian", "The furniture changes to light oak Scandinavian pieces with linen and plants."],
                ["Japandi", "The furniture changes to low Japandi pieces in natural wood with paper lamps."],
                ["Industrial", "The furniture changes to black steel and leather industrial pieces."],
                ["Evening", "Daylight fades to evening and warm lamps glow throughout the room."],
              ].map(([l, p]) => (
                <LiveBtn key={l} prompt={p} label={l}>
                  {l}
                </LiveBtn>
              ))}
            </div>
            <div className="chips">
              {(item.home?.chips ?? ["Condo/loft", "Built 1912 (converted 2019)", "HOA $540/mo", "Garage + EV charger", "$605/sqft", "Listed 3 days ago"]).map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <h2>What&apos;s special</h2>
            <p>{item.description}</p>
            <h2>Facts &amp; features</h2>
            <div className="feature-grid">
              {[["Interior", ["14 ft timber-beam ceilings", "Exposed brick", "Polished concrete floors"]], ["Kitchen", ["Butcher-block island", "Gas range", "Open shelving"]], ["Parking", ["1 deeded garage space", "Level 2 EV charger"]], ["Building", ["Elevator", "Roof deck", "Bike room"]]].map(
                ([t, xs]) => (
                  <div key={t as string}>
                    <h4>{t as string}</h4>
                    <ul>
                      {(xs as string[]).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          </section>
          <aside className="agent-card">
            <div className="agent">
              <span className="avatar">MR</span>
              <div>
                <b>Maya Reyes</b>
                <span>Harbor &amp; Main Realty · Listing agent</span>
              </div>
            </div>
            <button className="buy">Request a tour</button>
            <button className="ghost">Contact agent</button>
            <div className="tour-days">
              {["Sat 15", "Sun 16", "Mon 17", "Tue 18"].map((d, i) => (
                <span key={d} className={i === 0 ? "on" : ""}>{d}</span>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <StoreFooter brand={brand} cols={{ Explore: ["Homes for sale", "New listings", "Open houses"], Tools: ["Mortgage calculator", "Affordability", "Home value"], Company: ["About", "Agents", "Careers"] }} />
    </Shell>
  );
}

export function itemMetadata(item: ShopItem) {
  return {
    title: `${item.name} | ${item.brand}`,
    description: item.description,
    openGraph: { title: item.name, description: item.description, siteName: item.brand, images: [item.image], type: "website" as const },
  };
}
