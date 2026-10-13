/**
 * Collects field changes and saves them together once typing pauses.
 * Several quick edits become one save, which keeps IndexedDB writes low.
 *
 * @param {(changes: object) => Promise<void> | void} save Called with all pending changes.
 * @param {number} delayMs How long to wait after the last change.
 * @returns {{ queue: (changes: object) => void, flush: () => Promise<void> | undefined, hasPending: () => boolean }}
 */
export function createDebouncedSaver(save, delayMs) {
  let pending = {};
  let timer = null;

  function flush() {
    clearTimeout(timer);
    timer = null;
    if (Object.keys(pending).length === 0) return undefined;
    const changes = pending;
    pending = {};
    return save(changes);
  }

  return {
    queue(changes) {
      pending = { ...pending, ...changes };
      clearTimeout(timer);
      timer = setTimeout(flush, delayMs);
    },
    // Used when leaving the page or switching profile, so a last edit is never lost.
    flush,
    hasPending: () => Object.keys(pending).length > 0,
  };
}
