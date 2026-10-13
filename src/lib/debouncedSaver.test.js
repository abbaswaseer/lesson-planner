import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedSaver } from './debouncedSaver.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('createDebouncedSaver', () => {
  it('waits for the delay before saving', () => {
    const save = vi.fn();
    const saver = createDebouncedSaver(save, 500);
    saver.queue({ teacherName: 'A' });
    vi.advanceTimersByTime(499);
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledWith({ teacherName: 'A' });
  });

  it('merges quick edits into one save with the latest values', () => {
    const save = vi.fn();
    const saver = createDebouncedSaver(save, 500);
    saver.queue({ teacherName: 'G' });
    vi.advanceTimersByTime(300);
    saver.queue({ teacherName: 'Gh' });
    vi.advanceTimersByTime(300);
    saver.queue({ subject_id: '97' });
    vi.advanceTimersByTime(500);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ teacherName: 'Gh', subject_id: '97' });
  });

  it('flush saves pending changes straight away, once', () => {
    const save = vi.fn();
    const saver = createDebouncedSaver(save, 500);
    saver.queue({ term_id: '1' });
    expect(saver.hasPending()).toBe(true);
    saver.flush();
    expect(save).toHaveBeenCalledWith({ term_id: '1' });
    expect(saver.hasPending()).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('flush does nothing when there are no changes', () => {
    const save = vi.fn();
    createDebouncedSaver(save, 500).flush();
    expect(save).not.toHaveBeenCalled();
  });
});
