const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = readFileSync(filename, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  module._compile(code, filename);
};

const { Ink, WIDTH, HEIGHT } = require("../lib/camera/ink.ts");
const { handGesture } = require("../lib/camera/hand-gesture.ts");
const { createHandDrawing } = require("../lib/camera/hand-drawing.ts");
const map = (point) => ({ x: point.x * WIDTH, y: point.y * HEIGHT });

function hand(shape, x = 0.5) {
  const points = Array.from({ length: 21 }, () => ({ x, y: 0.55 }));
  points[0] = { x, y: 0.9 };
  for (const [base, offset] of [[5, -0.12], [9, -0.04], [13, 0.04], [17, 0.12]]) {
    points[base] = { x: x + offset, y: 0.55 };
    points[base + 1] = { x: x + offset, y: 0.4 };
    points[base + 3] = { x: x + offset, y: shape === "fist" ? 0.58 : 0.12 };
  }
  points[4] = { x: x + 0.17, y: 0.55 };
  if (shape === "index pinch") points[8] = points[4];
  if (shape === "four-finger pinch") {
    for (const [index, tip] of [8, 12, 16, 20].entries()) {
      points[tip] = { x: x + 0.15, y: 0.51 + index * 0.025, z: 0.01 };
    }
  }
  return { side: "Left", wrist: points[0], thumb: points[4], tip: points[8], knuckle: points[9], points };
}

test("all four fingertips must be near the thumb to start drawing at either hand size", () => {
  const { points } = hand("four-finger pinch");
  const small = points.map(({ x, y, z = 0 }) => ({ x: 0.4 + x * 0.2, y: 0.4 + y * 0.2, z: z * 0.2 }));
  assert.equal(handGesture(points), "pinch");
  assert.equal(handGesture(small), "pinch");
  for (const tip of [8, 12, 16, 20]) {
    const parted = points.slice();
    parted[tip] = { ...points[tip], z: 0.11 };
    assert.equal(handGesture(parted), undefined);
    assert.equal(handGesture(parted, true), "pinch");
  }
});

test("index pinch and open palm stay idle, then a fist starts and releases steering", () => {
  const ink = new Ink();
  const events = [];
  ink.onStroke = (event) => events.push(event.phase);
  const drawing = createHandDrawing(ink, (held) => events.push(held));
  const frame = (time, shape) => drawing.update([hand(shape)], time, time, map, false);
  frame(0, "index pinch");
  frame(300, "index pinch");
  frame(600, "palm");
  frame(900, "palm");
  assert.deepEqual(events, []);
  frame(1000, "fist");
  frame(1300, "fist");
  frame(1400, "palm");
  frame(1700, "palm");
  assert.deepEqual(events, [true, false]);
});

test("drawing survives a missed frame and a fist can steer after the stroke ends", () => {
  const ink = new Ink();
  const strokes = [];
  const speech = [];
  ink.onStroke = (event) => strokes.push(event.phase);
  const drawing = createHandDrawing(ink, (held) => speech.push(held));
  const frame = (time, hands) => drawing.update(hands, time, time, map, false);

  frame(0, [hand("four-finger pinch")]);
  frame(80, [hand("four-finger pinch", 0.53)]);
  frame(400, []);
  frame(600, [hand("four-finger pinch", 0.56)]);
  assert.deepEqual(strokes, ["start"]);

  frame(660, [hand("fist")]);
  assert.deepEqual(strokes, ["start"]);
  frame(790, [hand("fist")]);
  frame(1000, []);
  frame(1250, [hand("four-finger pinch", 0.59)]);
  assert.deepEqual(strokes, ["start"]);
  frame(1500, [hand("fist")]);
  drawing.expire(2050);
  assert.deepEqual(strokes, ["start", "end"]);
  assert.equal(ink.hasVisibleDrawing, true);
  assert.ok(ink.finished[0].points.at(-1).x > ink.finished[0].points[0].x);
  frame(2300, [hand("fist")]);
  assert.deepEqual(speech, []);
  frame(2500, [hand("fist")]);
  frame(2800, [hand("fist")]);
  assert.deepEqual(speech, [true]);
  frame(2900, []);
  frame(3150, []);
  assert.deepEqual(speech, [true, false]);
});

test("a brief shoulder tracking gap does not leave a break in a hand stroke", () => {
  const ink = new Ink();
  ink.follow = "headAndShoulders";
  const shoulder = { center: { x: 480, y: 270 }, width: 240, angle: 0 };
  ink.shoulder = shoulder;
  ink.apply("hand:Left", "start", { x: 0.5, y: 0.65 });
  ink.shoulder = undefined;
  ink.apply("hand:Left", "move", { x: 0.55, y: 0.65 });
  ink.shoulder = shoulder;
  ink.apply("hand:Left", "move", { x: 0.6, y: 0.65 });
  ink.apply("hand:Left", "end");
  assert.equal(ink.finished[0].points.length, 2);
  assert.ok(ink.finished[0].points.every(Boolean));
});

test("live camera pointer strokes can carry separate captions and preserve earlier drawing", () => {
  const ink = new Ink();
  ink.follow = "headAndShoulders";
  const events = [];
  ink.onStroke = (event) => {
    if (event.phase === "end") assert.equal(ink.hasStroke(event.id), true);
    events.push([event.id, event.phase]);
  };

  ink.apply("mac", "start", { x: 0.2, y: 0.3 });
  ink.apply("mac", "move", { x: 0.24, y: 0.35 });
  ink.apply("mac", "end");
  ink.apply("mac", "start", { x: 0.7, y: 0.4 });
  ink.apply("mac", "end");
  ink.apply("mac", "start", { x: 0.8, y: 0.7 });
  ink.apply("mac", "cancel");

  assert.deepEqual(events, [[1, "start"], [1, "end"], [2, "start"], [2, "end"], [3, "start"], [3, "cancel"]]);
  assert.equal(ink.hasStroke(1), true);
  assert.equal(ink.hasStroke(2), true);
  assert.equal(ink.hasStroke(3), false);
});
