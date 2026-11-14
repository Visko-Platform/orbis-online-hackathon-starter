import { canvasPoint, type InkAction, type Point } from "@/lib/camera/ink";

export function bindPointer(element: HTMLCanvasElement, apply: (action: InkAction, point?: Point) => void) {
  let pointer: number | undefined;
  const down = (event: PointerEvent) => {
    if (pointer !== undefined || event.button !== 0) return;
    event.preventDefault();
    element.setPointerCapture(event.pointerId);
    pointer = event.pointerId;
    apply("start", canvasPoint(event, element));
  };
  const move = (event: PointerEvent) => {
    if (event.pointerId === pointer) apply("move", canvasPoint(event, element));
  };
  const up = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return;
    pointer = undefined;
    apply(event.type === "pointerup" ? "end" : "cancel");
  };
  element.addEventListener("pointerdown", down);
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", up);
  element.addEventListener("pointercancel", up);
  element.addEventListener("lostpointercapture", up);
  return () => {
    element.removeEventListener("pointerdown", down);
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", up);
    element.removeEventListener("pointercancel", up);
    element.removeEventListener("lostpointercapture", up);
    if (pointer !== undefined) apply("cancel");
  };
}
