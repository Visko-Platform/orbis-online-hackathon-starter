import type { Reactor } from "@reactor-team/js-sdk";
import { setOrbisResolution, unwrapOrbisMessage, type OrbisMessage } from "./orbis";
import { orbisPromptPayload } from "./orbis-prompt";
import { prepareOrbisReference } from "./orbis-reference";

export type OrbisOpeningSignals = Partial<Record<"image" | "conditions" | "started", () => void>>;

async function awaitSignal<T>(
  signals: OrbisOpeningSignals,
  key: keyof OrbisOpeningSignals,
  description: string,
  command: () => Promise<T>,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const ready = new Promise<void>((resolve, reject) => {
    timeout = setTimeout(() => reject(new Error(`Timed out waiting for Orbis ${description}.`)), 15_000);
    signals[key] = () => {
      clearTimeout(timeout);
      resolve();
    };
  });
  try {
    const [, reply] = await Promise.all([ready, command()]);
    return reply;
  } finally {
    clearTimeout(timeout);
    delete signals[key];
  }
}

export async function openOrbisRun({
  sendCommand, uploadFile, signals, image, prompt, resolution, imageAccepted, conditionsReady,
}: Pick<Reactor, "sendCommand" | "uploadFile"> & {
  signals: OrbisOpeningSignals;
  image: File | null;
  prompt: string;
  resolution: string;
  imageAccepted: (reply: OrbisMessage) => void;
  conditionsReady: () => void;
}) {
  const [reference] = await Promise.all([
    image ? prepareOrbisReference(image) : null,
    setOrbisResolution(sendCommand, resolution),
  ]);

  if (reference) {
    const upload = await uploadFile(reference, { name: reference.name });
    const reply = await awaitSignal(signals, "image", "state.has_image", async () => {
      const accepted = unwrapOrbisMessage(await sendCommand("set_image", { image: upload }));
      if (accepted?.type !== "image_accepted") {
        throw new Error(accepted?.reason || "Orbis did not accept the uploaded start image.");
      }
      return accepted;
    });
    imageAccepted(reply);
  }

  await awaitSignal(signals, "conditions", "conditions_ready", async () => {
    const reply = unwrapOrbisMessage(await sendCommand("set_prompt", orbisPromptPayload(prompt, "opening", !!image)));
    if (!reply || reply.type === "command_error") {
      throw new Error(reply?.reason || "Orbis did not accept the prompt.");
    }
  });
  conditionsReady();

  await awaitSignal(signals, "started", "generation start", async () => {
    const reply = unwrapOrbisMessage(await sendCommand("start", {}));
    if (reply?.type === "command_error") throw new Error(reply.reason || "Orbis rejected the run.");
  });
}
