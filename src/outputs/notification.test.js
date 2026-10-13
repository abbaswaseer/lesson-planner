import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { EXAMPLE_PLAN } from '../lib/fixtures/examplePlan.js';
import notification, { longDateRange, notificationText } from './notification.js';

const WEEK = { from: '12/10/2026', till: '16/10/2026' };

describe('notificationText', () => {
  it('matches the CLAUDE.md format exactly', () => {
    const items = [
      { classLabel: 'O2', topic: '2.1 Data transmission — types of transmission' },
      { classLabel: 'O1', topic: '1.3.1 Data Storage — measurement of data storage' },
      { classLabel: 'O1', topic: '1.3.2 Calculating File Sizes — image and sound file size calculations' },
      { classLabel: 'O2', topic: '2.1 Data transmission — types of transmission' },
    ];
    expect(notificationText(items, SAMPLE_PROFILE, WEEK)).toBe(
      'The following topics are planned for *Computer Science (2210)* from 12th October to 16th October 2026:\n' +
        '\n' +
        '*Class IX*\n' +
        '1.3.1 Data Storage — measurement of data storage\n' +
        '1.3.2 Calculating File Sizes — image and sound file size calculations\n' +
        '\n' +
        '*Class X*\n' +
        '2.1 Data transmission — types of transmission'
    );
  });

  it('never mentions tests or CATs, but keeps syllabus topics about testing', () => {
    const items = [
      { classLabel: 'O3', topic: 'CAT 1' },
      { classLabel: 'O3', topic: 'Unit test on chapter 2' },
      { classLabel: 'O3', topic: '7.3 Test data — normal, abnormal and extreme' },
    ];
    expect(notificationText(items, SAMPLE_PROFILE, WEEK)).toMatch(/\*Class XI\*\n7\.3 Test data — normal, abnormal and extreme$/);
  });

  it('uses the default template when the profile has none', () => {
    const text = notificationText([{ classLabel: 'O3', topic: 't' }], { ...SAMPLE_PROFILE, notificationTemplate: '' }, WEEK);
    expect(text).toBe('The following topics are planned for *Computer Science (2210)* from 12th October to 16th October 2026:\n\n*Class XI*\nt');
  });

  it('keeps the year on both dates across New Year', () => {
    expect(longDateRange('29/12/2026', '02/01/2027')).toEqual({ from: '29th December 2026', till: '2nd January 2027' });
  });
});

describe('notification output', () => {
  it('renders from saved plans', () => {
    const { kind, parts } = notification.render([EXAMPLE_PLAN], SAMPLE_PROFILE);
    expect(kind).toBe('text');
    expect(parts[0].text).toContain(`*Class IX*\n${EXAMPLE_PLAN.topic}`);
  });
});
