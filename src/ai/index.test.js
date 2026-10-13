import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiError, errorFromStatus } from './errors.js';

const calls = { gemini: vi.fn(), groq: vi.fn(), openrouter: vi.fn() };
const lists = { gemini: vi.fn(), groq: vi.fn(), openrouter: vi.fn() };

vi.mock('./providers/gemini.js', () => ({
  callGemini: (...args) => calls.gemini(...args),
  listGeminiModels: (...args) => lists.gemini(...args),
  defaultGeminiModel: (models) => models.find((m) => m.includes('flash')) ?? models[0] ?? '',
}));
vi.mock('./providers/groq.js', () => ({
  callGroq: (...args) => calls.groq(...args),
  listGroqModels: (...args) => lists.groq(...args),
}));
vi.mock('./providers/openrouter.js', () => ({
  callOpenRouter: (...args) => calls.openrouter(...args),
  listOpenRouterModels: (...args) => lists.openrouter(...args),
}));

const { generateJson } = await import('./index.js');

const request = { system: 's', user: 'u', schema: {} };
const sleep = vi.fn(async () => {});
const profileWith = (keys, models = {}) => ({ keys, models: { gemini: 'g-flash', groq: 'llama', openrouter: 'x:free', ...models } });

beforeEach(() => {
  Object.values(calls).forEach((fn) => fn.mockReset());
  Object.values(lists).forEach((fn) => fn.mockReset());
  sleep.mockClear();
});

describe('generateJson', () => {
  it('uses Gemini first and reports which provider answered', async () => {
    calls.gemini.mockResolvedValue({ ok: 1 });
    const result = await generateJson(profileWith({ gemini: 'gk', groq: 'qk' }), request, { sleep });
    expect(result).toEqual({ data: { ok: 1 }, provider: 'Gemini', model: 'g-flash' });
    expect(calls.gemini).toHaveBeenCalledWith({ ...request, key: 'gk', model: 'g-flash' });
    expect(calls.groq).not.toHaveBeenCalled();
  });

  it('falls back to Groq straight away when the Gemini key is wrong', async () => {
    calls.gemini.mockRejectedValue(errorFromStatus(400, 'Gemini'));
    calls.groq.mockResolvedValue({ ok: 2 });
    const result = await generateJson(profileWith({ gemini: 'wrong', groq: 'qk' }), request, { sleep });
    expect(result.provider).toBe('Groq');
    expect(calls.gemini).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('retries busy errors with 2s, 5s, 10s waits, then moves on', async () => {
    calls.gemini.mockRejectedValue(errorFromStatus(429, 'Gemini'));
    calls.openrouter.mockResolvedValue({ ok: 3 });
    const onRetry = vi.fn();
    const result = await generateJson(profileWith({ gemini: 'gk', openrouter: 'ok' }), request, { sleep, onRetry });
    expect(result.provider).toBe('OpenRouter');
    expect(calls.gemini).toHaveBeenCalledTimes(4);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([2000, 5000, 10000]);
    expect(onRetry).toHaveBeenCalledWith({ provider: 'Gemini', attempt: 1, waitMs: 2000 });
  });

  it('succeeds on a retry', async () => {
    calls.gemini.mockRejectedValueOnce(errorFromStatus(503, 'Gemini')).mockResolvedValue({ ok: 4 });
    const result = await generateJson(profileWith({ gemini: 'gk' }), request, { sleep });
    expect(result.data).toEqual({ ok: 4 });
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('loads the default model when none is chosen', async () => {
    lists.gemini.mockResolvedValue(['g-pro', 'g-flash-2']);
    calls.gemini.mockResolvedValue({});
    const result = await generateJson(profileWith({ gemini: 'gk' }, { gemini: '' }), request, { sleep });
    expect(result.model).toBe('g-flash-2');
  });

  it('skips providers without a key', async () => {
    calls.groq.mockResolvedValue({ ok: 5 });
    expect((await generateJson(profileWith({ gemini: ' ', groq: 'qk' }), request, { sleep })).provider).toBe('Groq');
  });

  it('asks for a key when there is none', async () => {
    await expect(generateJson(profileWith({}), request, { sleep })).rejects.toMatchObject({
      code: 'BAD_KEY',
      message: 'No AI key is set. Add your free Gemini key on the Setup page.',
    });
  });

  it('explains what failed and what to do when every provider fails', async () => {
    calls.gemini.mockRejectedValue(errorFromStatus(429, 'Gemini'));
    calls.groq.mockRejectedValue(errorFromStatus(401, 'Groq'));
    const error = await generateJson(profileWith({ gemini: 'gk', groq: 'qk' }), request, { sleep }).catch((e) => e);
    expect(error).toBeInstanceOf(AiError);
    expect(error.message).toContain('Gemini says too many requests');
    expect(error.message).toContain('Groq did not accept this key');
    expect(error.message).toMatch(/Wait a minute and try again/);
  });
});
