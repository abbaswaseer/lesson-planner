// JSON schema for the AI-owned plan fields only (CLAUDE.md Section 6). Everything else
// (IDs, dates, duration, day, week) is filled in by code in lib/mergePlan.js.
//
// Written in Gemini's responseSchema format (upper-case types, propertyOrdering).
// Groq and OpenRouter get the same object described in the prompt.
// Counts and the time total are stated in descriptions and checked by lib/validate.js,
// because Gemini's schema support for numeric limits varies between models.

const text = (description) => ({ type: 'STRING', description });

const STUDENT_ACTIVITY = {
  type: 'OBJECT',
  properties: {
    student_activity: text('What the students do. Plain text, no HTML.'),
    time: { type: 'INTEGER', description: 'Minutes for this step. All times in the plan must add up exactly to the lesson duration.' },
    resources: text('Learning materials and resources, e.g. "Whiteboard, notebook".'),
    assessment: text('How learning is checked in this step, using the teacher\'s assessment methods.'),
  },
  required: ['student_activity', 'time', 'resources', 'assessment'],
  propertyOrdering: ['student_activity', 'time', 'resources', 'assessment'],
};

const TEACHER_ACTIVITY = {
  type: 'OBJECT',
  properties: {
    content_teacher_activity: text('What the teacher does, starting with the stage name, e.g. "Starter: …". Plain text, no HTML.'),
    students: {
      type: 'ARRAY',
      description: 'Exactly 1 student activity (2 only if truly needed).',
      items: STUDENT_ACTIVITY,
    },
  },
  required: ['content_teacher_activity', 'students'],
  propertyOrdering: ['content_teacher_activity', 'students'],
};

/** Schema for one lesson's AI fields. */
export const PLAN_AI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    shortTopic: text('A short topic name of 2 to 5 words for the plan label, e.g. "Calculating file sizes".'),
    topic: text('Syllabus section and topic, e.g. "1.3 Data storage and compression: calculation of image and sound file sizes".'),
    chapterNumber: { type: 'INTEGER', description: 'Textbook chapter number for this topic.' },
    chapterTitle: text('Textbook chapter title, e.g. "Data representation".'),
    attainment_targets_html: text(
      'One <p> per syllabus statement, each starting with its exact reference number, e.g. "<p>1.3.2 Calculate the file size of an image file</p>".'
    ),
    learning_outcomes_html: text(
      'Exactly three <p>: "<p><em>Knowledge:</em> …</p><p><em>Skills:</em> …</p><p><em>Attitudes:</em> …</p>".'
    ),
    activities: {
      type: 'ARRAY',
      description: '3 or 4 teacher activities in order: starter, explanation, practice, plenary.',
      items: TEACHER_ACTIVITY,
    },
  },
  required: [
    'shortTopic', 'topic', 'chapterNumber', 'chapterTitle',
    'attainment_targets_html', 'learning_outcomes_html', 'activities',
  ],
  propertyOrdering: [
    'shortTopic', 'topic', 'chapterNumber', 'chapterTitle',
    'attainment_targets_html', 'learning_outcomes_html', 'activities',
  ],
};

/** Schema for turning a free-text request into { day, classLabel, week } (T-45). */
export const REQUEST_SCHEMA = {
  type: 'OBJECT',
  properties: {
    day: { type: 'INTEGER', nullable: true, description: '1 = Monday … 5 = Friday, or null if no day is given.' },
    classLabel: { type: 'STRING', nullable: true, description: 'One of the class labels listed, or null if no class is given.' },
    week: { type: 'INTEGER', description: 'The week number.' },
  },
  required: ['day', 'classLabel', 'week'],
  propertyOrdering: ['day', 'classLabel', 'week'],
};

/** Schema for choosing the next topics from the scheme of work. */
export const TOPICS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    topics: {
      type: 'ARRAY',
      description: 'One topic per lesson, in lesson order, continuing on from each other.',
      items: text('Syllabus section and topic, e.g. "1.3 Data storage and compression: calculation of file sizes".'),
    },
  },
  required: ['topics'],
};

/** Schema for choosing a week's topics for several classes in one call (weekly notification). */
export const WEEK_TOPICS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    classes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          classLabel: { type: 'STRING', description: 'The class label exactly as given.' },
          topics: TOPICS_SCHEMA.properties.topics,
        },
        required: ['classLabel', 'topics'],
        propertyOrdering: ['classLabel', 'topics'],
      },
    },
  },
  required: ['classes'],
};
