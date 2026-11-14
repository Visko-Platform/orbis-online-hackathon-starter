import { useSyncExternalStore } from "react";
import { accessoryPlacements } from "@/lib/camera/accessory";
import type { Follow, Ink } from "@/lib/camera/ink";
import type { WardrobeControls } from "./use-wardrobe";
import type { AccessoryPosition } from "./accessory-position";
import { JointPicker } from "./joint-picker";
import styles from "./studio.module.css";

const drawingLayers: Record<Follow, string> = {
  off: "Canvas ink", shoulders: "Shoulder ink", face: "Face ink", joint: "Landmark ink", hat: "3D hat drawing", garment: "3D garment drawing",
};

export function CameraOverlays({ ink, wardrobe, follow, changeFollow, movingId, onMove, position }: {
  movingId: string;
  onMove?: (id: string) => void;
  ink: Ink;
  wardrobe: WardrobeControls;
  follow: Follow;
  changeFollow: (mode: Follow) => void;
  position: AccessoryPosition;
}) {
  useSyncExternalStore(ink.subscribeDrawing, ink.drawingRevision, () => 0);
  useSyncExternalStore(position.subscribeJoints, position.jointRevision, () => 0);
  const layers = ink.drawingLayers;
  if ((follow === "hat" || follow === "garment") && !layers.includes(follow)) layers.push(follow);
  const { pieces, worn } = wardrobe.wardrobe;
  const activePieces = pieces.filter((piece) => worn[piece.placement] === piece.id);
  const count = layers.length + activePieces.length;

  if (!count) return null;

  return <section className={styles.overlays} aria-label="Camera overlays">
    <p>{movingId ? "Drag on the video to reposition." : "Camera overlays"}</p>
    <ul className={styles.layerList}>
      {layers.map((layer) => <li key={layer}>
        {drawingLayers[layer]}
        <button type="button" aria-label={`Remove ${drawingLayers[layer]}`} onClick={() => {
          if (layer === follow && (layer === "hat" || layer === "garment")) changeFollow("off");
          ink.removeDrawingLayer(layer);
        }}>Remove</button>
      </li>)}
      {activePieces.map(({ id, placement, prompt }) => <li key={id}>
        <span>{accessoryPlacements[placement].label} · {prompt}</span>
        {placement !== "head" && <label>Follow joint <JointPicker accessory label={`Follow joint for ${prompt}`}
          value={position.jointFor(id)} onChange={(joint) => position.setJoint(id, joint)} /></label>}
        {onMove && placement !== "head" && <button type="button"
          aria-pressed={movingId === id}
          aria-label={movingId === id ? "Finish repositioning" : `Reposition ${prompt}`}
          onClick={() => onMove(movingId === id ? "" : id)}>
          {movingId === id ? "Done" : "Reposition"}
        </button>}
        <button type="button" aria-label={`Remove ${prompt} from camera`}
          onClick={() => wardrobe.remove(placement)}>Remove</button>
      </li>)}
    </ul>
  </section>;
}
