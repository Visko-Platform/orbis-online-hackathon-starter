"use client";

import { FormEvent, useState } from "react";

export function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      window.location.href = next;
      return;
    }
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setError(result?.error ?? "Login failed");
    setBusy(false);
  };

  return (
    <main className="login">
      <form onSubmit={submit} className="omni-card">
        <p className="eyebrow">Visko Orbis · private demo</p>
        <h1>Sign in</h1>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="primary" disabled={busy || !password}>
          {busy ? "Checking…" : "Enter"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
