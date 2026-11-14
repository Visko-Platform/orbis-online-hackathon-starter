const preparedReferences = new WeakMap<File, Promise<File>>();

export const REFERENCE_WIDTH = 1280;
export const REFERENCE_HEIGHT = 720;

export function referenceFile(canvas: HTMLCanvasElement, name: string) {
  return new Promise<File>((resolve, reject) => canvas.toBlob((blob) => {
    if (blob) resolve(new File([blob], name, { type: blob.type }));
    else reject(new Error("Couldn’t encode the Orbis reference."));
  }, "image/jpeg", 0.92));
}

async function resizeReference(file: File) {
  const image = await createImageBitmap(file);
  try {
    const aspect = REFERENCE_WIDTH / REFERENCE_HEIGHT;
    if (file.type === "image/jpeg" && image.width / image.height === aspect &&
        image.width <= REFERENCE_WIDTH && file.size <= 512 * 1024) return file;

    const width = Math.min(image.width, image.height * aspect);
    const height = width / aspect;
    const canvas = document.createElement("canvas");
    canvas.height = Math.min(REFERENCE_HEIGHT, Math.max(9, Math.ceil(height / 9) * 9));
    canvas.width = canvas.height * aspect;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Couldn’t prepare the Orbis reference.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, (image.width - width) / 2, (image.height - height) / 2,
      width, height, 0, 0, canvas.width, canvas.height);
    return await referenceFile(canvas, file.name.replace(/\.[^.]+$/, "") + ".jpg");
  } finally {
    image.close();
  }
}

export function prepareOrbisReference(file: File) {
  let pending = preparedReferences.get(file);
  if (!pending) {
    pending = resizeReference(file).catch((error) => {
      preparedReferences.delete(file);
      throw error;
    });
    preparedReferences.set(file, pending);
  }
  return pending;
}
