import { useSyncExternalStore } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';

const STORAGE_KEY = 'lessonPlanner.activeProfileId';
const CHANGE_EVENT = 'lessonPlanner:activeProfileChanged';

/**
 * The saved active profile id, or null if none is saved.
 * Storage can be blocked (e.g. some private windows), so failures count as "none".
 * @returns {number | null}
 */
export function getActiveProfileId() {
  try {
    const id = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

/**
 * Remember which profile is active. Pass null to forget it.
 * @param {number | null} id
 */
export function setActiveProfileId(id) {
  try {
    if (id == null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(id));
  } catch {
    // Storage blocked: the choice simply won't survive a reload.
  }
  // localStorage has no change event within the same tab, so announce it ourselves.
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * The profile to show: the saved one if it still exists, otherwise the first
 * profile by name (e.g. after the saved one was deleted), otherwise null.
 * @param {number | null} savedId
 * @returns {Promise<object | null>}
 */
export async function resolveActiveProfile(savedId) {
  if (savedId != null) {
    const saved = await db.profiles.get(savedId);
    if (saved) return saved;
  }
  return (await db.profiles.orderBy('name').first()) ?? null;
}

function subscribe(onChange) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange); // other tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * The active profile, kept up to date as it is edited or switched.
 * @returns {object | null | undefined} undefined while loading, null if there are no profiles.
 */
export function useActiveProfile() {
  const savedId = useSyncExternalStore(subscribe, getActiveProfileId);
  return useLiveQuery(() => resolveActiveProfile(savedId), [savedId]);
}
