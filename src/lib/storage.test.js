import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatMegabytes, requestPersistentStorage, storageStatus } from './storage.js';

afterEach(() => vi.unstubAllGlobals());

describe('formatMegabytes', () => {
  it('shows MB', () => {
    expect(formatMegabytes(0)).toBe('0.00 MB');
    expect(formatMegabytes(60 * 1024)).toBe('0.06 MB');
    expect(formatMegabytes(12.34 * 1024 * 1024)).toBe('12.3 MB');
    expect(formatMegabytes(250.6 * 1024 * 1024)).toBe('251 MB');
  });
});

describe('storage', () => {
  it('reports usage and asks for persistence', async () => {
    const persist = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('navigator', {
      storage: { estimate: async () => ({ usage: 5 * 1024 * 1024 }), persisted: async () => false, persist },
    });
    expect(await storageStatus()).toEqual({ used: '5.0 MB', persisted: false });
    expect(await requestPersistentStorage()).toBe(true);
    expect(persist).toHaveBeenCalled();
  });

  it('copes with browsers that do not support it', async () => {
    vi.stubGlobal('navigator', {});
    expect(await storageStatus()).toBeNull();
    expect(await requestPersistentStorage()).toBe(false);
  });
});
