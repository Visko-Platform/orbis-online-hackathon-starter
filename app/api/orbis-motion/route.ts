import { CAMERA_EDIT_LIMIT, CAMERA_SCENE_LIMIT, cameraMotionPayload, isCameraMotion } from "@/lib/orbis-camera-motion";
import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "orbis-motion", 90);
  if (blocked) return blocked;

  const payload = await readBoundedBody(request, 32 * 1024);
  if ("error" in payload) return payload.error;
  const input = await payload.body.json().catch(() => null);
  const { scene, edit, motion } = input ?? {};
  if (typeof scene !== "string" || !scene.trim() || scene.length > CAMERA_SCENE_LIMIT ||
      typeof edit !== "string" || edit.length > CAMERA_EDIT_LIMIT || !isCameraMotion(motion)) {
    return Response.json({ error: "Invalid camera motion or scene." }, { status: 400 });
  }

  return Response.json(cameraMotionPayload(scene, edit, motion), { headers: { "Cache-Control": "no-store" } });
}
