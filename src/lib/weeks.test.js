import { describe, expect, it } from 'vitest';
import {
  addDays,
  dateForDay,
  dayName,
  formatDate,
  formatLongDate,
  getWeek,
  nextWeek,
  parseDate,
} from './weeks.js';

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

describe('getWeek', () => {
  const profile = {
    weeks: [
      { number: 8, from: '05/10/2026', till: '09/10/2026' },
      { number: 9, from: '12/10/2026', till: '16/10/2026' },
      { number: 10, from: '', till: '' },
    ],
  };

  it('finds a week by number or text', () => {
    expect(getWeek(profile, 9)).toEqual({ number: 9, from: '12/10/2026', till: '16/10/2026' });
    expect(getWeek(profile, '8').from).toBe('05/10/2026');
  });

  it('returns null for a missing or unfinished week', () => {
    expect(getWeek(profile, 11)).toBeNull();
    expect(getWeek(profile, 10)).toBeNull();
    expect(getWeek({}, 9)).toBeNull();
  });
});

describe('dateForDay', () => {
  const week9 = { number: 9, from: '12/10/2026', till: '16/10/2026' };

  it('counts from Monday', () => {
    expect(dateForDay(week9, 1)).toBe('12/10/2026');
    expect(dateForDay(week9, '4')).toBe('15/10/2026');
    expect(dateForDay(week9, 5)).toBe('16/10/2026');
  });

  it('crosses a month end', () => {
    expect(dateForDay({ from: '28/09/2026' }, 5)).toBe('02/10/2026');
  });

  it('returns null for weekends or bad input', () => {
    expect(dateForDay(week9, 6)).toBeNull();
    expect(dateForDay(week9, 0)).toBeNull();
    expect(dateForDay({ from: 'x' }, 1)).toBeNull();
  });
});

describe('dayName', () => {
  it('names school days', () => {
    expect(dayName(1)).toBe('Monday');
    expect(dayName('5')).toBe('Friday');
    expect(dayName(7)).toBe('');
  });
});

describe('formatLongDate', () => {
  it.each([
    ['01/10/2026', '1st October 2026'],
    ['02/10/2026', '2nd October 2026'],
    ['03/10/2026', '3rd October 2026'],
    ['04/10/2026', '4th October 2026'],
    ['11/10/2026', '11th October 2026'],
    ['12/10/2026', '12th October 2026'],
    ['13/10/2026', '13th October 2026'],
    ['21/10/2026', '21st October 2026'],
    ['22/10/2026', '22nd October 2026'],
    ['23/10/2026', '23rd October 2026'],
    ['31/12/2026', '31st December 2026'],
  ])('%s → %s', (input, expected) => {
    expect(formatLongDate(input)).toBe(expected);
  });

  it('can leave out the year', () => {
    expect(formatLongDate('12/10/2026', { year: false })).toBe('12th October');
  });

  it('returns null for a bad date', () => {
    expect(formatLongDate('2026-10-12')).toBeNull();
  });
});
