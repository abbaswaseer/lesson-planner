// Browser storage: ask the browser to keep our data, and report how much is used.

/**
 * Ask the browser not to clear this site's data when space runs low.
 * Chrome decides silently; some browsers ask the user. Failure is harmless.
 * @returns {Promise<boolean>} true if storage is persistent.
 */
export async function requestPersistentStorage() {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/**
 * Bytes → "12.3 MB" (more decimals for small amounts).
 * @param {number} bytes
 * @returns {string}
 */
export function formatMegabytes(bytes) {
  const mb = (bytes ?? 0) / (1024 * 1024);
  const digits = mb < 1 ? 2 : 1; // small amounts would otherwise show as "0.0 MB"
  return `${mb < 100 ? mb.toFixed(digits) : Math.round(mb)} MB`;
}

/**
 * How much this site stores, and whether it is protected from automatic clearing.
 * @returns {Promise<{ used: string, persisted: boolean } | null>} null if the browser cannot tell.
 */
export async function storageStatus() {
  try {
    if (!navigator.storage?.estimate) return null;
    const [{ usage }, persisted] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted?.() ?? false,
    ]);
    return { used: formatMegabytes(usage), persisted: Boolean(persisted) };
  } catch {
    return null;
  }
}
