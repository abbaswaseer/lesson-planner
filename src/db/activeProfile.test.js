import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db, createProfile, deleteProfile } from './db.js';
import { getActiveProfileId, setActiveProfileId, resolveActiveProfile } from './activeProfile.js';

// Node has no localStorage or window, so give the helpers simple stand-ins.
function fakeLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
}

beforeEach(async () => {
  vi.stubGlobal('localStorage', fakeLocalStorage());
  vi.stubGlobal('window', new EventTarget());
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('active profile id', () => {
  it('is null when nothing is saved', () => {
    expect(getActiveProfileId()).toBeNull();
  });

  it('remembers the id that was set', () => {
    setActiveProfileId(7);
    expect(getActiveProfileId()).toBe(7);
  });

  it('forgets the id when set to null', () => {
    setActiveProfileId(7);
    setActiveProfileId(null);
    expect(getActiveProfileId()).toBeNull();
  });

  it('ignores junk in storage', () => {
    localStorage.setItem('lessonPlanner.activeProfileId', 'abc');
    expect(getActiveProfileId()).toBeNull();
  });

  it('treats blocked storage as nothing saved', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    });
    expect(() => setActiveProfileId(3)).not.toThrow();
    expect(getActiveProfileId()).toBeNull();
  });

  it('tells listeners when it changes', () => {
    const listener = vi.fn();
    window.addEventListener('lessonPlanner:activeProfileChanged', listener);
    setActiveProfileId(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('resolveActiveProfile', () => {
  it('returns null when there are no profiles', async () => {
    expect(await resolveActiveProfile(null)).toBeNull();
  });

  it('returns the saved profile', async () => {
    await createProfile({ name: 'A' });
    const b = await createProfile({ name: 'B' });
    expect((await resolveActiveProfile(b)).name).toBe('B');
  });

  it('falls back to the first profile by name if the saved one was deleted', async () => {
    const zara = await createProfile({ name: 'Zara' });
    await createProfile({ name: 'Ali' });
    await deleteProfile(zara);
    expect((await resolveActiveProfile(zara)).name).toBe('Ali');
  });

  it('falls back to the first profile by name if nothing is saved', async () => {
    await createProfile({ name: 'Zara' });
    await createProfile({ name: 'Ali' });
    expect((await resolveActiveProfile(null)).name).toBe('Ali');
  });
});
