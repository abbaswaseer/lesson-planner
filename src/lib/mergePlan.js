// Code fields + AI fields → one BEAMS plan, in the exact field order of CLAUDE.md Section 6.

/**
 * "<bookRef>, Ch <n> <title>". Leaves out whatever part is missing.
 * @param {string} bookRef From the profile.
 * @param {number | string} [chapterNumber]
 * @param {string} [chapterTitle]
 * @returns {string}
 */
export function bookReference(bookRef, chapterNumber, chapterTitle) {
  const chapter = [chapterNumber ? `Ch ${chapterNumber}` : '', chapterTitle ?? '']
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(' ');
  return [String(bookRef ?? '').trim(), chapter].filter(Boolean).join(', ');
}

/**
 * Build the final plan. IDs, dates, duration and day/week come from code, never the AI.
 * @param {object} lesson One item from buildLessons.
 * @param {object} profile
 * @param {{ shortTopic: string, topic: string, chapterNumber?: number | string, chapterTitle?: string,
 *   attainment_targets_html: string, learning_outcomes_html: string, activities: object[] }} aiFields
 * @returns {object} Keys in the exact BEAMS order.
 */
export function mergePlan(lesson, profile, aiFields) {
  const ai = aiFields ?? {};
  return {
    label: `${lesson.classLabel} Day ${lesson.dayId} - ${String(ai.shortTopic ?? '').trim()}`,
    class_id: lesson.class.class_id,
    section_ids: [...(lesson.class.section_ids ?? [])],
    subject_id: profile.subject_id,
    lp_type: profile.lp_type,
    acad_year_id: profile.acad_year_id,
    topic: ai.topic,
    week_from: lesson.from,
    week_till: lesson.till,
    attainment_targets_html: ai.attainment_targets_html,
    book_ref: bookReference(profile.bookRef, ai.chapterNumber, ai.chapterTitle),
    duration: lesson.duration,
    day_id: lesson.dayId,
    learning_outcomes_html: ai.learning_outcomes_html,
    term_id: profile.term_id,
    cycle_id: String(lesson.weekNo),
    collaboration_team: [...(profile.collaboration_team ?? [])],
    activities: (Array.isArray(ai.activities) ? ai.activities : []).map(orderActivity),
  };
}

// The AI may return activity keys in any order; BEAMS wants them in this one.
function orderActivity(activity) {
  return {
    content_teacher_activity: activity?.content_teacher_activity,
    students: (Array.isArray(activity?.students) ? activity.students : []).map((student) => ({
      student_activity: student?.student_activity,
      time: student?.time,
      resources: student?.resources,
      assessment: student?.assessment,
    })),
  };
}
