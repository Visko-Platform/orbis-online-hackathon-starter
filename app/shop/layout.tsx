import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SITE } from "@/lib/shop";

import "./shop.css";

export const metadata: Metadata = { metadataBase: new URL(SITE) };

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <div className="shop">{children}</div>;
}
