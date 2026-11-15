import Link from "next/link";
import { OrbisDemo } from "@/components/orbis-demo";

export default function Home() {
  return (
    <main>
      <header>
        <h1>Orbis starter</h1>
        <p>
          Connect, generate a continuous live video, then steer it by changing
          the prompt while it runs.
        </p>
      </header>
      <Link href="/live">Live Studio</Link>{" · "}
      <Link href="/looks">Looks</Link>{" · "}
      <Link href="/camera" prefetch={false}>Camera studio</Link>
      <OrbisDemo />
    </main>
  );
}
