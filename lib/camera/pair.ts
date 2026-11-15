import type { InkAction, Point } from "./ink";

export async function signal(body: object, abort: AbortSignal) {
  const response = await fetch("/api/camera-pair", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: abort,
  });
  if (response.status === 410) throw new Error("Pairing link expired. Open a new link from the Mac.");
  if (!response.ok) throw new Error("Could not pair with the Mac.");
  return response.json();
}

export async function description(peer: RTCPeerConnection, abort: AbortSignal) {
  const ready = () => peer.iceGatheringState === "complete";
  if (!ready()) await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => finish(), 2500);
    function finish(error?: unknown) {
      window.clearTimeout(timeout);
      peer.removeEventListener("icegatheringstatechange", update);
      abort.removeEventListener("abort", cancel);
      if (error) reject(error);
      else resolve();
    }
    function update() { if (ready()) finish(); }
    function cancel() { finish(abort.reason); }
    peer.addEventListener("icegatheringstatechange", update);
    abort.addEventListener("abort", cancel, { once: true });
    if (abort.aborted) cancel();
    else update();
  });
  const sdp = peer.localDescription?.sdp;
  if (!sdp) throw new Error("Could not prepare the local connection.");
  return sdp;
}

export function openHost(
  canvas: HTMLCanvasElement, address: string,
  onLink: (link: string) => void, status: (message: string) => void,
  ink: (action: InkAction, point?: Point) => void,
  onPrompt?: (text: string, autoApply?: boolean) => void,
) {
  const abort = new AbortController();
  const peer = new RTCPeerConnection({ iceServers: [] });
  const video = canvas.captureStream(30).getVideoTracks()[0];
  const channel = peer.createDataChannel("ink");
  peer.addTransceiver(video, { direction: "sendonly" });
  let pair: { id: string; host: string; guest: string } | undefined;
  let timer = 0;
  const stop = () => {
    if (abort.signal.aborted) return;
    abort.abort();
    window.clearTimeout(timer);
    channel.close();
    peer.close();
    video.stop();
    ink("cancel");
    if (pair) void signal({ action: "close", id: pair.id, key: pair.host }, AbortSignal.timeout(3000)).catch(() => {});
  };
  channel.onopen = () => { onLink(""); status("iPhone connected"); };
  peer.onconnectionstatechange = () => {
    if (["failed", "disconnected"].includes(peer.connectionState)) {
      stop();
      onLink("");
      status("iPhone disconnected. Open a new link to reconnect.");
    }
  };
  channel.onmessage = (event) => {
    if (typeof event.data !== "string" || event.data.length > 4096) return;
    try {
      const { action, point, text, autoApply } = JSON.parse(event.data);
      if (action === "prompt" && onPrompt && typeof text === "string") {
        onPrompt(text, autoApply);
        return;
      }
      if (action === "undo" || action === "cancel" || action === "end") ink(action);
      if ((action === "start" || action === "move") && Number.isFinite(point?.x) &&
        Number.isFinite(point?.y) && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1) ink(action, point);
    } catch { /* Ignore malformed drawing messages. */ }
  };

  void (async () => {
    try {
      await peer.setLocalDescription(await peer.createOffer());
      const sdp = await description(peer, abort.signal);
      const created: NonNullable<typeof pair> = await signal({ action: "create", sdp }, abort.signal);
      if (abort.signal.aborted) {
        void signal({ action: "close", id: created.id, key: created.host }, AbortSignal.timeout(3000)).catch(() => {});
        return;
      }
      pair = created;
      onLink(`https://${address}:3443/camera/phone#${pair.id}.${pair.guest}`);
      const poll = async () => {
        if (!pair || abort.signal.aborted) return;
        try {
          const result = await signal({ action: "poll", id: pair.id, key: pair.host }, abort.signal);
          if (result.sdp) {
            await peer.setRemoteDescription({ type: "answer", sdp: result.sdp });
            timer = window.setTimeout(() => {
              if (channel.readyState !== "open") fail(new Error("Could not connect. Check that both devices are on the same Wi-Fi."));
            }, 15_000);
          } else timer = window.setTimeout(poll, 500);
        } catch (error) { fail(error); }
      };
      void poll();
    } catch (error) { fail(error); }
  })();

  function fail(error: unknown) {
    if (abort.signal.aborted) return;
    stop();
    onLink("");
    status(error instanceof Error ? error.message : "Pairing failed.");
  }
  return stop;
}
