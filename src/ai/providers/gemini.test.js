import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callGemini } from './gemini.js';

const generateContent = vi.fn();
const constructed = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    constructor(options) {
      constructed(options);
    }
    models = { generateContent };
  },
}));

const request = { key: 'k', model: 'gemini-x-flash', system: 'You plan lessons.', user: 'Plan O3.', schema: { type: 'OBJECT' } };

beforeEach(() => {
  generateContent.mockReset();
  constructed.mockReset();
});

describe('callGemini', () => {
  it('asks for JSON with the schema and returns it parsed', async () => {
    generateContent.mockResolvedValue({ text: '{"topic":"1.2 Text"}' });
    expect(await callGemini(request)).toEqual({ topic: '1.2 Text' });
    expect(constructed).toHaveBeenCalledWith({ apiKey: 'k' });
    expect(generateContent).toHaveBeenCalledWith({
      model: 'gemini-x-flash',
      contents: [{ role: 'user', parts: [{ text: 'Plan O3.' }] }],
      config: { systemInstruction: 'You plan lessons.', responseMimeType: 'application/json', responseSchema: { type: 'OBJECT' } },
    });
  });

  it('accepts JSON inside a code fence', async () => {
    generateContent.mockResolvedValue({ text: '```json\n{"a":1}\n```' });
    expect(await callGemini(request)).toEqual({ a: 1 });
  });

  it.each([
    [429, 'RATE_LIMIT'],
    [503, 'SERVER'],
    [500, 'SERVER'],
    [403, 'BAD_KEY'],
  ])('maps HTTP %i to %s', async (status, code) => {
    generateContent.mockRejectedValue(Object.assign(new Error('x'), { status }));
    await expect(callGemini(request)).rejects.toMatchObject({ code, provider: 'Gemini' });
  });

  it('maps a failed connection to NETWORK, and bad replies to BAD_OUTPUT', async () => {
    generateContent.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(callGemini(request)).rejects.toMatchObject({ code: 'NETWORK' });
    generateContent.mockResolvedValue({ text: 'Sure! Here is your plan' });
    await expect(callGemini(request)).rejects.toMatchObject({ code: 'BAD_OUTPUT' });
    generateContent.mockResolvedValue({ text: '' });
    await expect(callGemini(request)).rejects.toMatchObject({ code: 'BAD_OUTPUT' });
  });
});
