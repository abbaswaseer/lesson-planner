import { describe, expect, it } from 'vitest';
import { formatIdList, parseIdList } from './idList.js';

describe('parseIdList', () => {
  it('splits on commas and trims spaces', () => {
    expect(parseIdList('3, 4 ,5')).toEqual(['3', '4', '5']);
  });

  it('keeps a single ID as a one-item list of strings', () => {
    expect(parseIdList('102558')).toEqual(['102558']);
  });

  it('ignores blanks, trailing commas and repeats', () => {
    expect(parseIdList(' 3,, 4, 3, ')).toEqual(['3', '4']);
  });

  it('returns an empty list for empty input', () => {
    expect(parseIdList('')).toEqual([]);
    expect(parseIdList(undefined)).toEqual([]);
  });
});

describe('formatIdList', () => {
  it('joins with comma and space', () => {
    expect(formatIdList(['3', '4'])).toBe('3, 4');
  });

  it('handles a missing list', () => {
    expect(formatIdList(undefined)).toBe('');
  });
});
