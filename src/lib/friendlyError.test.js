import { describe, expect, it } from 'vitest';
import { AiError } from '../ai/errors.js';
import { friendlyError, userMessage } from './friendlyError.js';

describe('userMessage', () => {
  it('shows messages written for teachers', () => {
    expect(userMessage(friendlyError('Add a key first.'), 'fallback')).toBe('Add a key first.');
    expect(userMessage(new AiError('RATE_LIMIT', 'Gemini is busy. Wait a minute.'), 'fallback')).toBe('Gemini is busy. Wait a minute.');
  });

  it('hides anything else', () => {
    expect(userMessage(new TypeError("Cannot read properties of undefined (reading 'x')"), 'Please try again.')).toBe(
      'Please try again.'
    );
    expect(userMessage(undefined, 'Please try again.')).toBe('Please try again.');
    expect(userMessage('a string', 'Please try again.')).toBe('Please try again.');
  });
});
