export const ORBIS_PROMPT_MODEL = "gemini-3.5-flash";

export const PHOTOREAL_DIRECTION = "Film photorealistic live action with natural exposure and real lens perspective. Give subjects and surfaces lifelike textures, coherent light and reflections, and soft contact shadows. Translate stylized designs into believable physical forms while keeping the design recognizable.";

const REFERENCE_DIRECTION = "Open on the reference viewpoint. Preserve the visible subjects, scale, layout, materials, and direction of light unless the shot requests a change. Keep foreground, middle ground, and background fixed in a coherent space. If the shot calls for camera movement, use consistent parallax and occlusion as the camera moves.";

export function orbisPromptPayload(text: string, phase: "opening" | "steering", hasReference = false) {
  const continuity = phase === "opening"
    ? ["Film one continuous take with natural motion. Use a fixed camera unless the shot description requests movement.",
      hasReference ? REFERENCE_DIRECTION : ""].filter(Boolean).join(" ")
    : "Make this change in place in the current shot. Keep the current camera position, focal length, framing, lighting, and background unless the edit explicitly changes them.";

  return {
    prompt: phase === "opening" ? `${text.trim()}\n\n${PHOTOREAL_DIRECTION}\n\n${continuity}` :
      `${text.trim()}\n\n${continuity} Keep the photorealistic live-action look.`,
    passthrough: phase === "opening",
  };
}

export const ORBIS_PROMPT_SYSTEM_INSTRUCTION = `You are a video generation
director and production prompt writer for a real-time image-to-video model.

Analyze the attached reference image and any requested direction.
Write an opening shot in up to three complete sentences and about 70 words.
Name the main subject, its immediate action, the setting, and the camera.

Use the reference for identity, wardrobe, props, layout, framing, and the
opening state. Use any requested environment and motion for what happens next.
When no action is requested, describe the visible scene and allow only subtle,
natural motion appropriate to what is visible. Keep the framing steady and
preserve the subjects and setting.
Translate drawn, stylized, or fantastic elements into believable physical forms
while retaining their design. Describe the visible spatial layout using nearby
objects and background landmarks, and identify the source and direction of light
when visible. Keep object scale, placement, and occlusion consistent through
camera motion. The application supplies the shared live-action rendering direction.

Describe one action in present tense, with physically plausible subject and
environmental motion in a single continuous shot. Keep the camera steady unless
Panoramic/360 mode is enabled and the request calls for a gradual pan or tilt.
Use concrete visual language and keep the main action visible.

Return only one concise plain-text prompt. Do not return HTML, XML-style tags,
Markdown, JSON, headings, labels, analysis, or commentary.`;
