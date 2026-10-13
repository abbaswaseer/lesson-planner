// Saving generated plans and moving each class's progress on (CLAUDE.md Section 7, step 8).
import { db, setLastTopic } from './db.js';

/**
 * Save one generated plan (or replace it after Regenerate), then record its topic as the
 * class's last covered topic.
 * @param {number} profileId
 * @param {{ lesson: object, plan: object, errors?: string[], provider?: string, model?: string, topic: string }} result
 * @param {{ request: string, outputType: string, planId?: number }} details `planId` replaces that saved plan.
 * @returns {Promise<number>} The saved plan's id.
 */
export function savePlan(profileId, result, { request, outputType, planId }) {
  const { lesson, plan, errors = [], provider = '', model = '', topic } = result;
  const row = {
    profileId,
    classLabel: lesson.classLabel,
    weekNo: lesson.weekNo,
    dayId: lesson.dayId,
    date: lesson.date,
    request,
    outputType,
    data: plan,
    errors,
    provider,
    model,
    createdAt: Date.now(),
  };
  return db.transaction('rw', [db.plans, db.progress], async () => {
    const id = planId ? (await db.plans.put({ ...row, id: planId }), planId) : await db.plans.add(row);
    await setLastTopic(profileId, lesson.classLabel, plan.topic || topic);
    return id;
  });
}

/**
 * Delete one saved plan.
 * @param {number} planId
 * @returns {Promise<void>}
 */
export function deletePlan(planId) {
  return db.plans.delete(planId);
}

/**
 * A profile's saved plans, newest first.
 * @param {number} profileId
 * @returns {Promise<object[]>}
 */
export async function listPlans(profileId) {
  const plans = await db.plans.where('profileId').equals(profileId).sortBy('createdAt');
  return plans.reverse();
}
