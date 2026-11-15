import { HEIGHT, WIDTH, type Ink } from "@/lib/camera/ink";
import { bindPointer } from "./pointer";

export function openOutput(ink: Ink) {
  const popup = window.open("", "camera-studio-output", "popup,width=980,height=620");
  if (!popup) return null;
  const page = popup.document;
  page.title = "Camera studio";
  const viewport = page.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1";
  page.head.append(viewport);
  page.body.style.cssText = "margin:0;background:#0a0a0b;color:#f6f4ed;font-family:Verdana,Inter,sans-serif;";
  const canvas = page.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = "display:block;width:100%;max-height:calc(100vh - 48px);width:min(100%,calc((100vh - 48px) * 16 / 9));margin:auto;background:#000;touch-action:none;";
  canvas.setAttribute("aria-label", "Draw on live video");
  const undo = page.createElement("button");
  undo.textContent = "Undo";
  undo.style.cssText = "margin:8px;font:inherit;";
  undo.onclick = () => ink.apply("output", "undo");
  page.body.replaceChildren(canvas, undo);
  const unbind = bindPointer(canvas, (action, point) => ink.apply("output", action, point));
  popup.addEventListener("pagehide", unbind, { once: true });
  const ctx = canvas.getContext("2d")!;
  return {
    focus: () => { if (popup.closed) return false; popup.focus(); return true; },
    draw: (source: HTMLCanvasElement) => { if (!popup.closed) ctx.drawImage(source, 0, 0); },
    clear: () => ctx.clearRect(0, 0, WIDTH, HEIGHT),
    close: () => { unbind(); popup.close(); },
  };
}
