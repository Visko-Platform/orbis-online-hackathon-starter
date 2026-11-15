import { notFound } from "next/navigation";

import { StudioShell } from "@/components/studio";
import { DEMOS, getDemo, toView } from "@/lib/demos";

export function generateStaticParams() {
  return DEMOS.map((demo) => ({ demo: demo.id }));
}

export default async function DemoPage({ params }: { params: Promise<{ demo: string }> }) {
  const { demo: id } = await params;
  const demo = getDemo(id);
  if (!demo) notFound();
  return <StudioShell demo={toView(demo)} />;
}
