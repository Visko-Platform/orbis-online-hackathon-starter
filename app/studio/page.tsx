import { OrbisDemo } from "@/components/orbis-demo";

// The manual controls from the starter: free-form prompts, a start image of
// your choice, and the preset direction HUD.
export default function Studio() {
  return (
    <main>
      <header>
        <span className="eyebrow">Orbis · manual controls</span>
        <h1>Studio</h1>
        <p>
          Set up any scene by hand: choose a start image, write the prompt, and
          steer it with preset directions. <a href="/">Back to Scene Director</a>
        </p>
      </header>
      <OrbisDemo />
    </main>
  );
}
