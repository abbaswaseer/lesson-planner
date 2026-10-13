import { afterEach, describe, expect, it, vi } from 'vitest';
import { callGroq } from './groq.js';
import { callOpenRouter } from './openrouter.js';

function mockFetch(status, body) {
  const fn = vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => body });
  vi.stubGlobal('fetch', fn);
  return fn;
}

const reply = (content) => ({ choices: [{ message: { content } }] });
const request = { key: 'k', model: 'm', system: 'You plan lessons.', user: 'Plan O3.', schema: { type: 'object' } };

afterEach(() => vi.unstubAllGlobals());

describe.each([
  ['Groq', callGroq, 'https://api.groq.com/openai/v1/chat/completions'],
  ['OpenRouter', callOpenRouter, 'https://openrouter.ai/api/v1/chat/completions'],
])('%s', (name, call, url) => {
  it('sends a JSON-mode chat request with the schema in the system prompt', async () => {
    const fetch = mockFetch(200, reply('{"topic":"1.2"}'));
    expect(await call(request)).toEqual({ topic: '1.2' });
    const [calledUrl, options] = fetch.mock.calls[0];
    expect(calledUrl).toBe(url);
    expect(options.headers.Authorization).toBe('Bearer k');
    const body = JSON.parse(options.body);
    expect(body.model).toBe('m');
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[0].content).toMatch(/^You plan lessons\.\n\nReturn only one JSON object/);
    expect(body.messages[0].content).toContain('{"type":"object"}');
    expect(body.messages[1]).toEqual({ role: 'user', content: 'Plan O3.' });
  });

  it.each([
    [429, 'RATE_LIMIT'],
    [401, 'BAD_KEY'],
    [503, 'SERVER'],
  ])('maps HTTP %i to %s', async (status, code) => {
    mockFetch(status, {});
    await expect(call(request)).rejects.toMatchObject({ code, provider: name });
  });

  it('reports empty or non-JSON answers as BAD_OUTPUT', async () => {
    mockFetch(200, reply(''));
    await expect(call(request)).rejects.toMatchObject({ code: 'BAD_OUTPUT' });
    mockFetch(200, reply('Here you go'));
    await expect(call(request)).rejects.toMatchObject({ code: 'BAD_OUTPUT' });
  });
});

describe('OpenRouter errors inside a 200 reply', () => {
  it('uses the error code from the body', async () => {
    mockFetch(200, { error: { code: 429, message: 'Rate limit exceeded: free-models-per-day' } });
    await expect(callOpenRouter(request)).rejects.toMatchObject({ code: 'RATE_LIMIT' });
  });
});
