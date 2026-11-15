export const ORBIS_MODEL_NAME = "reactor/visko-orbis-stable";

export const ORBIS_TRACKS = [
  { name: "main_video", kind: "video", direction: "recvonly" },
  { name: "main_audio", kind: "audio", direction: "recvonly" },
] as const;

export const STABLE_RESOLUTIONS = ["1080p", "2k", "4k"];

export function preferredOrbisResolution(available: string[] = STABLE_RESOLUTIONS) {
  for (const tier of ["720p", ...STABLE_RESOLUTIONS]) {
    const match = available.find((size) => size.toLowerCase() === tier);
    if (match) return match;
  }
  return available[0] ?? STABLE_RESOLUTIONS[0];
}

export async function setOrbisResolution(
  sendCommand: (command: string, data: { resolution: string }) => Promise<unknown>,
  resolution: string,
) {
  const reply = unwrapOrbisMessage(await sendCommand("set_resolution", { resolution }));
  if (reply?.type !== "resolution_accepted") {
    throw new Error(reply?.reason || `Orbis did not confirm ${resolution} delivery.`);
  }
}

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
