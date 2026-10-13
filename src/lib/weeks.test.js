import { describe, expect, it } from 'vitest';
import { addDays, formatDate, nextWeek, parseDate } from './weeks.js';

describe('parseDate', () => {
  it('reads dd/mm/yyyy', () => {
    const date = parseDate('12/10/2026');
    expect([date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()]).toEqual([12, 10, 2026]);
  });

  it('rejects other formats and impossible dates', () => {
    for (const bad of ['', '12/10/26', '2026-10-12', '1/10/2026', '31/02/2026', '00/10/2026', '12/13/2026']) {
      expect(parseDate(bad)).toBeNull();
    }
  });
});

describe('formatDate', () => {
  it('pads day and month', () => {
    expect(formatDate(parseDate('05/01/2027'))).toBe('05/01/2027');
  });
});

describe('addDays', () => {
  it('moves across month and year ends', () => {
    expect(addDays('28/10/2026', 7)).toBe('04/11/2026');
    expect(addDays('28/12/2026', 7)).toBe('04/01/2027');
    expect(addDays('25/02/2028', 7)).toBe('03/03/2028'); // 2028 is a leap year
  });

  it('returns null for a bad date', () => {
    expect(addDays('nope', 7)).toBeNull();
  });
});

describe('nextWeek', () => {
  it('adds one to the number and seven days to both dates', () => {
    expect(nextWeek({ number: 9, from: '12/10/2026', till: '16/10/2026' })).toEqual({
      number: 10,
      from: '19/10/2026',
      till: '23/10/2026',
    });
  });

  it('chains to make weeks 10 to 16', () => {
    let week = { number: 9, from: '12/10/2026', till: '16/10/2026' };
    for (let i = 0; i < 7; i++) week = nextWeek(week);
    expect(week).toEqual({ number: 16, from: '30/11/2026', till: '04/12/2026' });
  });

  it('returns null when the last week is incomplete', () => {
    expect(nextWeek({ number: null, from: '12/10/2026', till: '16/10/2026' })).toBeNull();
    expect(nextWeek({ number: 9, from: '', till: '16/10/2026' })).toBeNull();
  });
});
