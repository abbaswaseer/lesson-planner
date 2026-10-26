// Text of the Help page. Kept as data so it is easy to edit without touching layout code.
// `link` items are in-app routes; `href` items open other websites.

/** Step-by-step guide, in the order a new teacher needs it. */
export const STEPS = [
  {
    title: 'Get a free Gemini key',
    body: [
      'Open aistudio.google.com/apikey and sign in with your Google account.',
      'Press "Create API key", then copy the key (a long line of letters and numbers).',
      'In this app, open Setup → AI keys, paste the key into "Google Gemini key" and press Test. You should see "✓ Working".',
      'Optional: add a free Groq or OpenRouter key too. If Gemini is busy, the app uses them instead.',
    ],
    href: 'https://aistudio.google.com/apikey',
    linkText: 'Open Google AI Studio',
    screenshot: 'The AI keys card on Setup with "✓ Working" next to Test',
  },
  {
    title: 'Set up your profile',
    body: [
      'On Setup, fill in your name, subject and the BEAMS IDs (subject, academic year, term, collaboration team).',
      'Add your classes with their BEAMS class and section IDs.',
      'Set the period length, then click your periods in the timetable grid to choose the class for each one.',
      'Add the week table: each week number with its Monday and Friday dates.',
      'Everything saves by itself as you type.',
    ],
    link: '/setup',
    linkText: 'Go to Setup',
    screenshot: 'The timetable grid filled in for one week',
  },
  {
    title: 'Upload your sources',
    body: [
      'On Sources, add the textbook PDF and the scheme of work PDF. Check each file\'s type, then press Save.',
      'A big textbook takes a minute to read. Wait until it shows in "Your sources".',
      'Use "Check a topic is found" to make sure the book was read: type a topic and see the matching pages.',
      'You can also add the academic calendar, a timetable photo (needs the Gemini key) and your school\'s Word template.',
    ],
    link: '/sources',
    linkText: 'Go to Sources',
    screenshot: 'The Sources list showing the textbook with its page count',
  },
  {
    title: 'Generate plans',
    body: [
      'On Generate, type what you need, for example "Thursday, week 9", "O3, week 9" or "O2, week 9, Thursday".',
      'Check the lessons shown under the box, and the "Last topic covered" for each class.',
      'Choose the output (BEAMS JSON, Weekly topic notification or Word lesson plan) and press Generate.',
      'Plans are made one at a time. Each one is saved in History, and "Last topic covered" moves on by itself.',
    ],
    link: '/generate',
    linkText: 'Go to Generate',
    screenshot: 'A finished plan card with Copy, Download and Regenerate',
  },
  {
    title: 'Copy into BEAMS',
    body: [
      'Press Copy on a plan card (or "Copy all" for several).',
      'If you do not have the extension yet, download beams-lp-filler.zip from the BEAMS guide and install it once. The steps are on that page.',
      'Open the BEAMS lesson plan page, paste the JSON into the extension, press Fill form, and check the form before you submit it.',
    ],
    link: '/beams',
    linkText: 'Open the BEAMS guide',
    screenshot: 'The BEAMS extension with the plan pasted in',
  },
  {
    title: 'Export a backup',
    body: [
      'Everything is stored only in this browser. If the browser data is cleared, it is gone.',
      'On Setup → Backup, press Export now and then, and keep the file somewhere safe (e.g. Google Drive).',
      'To move to another computer, open the app there and press "Import a backup…".',
    ],
    link: '/setup',
    linkText: 'Go to Backup',
    screenshot: 'The Backup card on Setup',
  },
];

/** Common problems and what to do. */
export const FAQ = [
  {
    question: '"Too many requests" or "limit reached"',
    answer:
      'Free keys allow a limited number of requests per minute and per day. Wait a minute and try again. ' +
      'For many plans at once, add a free Groq or OpenRouter key on Setup: the app switches to them automatically.',
  },
  {
    question: '"Did not accept this key" or the key is not working',
    answer:
      'Copy the key again from the provider\'s website, with nothing before or after it, and paste it on Setup. ' +
      'Press Test to check it. If it still fails, delete the key on the provider\'s website and create a new one.',
  },
  {
    question: 'A plan has red errors',
    answer:
      'The app checks every plan (for example, that the activity times add up to the lesson length). ' +
      'If the AI could not fix a problem, the plan is shown with the list in red. Press Regenerate, ' +
      'optionally with a short instruction, or copy the plan and fix it by hand in BEAMS.',
  },
  {
    question: 'The plan uses the wrong topic',
    answer:
      'Check the "Last topic covered" box for that class on Generate, correct it, then press Regenerate. ' +
      'Make sure the scheme of work is uploaded on Sources.',
  },
  {
    question: '"Not understood yet" under the request box',
    answer:
      'Write the day or class and the week number, like "Thursday, week 9" or "O3, week 9". ' +
      'If you press Generate anyway, the AI tries to read the request.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Your profile, sources and plans stay in this browser. Only the lesson details and book pages are sent ' +
      'to the AI with your own key. Never type student names or marks into the notes.',
  },
];
