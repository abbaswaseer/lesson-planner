import { existsSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLAN_FIELDS } from '../../lib/validate.js';
import { EXTENSION_DOWNLOAD, SCHEMA_JSON, SUBJECT_IDS, TIMETABLE, WEEKS } from './beamsGuideContent.js';

// The guide is only useful if it matches what the app actually produces.
describe('BEAMS guide content', () => {
  it('shows the exact plan field order the app validates', () => {
    const [plan] = JSON.parse(SCHEMA_JSON);
    expect(Object.keys(plan)).toEqual(PLAN_FIELDS);
  });

  it('keeps the example schema as an array', () => {
    expect(Array.isArray(JSON.parse(SCHEMA_JSON))).toBe(true);
    expect(JSON.parse(SCHEMA_JSON)).toHaveLength(1);
  });

  it('numbers day_id per class across the week', () => {
    const counts = {};
    for (const entry of TIMETABLE) {
      counts[entry.classLabel] = (counts[entry.classLabel] ?? 0) + 1;
      expect(entry.sequenceId).toBe(String(counts[entry.classLabel]));
    }
    const find = (classLabel, day) => TIMETABLE.find((e) => e.classLabel === classLabel && e.day === day);
    expect(find('O2', 'Wednesday').sequenceId).toBe('1');
    expect(find('O2', 'Thursday').sequenceId).toBe('2');
    expect(find('O2', 'Friday').sequenceId).toBe('3');
    expect(find('O1', 'Monday').sequenceId).toBe('1');
    expect(find('O1', 'Friday').sequenceId).toBe('2');
    expect(find('O3', 'Thursday').sequenceId).toBe('4');
  });

  it('hosts the extension zip the guide links to', () => {
    const zip = new URL(`../../../public${EXTENSION_DOWNLOAD.url}`, import.meta.url);
    expect(existsSync(zip)).toBe(true);
    expect(statSync(zip).size).toBeGreaterThan(10000);
    // A zip file starts with "PK".
    expect(readFileSync(zip).subarray(0, 2).toString()).toBe('PK');
  });

  it('has a Monday-to-Friday span for every week', () => {
    const day = 24 * 60 * 60 * 1000;
    const toDate = (text) => {
      const [d, m, y] = text.split('/').map(Number);
      return Date.UTC(y, m - 1, d);
    };
    for (const week of WEEKS) expect((toDate(week.till) - toDate(week.from)) / day).toBe(4);
  });

  it('has unique subject IDs', () => {
    const ids = SUBJECT_IDS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
