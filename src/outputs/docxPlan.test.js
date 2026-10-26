import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { EXAMPLE_PLAN } from '../lib/fixtures/examplePlan.js';
import { htmlParagraphs, lessonPageContent } from './docxContent.js';
import docxPlan, { docxFileName } from './docxPlan.js';

describe('htmlParagraphs', () => {
  it('keeps paragraphs and italic labels', () => {
    expect(htmlParagraphs('<p><em>Knowledge:</em> Students know.</p><p>Plain &amp; simple</p>')).toEqual([
      [
        { text: 'Knowledge:', italics: true },
        { text: ' Students know.', italics: false },
      ],
      [{ text: 'Plain & simple', italics: false }],
    ]);
  });
});

describe('lessonPageContent', () => {
  it('fills the school layout from the plan and profile', () => {
    const { details, activities } = lessonPageContent(EXAMPLE_PLAN, SAMPLE_PROFILE);
    const text = (label) =>
      details.find((row) => row.label === label).paragraphs.map((runs) => runs.map((r) => r.text).join('')).join('\n');
    expect(details.map((row) => row.label)).toEqual([
      'Name of Teacher', 'Subject', 'Topic', 'Date', 'Class', 'Duration', 'Attainment Target', 'Learning Outcomes',
    ]);
    expect(text('Name of Teacher')).toBe('Ghulam Abbas');
    expect(text('Date')).toBe('Friday 16th October 2026');
    expect(text('Class')).toBe('IX');
    expect(text('Duration')).toBe('60 minutes');
    expect(text('Learning Outcomes').split('\n')).toHaveLength(3);
    expect(activities).toHaveLength(4);
    expect(activities[0]).toEqual({
      teacher: EXAMPLE_PLAN.activities[0].content_teacher_activity,
      student: 'Students answer orally.',
      time: '10 min',
      resources: 'Whiteboard',
      assessment: 'Oral questioning',
    });
  });
});

describe('docxPlan output', () => {
  it('makes a Word file (a zip starting with PK)', async () => {
    const output = await docxPlan.render([EXAMPLE_PLAN, { ...EXAMPLE_PLAN, label: 'O1 Day 2 - Second' }], SAMPLE_PROFILE);
    expect(output.kind).toBe('file');
    expect(output.fileName).toBe('Lesson plans week 9.docx');
    const bytes = new Uint8Array(await output.blob.arrayBuffer());
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe('PK');
    expect(bytes.length).toBeGreaterThan(5000);
  });

  it('names a single plan after its label', () => {
    expect(docxFileName([EXAMPLE_PLAN])).toBe('O1 Day 2 - Calculating file sizes.docx');
  });
});
