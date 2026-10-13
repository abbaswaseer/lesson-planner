import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { setupChecklist } from './readiness.js';

const doneMap = (list) => Object.fromEntries(list.map((item) => [item.id, item.done]));

describe('setupChecklist', () => {
  it('shows what is missing', () => {
    expect(doneMap(setupChecklist(SAMPLE_PROFILE, 0))).toEqual({ key: false, sources: false, timetable: true });
    expect(doneMap(setupChecklist({}, 0))).toEqual({ key: false, sources: false, timetable: false });
  });

  it('is complete with any key, a source, a timetable and weeks', () => {
    const profile = { ...SAMPLE_PROFILE, keys: { gemini: '', groq: 'k', openrouter: '' } };
    expect(setupChecklist(profile, 2).every((item) => item.done)).toBe(true);
    expect(doneMap(setupChecklist({ ...profile, weeks: [] }, 2)).timetable).toBe(false);
  });
});
