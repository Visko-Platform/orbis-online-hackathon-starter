import { drawAccessory, type AccessoryFace, type AccessoryHands, type CameraAccessory } from "@/lib/camera/accessory-overlay";
import { drawCamera } from "@/lib/camera/frame";
import type { Ink, Shoulder } from "@/lib/camera/ink";
import type { CameraMotionTracking } from "@/lib/camera/motion";
import { track } from "@/lib/camera/tracking";
import type { AccessoryPosition } from "./accessory-position";

function drawJointAccessory(ctx: CanvasRenderingContext2D, accessory: CameraAccessory, anchor: Shoulder) {
  const image = accessory.views[0];
  const height = Math.min(240, Math.max(18, anchor.width * 2.5));
  const width = height * image.width / image.height;
  ctx.translate(anchor.center.x, anchor.center.y);
  ctx.rotate(anchor.angle + Math.PI / 2);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
}

export function composeCamera({ video, canvas, clean, ink, position, pieces, status, onFrame, motionTracking }: {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  clean: HTMLCanvasElement;
  ink: Ink;
  position: AccessoryPosition;
  pieces: () => CameraAccessory[];
  status: (message: string) => void;
  onFrame: (source: HTMLCanvasElement) => void;
  motionTracking?: CameraMotionTracking;
}) {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const camera = clean.getContext("2d")!;
  let face: AccessoryFace | undefined;
  let hands: AccessoryHands = {};
  const endTracking = track(video, ink, status, {
    placements: () => pieces().flatMap(({ id, placement }) => position.jointFor(id) ? [] : [placement]),
    followedJoints: () => pieces().flatMap(({ id }) => {
      const joint = position.jointFor(id);
      return joint ? [joint] : [];
    }),
    headwear: () => pieces().find(({ placement }) => placement === "head")?.headwear,
    updateFace: (value) => { face = value; },
    updateHands: (value) => { hands = value; },
  }, motionTracking);
  let frame = 0;

  function render() {
    if (video.videoWidth) {
      drawCamera(camera, video);
      ctx.drawImage(clean, 0, 0);
      const upperBody = endTracking.upperBody();
      position.anchors.clear();
      for (const accessory of pieces()) {
        const { id, placement } = accessory;
        const joint = position.jointFor(id);
        const jointAnchor = joint && ink.jointAnchor(joint);
        if (joint && !jointAnchor) continue;
        const anchor = jointAnchor || (placement === "shoulders" ? ink.shoulder
          : placement === "leftHand" || placement === "rightHand" ? hands[placement]
            : placement === "upperLip" ? face?.upperLip : face?.eyes);
        const offset = position.offset(id, anchor);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        if (jointAnchor) drawJointAccessory(ctx, accessory, jointAnchor);
        else drawAccessory(ctx, accessory, face, ink.shoulder, hands, upperBody);
        ctx.restore();
      }
      ink.draw(ctx);
      ink.drawOverlays?.(ctx);
      onFrame(canvas);
    }
    frame = requestAnimationFrame(render);
  }

  render();
  return () => {
    cancelAnimationFrame(frame);
    position.anchors.clear();
    endTracking();
  };
}
