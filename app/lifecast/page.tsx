import { redirect } from "next/navigation";

// Friendly alias; the extension iframe uses /omni?embed=1.
export default function Lifecast() {
  redirect("/omni");
}
