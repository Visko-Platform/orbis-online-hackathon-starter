import type { Metadata } from "next";
import Link from "next/link";

import { Crumbs, Shell, StoreFooter, StoreHeader } from "@/app/shop/chrome";
import { DemoBar, JsonLd } from "@/app/shop/demo-bar";
import { BRANDS, CARS, SITE, withStory } from "@/lib/shop";

export const metadata: Metadata = {
  title: "New SUVs, Trucks & EVs | Northline Motors",
  description: "Shop AWD SUVs, 4x4 pickups and electric coupes at Northline Motors. Test drive today.",
  openGraph: { title: "Northline Motors inventory", siteName: "Northline Motors", images: [CARS[0].image] },
};

const monthly = (price: string) => Math.round((Number(price) * 0.9 * (0.059 / 12)) / (1 - Math.pow(1 + 0.059 / 12, -72)));

export default async function CarsPage({ searchParams }: { searchParams: Promise<{ story?: string }> }) {
  const { story } = await searchParams;
  const brand = BRANDS["Northline Motors"];
  return (
    <>
      <DemoBar story={story} here="/shop/cars" />
      <Shell theme={brand.theme}>
        <StoreHeader brand={brand} cart={false} />
        <Crumbs items={["Home", "New Inventory"]} />
        <main className="inv">
          <aside className="filters">
            <h3>Filters</h3>
            {[["Body style", ["SUV", "Pickup", "Coupe", "Sedan"]], ["Drivetrain", ["AWD", "4x4", "RWD"]], ["Fuel", ["Gas", "Hybrid", "Electric"]], ["Price", ["Under $40k", "$40k–$50k", "$50k+"]]].map(([t, xs]) => (
              <div key={t as string} className="filter">
                <h4>{t as string}</h4>
                {(xs as string[]).map((x) => (
                  <label key={x}>
                    <input type="checkbox" readOnly /> {x}
                  </label>
                ))}
              </div>
            ))}
          </aside>
          <section>
            <div className="inv-head">
              <h1>New vehicles for sale</h1>
              <span>{CARS.length} results · Sort: Recommended ▾</span>
            </div>
            <div className="inv-grid">
              {CARS.map((car, i) => (
                <Link key={car.id} href={story ? withStory(`/shop/cars/${car.id}`, story) : `/shop/cars/${car.id}`} className="inv-card">
                  <div className="inv-img">
                    <img src={car.image} alt={car.name} />
                    {i === 0 && <span className="tag">Popular</span>}
                  </div>
                  <div className="inv-body">
                    <span className="new">New 2026</span>
                    <h3>{car.name}</h3>
                    <p>{car.tagline}</p>
                    <div className="inv-price">
                      <b>${Number(car.price).toLocaleString("en-US")}</b>
                      <span>est. ${monthly(car.price)}/mo</span>
                    </div>
                    <div className="inv-specs">{car.specs.slice(0, 3).join(" · ")}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
        <StoreFooter brand={brand} cols={{ Shop: ["New", "Certified used", "Electric", "Trade-in value"], Owners: ["Service", "Parts", "Recalls"], Company: ["About", "Careers", "Contact"] }} />
      </Shell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: CARS.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/shop/cars/${c.id}`, name: c.name })),
        }}
      />
    </>
  );
}
