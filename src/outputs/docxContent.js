// What goes into the Word lesson plan, as plain data (kept apart from the docx layout so it can be tested).
import { buildLessons } from '../lib/timetable.js';
import { formatLongDate } from '../lib/weeks.js';

/**
 * Split simple HTML (<p>, <em>) into paragraphs of text runs.
 * @param {string} html e.g. "<p><em>Knowledge:</em> Students know…</p>"
 * @returns {Array<Array<{ text: string, italics: boolean }>>}
 */
export function htmlParagraphs(html) {
  const decode = (text) =>
    text.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const blocks = String(html ?? '')
    .split(/<\/p>/i)
    .map((block) => block.replace(/<p[^>]*>/gi, '').trim())
    .filter(Boolean);
  return blocks.map((block) =>
    block
      .split(/(<em>.*?<\/em>)/i)
      .filter(Boolean)
      .map((part) => {
        const italics = /^<em>/i.test(part);
        return { text: decode(part.replace(/<[^>]+>/g, '')), italics };
      })
      .filter((run) => run.text)
  );
}

/**
 * The weekday and date of a plan. `plan.day_id` is the class's lesson number that week,
 * not the weekday, so find that lesson in the timetable again. Returns null if the
 * profile's timetable or week table has changed since the plan was made.
 * @param {object} plan
 * @param {object} profile
 * @returns {{ dayName: string, date: string } | null}
 */
function lessonDate(plan, profile) {
  const cls = profile.classes?.find((c) => c.class_id === plan.class_id);
  if (!cls || plan.cycle_id == null || plan.day_id == null) return null;
  const lessons = buildLessons(profile, { day: null, classLabel: cls.label, week: Number(plan.cycle_id) });
  return lessons.find((lesson) => lesson.sequenceId === String(plan.day_id)) ?? null;
}

/**
 * The header rows and activity rows of one lesson's Word page.
 * @param {object} plan A BEAMS plan.
 * @param {object} profile
 * @returns {{ details: Array<{ label: string, paragraphs: Array<Array<{ text: string, italics: boolean }>> }>,
 *   activities: Array<{ teacher: string, student: string, time: string, resources: string, assessment: string }> }}
 */
export function lessonPageContent(plan, profile) {
  const lesson = lessonDate(plan, profile);
  const cls = profile.classes?.find((c) => c.class_id === plan.class_id);
  const plain = (text) => [[{ text: String(text ?? ''), italics: false }]];
  const details = [
    { label: 'Name of Teacher', paragraphs: plain(profile.teacherName) },
    { label: 'Subject', paragraphs: plain(profile.subjectName) },
    { label: 'Topic', paragraphs: plain(plan.topic) },
    { label: 'Date', paragraphs: plain(lesson ? `${lesson.dayName} ${formatLongDate(lesson.date)}` : '') },
    { label: 'Class', paragraphs: plain(cls?.displayName || String(plan.label ?? '').split(' ')[0]) },
    { label: 'Duration', paragraphs: plain(`${plan.duration} minutes`) },
    { label: 'Attainment Target', paragraphs: htmlParagraphs(plan.attainment_targets_html) },
    { label: 'Learning Outcomes', paragraphs: htmlParagraphs(plan.learning_outcomes_html) },
  ];
  // A teacher activity with two student activities becomes two rows; the teacher text shows once.
  const activities = (plan.activities ?? []).flatMap((activity) =>
    (activity.students ?? []).map((student, i) => ({
      teacher: i === 0 ? activity.content_teacher_activity : '',
      student: student.student_activity,
      time: `${student.time} min`,
      resources: student.resources,
      assessment: student.assessment,
    }))
  );
  return { details, activities };
}
