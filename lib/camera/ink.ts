import type { FaceAnchor, FacePoint } from "./face-anchor";
import type { SurfaceMode } from "./surface-mesh";
import { createSurfaceRenderer, type SurfaceStroke } from "./surface-renderer";
import type { SurfaceScene } from "./surface-scene";
import { hatReferenceScenes } from "./hat-reference";
import type { JointAnchors } from "./joint-tracking";
import { defaultJoint, type JointId } from "./joints";
import { fromAnchor, toAnchor } from "./anchor-transform";

export type Point = { x: number; y: number };
export type Shoulder = { center: Point; angle: number; width: number };
export type Follow = "off" | "shoulders" | "face" | "joint" | SurfaceMode;
type FlatStroke = { points: (FacePoint | null)[]; follow: Exclude<Follow, SurfaceMode>; color: string; joint?: JointId };
type Stroke = FlatStroke | SurfaceStroke;
const isSurface = (stroke: Stroke): stroke is SurfaceStroke => stroke.follow === "hat" || stroke.follow === "garment";
export type InkAction = "start" | "move" | "end" | "cancel" | "undo";
export const WIDTH = 960;
export const HEIGHT = 540;

export function canvasPoint(event: { clientX: number; clientY: number }, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

export function paint(ctx: CanvasRenderingContext2D, points: Point[], color = "#ffe083") {
  if (!points.length) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 1) ctx.lineTo(points[0].x + 0.01, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
}

export type PinchEvent = { id: number; phase: "start" | "end" | "cancel"; follow: Follow; joint?: JointId };

export class Ink {
  private strokeIds = new WeakMap<Stroke, number>();
  private nextStrokeId = 0;
  private hidden = new Set<number>();
  onPinch?: (event: PinchEvent) => void;
  drawOverlays?: (context: CanvasRenderingContext2D) => void;
  overlayShoulders?: () => boolean;
  overlayJoints?: () => JointId[];

  hasStroke(id: number) {
    return this.finished.some((stroke) => this.strokeIds.get(stroke) === id);
  }

  showStroke(id: number, visible: boolean) {
    if (visible) this.hidden.delete(id);
    else this.hidden.add(id);
    this.drawingChanged();
  }
  private finished: Stroke[] = [];
  private active = new Map<string, Stroke>();
  private revision = 0;
  private listeners = new Set<() => void>();
  readonly drawingRevision = () => this.revision;
  readonly subscribeDrawing = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  shoulder?: Shoulder;
  face?: FaceAnchor;
  scene?: SurfaceScene;
  private jointAnchors?: JointAnchors;
  private surfaceRenderer?: ReturnType<typeof createSurfaceRenderer>;
  private surfaceUnavailable = false;
  private stillSurface?: HTMLCanvasElement;
  onSurfaceUnavailable?: () => void;
  follow: Follow = "off";
  joint = defaultJoint;
  color = "#ffe083";

  get hasVisibleDrawing() {
    return !!this.stillSurface || this.finished.some((stroke) => !this.hidden.has(this.strokeIds.get(stroke) ?? 0));
  }

  get hasDrawing() { return this.finished.length > 0 || !!this.stillSurface; }
  get hasHatDrawing() {
    return this.finished.some((stroke) => stroke.follow === "hat") ||
      Array.from(this.active.values()).some((stroke) => stroke.follow === "hat" && stroke.points.length);
  }

  get drawingLayers() {
    return [...new Set(this.finished.map(({ follow }) => follow))];
  }

  removeDrawingLayer(mode: Follow) {
    this.finished = this.finished.filter((stroke) => {
      if (stroke.follow !== mode) return true;
      this.hidden.delete(this.strokeIds.get(stroke) ?? 0);
      return false;
    });
    for (const [source, stroke] of this.active) if (stroke.follow === mode) this.apply(source, "cancel");
    this.drawingChanged();
  }

  get hatStrokes() {
    return this.finished.filter(isSurface).filter((stroke) => stroke.follow === "hat");
  }

  drawHatReference(ctx: CanvasRenderingContext2D, tile: number) {
    const strokes = [...this.finished, ...this.active.values()].filter(isSurface).filter((stroke) => stroke.follow === "hat");
    if (!strokes.length) return false;
    const renderer = createSurfaceRenderer(tile, tile, () => {});
    if (!renderer) return false;
    try {
      hatReferenceScenes(tile).forEach((scene, index) =>
        ctx.drawImage(renderer.draw(scene, strokes), index * tile, 0));
      return true;
    } finally {
      renderer.dispose();
    }
  }

  get canStart() {
    if (this.follow === "hat" || this.follow === "garment") {
      return !this.surfaceUnavailable && !!this.scene?.objects.some((object) => object.mode === this.follow);
    }
    if (this.follow === "joint") return !!this.jointAnchor(this.joint);
    return this.follow === "off" || (this.follow === "face" ? !!this.face : !!this.shoulder);
  }

  jointAnchor(id: JointId) {
    return this.jointAnchors?.get(id);
  }

  *followedJoints() {
    if (this.follow === "joint") yield this.joint;
    for (const strokes of [this.finished, this.active.values()]) {
      for (const stroke of strokes) if (!isSurface(stroke) && stroke.joint) yield stroke.joint;
    }
  }

  setJointAnchors(anchors?: JointAnchors) {
    if (!this.jointAnchors?.size && !anchors?.size) return;
    this.jointAnchors = anchors;
    for (const stroke of this.active.values()) {
      if (!isSurface(stroke) && stroke.joint && !anchors?.has(stroke.joint) && stroke.points.at(-1)) {
        stroke.points.push(null);
      }
    }
  }

  follows(mode: Follow) {
    return this.follow === mode || this.finished.some((stroke) => stroke.follow === mode) ||
      Array.from(this.active.values()).some((stroke) => stroke.follow === mode);
  }

  clear() {
    this.finished = [];
    for (const source of this.active.keys()) this.apply(source, "cancel");
    this.hidden.clear();
    this.stillSurface = undefined;
    this.drawingChanged();
  }

  private drawingChanged() {
    this.revision++;
    for (const listener of this.listeners) listener();
  }

  resetSurfaceRenderer() {
    this.surfaceRenderer?.dispose();
    this.surfaceRenderer = undefined;
    this.surfaceUnavailable = false;
  }

  private renderSurface(strokes: Stroke[]) {
    if (!this.scene?.objects.length || this.surfaceUnavailable) return this.stillSurface;
    this.surfaceRenderer ??= createSurfaceRenderer(WIDTH, HEIGHT, () => {
      this.surfaceUnavailable = true;
      this.onSurfaceUnavailable?.();
    });
    return this.surfaceRenderer?.draw(this.scene, strokes.filter(isSurface));
  }

  snapshot() {
    const copy = new Ink();
    const strokes = this.finished.concat(Array.from(this.active.values()));
    const surface = this.renderSurface(strokes);
    if (surface) {
      copy.stillSurface = document.createElement("canvas");
      copy.stillSurface.width = WIDTH;
      copy.stillSurface.height = HEIGHT;
      copy.stillSurface.getContext("2d")!.drawImage(surface, 0, 0);
    }
    copy.finished = strokes.flatMap((stroke) => {
      if (isSurface(stroke)) return [];
      const points = this.project(stroke).map((point) => point ? { x: point.x / WIDTH, y: point.y / HEIGHT } : null);
      return points.some(Boolean) ? [{ points, follow: "off", color: stroke.color }] : [];
    });
    return copy;
  }

  apply(source: string, action: InkAction, point?: Point, hatScene?: SurfaceScene) {
    if (action === "undo") {
      const removed = this.finished.pop();
      if (!removed) this.stillSurface = undefined;
      else this.hidden.delete(this.strokeIds.get(removed) ?? 0);
      this.drawingChanged();
      return;
    }
    if (action === "start" && point) {
      const follow = hatScene ? "hat" : this.follow;
      const surfaceMode = follow === "hat" || follow === "garment";
      if (follow === "joint" && !this.canStart) return;
      if (!this.canStart && !surfaceMode && !source.startsWith("hand:")) return;
      this.active.set(source, follow === "joint"
        ? { points: [], follow, color: this.color, joint: this.joint }
        : { points: [], follow: this.canStart || surfaceMode ? follow : "off", color: this.color });
    }
    const stroke = this.active.get(source);
    if (!stroke) return;
    if (point && stroke.points.length < 4096) {
      if (isSurface(stroke)) {
        const scene = hatScene ?? this.scene;
        const hit = (hatScene || !this.surfaceUnavailable) &&
          scene?.pick({ x: point.x * WIDTH, y: point.y * HEIGHT }, stroke.follow);
        if (hit) stroke.points.push(hit);
        else if (stroke.points.at(-1)) stroke.points.push(null);
      } else {
        let local: FacePoint | undefined;
        const pixel = { x: point.x * WIDTH, y: point.y * HEIGHT };
        if (stroke.follow === "off") local = point;
        if (stroke.follow === "shoulders" && this.shoulder) local = toAnchor(pixel, this.shoulder);
        if (stroke.follow === "face") local = this.face?.attach(pixel);
        const anchor = stroke.joint && this.jointAnchor(stroke.joint);
        if (anchor) local = toAnchor(pixel, anchor);
        if (local) stroke.points.push(local);
        else if (stroke.points.at(-1)) stroke.points.push(null);
      }
    }
    if (source.startsWith("hand:") && stroke.points.length && !this.strokeIds.has(stroke)) {
      const id = ++this.nextStrokeId;
      this.strokeIds.set(stroke, id);
      this.onPinch?.({ id, phase: "start", follow: stroke.follow, joint: !isSurface(stroke) ? stroke.joint : undefined });
    }
    if (action === "end" || action === "cancel") {
      this.active.delete(source);
      if (action === "end" && stroke.points.length) {
        if (this.finished.length >= 128) {
          const removed = this.finished.shift()!;
          this.hidden.delete(this.strokeIds.get(removed) ?? 0);
        }
        this.finished.push(stroke);
      }
      const id = this.strokeIds.get(stroke);
      if (id !== undefined) this.onPinch?.({
        id, phase: action, follow: stroke.follow, joint: !isSurface(stroke) ? stroke.joint : undefined,
      });
      if (action === "end" && stroke.points.length) this.drawingChanged();
    }
  }

  draw(ctx: CanvasRenderingContext2D, only?: number, includeActive = true) {
    const strokes = [...this.finished, ...(includeActive ? this.active.values() : [])].filter((stroke) => {
      const id = this.strokeIds.get(stroke);
      return only !== undefined ? id === only : id === undefined || !this.hidden.has(id);
    });
    const surface = this.renderSurface(strokes);
    if (surface && (only === undefined || strokes.some(isSurface))) ctx.drawImage(surface, 0, 0);
    for (const stroke of strokes) {
      if (isSurface(stroke)) continue;
      let segment: Point[] = [];
      for (const point of this.project(stroke)) {
        if (point) segment.push(point);
        else if (segment.length) {
          paint(ctx, segment, stroke.color);
          segment = [];
        }
      }
      paint(ctx, segment, stroke.color);
    }
  }

  private project(stroke: FlatStroke) {
    const { shoulder, face } = this;
    const anchor = stroke.joint && this.jointAnchor(stroke.joint);
    if (stroke.follow === "face" && !face || stroke.follow === "shoulders" && !shoulder ||
      stroke.follow === "joint" && !anchor) return [];
    return stroke.points.map((point) => {
      if (!point) return;
      if (stroke.follow === "face") return face?.project(point);
      if (stroke.follow === "shoulders" && shoulder) return fromAnchor(point, shoulder);
      if (anchor) return fromAnchor(point, anchor);
      return { x: point.x * WIDTH, y: point.y * HEIGHT };
    });
  }
}

export function cover(width: number, height: number) {
  const scale = Math.max(WIDTH / width, HEIGHT / height);
  return { width: width * scale, height: height * scale,
    x: (WIDTH - width * scale) / 2, y: (HEIGHT - height * scale) / 2 };
}
