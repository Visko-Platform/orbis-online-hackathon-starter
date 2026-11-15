import { length, subtract, surfaces, type Mesh, type SurfaceMode, type SurfacePoint } from "./surface-mesh";
import type { SurfaceScene } from "./surface-scene";

export type SurfaceStroke = { follow: SurfaceMode; color: string; points: (SurfacePoint | null)[] };
export const inkTextureSize = 512;
const textureSize = inkTextureSize;
const brushSize = 0.65;

const vertexSource = `#version 300 es
layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;
uniform mat4 pose;
uniform vec2 perspective;
uniform vec2 principalPoint;
out vec2 texCoord;
out vec3 cameraPosition;
void main() {
  cameraPosition = (pose * vec4(position, 1.0)).xyz;
  float d = -cameraPosition.z;
  // Near plane at 1 cm. Use an infinite far plane.
  vec2 projected = vec2(-perspective.x * cameraPosition.x, perspective.y * cameraPosition.y);
  gl_Position = vec4(projected + principalPoint * d, d - 2.0, d);
  texCoord = uv;
}`;

const fragmentSource = `#version 300 es
precision highp float;
uniform sampler2D ink;
uniform vec3 material;
in vec2 texCoord;
in vec3 cameraPosition;
out vec4 color;
void main() {
  vec3 normal = normalize(cross(dFdx(cameraPosition), dFdy(cameraPosition)));
  normal = faceforward(normal, cameraPosition, normal);
  float light = 0.65 + 0.35 * max(0.0, dot(normal, normalize(vec3(-0.4, 0.8, 1.0))));
  vec4 mark = texture(ink, texCoord);
  color = vec4(mix(material * light, mark.rgb, mark.a), 1.0);
}`;

const crownColor = [0.25, 0.28, 0.36];
const brimColor = [0.18, 0.20, 0.26];
const garmentColor = [0.22, 0.30, 0.34];

function shader(gl: WebGL2RenderingContext, kind: number, source: string) {
  const item = gl.createShader(kind)!;
  gl.shaderSource(item, source);
  gl.compileShader(item);
  return item;
}

export function atlasStroke(ctx: CanvasRenderingContext2D, color: string, { chartWidth, chartHeight }: Mesh,
  point: SurfacePoint, previous?: SurfacePoint | null) {
  const x = point.u * chartWidth;
  const y = point.v * chartHeight;
  let fromX = x;
  let fromY = y;
  if (previous?.mesh === point.mesh && length(subtract(point.position, previous.position)) < 4) {
    let du = previous.u - point.u;
    du -= Math.round(du);
    fromX += du * chartWidth;
    fromY = previous.v * chartHeight;
  }
  ctx.save();
  ctx.scale(textureSize / chartWidth, textureSize / chartHeight);
  ctx.strokeStyle = color;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  for (const shift of [-chartWidth, 0, chartWidth]) {
    if (Math.max(x, fromX) + shift < -brushSize || Math.min(x, fromX) + shift > chartWidth + brushSize) continue;
    ctx.beginPath();
    ctx.moveTo(fromX + shift, fromY);
    ctx.lineTo(x + shift + 0.001, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function createSurfaceRenderer(width: number, height: number, onUnavailable: () => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, depth: true });
  if (!gl) { onUnavailable(); return; }
  const program = gl.createProgram()!;
  const vertex = shader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); onUnavailable(); return; }
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  const pose = gl.getUniformLocation(program, "pose");
  const perspective = gl.getUniformLocation(program, "perspective");
  const principalPoint = gl.getUniformLocation(program, "principalPoint");
  const material = gl.getUniformLocation(program, "material");

  const geometry = new Map<Mesh, { vao: WebGLVertexArrayObject; vertices: WebGLBuffer; indices: WebGLBuffer }>();
  const atlases = new Map<string, { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D;
    texture: WebGLTexture; dirty: boolean }>();
  const painted = new Map<SurfaceStroke, number>();
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const output = layer.getContext("2d")!;
  let invalid = true;
  let previousScene: SurfaceScene | undefined;

  function getAtlas(mode: SurfaceMode, mesh: number) {
    const key = `${mode}:${mesh}`;
    const found = atlases.get(key);
    if (found) return found;
    const chart = document.createElement("canvas");
    chart.width = chart.height = textureSize;
    const texture = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    const atlas = { canvas: chart, ctx: chart.getContext("2d")!, texture, dirty: true };
    atlases.set(key, atlas);
    return atlas;
  }

  function applyInk(strokes: SurfaceStroke[]) {
    const current = new Set(strokes);
    if ([...painted.keys()].some((stroke) => !current.has(stroke))) {
      painted.clear();
      for (const { ctx } of atlases.values()) ctx.clearRect(0, 0, textureSize, textureSize);
      for (const atlas of atlases.values()) atlas.dirty = true;
      invalid = true;
    }
    for (const stroke of strokes) {
      const start = painted.get(stroke) ?? 0;
      const { points } = stroke;
      for (let i = start; i < points.length; i++) {
        const point = points[i];
        if (!point) continue;
        const atlas = getAtlas(stroke.follow, point.mesh);
        atlasStroke(atlas.ctx, stroke.color, surfaces[stroke.follow][point.mesh], point, points[i - 1]);
        atlas.dirty = invalid = true;
      }
      painted.set(stroke, points.length);
    }
  }

  function bindGeometry(mesh: Mesh) {
    let buffers = geometry.get(mesh);
    if (!buffers) {
      buffers = { vao: gl!.createVertexArray()!, vertices: gl!.createBuffer()!, indices: gl!.createBuffer()! };
      geometry.set(mesh, buffers);
      gl!.bindVertexArray(buffers.vao);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffers.vertices);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(mesh.vertices.flatMap(({ position, u, v }) =>
        [...position, u, v])), gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(0);
      gl!.vertexAttribPointer(0, 3, gl!.FLOAT, false, 20, 0);
      gl!.enableVertexAttribArray(1);
      gl!.vertexAttribPointer(1, 2, gl!.FLOAT, false, 20, 12);
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, buffers.indices);
      gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl!.STATIC_DRAW);
    }
    gl!.bindVertexArray(buffers.vao);
  }

  function releaseGeometry(mesh: Mesh) {
    const buffers = geometry.get(mesh);
    if (!buffers) return;
    gl!.deleteVertexArray(buffers.vao);
    gl!.deleteBuffer(buffers.vertices);
    gl!.deleteBuffer(buffers.indices);
    geometry.delete(mesh);
  }

  function lost(event: Event) {
    event.preventDefault();
    onUnavailable();
  }
  canvas.addEventListener("webglcontextlost", lost, { once: true });

  return {
    draw(scene: SurfaceScene, strokes: SurfaceStroke[]) {
      applyInk(strokes);
      if (!invalid && previousScene === scene) return layer;
      invalid = false;
      // Generated pieces have their own mesh. Keep reusable drawing meshes
      // cached while releasing replaced wardrobe geometry.
      for (const object of previousScene?.objects ?? []) {
        if (object.color && !scene.objects.some((next) => next.geometry === object.geometry)) releaseGeometry(object.geometry);
      }
      previousScene = scene;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform2f(perspective, 2 * scene.focal / width, 2 * scene.focal / height);
      gl.uniform2f(principalPoint, 2 * scene.center.x / width - 1, 1 - 2 * scene.center.y / height);
      for (const object of scene.objects) {
        const atlas = getAtlas(object.mode, Math.max(0, object.mesh));
        gl.bindTexture(gl.TEXTURE_2D, atlas.texture);
        if (atlas.dirty) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
          gl.generateMipmap(gl.TEXTURE_2D);
          atlas.dirty = false;
        }
        bindGeometry(object.geometry);
        gl.uniformMatrix4fv(pose, false, object.pose);
        gl.uniform3fv(material, object.color ?? (object.mode === "garment" ? garmentColor : object.mesh === 1 ? brimColor : crownColor));
        gl.colorMask(object.visible, object.visible, object.visible, object.visible);
        gl.drawElements(gl.TRIANGLES, object.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
      }
      gl.colorMask(true, true, true, true);
      output.clearRect(0, 0, width, height);
      output.drawImage(canvas, 0, 0);
      return layer;
    },
    dispose() {
      canvas.removeEventListener("webglcontextlost", lost);
      for (const mesh of geometry.keys()) releaseGeometry(mesh);
      for (const atlas of atlases.values()) gl.deleteTexture(atlas.texture);
      gl.deleteProgram(program);
    },
  };
}
