import { type Demo, getDemo } from "@/lib/demos";
import { getOmniDemo } from "@/lib/server/omni";

/** Static demos plus dynamic Omni plans (kept in server memory). */
export function resolveDemo(id: string): Demo | undefined {
  return getDemo(id) ?? getOmniDemo(id);
}
