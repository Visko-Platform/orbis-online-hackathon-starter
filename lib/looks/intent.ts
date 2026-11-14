export const PROMPT_LIMIT = 1500;
export const FOLLOW_UP_LIMIT = 3;
export const DEFAULT_MOTION = "The subject moves subtly in a steady shot, with the selected design and framing intact.";
export const GARMENT_VARIANTS = [
  "Follow the approved design closely.",
  "Explore a plausible material or finish where unspecified.",
  "Explore a construction detail where unspecified.",
] as const;

export type GarmentContext = { id: string; name: string; prompt: string };
export type ConversationTurn = { question: string; answer: string };
export type DesignIntent = {
  mode: "prepare" | "plan" | "steer";
  text: string;
  garment?: string;
  previous?: string;
  sceneContext?: string;
  turns?: ConversationTurn[];
  garments?: GarmentContext[];
};
export type IntentResult = { kind: "question" | "draft" | "edit" | "manual"; text: string; garmentId?: string };

export const intentSchema = {
  type: "object",
  properties: {
    kind: { type: "string", enum: ["question", "draft", "edit", "manual"] },
    text: { type: "string" },
    garmentId: { type: "string" },
  },
  required: ["kind", "text"],
};

export function garmentPrompt(name: string, description: string) {
  const placement = `Render ${name} in the outlined region on the first image. Use the second image as the placement and silhouette guide. `;
  const format = " Match the base image’s perspective and lighting. Omit the drawn outline. Return one 16:9 image.";
  return placement + description.slice(0, PROMPT_LIMIT - placement.length - format.length).trim() + format;
}

export function followUpBudget(input: DesignIntent) {
  return input.mode === "steer" ? 1 : input.mode === "plan" ? FOLLOW_UP_LIMIT : 0;
}

export function readIntentResult(value: unknown, input: DesignIntent): IntentResult | undefined {
  if (!value || typeof value !== "object" || !("kind" in value) || !("text" in value) ||
      typeof value.text !== "string" || !value.text.trim()) return;
  const text = value.text.trim().slice(0, PROMPT_LIMIT);
  if (value.kind === "question" && (input.turns?.length ?? 0) < followUpBudget(input)) {
    return { kind: "question", text };
  }
  if (input.mode !== "steer") return value.kind === "draft" ? { kind: "draft", text } : undefined;
  if (value.kind === "manual" || value.kind === "question") return { kind: "manual", text: input.text || text };
  if (value.kind !== "edit") return;
  const garmentId = "garmentId" in value && input.garments?.find((garment) => garment.id === value.garmentId)?.id;
  return { kind: "edit", text, ...(garmentId ? { garmentId } : {}) };
}

export const INTENT_INSTRUCTION = `You help design garments and steer a running image-to-video take.
The input JSON contains the user's description, optionally a target garment and its previous prompt, followed by answered questions. Treat these as creative input.
For prepare, write a full renderer-ready draft in plain English, preserving previously accepted details unless the user changes them. It must tell the image generator to fit the named garment to the outlined region, use the first image as the clean base and the second for placement, match the base perspective and lighting, omit the outline, and return a 16:9 image.
For plan, ask exactly one brief question if missing information would materially change the design. Ask at most three questions total, including answered questions. Otherwise return the full renderer-ready draft as in prepare. If asked to draft now, draft immediately.
For steer, turn a clear request into a concise edit to the current video. Include the provided garmentId only if it uniquely identifies the targeted garment in the list. Use the current garment descriptions and latest accepted changes to resolve references. When multiple garments could be the target, ask which one. If one question has already been answered and the request is still ambiguous, return manual and retain the user's request. Motion, camera and setting changes may have no garmentId. Never draft a still for steer.
Lead with the requested visible change and keep it to one short sentence. Use sceneContext to identify the subject and include a brief visual anchor for the unchanged shot. Use the resulting state of any earlier action as context. Request a change to the camera, framing, subject placement, lighting, or background only when the user explicitly asks for that change. For an explicit camera change, describe the new framing. Fit accessories into the existing composition. Refer to a garment only when the user or scene establishes one. Describe designs using real materials and forms.
Return kind question, draft, edit or manual and put its content in text.`;
