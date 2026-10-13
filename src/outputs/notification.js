// Weekly topic notification (CLAUDE.md Section 10): short lines, no commentary.
import { formatLongDate, parseDate } from '../lib/weeks.js';

// The notification goes to parents and students: tests and CATs are never announced in it.
const ASSESSMENT_LINE = /\bCATs?\b|\b(class|unit|monthly|weekly|mid-?term|term)\s+(test|exam)/i;

export const DEFAULT_TEMPLATE = 'The following topics are planned for *{subject}* from {from} to {till}:\n\n{classes}';

/**
 * "12th October" to "16th October 2026"; the first date keeps its year only if the years differ.
 * @param {string} from dd/mm/yyyy
 * @param {string} till dd/mm/yyyy
 * @returns {{ from: string, till: string }}
 */
export function longDateRange(from, till) {
  const sameYear = parseDate(from)?.getUTCFullYear() === parseDate(till)?.getUTCFullYear();
  return { from: formatLongDate(from, { year: !sameYear }) ?? from, till: formatLongDate(till) ?? till };
}

/**
 * The message text.
 * @param {Array<{ classLabel: string, topic: string }>} items One per lesson, in lesson order.
 * @param {object} profile
 * @param {{ from: string, till: string }} week dd/mm/yyyy dates.
 * @returns {string}
 */
export function notificationText(items, profile, week) {
  // Classes in the order the teacher listed them on Setup.
  const order = (profile.classes ?? []).map((c) => c.label);
  const labels = [...new Set(items.map((item) => item.classLabel))].sort(
    (a, b) => (order.indexOf(a) + 1 || Infinity) - (order.indexOf(b) + 1 || Infinity)
  );
  const blocks = labels.map((label) => {
    const displayName = profile.classes?.find((c) => c.label === label)?.displayName || label;
    const topics = [
      ...new Set(
        items
          .filter((item) => item.classLabel === label)
          .map((item) => item.topic.trim())
          .filter((topic) => topic && !ASSESSMENT_LINE.test(topic))
      ),
    ];
    return [`*Class ${displayName}*`, ...topics].join('\n');
  });
  const dates = longDateRange(week.from, week.till);
  const template = profile.notificationTemplate?.trim() ? profile.notificationTemplate : DEFAULT_TEMPLATE;
  return template
    .replaceAll('{subject}', profile.subjectName ?? '')
    .replaceAll('{from}', dates.from)
    .replaceAll('{till}', dates.till)
    .replaceAll('{classes}', blocks.join('\n\n'));
}

export default {
  id: 'notification',
  name: 'Weekly topic notification',
  /**
   * @param {object[]} plans BEAMS plans of one week (the class is the first word of each label).
   * @param {object} profile
   * @returns {{ kind: 'text', parts: Array<{ text: string }> }}
   */
  render(plans, profile) {
    const items = plans.map((plan) => ({ classLabel: String(plan.label).split(' ')[0], topic: plan.topic }));
    const week = { from: plans[0]?.week_from, till: plans[0]?.week_till };
    return { kind: 'text', parts: [{ text: notificationText(items, profile, week) }] };
  },
};
