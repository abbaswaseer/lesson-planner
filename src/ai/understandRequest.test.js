import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';

const generateJson = vi.fn();
vi.mock('./index.js', () => ({ generateJson: (...args) => generateJson(...args) }));

const { checkAiRequest, understandRequest } = await import('./understandRequest.js');

beforeEach(() => generateJson.mockReset());

describe('understandRequest', () => {
  it('does not call the AI when code can read the request', async () => {
    expect(await understandRequest(SAMPLE_PROFILE, 'Thursday, week 9')).toEqual({
      parsed: { day: 4, classLabel: null, week: 9 },
      byAi: false,
    });
    expect(generateJson).not.toHaveBeenCalled();
  });

  it('asks the AI for "plans for my 11th class next Tuesday week 9"', async () => {
    generateJson.mockResolvedValue({ data: { day: 2, classLabel: 'O3', week: 9 }, provider: 'Gemini', model: 'm' });
    const result = await understandRequest(SAMPLE_PROFILE, 'plans for my 11th class next Tuesday week 9');
    expect(result).toEqual({ parsed: { day: 2, classLabel: 'O3', week: 9 }, byAi: true });
    const [, request] = generateJson.mock.calls[0];
    expect(request.user).toBe('Request: plans for my 11th class next Tuesday week 9');
    expect(request.system).toContain('O3 (Class XI)');
    expect(request.schema.properties).toHaveProperty('week');
  });
});

describe('checkAiRequest', () => {
  it('accepts a class name the AI gave as a grade', () => {
    expect(checkAiRequest({ day: null, classLabel: 'XI', week: '9' }, SAMPLE_PROFILE)).toEqual({ day: null, classLabel: 'O3', week: 9 });
  });

  it('accepts a whole week', () => {
    expect(checkAiRequest({ day: null, classLabel: null, week: 9 }, SAMPLE_PROFILE)).toEqual({ day: null, classLabel: null, week: 9 });
  });

  it('rejects unknown classes, bad days and missing weeks', () => {
    expect(checkAiRequest({ day: 2, classLabel: 'O7', week: 9 }, SAMPLE_PROFILE)).toBeNull();
    expect(checkAiRequest({ day: 6, classLabel: null, week: 9 }, SAMPLE_PROFILE)).toBeNull();
    expect(checkAiRequest({ day: 2, classLabel: null, week: null }, SAMPLE_PROFILE)).toBeNull();
    expect(checkAiRequest(null, SAMPLE_PROFILE)).toBeNull();
  });
});
