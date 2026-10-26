// File names and headers for saved or downloaded plans.
import { dayName } from './weeks.js';

/**
 * "O1-day2-week9.json": short, safe on every computer, and sorts sensibly.
 * @param {{ label?: string, day_id?: string, cycle_id?: string }} plan
 * @returns {string}
 */
export function planFileName(plan) {
  const classLabel = String(plan?.label ?? 'plan').split(' ')[0].replace(/[^A-Za-z0-9]/g, '') || 'plan';
  return `${classLabel}-day${plan?.day_id ?? ''}-week${plan?.cycle_id ?? ''}.json`;
}

/**
 * Card header: "O1 · Friday 16/10/2026 · 60 min".
 * @param {{ classLabel: string, dayId: string, date: string, duration: number }} lesson
 * @returns {string}
 */
export function planHeader(lesson) {
  return `${lesson.classLabel} · ${dayName(lesson.dayId)} ${lesson.date} · ${lesson.duration} min`;
}
