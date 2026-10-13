// BEAMS JSON output: what the BEAMS Chrome extension pastes in (CLAUDE.md Section 6).
import { planFileName } from '../lib/planFiles.js';

/**
 * One plan as BEAMS expects it: always an array, pretty-printed.
 * @param {object} plan
 * @returns {string}
 */
export function planText(plan) {
  return JSON.stringify([plan], null, 2);
}

export default {
  id: 'beamsJson',
  name: 'BEAMS JSON',
  /**
   * @param {object[]} plans
   * @returns {{ kind: 'text', parts: Array<{ text: string, fileName: string }>, all: string, allFileName: string }}
   */
  render(plans) {
    const week = plans[0]?.cycle_id ?? '';
    return {
      kind: 'text',
      parts: plans.map((plan) => ({ text: planText(plan), fileName: planFileName(plan) })),
      all: JSON.stringify(plans, null, 2),
      allFileName: `plans-week${week}.json`,
    };
  },
};
