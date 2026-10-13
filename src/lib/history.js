// Filters for the History page.

/**
 * The classes and weeks that appear in saved plans, for the filter dropdowns.
 * @param {Array<{ classLabel: string, weekNo: number }>} plans
 * @returns {{ classes: string[], weeks: number[] }}
 */
export function planFilterOptions(plans) {
  const classes = [...new Set(plans.map((plan) => plan.classLabel))].sort();
  const weeks = [...new Set(plans.map((plan) => plan.weekNo))].sort((a, b) => b - a);
  return { classes, weeks };
}

/**
 * Plans matching the chosen class and week ('' means any). Keeps the given order.
 * @param {Array<{ classLabel: string, weekNo: number }>} plans
 * @param {{ classLabel: string, weekNo: string }} filters
 * @returns {object[]}
 */
export function filterPlans(plans, { classLabel, weekNo }) {
  return plans.filter(
    (plan) => (!classLabel || plan.classLabel === classLabel) && (!weekNo || String(plan.weekNo) === String(weekNo))
  );
}
