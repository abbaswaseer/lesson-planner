// Content for the BEAMS guide page (/beams), adapted from
// Project-Instructions-BEAMS-Planner.md. Kept as data so the guide can be
// edited without touching layout code.

/** Section links shown at the top of the guide. */
export const CONTENTS = [
  { id: 'how-to-ask', label: 'How to ask' },
  { id: 'before-you-generate', label: 'Before you generate' },
  { id: 'fixed-values', label: 'Fixed values' },
  { id: 'subject-ids', label: 'Subject IDs' },
  { id: 'timetable-weeks', label: 'Timetable and weeks' },
  { id: 'activity-style', label: 'Activity style' },
  { id: 'json', label: 'JSON rules and schema' },
  { id: 'extension', label: 'Copy into BEAMS' },
  { id: 'other-subjects', label: 'Other subjects' },
  { id: 'checklist', label: 'Checklist' },
];

/** The four things a teacher does, in order. */
export const QUICK_START = [
  {
    title: 'Set up your profile',
    text: 'Subject, BEAMS IDs, classes, sections, periods, timetable and weeks. Everything saves by itself.',
    to: '/setup',
    linkText: 'Open Setup',
  },
  {
    title: 'Upload your sources',
    text: 'The textbook PDF and the scheme of work are the two that matter most. The academic calendar and a timetable photo are optional.',
    to: '/sources',
    linkText: 'Open Sources',
  },
  {
    title: 'Ask for your plans',
    text: 'Type a day or class and the week, check the lessons shown, then press Generate.',
    to: '/generate',
    linkText: 'Open Generate',
  },
  {
    title: 'Copy into the extension',
    text: 'Choose BEAMS JSON, press Copy, paste into the BEAMS Lesson Plan Filler extension, check the form, then submit.',
  },
];

/** Supported request forms. */
export const REQUEST_EXAMPLES = [
  { ask: 'Monday, week 7', result: 'One plan for every class you teach that day.' },
  { ask: 'O3, week 7', result: 'Every O3 lesson that week. Topics follow on from each other.' },
  { ask: 'O2, week 7, Thursday', result: 'One lesson.' },
  { ask: '11C week 7', result: 'The same as O3 when 11C is that class. XI, Class 11 and class XI also work.' },
  { ask: 'week 7', result: 'The whole week. Mainly used for the weekly notification.' },
  { ask: 'thursday wk 9', result: 'Short forms work too: wk, w, thu, fri and similar.' },
];

/** How the extension guide says to ask for a plan in another subject. */
export const OTHER_SUBJECT_ASK = 'Biology, O1, section A, week 7, Day 2, 40 min';

/** What the app takes from Setup before any AI is called. */
export const PROFILE_ITEMS = [
  { item: 'Subject and subject_id', note: 'The AI writes topics and syllabus references for this subject.' },
  { item: 'Classes and sections', note: 'The class_id and section_ids in every plan.' },
  { item: 'Period length', note: 'Used to work out duration. A day override (e.g. shorter Friday periods) is applied too.' },
  { item: 'Timetable', note: 'Which class you teach on which day and period. A double period becomes one lesson.' },
  { item: 'Week table', note: 'Week numbers with Monday and Friday dates. These become cycle_id, week_from and week_till.' },
  { item: 'Book reference', note: 'The start of book_ref. The AI adds the chapter and title.' },
  { item: 'Activity style and assessment methods', note: 'The AI follows these when writing activities.' },
  { item: 'Collaboration team', note: 'The employee IDs sent in every plan. Only the number matters to BEAMS.' },
];

/** Sources page: what to upload and why. */
export const SOURCE_ITEMS = [
  { source: 'Textbook PDF', why: 'Gives the AI the real book content, activities and section names. The most important source. Add any other subject book you use too.' },
  { source: 'Scheme of work PDF', why: 'Tells the AI which topic comes next, week by week. The other most important source.' },
  { source: 'Academic calendar', why: 'Reference for holidays and exam days. The request or notes can also mention them.' },
  { source: 'Timetable image', why: 'Optional. A JPG or PNG is read once by Gemini and stored as text.' },
  { source: 'Word lesson plan template', why: 'Optional. Stored for the Word output.' },
];

/** Fixed values from the extension guide. */
export const FIXED_VALUES = [
  { name: 'collaboration_team', value: '["102558 - Abdul Rehman"]', note: 'Put in every plan unless told otherwise. Enter it on Setup → Basic details if your extension expects the name; the number alone ("102558") is enough for BEAMS.' },
  { name: 'lp_type', value: '"1"', note: 'Lesson plan type.' },
  { name: 'acad_year_id', value: '"35"', note: 'Academic year.' },
  { name: 'term_id', value: '"1"', note: 'Term 1. Use "2" for Term 2.' },
  { name: 'subject_id', value: '"97"', note: 'Computer Science 2210. This is the default when no other subject is named.' },
];

/** Class labels used in the extension guide. */
export const CLASS_IDS = [
  { label: 'O1', display: 'Class 9', id: '16' },
  { label: 'O2', display: 'Class 10', id: '17' },
  { label: 'O3', display: 'Class 11', id: '18' },
];

/** Section letters and their BEAMS IDs. */
export const SECTION_IDS = [
  { section: 'A', id: '1' },
  { section: 'B', id: '2' },
  { section: 'C', id: '3' },
];

/**
 * subject_id values from the BEAMS dropdown. Computer Science is first because
 * it is the default; the rest are alphabetical.
 */
export const SUBJECT_IDS = [
  { subject: 'Computer Science 2210', id: '97', note: 'Default' },
  { subject: 'Additional Mathematics 4037', id: '55' },
  { subject: 'Agriculture 5038', id: '72' },
  { subject: 'Art 6010', id: '60' },
  { subject: 'Biology 5090', id: '10' },
  { subject: 'Business Studies 7115', id: '17' },
  { subject: 'Chemistry 5070', id: '14' },
  { subject: 'Commerce 7100', id: '91' },
  { subject: 'Computer Studies 7010', id: '39' },
  { subject: 'Economics 2281', id: '16' },
  { subject: 'English 1123', id: '57' },
  { subject: 'English Literature 2010', id: '34' },
  { subject: 'Environmental Management 5014', id: '88' },
  { subject: 'Fashion and Textiles 6130', id: '18' },
  { subject: 'Food and Nutrition 6065', id: '19' },
  { subject: 'Global Perspectives 2069', id: '46' },
  { subject: 'ICT 0417', id: '92' },
  { subject: 'Islamiat 2058', id: '59' },
  { subject: 'Mathematics D 4024', id: '5' },
  { subject: 'Media Studies 3860', id: '31' },
  { subject: 'Pakistan Studies 2059', id: '58' },
  { subject: 'PE and Sports', id: '4' },
  { subject: 'Physics 5054', id: '12' },
  { subject: 'Principles of Accounts 7110', id: '15' },
  { subject: 'PSHE (Personal, Social, Health and Economic Wellbeing)', id: '128' },
  { subject: 'Sociology 2251', id: '85' },
  { subject: 'Statistics 4040', id: '86' },
  { subject: 'Urdu A 3247', id: '37' },
  { subject: 'Urdu B 3248', id: '38' },
  { subject: 'World History', id: '29' },
  { subject: 'IGCSE Add Maths 0606', id: '106' },
  { subject: 'IGCSE Business 0264', id: '52' },
  { subject: 'IGCSE Chemistry 0620', id: '102' },
  { subject: 'IGCSE English 0500', id: '100' },
  { subject: 'IGCSE Islamiat 0493', id: '105' },
  { subject: 'IGCSE Mathematics 0580', id: '101' },
  { subject: 'IGCSE Pakistan Studies 0448', id: '104' },
  { subject: 'IGCSE Physics 0625', id: '103' },
  { subject: 'IGCSE Urdu 0539', id: '107' },
];

/**
 * Timetable from the extension guide (Computer Science 2210, 40-minute periods).
 * `sequenceId` is BEAMS' day_id: this class's 1st, 2nd, 3rd … lesson that week.
 * It is not the weekday: O2's Wednesday lesson is "1", Thursday "2", Friday "3".
 */
export const TIMETABLE = [
  { day: 'Monday', classLabel: 'O1', periods: '1–2', duration: 80, sequenceId: '1' },
  { day: 'Monday', classLabel: 'O3', periods: '3–4', duration: 80, sequenceId: '1' },
  { day: 'Tuesday', classLabel: 'O3', periods: '3–4', duration: 80, sequenceId: '2' },
  { day: 'Wednesday', classLabel: 'O3', periods: '3', duration: 40, sequenceId: '3' },
  { day: 'Wednesday', classLabel: 'O2', periods: '7', duration: 40, sequenceId: '1' },
  { day: 'Thursday', classLabel: 'O2', periods: '1–2', duration: 80, sequenceId: '2' },
  { day: 'Thursday', classLabel: 'O3', periods: '3–4', duration: 80, sequenceId: '4' },
  { day: 'Friday', classLabel: 'O1', periods: '2–3', duration: 80, sequenceId: '2' },
  { day: 'Friday', classLabel: 'O2', periods: '7–8', duration: 80, sequenceId: '3' },
];

/** Week numbers and dates from the extension guide (Term 1 2026). */
export const WEEKS = [
  { number: 5, from: '28/09/2026', till: '02/10/2026' },
  { number: 6, from: '05/10/2026', till: '09/10/2026' },
  { number: 7, from: '12/10/2026', till: '16/10/2026' },
  { number: 8, from: '19/10/2026', till: '23/10/2026' },
  { number: 9, from: '26/10/2026', till: '30/10/2026' },
  { number: 10, from: '02/11/2026', till: '06/11/2026' },
  { number: 11, from: '09/11/2026', till: '13/11/2026' },
  { number: 12, from: '16/11/2026', till: '20/11/2026' },
  { number: 13, from: '23/11/2026', till: '27/11/2026' },
  { number: 14, from: '30/11/2026', till: '04/12/2026' },
  { number: 15, from: '07/12/2026', till: '11/12/2026' },
  { number: 16, from: '14/12/2026', till: '18/12/2026' },
];

/** Who writes each field: the app, the AI, or both. */
export const FIELD_RULES = [
  { field: 'label', owner: 'App + AI', rule: 'Class and lesson number are written by the app; the AI adds a short topic. Format: "<class> Day <lesson number> - <short topic>".' },
  { field: 'class_id', owner: 'App', rule: 'From the class on Setup: O1 = "16", O2 = "17", O3 = "18".' },
  { field: 'section_ids', owner: 'App', rule: 'The section(s) set for that class on Setup. Always strings.' },
  { field: 'subject_id', owner: 'App', rule: '"97" for Computer Science 2210 unless the profile is for another subject.' },
  { field: 'lp_type', owner: 'App', rule: '"1".' },
  { field: 'acad_year_id', owner: 'App', rule: '"35".' },
  { field: 'topic', owner: 'AI', rule: 'Syllabus reference and title, e.g. "10.1 Logic gates: symbols and truth tables".' },
  { field: 'week_from / week_till', owner: 'App', rule: 'The Monday and Friday of the week on Setup, dd/mm/yyyy.' },
  { field: 'attainment_targets_html', owner: 'AI', rule: 'One sentence per syllabus statement, one <p> each, starting with its exact reference number.' },
  { field: 'book_ref', owner: 'App + AI', rule: 'The profile book reference plus "Ch <n> <title>" from the AI. For CS: "Cambridge IGCSE and O Level Computer Science (2nd Ed.), Williams & Watson, Ch <n> <title>".' },
  { field: 'duration', owner: 'App', rule: 'Periods × period length for that day. An 80-minute double, for example.' },
  { field: 'day_id', owner: 'App', rule: 'The lesson number for that class in the week: first lesson "1", second "2", and so on. It is not the weekday. O2 Wednesday = "1", Thursday = "2", Friday = "3".' },
  { field: 'learning_outcomes_html', owner: 'AI', rule: 'Exactly three <p>, labelled Knowledge, Skills and Attitudes.' },
  { field: 'term_id', owner: 'App', rule: '"1" for Term 1 or "2" for Term 2.' },
  { field: 'cycle_id', owner: 'App', rule: 'The week number as a string, e.g. "9".' },
  { field: 'collaboration_team', owner: 'App', rule: 'Array of employee IDs, e.g. ["102558 - Abdul Rehman"]. Only the number matters to BEAMS.' },
  { field: 'activities', owner: 'AI', rule: '3–4 teacher activities in order: starter, explanation, practice, plenary. Each has 1 student activity (2 only if truly needed). Plain text, no HTML.' },
];

/** Rules the JSON must follow. */
export const OUTPUT_RULES = [
  'Return only one JSON code block containing an array — even for one plan.',
  'Use valid JSON: double quotes, no trailing commas, no comments. Escape a quote inside text as \\".',
  'IDs are strings ("18"); duration and every time are numbers; dates are dd/mm/yyyy.',
  'If the class, section or week is missing and cannot be worked out, ask in one line instead of guessing.',
  'Keep the field order used in the schema below.',
  'Activities are plain text, never HTML. The times must add up exactly to duration.',
  'Attainment targets: one paragraph per syllabus statement, each starting with its reference number.',
  'Learning outcomes: exactly the three labels Knowledge, Skills and Attitudes.',
];

/** Recommended classroom activity style. */
export const ACTIVITY_DO = [
  'Teacher explains with board examples; students copy the key points in notebooks.',
  'Students read a textbook section, then answer its questions or activities in notebooks.',
  'Class discussion, questioning, think-pair-share with a partner.',
  'Students solve textbook exercises or one past-paper style question.',
  'A short recap quiz or exit question at the end.',
];

/** Things the guide says to avoid. */
export const ACTIVITY_AVOID = [
  'Apps, websites or online tools.',
  'Group projects, printed worksheets or props.',
  'Anything that needs preparation before the lesson.',
  'The computer lab, unless you asked for a practical lesson.',
];

/** An 80-minute example from the extension guide. */
export const ACTIVITY_EXAMPLE = [
  { stage: 'Starter', time: 10, teacher: 'Teacher asks recap questions on the last lesson.', student: 'Students answer orally.' },
  { stage: 'Explanation', time: 30, teacher: 'Teacher explains the topic on the board with 2 worked examples.', student: 'Students copy notes and examples.' },
  { stage: 'Practice', time: 30, teacher: 'Teacher asks students to read the textbook section and answer its questions; checks and helps.', student: 'Students answer the questions in their notebooks.' },
  { stage: 'Plenary', time: 10, teacher: 'Class discussion of answers, then one exit question.', student: 'Students write the exit answer and hand it in.' },
];

/** The extension zip hosted with this site. */
export const EXTENSION_DOWNLOAD = {
  url: '/downloads/beams-lp-filler.zip',
  fileName: 'beams-lp-filler.zip',
  version: '1.0.0',
  size: '20 KB',
};

/** One-time install of the unpacked Chrome extension (from its README). */
export const EXTENSION_INSTALL_STEPS = [
  'Download the zip and unzip it somewhere permanent, for example Documents\\beams-lp-filler. Do not delete the folder: Chrome loads the extension from it every time.',
  'Open chrome://extensions in Chrome.',
  'Turn on Developer mode (top right).',
  'Press Load unpacked and choose the beams-lp-filler folder — the one that has manifest.json inside it.',
  'Pin the extension to the toolbar so it is one click away.',
  'After changing any extension file, press the reload icon on chrome://extensions.',
];

/** What the extension deliberately does not touch (from its README). */
export const EXTENSION_SAFETY = [
  'It never clicks Update. You check the form and click Update yourself.',
  'It never changes Campus, Students, Selected Attainment Targets, Approval Batch or Approving Authority.',
  'It fills Collaboration Team only when the JSON contains collaboration_team.',
  'Changing Class or Subject makes BEAMS reload the form, so the extension fills in stages and reports each step in its log.',
];

/** Steps for putting the generated JSON into BEAMS. */
export const EXTENSION_STEPS = [
  'On Generate, choose BEAMS JSON and press Generate.',
  'Press Copy on a plan card. For several lessons, Copy all gives one JSON array with every plan.',
  'In BEAMS, open Lesson Plan and add a NEW lesson plan (a blank form).',
  'Click the extension, paste the JSON, pick the plan from the dropdown, then press Fill form.',
  'Check the log and the form: class, section, topic, dates, activities and times.',
  'Set Approval Batch if needed, then click Update yourself.',
];

/** Final checklist before submitting. */
export const CHECKLIST = [
  'Subject ID, class IDs, section IDs, lp_type, acad_year_id, term_id and collaboration team are set on Setup.',
  'Periods, timetable and week table match your school.',
  'The textbook and scheme of work are uploaded, and a topic search finds the right pages.',
  'The last topic covered is correct for every class in the request.',
  'The request is understood and the lesson preview shows the right lessons.',
  'BEAMS JSON is chosen and the plans are generated.',
  'The JSON is pasted into the extension and the filled form is checked before submitting.',
  'A backup is exported after big changes.',
];

/** Notes for planning a subject other than Computer Science. */
export const OTHER_SUBJECT_NOTES = [
  'This app plans for the subject of the active profile. To plan Biology, switch to a Biology profile (or create one) before generating.',
  'The request selects the day, class and week. The subject, section and period length come from the profile, not from the request text.',
  'Set that subject\'s subject_id from the table above, its classes and sections, and its book reference.',
  'Use that subject\'s syllabus codes and reference numbers in the topic and attainment targets.',
  'Add a timetable for that profile too. Without timetable entries the app cannot work out which lessons to plan or how long they are.',
  'If you have no textbook for that subject, set a standard Cambridge coursebook as the book reference. The AI will not invent chapter or page numbers.',
  'The timetable in this guide is for Computer Science 2210 only. 8CS and PSHE lessons are skipped unless you ask for them.',
];

/** The array the extension expects, with placeholders. */
export const SCHEMA_JSON = `[
  {
    "label": "",
    "class_id": "",
    "section_ids": [""],
    "subject_id": "97",
    "lp_type": "1",
    "acad_year_id": "35",
    "topic": "",
    "week_from": "dd/mm/yyyy",
    "week_till": "dd/mm/yyyy",
    "attainment_targets_html": "<p></p>",
    "book_ref": "",
    "duration": 80,
    "day_id": "",
    "learning_outcomes_html": "<p><em>Knowledge:</em> </p><p><em>Skills:</em> </p><p><em>Attitudes:</em> </p>",
    "term_id": "1",
    "cycle_id": "",
    "collaboration_team": ["102558 - Abdul Rehman"],
    "activities": [
      {
        "content_teacher_activity": "",
        "students": [
          { "student_activity": "", "time": 10, "resources": "", "assessment": "" }
        ]
      }
    ]
  }
]`;
