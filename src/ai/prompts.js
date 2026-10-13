// All prompt text lives here (CLAUDE.md Section 8). No student names, marks or other
// personal data ever go into a prompt: only the teacher's settings and source text.

const DAY_NAMES = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };

/**
 * A sensible way to split a lesson's minutes over starter, explanation, practice and plenary,
 * given to the AI as an example. Always adds up to `duration`.
 * @param {number} duration
 * @returns {number[]}
 */
export function suggestedTimes(duration) {
  const edge = duration >= 60 ? 10 : 5;
  const middle = duration - 2 * edge;
  const explanation = Math.ceil(middle / 2);
  return [edge, explanation, middle - explanation, edge];
}

/**
 * System prompt for writing one lesson plan.
 * @param {object} profile
 * @returns {string}
 */
export function planSystemPrompt(profile) {
  const subject = profile.subjectName || 'the subject';
  const methods = (profile.assessmentMethods ?? []).filter(Boolean);
  return [
    `You are a lesson planner for a ${subject} teacher at Beaconhouse School System.`,
    'You write short, practical lesson plans that the teacher will really use in class.',
    '',
    'Rules:',
    '- Follow the scheme of work (SOW). Teach the topic you are given; it continues from the last topic covered.',
    '- Use the exact syllabus reference numbers from the SOW or book pages (for example "1.3.2"). Never make one up.',
    '- Only name a textbook activity, exercise or section if it appears in the provided book pages.',
    "  Otherwise write 'textbook questions on <topic>'. Never invent page numbers.",
    `- Activity style: ${profile.activityStyle || 'simple classroom activities with board explanation and notebook work.'}`,
    methods.length ? `- Assessment methods the teacher uses: ${methods.join('; ')}.` : '',
    '- Write 3 or 4 teacher activities in order: starter, explanation, practice, plenary.',
    '  Each has exactly 1 student activity (2 only if truly needed).',
    '- Activity text is plain text: no HTML, no markdown, no bullet characters.',
    '- Each "time" is a whole number of minutes, and all times must add up EXACTLY to the lesson duration.',
    '- attainment_targets_html: one <p> per syllabus statement, each starting with its reference number.',
    '- learning_outcomes_html: exactly three <p>, starting with <em>Knowledge:</em>, <em>Skills:</em> and <em>Attitudes:</em>.',
    '- Keep sentences short and clear. Use British English.',
    '- Return JSON only, matching the schema. No other text.',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

/**
 * User prompt for one lesson: the facts, the topic and the source text to plan from.
 * @param {{ lesson: { classLabel: string, class?: { displayName?: string }, dayId: string, date: string, duration: number },
 *   topic: string, lastTopic?: string, notes?: string, sowText?: string,
 *   bookPages?: Array<{ pageNo: number, text: string }>, previousTopicsThisRequest?: string[] }} input
 * @returns {string}
 */
export function planUserPrompt({ lesson, topic, lastTopic, notes, sowText, bookPages = [], previousTopicsThisRequest = [] }) {
  const times = suggestedTimes(lesson.duration);
  const className = lesson.class?.displayName ? `${lesson.classLabel} (Class ${lesson.class.displayName})` : lesson.classLabel;
  const sections = [
    'Write the lesson plan for this lesson.',
    '',
    `Class: ${className}`,
    `Day: ${DAY_NAMES[lesson.dayId] ?? lesson.dayId}, ${lesson.date}`,
    `Duration: ${lesson.duration} minutes. The "time" values must add up to exactly ${lesson.duration}` +
      ` (for example ${times.join(' + ')} = ${lesson.duration}).`,
    `Topic for this lesson: ${topic}`,
    `Last topic covered before this request: ${lastTopic?.trim() || 'not given (start from the SOW for this point in the year)'}`,
  ];
  if (previousTopicsThisRequest.length) {
    sections.push(`Earlier lessons of this class in this request already cover: ${previousTopicsThisRequest.join('; ')}. Do not repeat them.`);
  }
  if (notes?.trim()) sections.push(`Teacher's notes: ${notes.trim()}`);
  sections.push('', '--- Scheme of work (extract) ---', sowText?.trim() || '(No scheme of work uploaded.)');
  sections.push('', '--- Book pages ---');
  if (bookPages.length) {
    for (const page of bookPages) sections.push(`[Book page ${page.pageNo}]`, page.text.trim(), '');
  } else {
    sections.push("(No book pages found. Do not name textbook activities; write 'textbook questions on <topic>'.)");
  }
  return sections.join('\n').trim();
}

/**
 * Ask the AI to fix only the listed problems (CLAUDE.md Section 7, step 7).
 * @param {object} aiFields The AI fields it returned last time.
 * @param {string[]} errors From lib/validate.js.
 * @returns {string}
 */
export function fixPrompt(aiFields, errors) {
  return [
    'Your lesson plan has these problems:',
    ...errors.map((error) => `- ${error}`),
    '',
    'Fix only these problems and keep everything else the same. Return the full JSON again.',
    '',
    JSON.stringify(aiFields, null, 2),
  ].join('\n');
}

/**
 * Prompts for choosing the next topics of one class from the scheme of work.
 * @param {{ subjectName?: string, classLabel: string, displayName?: string, lessonCount: number,
 *   lessonDates: string[], lastTopic?: string, sowText?: string, notes?: string }} input
 * @returns {{ system: string, user: string }}
 */
export function topicPrompt({ subjectName, classLabel, displayName, lessonCount, lessonDates = [], lastTopic, sowText, notes }) {
  const system = [
    `You help a ${subjectName || ''} teacher at Beaconhouse School System follow their scheme of work (SOW).`,
    'Choose the topics for the next lessons. Topics must follow the SOW order, continue straight on',
    'from the last covered topic, and follow on from each other. One lesson covers a small, teachable part.',
    'Use the exact syllabus reference numbers and wording from the SOW. Return JSON only, matching the schema.',
  ].join('\n');
  const user = [
    `Class: ${classLabel}${displayName ? ` (Class ${displayName})` : ''}`,
    `Number of lessons: ${lessonCount}${lessonDates.length ? ` (on ${lessonDates.join(', ')})` : ''}`,
    `Last topic covered: ${lastTopic?.trim() || 'not given (use the SOW entry for these dates)'}`,
    notes?.trim() ? `Teacher's notes: ${notes.trim()}` : '',
    '',
    '--- Scheme of work ---',
    sowText?.trim() || '(No scheme of work uploaded. Choose sensible next topics from the syllabus.)',
  ]
    .filter((line, i, all) => line !== '' || all[i - 1] !== '')
    .join('\n');
  return { system, user };
}

/**
 * Prompts for turning a request the code could not read into { day, classLabel, week } (T-45).
 * @param {string} text What the teacher typed.
 * @param {Array<{ label: string, displayName?: string }>} classes
 * @returns {{ system: string, user: string }}
 */
export function requestPrompt(text, classes) {
  const list = classes.map((c) => (c.displayName ? `${c.label} (Class ${c.displayName})` : c.label)).join(', ');
  const system = [
    'Convert a teacher\'s request for lesson plans into JSON: { "day": number|null, "classLabel": string|null, "week": number }.',
    'day: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, or null if no day is named.',
    `classLabel: one of these labels exactly: ${list || '(none)'}; or null if no class is named.`,
    'Classes may be named by grade, e.g. "11th", "grade 11", "XI" or "11C" all mean the class shown as XI.',
    'week: the week number given in the request. Return JSON only.',
  ].join('\n');
  return { system, user: `Request: ${text}` };
}

/**
 * Ask for a plain-text copy of an uploaded image (e.g. a timetable photo), so it can be
 * stored and searched like a PDF page.
 * @param {string} sourceType e.g. "timetable"
 * @returns {string}
 */
export function imageTranscriptionPrompt(sourceType) {
  return [
    `This image is a school ${sourceType === 'other' ? 'document' : sourceType} used by a teacher.`,
    'Write out all of its text as clean plain text, in reading order.',
    'If it contains a table (such as a timetable), write one row per line with cells separated by " | ", and keep the header row.',
    'Do not add comments, explanations or anything that is not in the image. Write "[unclear]" for text you cannot read.',
  ].join('\n');
}

/**
 * For providers without a schema option (Groq, OpenRouter), the schema is described in the prompt.
 * @param {object} schema
 * @returns {string}
 */
export function schemaInstruction(schema) {
  return `Return only one JSON object, with no other text, that matches this JSON schema:\n${JSON.stringify(schema)}`;
}
