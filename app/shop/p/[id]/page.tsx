import { notFound } from "next/navigation";

import { ItemPage, itemMetadata } from "@/app/shop/item-page";
import { PRODUCTS } from "@/lib/shop";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ story?: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = PRODUCTS.find((x) => x.id === id);
  return item ? itemMetadata(item) : {};
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { story } = await searchParams;
  const item = PRODUCTS.find((x) => x.id === id);
  if (!item) notFound();
  return <ItemPage item={item} here={`/shop/p/${id}`} story={story} />;
}
