import { describeAccessory } from "@/lib/camera/accessory";
import type { CameraAccessory } from "@/lib/camera/accessory-overlay";
import { canvasBlob } from "@/lib/camera/frame";
import { headViews, type HeadPhotos } from "@/lib/camera/head-views";
import { responseError } from "@/lib/looks/requests";
export async function prepareWardrobeReference(frame: Blob, pieces: CameraAccessory[], signal: AbortSignal,
  { headPhotos, hat, environment, background, sketch }: { headPhotos: HeadPhotos; hat?: Blob; environment?: string; background?: File; sketch?: boolean }) {
  if (!pieces.length && !hat && !Object.keys(headPhotos).length && !environment && !background && !sketch) {
    return { image: new File([frame], "Camera drawing.jpg", { type: "image/jpeg" }), direction: "" };
  }
  const body = new FormData();
  body.append("frame", frame, "camera.jpg");
  if (environment) body.append("environment", environment);
  if (background) body.append("background", background);
  if (sketch) body.append("source", "sketch");

  const directions = pieces.map(({ placement, prompt }) => describeAccessory(placement, prompt));
  if (hat) {
    body.append("hat", hat, "drawn-hat.jpg");
    directions.push("Keep the hat's crown, brim, and painted markings in the same physical positions as the person turns.");
  }
  for (const { id } of headViews) {
    const photo = headPhotos[id];
    if (photo) body.append(id, photo, `${id}.jpg`);
  }
  const direction = directions.join(" ");
  body.append("direction", direction);
  await Promise.all(pieces.map(async ({ sheet }, index) => {
    const bitmap = await createImageBitmap(sheet, { resizeWidth: 768, resizeQuality: "high" });
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    bitmap.close();
    return { blob: await canvasBlob(canvas, "image/jpeg"), index };
  })).then((sheets) => {
    for (const { blob, index } of sheets) body.append("sheet", blob, `piece-${index + 1}.jpg`);
  });
  const response = await fetch("/api/wardrobe-reference", { method: "POST", body, signal });
  if (!response.ok) throw await responseError(response);
  const blob = await response.blob();
  return { image: new File([blob], sketch ? "Sketch render.jpg" : "Wardrobe look.jpg", { type: blob.type }), direction };
}
