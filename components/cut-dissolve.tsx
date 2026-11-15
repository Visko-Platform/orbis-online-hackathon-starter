"use client";

// Hides a cut jump (Orbis reset + restart) behind a WebGL transition:
//   begin():  freeze the last frame of the old world on a GPU canvas over
//             the video, then pull it into a radial zoom-blur, as if the ship
//             is punching forward through it. The restart (blank and
//             priming frames) is never seen.
//   finish(): once the new world is on screen, dissolve from the frozen
//             frame to the live video through animated noise, with a
//             glowing teal burn along the dissolve edge.
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
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform vec2 u_fromScale;
uniform vec2 u_toScale;
uniform float u_hasTo;
uniform float u_hold;      // 0..1 zoom-blur pull on the frozen frame
uniform float u_progress;  // 0..1 dissolve to the live video
uniform float u_time;

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

void main() {
  vec2 centre = vec2(0.5, 0.45);
  vec2 d = v_uv - centre;

  // Frozen old world, pulled into a radial zoom-blur that grows with u_hold.
  vec3 from = vec3(0.0);
  for (int i = 0; i < 10; i++) {
    float k = float(i) / 10.0;
    from += texture2D(u_from, cover(centre + d * (1.0 - u_hold * 0.32 * k), u_fromScale)).rgb;
  }
  from /= 10.0;
  from += u_hold * 0.18 * vec3(0.55, 0.85, 1.0) * (1.0 - length(d));

  vec3 to = u_hasTo > 0.5 ? texture2D(u_to, cover(v_uv, u_toScale)).rgb : from;

  // Noise dissolve: the new world burns through in patches, centre first.
  float n = fbm(v_uv * vec2(5.5, 3.2) + vec2(u_time * 0.05, -u_time * 0.03));
  n = mix(n, length(d) * 1.2, 0.35);
  float edge = u_progress * 1.35 - 0.15;
  float keepOld = smoothstep(edge - 0.035, edge + 0.035, n);
  float burn = smoothstep(edge - 0.05, edge, n) * (1.0 - smoothstep(edge, edge + 0.035, n));
  vec3 colour = mix(to, from, keepOld) + burn * vec3(0.55, 1.0, 0.95) * 1.3;
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
      const hold = Math.min(1, (time - holdStart) / 1_500);
      const progress = state === "dissolving" ? Math.min(1, (time - dissolveStart) / 1_400) : 0;
      const live = state === "dissolving" ? video() : null;
      if (live) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, toTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, live);
        gl.uniform2fv(uniform("u_toScale"), coverScale(live.videoWidth, live.videoHeight, element.width, element.height));
      }
      gl.uniform1f(uniform("u_hasTo"), live ? 1 : 0);
      gl.uniform2fv(uniform("u_fromScale"), coverScale(fromSize[0], fromSize[1], element.width, element.height));
      gl.uniform1f(uniform("u_hold"), hold * (1 - progress * 0.6));
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
