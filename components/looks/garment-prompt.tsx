"use client";

import { useEffect, useRef, useState } from "react";
import { closedOutline } from "@/lib/looks/composite";
import { readGarmentText, saveGarmentText, type Garment, type LookDraft } from "@/lib/looks/draft";
import { GARMENT_VARIANTS, PROMPT_LIMIT, garmentPrompt, type ConversationTurn, type DesignIntent } from "@/lib/looks/intent";
import { requestIntent } from "@/lib/looks/requests";
import { GarmentCandidates } from "./images";
import { LiveVoice } from "./live-voice";
import { Voice } from "./voice";

type Conversation = { description: string; turns: ConversationTurn[]; question: string };

export function GarmentPrompt({ layer, look, initial = "", preview = false, onClose }: {
  layer: Garment;
  look: LookDraft;
  initial?: string;
  preview?: boolean;
  onClose?: () => void;
}) {
  const [text, setText] = useState(() => preview ? initial : readGarmentText(layer.id)?.description ?? layer.accepted?.prompt ?? "");
  const [review, setReview] = useState<string | null>(() => preview
    ? garmentPrompt(layer.name, `Update the previous design as follows. ${initial} Previous design: ${layer.accepted?.prompt || ""}`)
    : readGarmentText(layer.id)?.review ?? null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [voicePlanning, setVoicePlanning] = useState(false);
  const [batch, setBatch] = useState<{ look: LookDraft; layer: Garment; prompt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const hasOutline = closedOutline(layer.outline);
  const staleBatch = batch && (batch.layer !== layer || batch.look.frame !== look.frame || batch.look.source !== look.source);
  useEffect(() => { if (staleBatch) setBatch(null); }, [staleBatch]);

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (!preview) saveGarmentText(layer.id, conversation?.description ?? text, review);
  }, [layer.id, preview, conversation, text, review]);

  async function prepare(mode: DesignIntent["mode"], spoken?: string, skipAnswer = false) {
    if (request.current) return;
    const answer = (spoken ?? text).trim();
    if (!answer && (!conversation || !skipAnswer)) return;
    const description = conversation?.description ?? answer;
    const turns = conversation ? [...conversation.turns, ...(answer && !skipAnswer ? [{ question: conversation.question, answer }] : [])] : [];
    const job = new AbortController();
    request.current = job;
    setBusy(true);
    setError("");
    try {
      const result = await requestIntent({ mode, text: description, garment: layer.name, previous: layer.accepted?.prompt, turns }, job.signal);
      if (job.signal.aborted) return;
      if (result.kind === "question") {
        setConversation({ description, turns, question: result.text });
        setText("");
      } else if (result.kind === "draft") {
        setConversation(null);
        setVoicePlanning(false);
        setReview(result.text);
      }
    } catch (caught) {
      if (!job.signal.aborted) {
        const details = [description, ...turns.map((turn) => `${turn.question} ${turn.answer}`)].join(" ");
        setReview(garmentPrompt(layer.name, details));
        setConversation(null);
        setVoicePlanning(false);
        setError(caught instanceof Error ? caught.message : "Couldn’t prepare this prompt.");
      }
    } finally {
      if (request.current === job) { request.current = null; setBusy(false); }
    }
  }

  function closeBatch() {
    setBatch(null);
    onClose?.();
  }

  return <section className="looks-prompt" aria-label={preview ? `Preview ${layer.name} as still` : `Design ${layer.name}`}>
    {batch && !staleBatch ? <GarmentCandidates {...batch} close={closeBatch} /> : review !== null ? <>
      <label>Image prompt<textarea value={review} maxLength={PROMPT_LIMIT} rows={4} onChange={(event) => setReview(event.target.value)} /></label>
      <details><summary>Candidate directions</summary><ol>{GARMENT_VARIANTS.map((direction) => <li key={direction}>{direction}</li>)}</ol></details>
      <div className="looks-row">
        <button type="button" disabled={!review.trim() || !hasOutline} onClick={() => setBatch({ look, layer, prompt: review.trim() })}>Generate {layer.name}</button>
        <button type="button" onClick={() => onClose ? onClose() : setReview(null)}>{preview ? "Close preview" : "Back"}</button>
      </div>
    </> : <>
      {!hasOutline && <p>Draw a closed outline for {layer.name}.</p>}
      {conversation && <p role="status">{conversation.question}</p>}
      <label>{conversation ? "Your answer" : `Describe ${layer.name}`}<textarea value={text} rows={2} maxLength={PROMPT_LIMIT}
        onChange={(event) => setText(event.target.value)} /></label>
      <div className="looks-row">
        {voicePlanning || conversation ? <LiveVoice question={conversation?.question} busy={busy} onError={setError}
          onTranscript={(speech) => { setText(speech); void prepare("plan", speech); }} /> :
          <Voice context={0} disabled={busy} onError={setError} onTranscript={setText} />}
        {conversation ? <>
          <button type="button" disabled={busy || !text.trim()} onClick={() => void prepare("plan")}>Answer</button>
          <button type="button" disabled={busy} onClick={() => void prepare("prepare", undefined, !text.trim())}>Draft now</button>
          <button type="button" disabled={busy} onClick={() => {
            setText(conversation.description);
            setConversation(null);
            setVoicePlanning(false);
          }}>Back</button>
        </> : <>
          <button type="button" disabled={busy || !text.trim()} onClick={() => void prepare("prepare")}>Prepare prompt</button>
          <button type="button" disabled={busy || (voicePlanning && !text.trim())}
            onClick={() => { setVoicePlanning(true); if (text.trim()) void prepare("plan"); }}>{voicePlanning ? "Ask planner" : "Plan together"}</button>
        </>}
        {busy && <span role="status">Preparing…</span>}
      </div>
    </>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
