export const ORBIS_MODEL_NAME = "reactor/visko-orbis-stable";

export const ORBIS_TRACKS = [
  { name: "main_video", kind: "video", direction: "recvonly" },
  { name: "main_audio", kind: "audio", direction: "recvonly" },
] as const;

export const DOCUMENTED_RESOLUTIONS = ["1080p", "2k", "4k"];

/** Hard cap on one Orbis session, enforced by the token /api/token mints. */
export const SESSION_LIMIT_SECONDS = 300;

export type OrbisMessage = {
  type?: string;
  command?: string;
  reason?: string;
  available_resolutions?: string[];
  width?: number;
  height?: number;
  has_image?: boolean;
  image_conditioned?: boolean;
  started?: boolean;
  paused?: boolean;
};

export function unwrapOrbisMessage(raw: unknown): OrbisMessage {
  const envelope = raw as { type?: string; data?: Record<string, unknown> };
  if (envelope?.data && typeof envelope.data === "object") {
    return { ...envelope.data, type: envelope.type } as OrbisMessage;
  }
  return raw as OrbisMessage;
}

/** The Orbis models the cockpit can fly (A/B switch; Stable is the default). */
export const ORBIS_MODELS = {
  stable: "reactor/visko-orbis-stable",
  dynamic: "reactor/visko-orbis-dynamic",
} as const;
export type OrbisModelKey = keyof typeof ORBIS_MODELS;

export async function requestReactorJwt(model: OrbisModelKey = "stable") {
  const response = await fetch(`/api/token?model=${model}`, { method: "POST" });
  const result = (await response.json()) as { jwt?: string; error?: string };
  if (!response.ok || !result.jwt) {
    throw new Error(result.error || "Could not create a Reactor token");
  }
  return result.jwt;
}
