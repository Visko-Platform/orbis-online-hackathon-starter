import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { COPILOT_MODEL, COPILOT_SESSION_CONFIG } from "@/lib/copilot-config";

export const runtime = "nodejs";

// Mints a short-lived, single-use Gemini Live token for the browser copilot.
// The token is locked to VESTA's model AND her full session config (voice,
// captions, persona): a constrained token ignores whatever config the client
// sends, so everything she needs must be baked in here. The real
// GEMINI_API_KEY never leaves the server.
export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });
    const now = Date.now();
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        // The session may run up to 30 minutes, but must START within 2.
        expireTime: new Date(now + 30 * 60_000).toISOString(),
        newSessionExpireTime: new Date(now + 2 * 60_000).toISOString(),
        liveConnectConstraints: {
          model: COPILOT_MODEL,
          config: COPILOT_SESSION_CONFIG,
        },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });
    if (!token.name) throw new Error("no token name");
    return NextResponse.json(
      { token: token.name },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (caught) {
    console.error("Live token mint failed", caught);
    return NextResponse.json(
      { error: "Could not start the copilot (Gemini Live token failed)" },
      { status: 502 },
    );
  }
}
