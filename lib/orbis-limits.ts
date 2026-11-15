// Client-side limits on how hard the app leans on Reactor, so a retry loop,
// an impatient click or a bug cannot hammer their API and get the account
// rate-limited or blocked.
//
// Reactor's published account limits are 10 new sessions per minute and 5 at
// once. The app stays well inside them.

/** At most this many session starts in any rolling minute (Reactor: 10). */
export const MAX_SESSION_STARTS_PER_MINUTE = 5;
/** Never start two sessions closer together than this. */
export const MIN_SESSION_START_GAP_MS = 5_000;
/**
 * Never send two steering prompts closer together than this. Orbis takes a
 * prompt at the next chunk boundary (about 1.8 s), and its guide says faster
 * prompts only queue up.
 */
export const MIN_PROMPT_GAP_MS = 3_000;

const WINDOW_MS = 60_000;
// Module-level so the count covers every component and every film.
const sessionStarts: number[] = [];

/**
 * How long to wait before another session may be started: 0 when one can
 * start now. Failed attempts count too, because Reactor counts them.
 */
export function sessionStartDelay(now = Date.now()) {
  while (sessionStarts.length && now - sessionStarts[0] > WINDOW_MS) {
    sessionStarts.shift();
  }
  const last = sessionStarts[sessionStarts.length - 1];
  const gapWait = last === undefined ? 0 : last + MIN_SESSION_START_GAP_MS - now;
  const windowWait =
    sessionStarts.length >= MAX_SESSION_STARTS_PER_MINUTE
      ? sessionStarts[0] + WINDOW_MS - now
      : 0;
  return Math.max(0, gapWait, windowWait);
}

export function recordSessionStart(now = Date.now()) {
  sessionStarts.push(now);
}
