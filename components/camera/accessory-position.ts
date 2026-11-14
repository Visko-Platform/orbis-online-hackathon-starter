import { HEIGHT, WIDTH, type InkAction, type Point, type Shoulder } from "@/lib/camera/ink";
import type { JointId } from "@/lib/camera/joints";
import { anchorOffset, toAnchor } from "@/lib/camera/anchor-transform";

export class AccessoryPosition {
  readonly anchors = new Map<string, Shoulder>();
  private readonly offsets = new Map<string, Point>();
  private readonly joints = new Map<string, JointId>();
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private grab?: { id: string; point: Point };

  readonly jointRevision = () => this.revision;
  readonly subscribeJoints = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  jointFor(id: string) { return this.joints.get(id); }

  setJoint(id: string, joint?: JointId) {
    const previous = this.joints.get(id);
    if (previous === joint) return;
    if (previous) this.offsets.delete(`${id}:${previous}`);
    if (joint) this.joints.set(id, joint);
    else this.joints.delete(id);
    this.anchors.delete(id);
    if (this.grab?.id === id) this.grab = undefined;
    this.notify();
  }

  clearJoints() {
    if (!this.joints.size) return;
    for (const [id, joint] of this.joints) {
      this.offsets.delete(`${id}:${joint}`);
      this.anchors.delete(id);
    }
    this.grab = undefined;
    this.joints.clear();
    this.notify();
  }

  private notify() {
    this.revision++;
    for (const listener of this.listeners) listener();
  }

  private offsetKey(id: string) {
    const joint = this.joints.get(id);
    return joint ? `${id}:${joint}` : id;
  }

  offset(id: string, anchor: Shoulder | undefined): Point {
    if (!anchor || anchor.width <= 0) return { x: 0, y: 0 };
    this.anchors.set(id, anchor);
    const offset = this.offsets.get(this.offsetKey(id));
    return offset ? anchorOffset(offset, anchor) : { x: 0, y: 0 };
  }

  apply(id: string, action: InkAction, point?: Point) {
    if (action === "end" || action === "cancel") {
      this.grab = undefined;
      return;
    }
    const anchor = this.anchors.get(id);
    if (!anchor || !point) return;

    const local = toAnchor({ x: point.x * WIDTH, y: point.y * HEIGHT }, anchor);
    if (action === "start") {
      const offset = this.offsets.get(this.offsetKey(id)) ?? { x: 0, y: 0 };
      this.grab = { id, point: { x: local.x - offset.x, y: local.y - offset.y } };
    }
    if (action === "move" && this.grab?.id === id) {
      this.offsets.set(this.offsetKey(id), { x: local.x - this.grab.point.x, y: local.y - this.grab.point.y });
    }
  }
}
