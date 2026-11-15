"use client";

import { useState } from "react";

// The model only needs enough detail to describe the scene, so send a
// downscaled JPEG instead of the full-size start image.
async function imageToBase64Jpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1568 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
}

export function PromptWriter({
  disabled,
  image,
  idea,
  onIdeaChange,
  onPrompt,
}: {
  disabled: boolean;
  image: File | null;
  idea: string;
  onIdeaChange: (idea: string) => void;
  onPrompt: (prompt: string) => void;
}) {
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState("");

  const write = async () => {
    if (!idea.trim() || writing) return;
    setWriting(true);
    setError("");
    try {
      const response = await fetch("/api/write-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          image: image ? await imageToBase64Jpeg(image) : undefined,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        prompt?: string;
        error?: string;
      } | null;
      if (!response.ok || !result?.prompt?.trim()) {
        throw new Error(result?.error || "No prompt came back");
      }
      onPrompt(result.prompt.trim());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setWriting(false);
    }
  };

  return (
    <div className="prompt-writer">
      <label>
        {image
          ? "Describe what should happen and get a prompt written to match your start image"
          : "Describe an idea and have the prompt written for you"}
        <div className="prompt-writer-row">
          <input
            type="text"
            value={idea}
            maxLength={2000}
            placeholder="e.g. a fox running through snowy woods at dawn"
            onChange={(event) => onIdeaChange(event.target.value)}
            onKeyDown={(event) => {
              // Enter here should write a prompt, not submit the run form.
              if (event.key === "Enter") {
                event.preventDefault();
                void write();
              }
            }}
          />
          <button
            type="button"
            disabled={disabled || writing || !idea.trim()}
            onClick={() => void write()}
          >
            {writing ? "Writing…" : "Write prompt"}
          </button>
        </div>
      </label>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
