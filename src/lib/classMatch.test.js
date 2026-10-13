import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { findClass } from './classMatch.js';

const labelFor = (text, profile = SAMPLE_PROFILE) => findClass(profile, text)?.label ?? null;

describe('findClass', () => {
  it('matches the short label in any case', () => {
    expect(labelFor('O3')).toBe('O3');
    expect(labelFor('o3')).toBe('O3');
    expect(labelFor(' O1 ')).toBe('O1');
  });

  it('matches the display name', () => {
    expect(labelFor('XI')).toBe('O3');
    expect(labelFor('x')).toBe('O2');
    expect(labelFor('IX')).toBe('O1');
  });

  it('matches a grade number with or without a section letter', () => {
    expect(labelFor('11C')).toBe('O3');
    expect(labelFor('10c')).toBe('O2');
    expect(labelFor('9')).toBe('O1');
    expect(labelFor('11 C')).toBe('O3');
  });

  it('matches "Class 11" and "class XI"', () => {
    expect(labelFor('Class 11')).toBe('O3');
    expect(labelFor('class XI')).toBe('O3');
    expect(labelFor('Class X')).toBe('O2');
    expect(labelFor('Grade 9')).toBe('O1');
    expect(labelFor('class XI C')).toBe('O3');
  });

  it('works when display names are numbers', () => {
    const profile = { classes: [{ label: 'A', displayName: '11' }, { label: 'B', displayName: 'Grade 10' }] };
    expect(labelFor('XI', profile)).toBe('A');
    expect(labelFor('class 10', profile)).toBe('B');
    expect(labelFor('X', profile)).toBe('B');
  });

  it('returns null when nothing matches', () => {
    expect(labelFor('12C')).toBeNull();
    expect(labelFor('O4')).toBeNull();
    expect(labelFor('')).toBeNull();
    expect(labelFor('maths')).toBeNull();
    expect(findClass(undefined, 'O3')).toBeNull();
  });
});
