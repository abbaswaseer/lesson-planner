import { describe, expect, it } from 'vitest';
import { textFromItems } from './pdf.js';

describe('textFromItems', () => {
  it('joins items and keeps line breaks', () => {
    const items = [
      { str: '1.3.2', hasEOL: false },
      { str: ' ', hasEOL: false },
      { str: 'Calculation of file size', hasEOL: true },
      { str: 'Activity 1.16  ', hasEOL: true },
      { str: '', hasEOL: true },
      { str: '', hasEOL: true },
      { str: '', hasEOL: true },
      { str: 'Next part', hasEOL: false },
    ];
    expect(textFromItems(items)).toBe('1.3.2 Calculation of file size\nActivity 1.16\n\nNext part');
  });

  it('gives empty text for an empty page', () => {
    expect(textFromItems([])).toBe('');
    expect(textFromItems([{ str: '  ', hasEOL: true }])).toBe('');
  });
});
