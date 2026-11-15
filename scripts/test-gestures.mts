// Synthetic-motion tests for the gesture classifier (no camera needed).
// Run: node --experimental-strip-types scripts/test-gestures.mts
import { GestureDetector, type Hand, type Point } from "../lib/drama/gestures.ts";

function hand(key: string, x: number, y: number, shape: "open" | "point" | "fist"): Hand {
  const lm: Point[] = Array.from({ length: 21 }, () => ({ x, y }));
  const finger = (mcp: number, pip: number, tip: number, dx: number, out: boolean) => {
    lm[mcp] = { x: x + dx, y: y - 0.05 };
    lm[pip] = { x: x + dx, y: y - 0.08 };
    lm[tip] = out ? { x: x + dx, y: y - 0.13 } : { x: x + dx, y: y - 0.04 };
  };
  finger(5, 6, 8, -0.02, shape !== "fist");
  finger(9, 10, 12, 0, shape === "open");
  finger(13, 14, 16, 0.02, shape === "open");
  finger(17, 18, 20, 0.04, shape === "open");
  return { key, landmarks: lm };
}

function run(name: string, frames: (t: number) => Hand[], ms: number, expect: string | null) {
  const d = new GestureDetector();
  let got: string | null = null;
  for (let t = 0; t <= ms; t += 33) {
    const g = d.update(frames(t), t);
    if (g && !got) got = `${g}@${t}ms`;
  }
  const ok = expect === null ? got === null : got?.startsWith(expect);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${got ?? "nothing"}`);
  return ok;
}

const results = [
  run("slap: open hand swings right fast", (t) => [hand("R", 0.3 + Math.min(t, 300) / 300 * 0.4, 0.5, "open")], 600, "slap"),
  run(
    "slap with blur: open at start, fist mid-swing, then lost",
    (t) => (t < 100 ? [hand("R", 0.3, 0.5, "open")] : t < 250 ? [hand("R", 0.3 + (t - 100) / 150 * 0.25, 0.5, "fist")] : []),
    800,
    "slap",
  ),
  run(
    "slap with only two tracked frames",
    (t) => (t === 0 ? [hand("R", 0.3, 0.5, "open")] : t === 198 ? [hand("R", 0.5, 0.5, "open")] : []),
    800,
    "slap",
  ),
  run("no slap: hand raised straight up fast", (t) => [hand("R", 0.5, 0.8 - Math.min(t, 300) / 300 * 0.6, "open")], 600, null),
  run("no slap: open hand drifts slowly", (t) => [hand("R", 0.3 + t / 3000 * 0.4, 0.5, "open")], 3000, null),
  run("no slap: fist swings fast", (t) => [hand("R", 0.3 + Math.min(t, 300) / 300 * 0.4, 0.5, "fist")], 600, null),
  run("point: held still", () => [hand("R", 0.5, 0.5, "point")], 1300, "point"),
  run(
    "slap, not point: hand held up like a point, then swung",
    (t) => (t < 600 ? [hand("R", 0.3, 0.5, "point")] : [hand("R", 0.3 + Math.min(t - 600, 250) / 250 * 0.35, 0.5, "open")]),
    1200,
    "slap",
  ),
  run("no point: too brief", (t) => (t < 300 ? [hand("R", 0.5, 0.5, "point")] : [hand("R", 0.5, 0.5, "open")]), 900, null),
  run("no point: open hand held", () => [hand("R", 0.5, 0.5, "open")], 1500, null),
  run(
    "crown: both hands up, then down",
    (t) => {
      const y = t < 600 ? 0.2 : 0.2 + Math.min(1, (t - 600) / 400) * 0.6;
      return [hand("L", 0.4, y, "fist"), hand("R", 0.6, y, "fist")];
    },
    1500,
    "crown",
  ),
  run("no crown: hands up, never come down", () => [hand("L", 0.4, 0.2, "fist"), hand("R", 0.6, 0.2, "fist")], 2500, null),
  run("no crown: one hand up and down", (t) => [hand("R", 0.6, t < 600 ? 0.2 : 0.8, "fist")], 1500, null),
];
process.exit(results.every(Boolean) ? 0 : 1);
