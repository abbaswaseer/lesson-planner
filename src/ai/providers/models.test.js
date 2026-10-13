import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiError, errorFromStatus } from '../errors.js';
import { defaultGeminiModel, listGeminiModels } from './gemini.js';
import { listGroqModels } from './groq.js';
import { checkOpenRouterKey, listOpenRouterModels } from './openrouter.js';

/** Fake fetch that answers each call in turn with { status, body }. */
function mockFetch(...replies) {
  const fn = vi.fn();
  for (const { status = 200, body = {} } of replies) {
    fn.mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => body });
  }
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('errorFromStatus', () => {
  it.each([
    [400, 'BAD_KEY'],
    [401, 'BAD_KEY'],
    [403, 'BAD_KEY'],
    [429, 'RATE_LIMIT'],
    [500, 'SERVER'],
    [503, 'SERVER'],
  ])('maps %i to %s with a friendly message', (status, code) => {
    const error = errorFromStatus(status, 'Gemini');
    expect(error).toBeInstanceOf(AiError);
    expect(error.code).toBe(code);
    expect(error.message).toMatch(/^Gemini /);
  });
});

describe('listGeminiModels', () => {
  it('keeps text models only, strips "models/", and sorts newest first', async () => {
    mockFetch({
      body: {
        models: [
          { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] },
          { name: 'models/gemini-2.5-flash-preview-tts', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-2.5-pro', supportedGenerationMethods: ['generateContent'] },
        ],
      },
    });
    expect(await listGeminiModels('k')).toEqual(['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash']);
  });

  it('sends the key in a header, not the address', async () => {
    const fetch = mockFetch({ body: { models: [] } });
    await listGeminiModels('secret');
    const [url, options] = fetch.mock.calls[0];
    expect(url).not.toContain('secret');
    expect(options.headers['x-goog-api-key']).toBe('secret');
  });

  it('follows every page', async () => {
    const fetch = mockFetch(
      { body: { models: [{ name: 'models/a-flash', supportedGenerationMethods: ['generateContent'] }], nextPageToken: 'p2' } },
      { body: { models: [{ name: 'models/b-flash', supportedGenerationMethods: ['generateContent'] }] } }
    );
    expect(await listGeminiModels('k')).toEqual(['b-flash', 'a-flash']);
    expect(fetch.mock.calls[1][0]).toContain('pageToken=p2');
  });

  it('reports a bad key as BAD_KEY', async () => {
    mockFetch({ status: 400 });
    await expect(listGeminiModels('wrong')).rejects.toMatchObject({ code: 'BAD_KEY' });
  });

  it('reports no connection as NETWORK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(listGeminiModels('k')).rejects.toMatchObject({ code: 'NETWORK' });
  });
});

describe('defaultGeminiModel', () => {
  it('prefers a stable full flash model', () => {
    expect(
      defaultGeminiModel(['gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.5-flash-preview', 'gemini-2.5-flash'])
    ).toBe('gemini-2.5-flash');
  });

  it('falls back to any flash model, then the first model', () => {
    expect(defaultGeminiModel(['gemini-x-pro', 'gemini-x-flash-lite'])).toBe('gemini-x-flash-lite');
    expect(defaultGeminiModel(['gemini-x-pro'])).toBe('gemini-x-pro');
    expect(defaultGeminiModel([])).toBe('');
  });
});

describe('listGroqModels', () => {
  it('drops speech, guard and inactive models', async () => {
    mockFetch({
      body: {
        data: [
          { id: 'whisper-large-v3' },
          { id: 'llama-guard-4' },
          { id: 'old-model', active: false },
          { id: 'llama-3.3-70b-versatile' },
          { id: 'gemma2-9b-it' },
        ],
      },
    });
    expect(await listGroqModels('k')).toEqual(['gemma2-9b-it', 'llama-3.3-70b-versatile']);
  });
});

describe('OpenRouter', () => {
  it('checks the key before listing, and offers free models only', async () => {
    const fetch = mockFetch(
      { body: { data: { label: 'my key' } } },
      { body: { data: [{ id: 'paid/model' }, { id: 'b/model:free' }, { id: 'a/model:free' }] } }
    );
    expect(await listOpenRouterModels('k')).toEqual(['a/model:free', 'b/model:free']);
    expect(fetch.mock.calls[0][0]).toMatch(/\/key$/);
  });

  it('reports a bad key as BAD_KEY', async () => {
    mockFetch({ status: 401 });
    await expect(checkOpenRouterKey('wrong')).rejects.toMatchObject({ code: 'BAD_KEY' });
  });
});
