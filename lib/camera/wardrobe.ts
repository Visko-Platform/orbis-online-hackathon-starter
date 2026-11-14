import type { AccessoryPlacement } from "./accessory";
import type { CameraAccessory } from "./accessory-overlay";

export type WardrobePiece = { id: string; prompt: string; placement: AccessoryPlacement; sheet: Blob };
export type Outfit = { id: string; name: string; worn: Partial<Record<AccessoryPlacement, string>> };
export type Wardrobe = { pieces: WardrobePiece[]; worn: Outfit["worn"]; outfits?: Outfit[]; environment?: string };
export const emptyWardrobe: Wardrobe = { pieces: [], worn: {} };

async function wardrobeDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("orbis-wardrobe", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("looks");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadWardrobe() {
  const db = await wardrobeDatabase();
  try {
    return await new Promise<Wardrobe>((resolve, reject) => {
      const request = db.transaction("looks").objectStore("looks").get("current");
      request.onsuccess = () => resolve(request.result ?? emptyWardrobe);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function saveWardrobe(wardrobe: Wardrobe) {
  const db = await wardrobeDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("looks", "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
      transaction.objectStore("looks").put(wardrobe, "current");
    });
  } finally {
    db.close();
  }
}

export function wornAccessories(wardrobe: Wardrobe, decoded: Map<string, CameraAccessory>) {
  return Object.values(wardrobe.worn).flatMap((id) => {
    const piece = decoded.get(id);
    return piece ? [piece] : [];
  });
}
