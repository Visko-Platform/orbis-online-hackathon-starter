import path from "node:path";

/** Persistent cache root. Point CACHE_DIR outside the app dir in production so deploys never wipe it. */
export const CACHE_DIR = process.env.CACHE_DIR || path.join(process.cwd(), ".cache");
