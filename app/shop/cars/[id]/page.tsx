import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Crumbs, I, Shell, StoreFooter, StoreHeader } from "@/app/shop/chrome";
import { DemoBar, JsonLd } from "@/app/shop/demo-bar";
import { BRANDS, CARS, SITE } from "@/lib/shop";

export function generateStaticParams() {
  return CARS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const car = CARS.find((c) => c.id === id);
  if (!car) return {};
  return {
    title: `${car.name} | Northline Motors`,
    description: car.description,
    openGraph: { title: car.name, description: car.description, siteName: "Northline Motors", images: [car.image] },
  };
}

export default async function CarPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ story?: string }> }) {
  const { story } = await searchParams;
  const { id } = await params;
  const car = CARS.find((c) => c.id === id);
  if (!car) notFound();
  const brand = BRANDS["Northline Motors"];
  const price = Number(car.price);
  const monthly = Math.round((price * 0.9 * (0.059 / 12)) / (1 - Math.pow(1 + 0.059 / 12, -72)));
  return (
    <>
      <DemoBar story={story} here={`/shop/cars/${id}`} />
      <Shell theme={brand.theme}>
        <StoreHeader brand={brand} cart={false} />
        <Crumbs items={["Home", "New Inventory", car.body, car.name]} />
        <main className="vdp">
          <section className="vdp-left">
            <div className="vdp-gallery">
              <img src={car.image} alt={car.name} />
              <span className="photo-count">1 / 32 · 360° view</span>
            </div>
            <h2>Key specs</h2>
            <div className="spec-grid">
              {car.specs.map((sp) => (
                <div key={sp}>{sp}</div>
              ))}
              <div>Body: {car.body}</div>
              <div>Warranty: 5 yr / 60k mi</div>
            </div>
            <h2>Overview</h2>
            <p>{car.description}</p>
            <h2>Popular features</h2>
            <div className="chips">
              {["Adaptive cruise", "Lane keep assist", "Heated front seats", "Wireless phone mirroring", "360° camera", "Power liftgate"].map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
          </section>
          <aside className="vdp-buy">
            <span className="new">New 2026 · In stock</span>
            <h1>{car.name}</h1>
            <p className="vin">VIN 5NL{car.id.slice(0, 3).toUpperCase()}8K2TX104392 · Stock #N{(price % 9973).toString().padStart(4, "0")}</p>
            <div className="price-box">
              <div>
                <span>MSRP</span>
                <b>${price.toLocaleString("en-US")}</b>
              </div>
              <div>
                <span>Est. payment</span>
                <b>${monthly}/mo</b>
              </div>
            </div>
            <p className="fine">72 mo at 5.9% APR with 10% down. Taxes and fees extra.</p>
            <div className="live-row light">
              <span>Paint</span>
              {[["Silver", "#c9ccd1"], ["Matte red", "#9e1b1b"], ["Pearl white", "#f2f0ea"], ["Midnight blue", "#1c2a4a"], ["Forest green", "#2f4a33"]].map(([n, hex]) => (
                <button key={n} type="button" className="paint" style={{ background: hex }} title={n} data-lifecast-prompt={`The vehicle's paint changes to ${n.toLowerCase()}.`} data-lifecast-label={`${n} paint`} />
              ))}
            </div>
            <div className="live-row light">
              <span>See it in</span>
              {[["☀ Sun", "Bright sunshine lights up the road and the vehicle gleams."], ["❄ Snow", "Snow begins falling and the road turns white around the vehicle."], ["🌧 Rain", "Rain begins falling and the road turns glossy and wet."], ["🌙 Night", "Night falls and the vehicle's headlights switch on."]].map(([l, p]) => (
                <button key={l} type="button" className="live-btn" data-lifecast-prompt={p} data-lifecast-label={l}>
                  {l}
                </button>
              ))}
            </div>
            <button className="buy">Check availability</button>
            <button className="ghost">Schedule a test drive</button>
            <form className="lead">
              <input placeholder="First name" readOnly />
              <input placeholder="Email" readOnly />
              <input placeholder="Phone" readOnly />
            </form>
            <div className="dealer">
              <I name="pin" />
              <div>
                <b>Northline Motors · Harbor District</b>
                <span>Open today 9 am – 8 pm · 4.8★ (1,204)</span>
              </div>
            </div>
          </aside>
        </main>
        <StoreFooter brand={brand} cols={{ Shop: ["New", "Certified used", "Electric", "Trade-in value"], Owners: ["Service", "Parts", "Recalls"], Company: ["About", "Careers", "Contact"] }} />
      </Shell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Car",
          name: car.name,
          bodyType: car.body,
          brand: { "@type": "Brand", name: "Northline Motors" },
          image: [`${SITE}${car.image}`],
          description: `${car.description} ${car.specs.join(", ")}.`,
          offers: { "@type": "Offer", price: car.price, priceCurrency: "USD" },
        }}
      />
    </>
  );
}
