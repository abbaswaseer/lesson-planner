import { describe, expect, it } from 'vitest';
import { EXAMPLE_PLAN } from '../lib/fixtures/examplePlan.js';
import beamsJson, { planText } from './beamsJson.js';
import { getOutput, OUTPUT_TYPES } from './index.js';

describe('beamsJson output', () => {
  it('is registered', () => {
    expect(getOutput('beamsJson')).toBe(beamsJson);
    expect(OUTPUT_TYPES.map((type) => type.id)).toEqual(['beamsJson', 'notification', 'docxPlan']);
  });

  it('renders each plan as a one-item array, and all plans together', () => {
    const second = { ...EXAMPLE_PLAN, label: 'O2 Day 2 - x' };
    const output = beamsJson.render([EXAMPLE_PLAN, second]);
    expect(output.kind).toBe('text');
    expect(JSON.parse(output.parts[0].text)).toEqual([EXAMPLE_PLAN]);
    expect(output.parts[1].fileName).toBe('O2-day2-week9.json');
    expect(JSON.parse(output.all)).toEqual([EXAMPLE_PLAN, second]);
    expect(output.allFileName).toBe('plans-week9.json');
    expect(planText(EXAMPLE_PLAN)).toBe(output.parts[0].text);
  });
});
