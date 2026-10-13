import { describe, expect, it } from 'vitest';
import { inputsFromOverrides, overridesFromInputs, parseMinutes } from './periods.js';

describe('parseMinutes', () => {
  it('accepts whole minutes', () => {
    expect(parseMinutes('40')).toBe(40);
    expect(parseMinutes(' 30 ')).toBe(30);
    expect(parseMinutes(35)).toBe(35);
  });

  it('rejects blanks, decimals, zero, negatives and silly values', () => {
    for (const bad of ['', '  ', '30.5', '0', '-5', 'abc', '181']) {
      expect(parseMinutes(bad)).toBeNull();
    }
  });
});

describe('overridesFromInputs', () => {
  it('saves only days with a valid value, as in CLAUDE.md', () => {
    expect(overridesFromInputs({ 1: '', 2: '', 3: '', 4: '', 5: '30' })).toEqual({
      5: { periodMinutes: 30 },
    });
  });

  it('drops invalid values', () => {
    expect(overridesFromInputs({ 1: 'x', 2: '0' })).toEqual({});
  });
});

describe('inputsFromOverrides', () => {
  it('fills a box for every weekday', () => {
    expect(inputsFromOverrides({ 5: { periodMinutes: 30 } })).toEqual({
      1: '', 2: '', 3: '', 4: '', 5: '30',
    });
  });

  it('handles a profile with no overrides', () => {
    expect(inputsFromOverrides(undefined)).toEqual({ 1: '', 2: '', 3: '', 4: '', 5: '' });
  });

  it('round-trips with overridesFromInputs', () => {
    const saved = { 2: { periodMinutes: 35 }, 5: { periodMinutes: 30 } };
    expect(overridesFromInputs(inputsFromOverrides(saved))).toEqual(saved);
  });
});
