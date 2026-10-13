import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { parseRequest } from './request.js';

describe('parseRequest', () => {
  it('reads a request by day', () => {
    expect(parseRequest('Monday, week 9')).toEqual({ day: 1, classLabel: null, week: 9 });
  });

  it('reads a request by class', () => {
    expect(parseRequest('O3, week 9')).toEqual({ day: null, classLabel: 'O3', week: 9 });
    expect(parseRequest('11C week 9')).toEqual({ day: null, classLabel: '11C', week: 9 });
  });

  it('reads a single lesson request', () => {
    expect(parseRequest('O2, week 9, Thursday')).toEqual({ day: 4, classLabel: 'O2', week: 9 });
  });

  it('reads short forms', () => {
    expect(parseRequest('thursday wk 9')).toEqual({ day: 4, classLabel: null, week: 9 });
    expect(parseRequest('Fri w10')).toEqual({ day: 5, classLabel: null, week: 10 });
    expect(parseRequest('week 9 Wed')).toEqual({ day: 3, classLabel: null, week: 9 });
  });

  it('ignores filler words', () => {
    expect(parseRequest('Plans for O3 on Monday, week 9')).toEqual({ day: 1, classLabel: 'O3', week: 9 });
  });

  it('keeps multi-word class names together', () => {
    expect(parseRequest('Class 11, week 9')).toEqual({ day: null, classLabel: 'Class 11', week: 9 });
  });

  it('turns the class into its label when given a profile', () => {
    expect(parseRequest('11C week 9', SAMPLE_PROFILE)).toEqual({ day: null, classLabel: 'O3', week: 9 });
    expect(parseRequest('class X, week 9, Friday', SAMPLE_PROFILE)).toEqual({ day: 5, classLabel: 'O2', week: 9 });
    expect(parseRequest('Monday, week 9', SAMPLE_PROFILE)).toEqual({ day: 1, classLabel: null, week: 9 });
  });

  it('returns null when it cannot parse', () => {
    expect(parseRequest('Monday')).toBeNull();
    expect(parseRequest('week 9')).toBeNull();
    expect(parseRequest('next week please')).toBeNull();
    expect(parseRequest('Monday and Tuesday, week 9')).toBeNull();
    expect(parseRequest('week 0, Monday')).toBeNull();
    expect(parseRequest('')).toBeNull();
    expect(parseRequest(undefined)).toBeNull();
  });

  it('returns null when the class is not in the profile', () => {
    expect(parseRequest('12C week 9', SAMPLE_PROFILE)).toBeNull();
    expect(parseRequest('tomorrow week 9', SAMPLE_PROFILE)).toBeNull();
  });
});
