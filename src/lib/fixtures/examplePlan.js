// The real, approved plan from CLAUDE.md Section 6. Used by tests as the "known good" plan.

export const EXAMPLE_LESSON = { classLabel: 'O1', dayId: '5', weekNo: 9 };

export const EXAMPLE_PLAN = {
  label: 'O1 Day 5 - Calculating file sizes',
  class_id: '16',
  section_ids: ['3'],
  subject_id: '97',
  lp_type: '1',
  acad_year_id: '35',
  topic: '1.3 Data storage and compression: calculation of image and sound file sizes',
  week_from: '12/10/2026',
  week_till: '16/10/2026',
  attainment_targets_html:
    '<p>1.3.2 Calculate the file size of an image file and a sound file, using information given</p>',
  book_ref:
    'Cambridge IGCSE and O Level Computer Science (2nd Ed.), Williams & Watson, Ch 1 Data representation',
  duration: 60,
  day_id: '5',
  learning_outcomes_html:
    '<p><em>Knowledge:</em> Students know the formulas: image size = resolution x colour depth, and sound size = sample rate x sample resolution x length of sample.</p><p><em>Skills:</em> Students can calculate image and sound file sizes and convert the answer into KiB or MiB.</p><p><em>Attitudes:</em> Students show working step by step and check their units.</p>',
  term_id: '1',
  cycle_id: '9',
  collaboration_team: ['102558'],
  activities: [
    {
      content_teacher_activity:
        'Starter: Teacher asks recap questions on storage units (how many bytes in a KiB, bits in a byte, KiB in a MiB).',
      students: [
        { student_activity: 'Students answer orally.', time: 10, resources: 'Whiteboard', assessment: 'Oral questioning' },
      ],
    },
    {
      content_teacher_activity:
        'Explanation: Teacher writes the two formulas on the board and works two examples step by step.',
      students: [
        {
          student_activity:
            'Students copy both formulas and worked examples in notebooks and answer questions during the explanation.',
          time: 20,
          resources: 'Whiteboard, notebook',
          assessment: 'Questioning during explanation',
        },
      ],
    },
    {
      content_teacher_activity:
        'Practice: Teacher asks students to read textbook section 1.3.2 Calculation of file size and solve Activity 1.16 questions 1 and 3.',
      students: [
        {
          student_activity: 'Students solve the textbook activity in notebooks, showing working, and check with a partner.',
          time: 20,
          resources: 'Textbook, notebook',
          assessment: 'Textbook activity solved and checked',
        },
      ],
    },
    {
      content_teacher_activity:
        'Plenary: Teacher discusses answers, then shares a short Google Form quiz (5 questions on file size calculations and units).',
      students: [
        {
          student_activity: 'Students correct their work, then attempt the Google Form quiz.',
          time: 10,
          resources: 'Whiteboard, Google Form',
          assessment: 'Google Form quiz',
        },
      ],
    },
  ],
};
