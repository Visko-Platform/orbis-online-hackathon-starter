import { OmniApp } from "@/components/omni";

export const metadata = { title: "Lifecast · try it on before you buy anything" };

export default async function OmniPage({ searchParams }: { searchParams: Promise<{ embed?: string; admin?: string }> }) {
  const { embed, admin } = await searchParams;
  return <OmniApp embed={embed === "1"} admin={admin === "1"} />;
}
