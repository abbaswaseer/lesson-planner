/**
 * Error from an AI service, with a type the app can act on and a message a teacher can read.
 * Codes: BAD_KEY, RATE_LIMIT, SERVER, NETWORK, BAD_OUTPUT (CLAUDE.md Section 8).
 */
export class AiError extends Error {
  /**
   * @param {'BAD_KEY' | 'RATE_LIMIT' | 'SERVER' | 'NETWORK' | 'BAD_OUTPUT'} code
   * @param {string} message Plain-English message, safe to show to the teacher.
   * @param {{ provider?: string, status?: number }} [details]
   */
  constructor(code, message, { provider, status } = {}) {
    super(message);
    this.name = 'AiError';
    this.code = code;
    this.provider = provider;
    this.status = status;
  }
}

/**
 * Turn a failed HTTP response into an AiError.
 * @param {number} status HTTP status code.
 * @param {string} providerName e.g. "Gemini"
 * @returns {AiError}
 */
export function errorFromStatus(status, providerName) {
  const details = { provider: providerName, status };
  if (status === 400 || status === 401 || status === 403) {
    return new AiError(
      'BAD_KEY',
      `${providerName} did not accept this key. Check that you copied the whole key, with nothing extra.`,
      details
    );
  }
  if (status === 429) {
    return new AiError(
      'RATE_LIMIT',
      `${providerName} says too many requests for now. Wait a minute and try again.`,
      details
    );
  }
  return new AiError(
    'SERVER',
    `${providerName} is having problems right now (error ${status}). Try again in a few minutes.`,
    details
  );
}

/**
 * The request never reached the service (offline, blocked, DNS…).
 * @param {string} providerName
 * @returns {AiError}
 */
export function networkError(providerName) {
  return new AiError(
    'NETWORK',
    `Could not reach ${providerName}. Check your internet connection and try again.`,
    { provider: providerName }
  );
}

/**
 * fetch() that always fails with an AiError, so callers handle one kind of error.
 * @param {string} url
 * @param {RequestInit} options
 * @param {string} providerName
 * @returns {Promise<any>} The parsed JSON body.
 */
export async function fetchJson(url, options, providerName) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw networkError(providerName);
  }
  if (!response.ok) throw errorFromStatus(response.status, providerName);
  try {
    return await response.json();
  } catch {
    throw new AiError('BAD_OUTPUT', `${providerName} sent back something unexpected. Try again.`, {
      provider: providerName,
    });
  }
}
