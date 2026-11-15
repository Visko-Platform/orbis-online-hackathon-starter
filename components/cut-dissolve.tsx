"use client";

// The wormhole: hides a jump (a cut's restart, or a morph's in-between
// frames) behind a WebGL journey built from the old world's last frame.
//   begin():  freeze the last frame, then bend it into a 3D tunnel we fly
//             through, accelerating, with noise swirls and chromatic fringe.
//             At the tunnel's end an "Interstellar" glass sphere grows,
//             showing the view through it bent and inverted (the old world
//             at first, the new world live as soon as Orbis shows it).
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

#define PI 3.14159265

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
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
vec2 cover(vec2 uv, vec2 scale) { return (uv - 0.5) * scale + 0.5; }
vec2 mirror(vec2 uv) { vec2 m = mod(uv, 2.0); return mix(m, 2.0 - m, step(1.0, m)); }

void main() {
  vec2 centre = vec2(0.5, 0.45);
  vec2 p = (v_uv - centre) * vec2(u_aspect, 1.0);
  float r = length(p);
  float a = atan(p.y, p.x);

  // How far along the journey: eases toward 1 so a long hang keeps moving.
  float approach = 1.0 - exp(-u_travel / 3.5);
  float speed = 0.7 + u_travel * 0.3;

  // 1. The frozen frame, as we enter.
  vec3 still = texture2D(u_from, cover(centre + (v_uv - centre) * (1.0 - u_hold * 0.15), u_fromScale)).rgb;

  // 2. Tunnel walls made of the old world, flying forward through them.
  float depth = 0.3 / max(r, 0.015) + u_travel * speed;
  float swirl = fbm(vec2(a * 1.6, depth * 0.55) + u_time * 0.12);
  // abs(a)/PI mirrors the walls top-to-bottom, so there's no seam where the
  // angle wraps around.
  vec2 tuv = mirror(vec2(abs(a) / PI + swirl * 0.12 + depth * 0.025, depth * 0.17));
  float ca = 0.002 + 0.005 * approach; // chromatic fringing grows with speed
  vec3 wall = vec3(
    texture2D(u_from, cover(mirror(tuv + vec2(ca, 0.0)), u_fromScale)).r,
    texture2D(u_from, cover(tuv, u_fromScale)).g,
    texture2D(u_from, cover(mirror(tuv - vec2(ca, 0.0)), u_fromScale)).b);
  wall = pow(wall, vec3(1.25)) * (0.18 + 0.82 * smoothstep(0.0, 0.75, r)); // contrast + depth falloff
  wall += vec3(0.35, 0.75, 1.0) * max(0.0, fbm(vec2(a * 3.0, depth * 2.0 - u_time * 1.5)) - 0.45) * 0.9; // energy streaks
  vec3 colour = mix(still, wall, smoothstep(0.0, 1.0, u_hold));

  // 3. The lens: a glass sphere at the tunnel's end showing the view through
  //    it bent and inverted. It grows as we approach; on exit it swells past
  //    the screen and its bending relaxes to a flat picture.
  float R = mix(0.05, 0.27, approach) * u_hold + u_progress * u_progress * 2.4;
  float lens = 1.0 - u_progress;
  if (r < R) {
    float k = r / R;
    vec2 q = (v_uv - centre) / max(R, 0.02);
    vec2 bent = centre - q * 0.42 * (1.0 - 0.55 * k * k);           // inverted, magnified
    vec2 luv = mix(v_uv, bent, lens);
    vec3 inside = u_hasTo > 0.5
      ? texture2D(u_to, cover(luv, u_toScale)).rgb
      : texture2D(u_from, cover(luv, u_fromScale)).rgb * vec3(0.8, 0.95, 1.12);
    inside *= 1.0 + 0.35 * lens * (1.0 - k);                         // glassy brightening
    colour = inside;
  }
  float ring = exp(-pow((r - R) / (0.01 + 0.025 * R), 2.0)) * lens * u_hold;
  colour += ring * vec3(0.78, 0.96, 1.0) * 1.5;                       // the bright rim of bent light
  colour += vec3(0.3, 0.6, 1.0) * 0.22 * smoothstep(R * 2.6, R, r) * lens * u_hold; // halo

  // Land clean: the last moments are the plain live picture.
  if (u_hasTo > 0.5) colour = mix(colour, texture2D(u_to, cover(v_uv, u_toScale)).rgb, smoothstep(0.82, 1.0, u_progress));
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
      const ratio = Math.min(window.devicePixelRatio, 1.5);
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
