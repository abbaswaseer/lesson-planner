import { describe, expect, it } from 'vitest';
import { fileKind, guessType, sourceTypeLabel, typesForKind } from './sourceTypes.js';

describe('fileKind', () => {
  it('knows PDFs, images and Word files by extension', () => {
    expect(fileKind({ name: 'Book.PDF' })).toBe('pdf');
    expect(fileKind({ name: 'timetable.jpeg' })).toBe('image');
    expect(fileKind({ name: 'photo.png' })).toBe('image');
    expect(fileKind({ name: 'template.docx' })).toBe('docx');
  });

  it('rejects anything else', () => {
    expect(fileKind({ name: 'notes.txt' })).toBeNull();
    expect(fileKind({ name: 'old.doc' })).toBeNull();
    expect(fileKind({ name: 'pdf' })).toBeNull();
  });
});

describe('typesForKind', () => {
  it('allows only "template" for Word files, and never for others', () => {
    expect(typesForKind('docx').map((t) => t.value)).toEqual(['template']);
    expect(typesForKind('pdf').map((t) => t.value)).not.toContain('template');
    expect(typesForKind('image').map((t) => t.value)).toContain('timetable');
  });
});

describe('guessType', () => {
  it('guesses from the file name', () => {
    expect(guessType('CS Scheme of Work 2026.pdf', 'pdf')).toBe('sow');
    expect(guessType('sow_term1.pdf', 'pdf')).toBe('sow');
    expect(guessType('Academic Calendar.pdf', 'pdf')).toBe('calendar');
    expect(guessType('Time table.pdf', 'pdf')).toBe('timetable');
    expect(guessType('Computer Science 2nd Ed.pdf', 'pdf')).toBe('textbook');
    expect(guessType('IMG_2041.jpg', 'image')).toBe('timetable');
    expect(guessType('anything.docx', 'docx')).toBe('template');
  });
});

describe('sourceTypeLabel', () => {
  it('gives a friendly name', () => {
    expect(sourceTypeLabel('sow')).toBe('Scheme of work');
    expect(sourceTypeLabel('weird')).toBe('weird');
  });
});
