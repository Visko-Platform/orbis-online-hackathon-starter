import type { ReactNode } from "react";

import type { Brand } from "@/lib/shop";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
export const icons = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm10 2-4.3-4.3",
  user: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  bag: "M6 7h12l1 14H5L6 7zm3 0a3 3 0 0 1 6 0",
  heart: "M12 21s-7-4.4-9.3-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z",
  truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  return: "M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3",
  pin: "M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  share: "M4 12v8h16v-8M12 3v12M7 8l5-5 5 5",
};
export const I = ({ name }: { name: keyof typeof icons }) => <Icon d={icons[name]} />;

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      <span className="stars-fill" style={{ width: `${(rating / 5) * 100}%` }}>★★★★★</span>
      <span className="stars-empty">★★★★★</span>
      <span className="stars-count">
        {rating.toFixed(1)}
        {reviews ? ` (${reviews} reviews)` : ""}
      </span>
    </span>
  );
}

export function StoreHeader({ brand, cart = true }: { brand: Brand; cart?: boolean }) {
  return (
    <>
      {brand.promo && <div className="promo">{brand.promo}</div>}
      <header className="store-top">
        <div className="logo">{brand.logo}</div>
        <nav className="store-nav">
          {brand.nav.map((n) => (
            <a key={n}>{n}</a>
          ))}
        </nav>
        <div className="store-tools">
          <span className="search-box">
            <I name="search" />
            <span>Search</span>
          </span>
          <I name="user" />
          {cart && (
            <span className="cart">
              <I name="bag" />
              <b>0</b>
            </span>
          )}
        </div>
      </header>
    </>
  );
}

export function StoreFooter({ brand, cols }: { brand: Brand; cols?: Record<string, string[]> }) {
  const columns = cols ?? {
    Help: ["Order status", "Shipping", "Returns", "Size guide", "Contact us"],
    About: ["Our story", "Sustainability", "Careers", "Stores"],
    Community: ["Journal", "Events", "Ambassadors", "Newsletter"],
  };
  return (
    <footer className="store-footer">
      <div className="footer-brand">
        <div className="logo">{brand.logo}</div>
        <p>{brand.footer}</p>
      </div>
      {Object.entries(columns).map(([title, links]) => (
        <div key={title}>
          <h4>{title}</h4>
          {links.map((l) => (
            <a key={l}>{l}</a>
          ))}
        </div>
      ))}
      <div className="footer-legal">© 2026 {brand.logo} · Privacy · Terms · Accessibility · (fictional demo store)</div>
    </footer>
  );
}

export function Crumbs({ items }: { items: string[] }) {
  return (
    <div className="crumbs-bar">
      {items.map((c, i) => (
        <span key={c}>
          {i > 0 && <span className="sep">/</span>}
          {c}
        </span>
      ))}
    </div>
  );
}

export const Shell = ({ theme, children }: { theme: string; children: ReactNode }) => <div className={`store ${theme}`}>{children}</div>;
