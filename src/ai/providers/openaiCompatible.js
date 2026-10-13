// Shared JSON chat call for OpenAI-compatible services (Groq, OpenRouter).
import { AiError, errorFromStatus, fetchJson, parseJsonReply } from '../errors.js';
import { schemaInstruction } from '../prompts.js';

/**
 * POST a chat completion in JSON mode and return the parsed JSON reply.
 * @param {{ url: string, providerName: string, key: string, model: string, system: string,
 *   user: string, schema?: object, headers?: Record<string, string> }} request
 * @returns {Promise<any>}
 * @throws {AiError}
 */
export async function callChatJson({ url, providerName, key, model, system, user, schema, headers = {} }) {
  const body = await fetchJson(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...headers },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: schema ? `${system}\n\n${schemaInstruction(schema)}` : system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
      }),
    },
    providerName
  );
  // OpenRouter can answer 200 but report the upstream model's failure in the body.
  if (body?.error) throw errorFromStatus(Number(body.error.code) || 500, providerName);
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new AiError('BAD_OUTPUT', `${providerName} sent back an empty answer. Try again.`, { provider: providerName });
  }
  return parseJsonReply(content, providerName);
}
