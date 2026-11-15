import { SceneDirector } from "@/components/scene-director";

export default function Home() {
  return (
    <main className="sd-page">
      <header className="sd-header">
        <h1>AI Scene Director</h1>
        <p>
          A live, continuously generated film. Investigate, manipulate, and
          intervene, and an AI director decides what happens next.
        </p>
      </header>
      <SceneDirector />
    </main>
  );
}
