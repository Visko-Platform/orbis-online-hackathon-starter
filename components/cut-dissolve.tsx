"use client";

// The wormhole: hides a jump (a cut's restart, or a morph's in-between
// frames) behind a WebGL journey built from the old world's last frame.
//   begin():  freeze the last frame, then smear it into a nebula tunnel we
//             fly through: domain-warped gas in the old world's colours, dark
//             dust lanes, a black core. At its end a mirrored "Interstellar"
//             sphere grows, lensing space around it: the destination shows
//             through its core inverted, its limb reflects the tunnel.
//   finish(): the sphere swells past the screen and its bending relaxes:
//             we pass through it into the new world, landing on the plain
//             live picture.
// Canvas sits exactly over the world layer (same classes), under the warp
// streaks and the cockpit.

import { useEffect, useRef } from "react";

export type CutDissolveControl = {
  begin: () => void;
  finish: () => void;
};

const VERTEX = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_from;   // frozen last frame of the old world
uniform sampler2D u_to;     // the live video (once the new world is there)
uniform vec2 u_fromScale;
uniform vec2 u_toScale;
uniform float u_hasTo;
uniform float u_hold;       // 0..1 entry into the wormhole
uniform float u_travel;     // seconds since the jump began
uniform float u_progress;   // 0..1 exit through the lens
uniform float u_time;
uniform float u_aspect;     // canvas width / height
uniform vec3 u_avg;         // the old world's average colour (the gas's base tone)

#define PI 3.14159265
const vec2 CENTRE = vec2(0.5, 0.45);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
vec2 cover(vec2 uv, vec2 scale) { return (uv - 0.5) * scale + 0.5; }
vec2 mirror(vec2 uv) { vec2 m = mod(uv, 2.0); return mix(m, 2.0 - m, step(1.0, m)); }
vec3 fromAt(vec2 uv) { return texture2D(u_from, cover(mirror(uv), u_fromScale)).rgb; }
vec3 toAt(vec2 uv) { return texture2D(u_to, cover(mirror(uv), u_toScale)).rgb; }
// Highlights roll off instead of clipping: nothing ever blows out to white.
vec3 rolloff(vec3 c) { return 1.0 - exp(-c * 1.25); }

// The tunnel at polar position (r, a): the old world's last frame smeared
// into gas, sculpted by domain-warped noise into nebula clouds, with dark
// dust lanes absorbing the light and a black core where the tunnel recedes.
// u is the angle mapped to 0..1, mirrored top-to-bottom (no seam where the
// angle wraps); callers add twist in u-space so the mirror stays seamless.
vec3 tunnel(float r, float u, float approach) {
  float speed = 0.7 + u_travel * 0.3;
  float depth = 0.3 / max(r, 0.02) + u_travel * speed;

  // Domain warp: noise displacing noise gives the slow, folded look of gas.
  vec2 n = vec2(u * 3.0, depth * 0.45);
  vec2 q = vec2(fbm(n + vec2(0.0, u_time * 0.04)), fbm(n + vec2(5.2, 1.3)));
  vec2 w = vec2(fbm(n + 2.6 * q + vec2(1.7, 9.2) + u_time * 0.06), fbm(n + 2.6 * q + vec2(8.3, 2.8)));
  float gas = fbm(n + 2.2 * w);

  // The frame's own colours, motion-blurred along the flight path and
  // pushed around by the same warp, so the nebula is made of the old world.
  float ca = 0.002 + 0.004 * approach;
  vec3 wall = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float lag = float(i) * (0.012 + 0.03 * approach);
    vec2 tuv = vec2(u + (w.x - 0.5) * 0.18 + (depth - lag) * 0.025, (depth - lag) * 0.17 + (w.y - 0.5) * 0.12);
    wall += vec3(fromAt(tuv + vec2(ca, 0.0)).r, fromAt(tuv).g, fromAt(tuv - vec2(ca, 0.0)).b);
  }
  wall *= 0.25;
  // Where the frame is dark (a black sky), the gas keeps the world's own
  // average tone, so the tunnel never collapses to empty black.
  wall = max(wall, u_avg * 1.7 + 0.03);
  // A gentle multiplicative nebula tint (cool to violet), drifting with the gas.
  wall *= mix(vec3(0.72, 0.86, 1.05), vec3(1.05, 0.78, 0.98), smoothstep(0.3, 0.7, w.x));

  // Density shapes where there is gas at all; dust lanes eat light.
  float density = smoothstep(0.32, 0.78, gas);
  float dust = smoothstep(0.5, 0.72, fbm(n * 2.1 + 3.0 * q + vec2(4.0, 0.0)));
  vec3 colour = wall * (0.08 + 0.95 * density) * (1.0 - 0.65 * dust);
  // Emission in the gas's own palette (no foreign cyan), only in the
  // densest folds, kept low so it glows rather than flares.
  colour += wall * wall * pow(density, 3.0) * (1.0 - dust) * 0.45;

  // Sparse distant stars stretching past, faint.
  vec2 cell = vec2(u * 60.0, depth * 24.0);
  float star = step(0.992, hash(floor(cell))) * smoothstep(0.22, 0.0, length((fract(cell) - 0.5) * vec2(1.0, 0.6)));
  colour += vec3(0.75, 0.82, 0.9) * star * 0.22 * smoothstep(0.15, 0.6, r);

  // Darkness: the tunnel's far end is black, and depth eats colour.
  colour *= smoothstep(0.02, 0.55, r) * smoothstep(0.02, 0.9, r);
  return colour;
}

void main() {
  vec2 p = (v_uv - CENTRE) * vec2(u_aspect, 1.0);
  float r = length(p);
  float a = atan(p.y, p.x);
  float u = abs(a) / PI;

  // How far along the journey: eases toward 1 so a long hang keeps moving.
  float approach = 1.0 - exp(-u_travel / 3.5);
  // The sphere at the tunnel's end. It grows as we approach; on exit it
  // swells past the screen and its bending relaxes to flat.
  float R = mix(0.05, 0.27, approach) * u_hold + u_progress * u_progress * 2.4;
  float lens = 1.0 - u_progress;
  float hold = smoothstep(0.0, 1.0, u_hold);

  // 1. The frozen frame, dimming as we enter.
  vec3 still = fromAt(CENTRE + (v_uv - CENTRE) * (1.0 - u_hold * 0.15)) * (1.0 - 0.3 * hold);

  // 2. Outside the sphere: the tunnel, gravitationally lensed around it
  //    (space near the sphere is stretched outward and twisted), inside a
  //    dark shadow that frames the sphere instead of a glow.
  vec3 colour = still;
  if (r >= R) {
    float pull = R * R / max(r, R);
    float lr = r + pull * 0.8 * lens;
    float twist = pull / max(r, 0.02) * 0.3 * lens;
    vec3 outside = tunnel(lr, u + twist, approach);
    float shadow = smoothstep(R * 1.9, R * 1.02, r) * lens * u_hold;
    outside *= 1.0 - 0.75 * shadow;
    colour = mix(still, outside, hold);
  }

  // 3. The sphere itself: a mirrored lens. Its core shows the destination
  //    bent and inverted (with dispersion: R, G and B bend differently);
  //    toward the limb it turns to mirror, reflecting the tunnel around it.
  if (r < R) {
    float k = r / R;
    vec2 q = (v_uv - CENTRE) / max(R, 0.02);
    float curve = 1.0 - 0.55 * k * k;
    float bend = lens * lens;
    vec2 uvR = mix(v_uv, CENTRE - q * 0.41 * curve, bend);
    vec2 uvG = mix(v_uv, CENTRE - q * 0.42 * curve, bend);
    vec2 uvB = mix(v_uv, CENTRE - q * 0.43 * curve, bend);
    vec3 through = u_hasTo > 0.5
      ? vec3(toAt(uvR).r, toAt(uvG).g, toAt(uvB).b)
      : vec3(fromAt(uvR).r, fromAt(uvG).g, fromAt(uvB).b) * vec3(0.7, 0.8, 0.95);
    // Mirror: the limb reflects the tunnel from behind us, flipped.
    float fresnel = pow(k, 2.5);
    float mirrorAmount = (0.1 + 0.75 * fresnel) * lens * (1.0 - smoothstep(0.0, 0.3, u_progress));
    vec3 inside = through;
    if (mirrorAmount > 0.004) {
      vec3 reflection = tunnel(mix(0.95, 0.22, k), 1.0 - u, approach);
      inside = mix(through, reflection, mirrorAmount);
    }
    // Dark limb: glass edges absorb, giving the sphere its volume.
    inside *= 1.0 - 0.55 * pow(k, 7.0) * lens;
    // A small, soft specular kiss, tinted by the gas.
    vec2 hl = (p / max(R, 0.02)) - vec2(-0.38, -0.42);
    inside += vec3(0.8, 0.86, 0.95) * exp(-dot(hl, hl) * 14.0) * 0.12 * lens;
    colour = inside;
  }
  // The Einstein ring: a thin, restrained arc of bent light, its colour
  // drawn from the destination, with only a whisper of thin-film rainbow.
  float rimWidth = 0.006 + 0.012 * R;
  float ring = exp(-pow((r - R) / rimWidth, 2.0)) * lens * u_hold;
  vec3 film = 0.6 + 0.4 * cos(6.2831 * (a / (2.0 * PI) * 2.0 + u_time * 0.1 + vec3(0.0, 0.33, 0.67)));
  vec3 ringLight = u_hasTo > 0.5 ? toAt(CENTRE + normalize(p + 1e-4) * vec2(0.3 / u_aspect, 0.3)) : vec3(0.6, 0.66, 0.75);
  colour += ring * mix(ringLight, film, 0.25) * 0.4;

  colour = mix(colour, rolloff(colour), lens * hold);
  // Land clean: the last moments are the plain live picture.
  if (u_hasTo > 0.5) colour = mix(colour, toAt(v_uv), smoothstep(0.82, 1.0, u_progress));
  gl_FragColor = vec4(colour, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("cut-dissolve shader:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

/** Scale that makes a texture of size (w,h) "cover" a canvas of size (cw,ch). */
function coverScale(w: number, h: number, cw: number, ch: number): [number, number] {
  const texture = w / h;
  const canvas = cw / ch;
  return texture > canvas ? [canvas / texture, 1] : [1, texture / canvas];
}

/**
 * No WebGL: still hide the restart. Freeze the last frame (softly blurred),
 * then cross-fade it away once the new world is on screen.
 */
function fallback2d(element: HTMLCanvasElement, control: { current: CutDissolveControl | null }) {
  const box = element.parentElement;
  const context = element.getContext("2d");
  let safety = 0;
  control.current = {
    begin() {
      const video = document.querySelector<HTMLVideoElement>(".sw-world video");
      if (!box || !context || !video || video.readyState < 2) return;
      element.width = video.videoWidth;
      element.height = video.videoHeight;
      context.filter = "blur(3px) brightness(1.1)";
      context.drawImage(video, 0, 0);
      box.classList.remove("is-fading");
      box.classList.add("is-active");
      window.clearTimeout(safety);
      safety = window.setTimeout(() => control.current?.finish(), 16_000);
    },
    finish() {
      if (!box?.classList.contains("is-active")) return;
      box.classList.add("is-fading");
      window.setTimeout(() => box.classList.remove("is-active", "is-fading"), 1_200);
    },
  };
  return () => {
    window.clearTimeout(safety);
    control.current = null;
  };
}

export function CutDissolve({ control }: { control: { current: CutDissolveControl | null } }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const gl = element.getContext("webgl", { premultipliedAlpha: false, alpha: false });
    if (!gl) return fallback2d(element, control);

    const program = gl.createProgram();
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!program || !vertex || !fragment) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const makeTexture = (unit: number) => {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return texture;
    };
    const fromTexture = makeTexture(0);
    const toTexture = makeTexture(1);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform1i(uniform("u_from"), 0);
    gl.uniform1i(uniform("u_to"), 1);

    const snapshot = document.createElement("canvas");
    let fromSize: [number, number] = [16, 9];
    let state: "idle" | "holding" | "dissolving" = "idle";
    let holdStart = 0;
    let dissolveStart = 0;
    let safety = 0;
    let frame = 0;

    const video = () => {
      const element = document.querySelector<HTMLVideoElement>(".sw-world video");
      return element && element.readyState >= 2 && element.videoWidth ? element : null;
    };

    const resize = () => {
      // 1×: the effect is soft by nature, and the full-screen exit is the
      // heaviest moment; retina density there just costs frame rate.
      const ratio = 1;
      element.width = Math.max(1, Math.round(element.clientWidth * ratio));
      element.height = Math.max(1, Math.round(element.clientHeight * ratio));
      gl.viewport(0, 0, element.width, element.height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();

    const stop = () => {
      state = "idle";
      element.parentElement?.classList.remove("is-active");
      window.clearTimeout(safety);
    };

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (state === "idle") return;
      const hold = Math.min(1, (time - holdStart) / 1_200);
      const progress = state === "dissolving" ? Math.min(1, (time - dissolveStart) / 1_600) : 0;
      // The live video feeds the lens as soon as it has frames.
      const live = video();
      if (live) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, toTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, live);
        gl.uniform2fv(uniform("u_toScale"), coverScale(live.videoWidth, live.videoHeight, element.width, element.height));
      }
      gl.uniform1f(uniform("u_hasTo"), live ? 1 : 0);
      gl.uniform2fv(uniform("u_fromScale"), coverScale(fromSize[0], fromSize[1], element.width, element.height));
      gl.uniform1f(uniform("u_hold"), hold);
      gl.uniform1f(uniform("u_travel"), (time - holdStart) / 1000);
      gl.uniform1f(uniform("u_aspect"), element.width / Math.max(1, element.height));
      gl.uniform1f(uniform("u_progress"), progress);
      gl.uniform1f(uniform("u_time"), time / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (progress >= 1) stop();
    };
    frame = requestAnimationFrame(draw);

    control.current = {
      begin() {
        const live = video();
        if (!live) return; // nothing on screen to hold: skip the effect
        snapshot.width = live.videoWidth;
        snapshot.height = live.videoHeight;
        snapshot.getContext("2d")?.drawImage(live, 0, 0);
        fromSize = [snapshot.width, snapshot.height];
        const tiny = document.createElement("canvas");
        tiny.width = tiny.height = 1;
        const tinyContext = tiny.getContext("2d");
        tinyContext?.drawImage(snapshot, 0, 0, 1, 1);
        const [ar, ag, ab] = tinyContext?.getImageData(0, 0, 1, 1).data ?? [40, 40, 50];
        gl.uniform3f(uniform("u_avg"), ar / 255, ag / 255, ab / 255);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fromTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snapshot);
        state = "holding";
        holdStart = performance.now();
        element.parentElement?.classList.add("is-active");
        // Never strand the screen: dissolve after 16 s whatever happens.
        window.clearTimeout(safety);
        safety = window.setTimeout(() => control.current?.finish(), 16_000);
      },
      finish() {
        if (state !== "holding") return;
        state = "dissolving";
        dissolveStart = performance.now();
      },
    };

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.clearTimeout(safety);
      control.current = null;
    };
  }, [control]);

  // Wrapped in a .sw-world box so it gets exactly the world layer's size,
  // mask and parallax.
  return (
    <div className="sw-world sw-cut" aria-hidden>
      <canvas ref={canvas} />
    </div>
  );
}
