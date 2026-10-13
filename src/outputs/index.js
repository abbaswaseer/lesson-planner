// Registry of output types (CLAUDE.md Section 10). Adding a type = one new file + one line here.
import beamsJson from './beamsJson.js';

/** Output types the teacher can choose on Generate, in menu order. */
export const OUTPUT_TYPES = [
  beamsJson,
  { id: 'notification', name: 'Weekly topic notification' },
  { id: 'docxPlan', name: 'Word lesson plan' },
];

/**
 * @param {string} id
 * @returns {object | undefined} The output module.
 */
export function getOutput(id) {
  return OUTPUT_TYPES.find((type) => type.id === id);
}
