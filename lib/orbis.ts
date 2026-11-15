// Orbis Stable and Orbis Dynamic share the same commands, events and tracks,
// so switching is only a matter of the model name. Stable is the default: in
// testing it moved in for close shots of two characters, while Dynamic held
// the wide framing of the start image. Set NEXT_PUBLIC_ORBIS_MODEL to
// "reactor/visko-orbis-dynamic" in .env.local to try Dynamic.
export const ORBIS_MODEL_NAME =
  process.env.NEXT_PUBLIC_ORBIS_MODEL || "reactor/visko-orbis-stable";

// Every Orbis model the app may connect to. A film can choose its own.
export const ORBIS_STABLE = "reactor/visko-orbis-stable";
export const ORBIS_DYNAMIC = "reactor/visko-orbis-dynamic";
export const ORBIS_MODELS = [ORBIS_STABLE, ORBIS_DYNAMIC];

export const ORBIS_TRACKS = [
  { name: "main_video", kind: "video", direction: "recvonly" },
  { name: "main_audio", kind: "audio", direction: "recvonly" },
] as const;

export const DOCUMENTED_RESOLUTIONS = ["1080p", "2k", "4k"];

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

export async function requestReactorJwt() {
  const response = await fetch("/api/token", { method: "POST" });
  const result = (await response.json()) as { jwt?: string; error?: string };
  if (!response.ok || !result.jwt) {
    throw new Error(result.error || "Could not create a Reactor token");
  }
  return result.jwt;
}
