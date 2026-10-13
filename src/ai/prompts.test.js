import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { buildLessons } from '../lib/timetable.js';
import { fixPrompt, planSystemPrompt, planUserPrompt, requestPrompt, suggestedTimes, topicPrompt } from './prompts.js';

const [lesson] = buildLessons(SAMPLE_PROFILE, { day: 5, classLabel: 'O1', week: 9 });

describe('suggestedTimes', () => {
  it.each([30, 40, 60, 80, 45])('adds up to %i', (duration) => {
    const times = suggestedTimes(duration);
    expect(times).toHaveLength(4);
    expect(times.reduce((a, b) => a + b, 0)).toBe(duration);
    expect(times.every((t) => t > 0)).toBe(true);
  });

  it('matches the example plan for 60 minutes', () => {
    expect(suggestedTimes(60)).toEqual([10, 20, 20, 10]);
  });
});

describe('planSystemPrompt', () => {
  const prompt = planSystemPrompt(SAMPLE_PROFILE);

  it('includes every rule from CLAUDE.md Section 8', () => {
    expect(prompt).toContain('Computer Science (2210)');
    expect(prompt).toContain('Beaconhouse');
    expect(prompt).toContain('Follow the scheme of work');
    expect(prompt).toContain('continues from the last topic covered');
    expect(prompt).toContain(SAMPLE_PROFILE.activityStyle);
    expect(prompt).toContain('Oral questioning; Textbook activity solved and checked');
    expect(prompt).toContain("Otherwise write 'textbook questions on <topic>'. Never invent page numbers.");
    expect(prompt).toContain('exact syllabus reference numbers');
    expect(prompt).toContain('add up EXACTLY to the lesson duration');
    expect(prompt).toContain('Return JSON only');
  });
});

describe('planUserPrompt', () => {
  it('gives the exact duration, topic and sources', () => {
    const prompt = planUserPrompt({
      lesson,
      topic: '1.3.2 Calculating file sizes',
      lastTopic: '1.3.1 Data storage units',
      notes: 'Revise units first',
      sowText: 'Week 9: 1.3.2 file sizes',
      bookPages: [{ pageNo: 30, text: 'Calculation of file size' }],
      previousTopicsThisRequest: ['1.3.1 units'],
    });
    expect(prompt).toContain('Class: O1 (Class IX)');
    expect(prompt).toContain('Day: Friday, 16/10/2026');
    expect(prompt).toContain('must add up to exactly 60 (for example 10 + 20 + 20 + 10 = 60)');
    expect(prompt).toContain('Topic for this lesson: 1.3.2 Calculating file sizes');
    expect(prompt).toContain('Last topic covered before this request: 1.3.1 Data storage units');
    expect(prompt).toContain("Teacher's notes: Revise units first");
    expect(prompt).toContain('[Book page 30]\nCalculation of file size');
    expect(prompt).toContain('Do not repeat them.');
  });

  it('says what to do without book pages', () => {
    expect(planUserPrompt({ lesson, topic: 't' })).toContain('No book pages found');
  });
});

describe('fixPrompt', () => {
  it('lists the errors and asks for the full JSON again', () => {
    const prompt = fixPrompt({ topic: 't' }, ['Times add up to 65.']);
    expect(prompt).toContain('- Times add up to 65.');
    expect(prompt).toContain('Fix only these problems');
    expect(prompt).toContain('Return the full JSON again.');
    expect(prompt).toContain('"topic": "t"');
  });
});

describe('topicPrompt and requestPrompt', () => {
  it('ask for topics in order and for a known class label', () => {
    const { system, user } = topicPrompt({ subjectName: 'CS', classLabel: 'O3', displayName: 'XI', lessonCount: 4, lastTopic: '2.1' });
    expect(system).toContain('follow on from each other');
    expect(user).toContain('Number of lessons: 4');
    expect(requestPrompt('my 11th class', SAMPLE_PROFILE.classes).system).toContain('O1 (Class IX), O2 (Class X), O3 (Class XI)');
  });
});
