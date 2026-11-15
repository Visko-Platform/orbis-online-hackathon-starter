"use client";

import { useState } from "react";
import { addGarment, moveGarment, removeGarment, selectGarment, type LookDraft } from "@/lib/looks/draft";

export function Layers({ look }: { look: LookDraft }) {
  const [name, setName] = useState("");
  return <>
    <form className="looks-row looks-tools" onSubmit={(event) => {
      event.preventDefault();
      if (name.trim()) { addGarment(name.trim()); setName(""); }
    }}>
      <input aria-label="Garment name" placeholder="Garment name" value={name} maxLength={64} onChange={(event) => setName(event.target.value)} />
      <button disabled={!name.trim() || look.layers.length >= 24}>Add garment</button>
    </form>
    {look.layers.length > 0 && <ol className="looks-layer-list" aria-label="Garment layers, front to back">
      {[...look.layers].reverse().map((layer, index) => <li key={layer.id}>
        <button type="button" aria-pressed={look.activeId === layer.id} onClick={() => selectGarment(layer.id)}>{layer.name}</button>
        {look.activeId === layer.id && <>
          <button type="button" disabled={index === 0} aria-label={`Move ${layer.name} forward`} onClick={() => moveGarment(layer.id, 1)}>↑</button>
          <button type="button" disabled={index === look.layers.length - 1} aria-label={`Move ${layer.name} backward`} onClick={() => moveGarment(layer.id, -1)}>↓</button>
        </>}
        <button type="button" aria-label={`Delete layer ${layer.name}`} onClick={() => removeGarment(layer.id)}>Delete</button>
      </li>)}
    </ol>}
  </>;
}
