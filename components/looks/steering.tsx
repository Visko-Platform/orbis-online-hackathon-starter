"use client";

import { useEffect, useRef, useState } from "react";
import { garmentContext, useLook, type LookDraft } from "@/lib/looks/draft";
import { PROMPT_LIMIT, type GarmentContext, type IntentResult } from "@/lib/looks/intent";
import { requestIntent } from "@/lib/looks/requests";
import { GarmentPrompt } from "./garment-prompt";
import { LiveVoice } from "./live-voice";

type AppliedEdit = { text: string; garmentId?: string };

export function Steering({ runLook, openingScene, disabled, apply, onError, onLiveSpeech }: {
  runLook?: LookDraft;
  openingScene: string;
  disabled?: boolean;
  apply: (prompt: string) => Promise<boolean>;
  onError: (error: string) => void;
  onLiveSpeech?: (text: string) => boolean;
}) {
  const look = useLook();
  const garments = useRef<GarmentContext[]>(runLook ? garmentContext(runLook.layers) : []).current;
  const [text, setText] = useState("");
  const [question, setQuestion] = useState<{ first: string; question: string } | null>(null);
  const [edits, setEdits] = useState<AppliedEdit[]>([]);
  const [preview, setPreview] = useState<AppliedEdit | null>(null);
  const [busy, setBusy] = useState(false);
  const operation = useRef<AbortController | null>(null);
  const previous = useRef<AppliedEdit[]>([]);
  const fallback = useRef(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const feed = useRef<HTMLOListElement>(null);
  useEffect(() => () => operation.current?.abort(), []);
  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight; }, [edits]);

  async function steer(instruction: string, force = false) {
    if (operation.current || disabledRef.current || !instruction.trim()) return;
    const job = new AbortController();
    operation.current = job;
    setBusy(true);
    onError("");
    const original = question?.first ?? instruction.trim();
    const editable = question ? `${original}\n${instruction.trim()}`.slice(0, PROMPT_LIMIT) : original;
    const turns = question ? [{ question: question.question, answer: instruction.trim() }] : [];
    try {
      const result: IntentResult = force ? { kind: "edit", text: instruction.trim() } : await requestIntent({
        mode: "steer", text: original, turns,
        sceneContext: (previous.current.at(-1)?.text ?? openingScene).slice(0, PROMPT_LIMIT),
        garments: garments.map((garment) => ({ ...garment,
          prompt: [garment.prompt, ...previous.current.filter((edit) => edit.garmentId === garment.id).slice(-3).map((edit) => edit.text)]
            .join("\n").slice(-PROMPT_LIMIT) })),
      }, job.signal);
      if (job.signal.aborted) return;
      if (result.kind === "question") { setQuestion({ first: original, question: result.text }); setText(""); return; }
      if (result.kind !== "edit" || disabledRef.current) {
        fallback.current = true;
        setQuestion(null);
        setText(editable);
        return;
      }
      const accepted = await apply(result.text);
      if (!accepted && !job.signal.aborted) {
        setQuestion(null);
        setText(editable);
      }
      if (accepted && !job.signal.aborted) {
        previous.current = [...previous.current, { text: result.text, garmentId: result.garmentId }];
        setEdits(previous.current);
        setText("");
        setQuestion(null);
        fallback.current = false;
      }
    } catch (caught) {
      if (!job.signal.aborted) {
        fallback.current = true;
        setQuestion(null);
        setText(editable);
        onError(caught instanceof Error ? caught.message : "Couldn’t prepare this edit.");
      }
    } finally {
      if (operation.current === job) { operation.current = null; setBusy(false); }
    }
  }

  const layer = look.layers.find((item) => item.id === preview?.garmentId);
  return <>
    {edits.length > 0 && <ol ref={feed} className="live-history looks-edits" aria-label="Accepted edits">
      {edits.map((edit, index) => <li key={index}>{edit.text}{edit.garmentId && look.layers.some((item) => item.id === edit.garmentId) &&
        <button type="button" onClick={() => setPreview(edit)}>Preview as still</button>}</li>)}
    </ol>}
    {question && <p role="status">{question.question}</p>}
    <form className="looks-prompt" onSubmit={(event) => { event.preventDefault(); void steer(text, fallback.current); }}>
      <label>{question ? "Your answer" : "Steer the take"}<textarea value={text} maxLength={PROMPT_LIMIT} rows={2}
        onChange={(event) => setText(event.target.value)} /></label>
      <div className="looks-row">
        <LiveVoice question={question?.question} disabled={disabled} busy={busy} onError={onError}
          onTranscript={(speech) => {
            if (!question && onLiveSpeech?.(speech)) return;
            setText(speech);
            fallback.current = false;
            void steer(speech);
          }} />
        <button disabled={disabled || busy || !text.trim()}>{question ? "Answer" : "Apply edit"}</button>
        {busy && <span role="status">Preparing edit…</span>}
      </div>
    </form>
    {preview && layer && <GarmentPrompt key={`${edits.indexOf(preview)}:${layer.id}`} layer={layer} look={look} initial={preview.text}
      preview onClose={() => setPreview(null)} />}
  </>;
}
