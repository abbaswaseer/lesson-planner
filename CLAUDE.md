# CLAUDE.md — Lesson Planner for Beaconhouse Teachers

This file is the permanent brief for this project. Read it fully at the start of every session.
Work from `TASKS.md`: do ONE task at a time, only what that task asks, then stop and report.

---

## 1. What we are building

A free web app that generates lesson plans for Beaconhouse teachers using AI.

A teacher:
1. Sets up a profile (subject, classes, sections, timetable, week numbers, IDs).
2. Uploads sources (textbook PDF, scheme of work, academic calendar, timetable image, school template).
3. Types a request such as `Thursday, week 9` or `10C, week 9`, and confirms the last topic covered per class.
4. Gets one ready-to-use output per lesson: BEAMS JSON (for the Chrome extension), a weekly
   topic notification, or a Word lesson plan in the school template.

### Non-negotiable goals
- **Free forever:** no paid services, no server we pay for.
- **Never stops:** each teacher uses their own free API key; automatic fallback to other free providers.
- **Simple to use:** a non-technical teacher must manage it with the Help page alone.
- **Simple to maintain:** small files, plain JavaScript, no clever abstractions.
- **Private:** all data stays in the teacher's own browser. No student data is ever sent to an AI.

---

## 2. Architecture

- **Fully client-side static app**, deployed on **Cloudflare Pages** (free).
- No backend, no server database, no login in v1.
- Each teacher's data lives in **their own browser** (IndexedDB).
- AI is called **directly from the browser** with the **teacher's own API key**.

```
Browser
 ├─ React UI (Setup, Sources, Generate, History, Help)
 ├─ IndexedDB via Dexie (profiles, sources, pages, plans, progress)
 ├─ pdfjs-dist (PDF → text, per page)
 ├─ MiniSearch (keyword search over textbook pages)
 └─ AI layer → Gemini (default) → Groq → OpenRouter (fallbacks)
```

---

## 3. Tech stack (do not add others without asking)

| Purpose | Library |
|---|---|
| Build tool | Vite |
| UI | React 18 (JavaScript, **no TypeScript**) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`; no config file — settings live in `src/index.css`) |
| Routing | react-router-dom |
| Storage | dexie, dexie-react-hooks |
| PDF reading | pdfjs-dist |
| Search | minisearch |
| Gemini | @google/genai |
| Groq / OpenRouter | plain `fetch` (OpenAI-compatible endpoints) |
| Word export | docx |
| Download files | file-saver |
| IDs | nanoid |

Pin exact versions in `package.json`.

---

## 4. Folder structure

```
lesson-planner/
├─ CLAUDE.md
├─ TASKS.md
├─ DEPLOY.md
├─ index.html
├─ package.json
├─ vite.config.js
├─ public/
│  └─ _redirects                  # SPA routing for Cloudflare Pages
└─ src/
   ├─ main.jsx
   ├─ App.jsx                     # layout + routes
   ├─ index.css
   ├─ db/
   │  └─ db.js                    # Dexie schema + helpers
   ├─ pages/
   │  ├─ SetupPage.jsx
   │  ├─ SourcesPage.jsx
   │  ├─ GeneratePage.jsx
   │  ├─ HistoryPage.jsx
   │  └─ HelpPage.jsx
   ├─ components/                 # small reusable UI pieces
   │  ├─ Sidebar.jsx
   │  ├─ ProfileSwitcher.jsx
   │  ├─ CopyButton.jsx
   │  ├─ JsonCard.jsx
   │  ├─ Toast.jsx
   │  └─ ...
   ├─ lib/
   │  ├─ timetable.js             # request → list of lessons
   │  ├─ weeks.js                 # week number ↔ dates
   │  ├─ pdf.js                   # PDF → pages
   │  ├─ search.js                # MiniSearch index over pages
   │  ├─ validate.js              # plan validation
   │  ├─ exportImport.js          # profile backup file
   │  └─ download.js
   ├─ ai/
   │  ├─ index.js                 # generate() with retry + fallback
   │  ├─ prompts.js               # all prompt text lives here
   │  ├─ schema.js                # JSON schema for AI fields
   │  └─ providers/
   │     ├─ gemini.js
   │     ├─ groq.js
   │     └─ openrouter.js
   └─ outputs/
      ├─ index.js                 # registry of output types
      ├─ beamsJson.js
      ├─ notification.js
      └─ docxPlan.js
```

---

## 5. Data model (Dexie)

Database name: `lessonPlanner`. Version 1 schema:

```js
db.version(1).stores({
  profiles: '++id, name',
  sources:  '++id, profileId, type, name, addedAt',
  pages:    '++id, profileId, sourceId, pageNo',
  plans:    '++id, profileId, classLabel, weekNo, dayId, createdAt',
  progress: '[profileId+classLabel], profileId'
});
```

### Profile object (example — this is the author's real profile)

```json
{
  "name": "Ghulam Abbas — Computer Science",
  "teacherName": "Ghulam Abbas",
  "subjectName": "Computer Science (2210)",
  "subject_id": "97",
  "lp_type": "1",
  "acad_year_id": "35",
  "term_id": "1",
  "collaboration_team": ["102558"],
  "bookRef": "Cambridge IGCSE and O Level Computer Science (2nd Ed.), Williams & Watson",
  "periodMinutes": 40,
  "dayOverrides": { "5": { "periodMinutes": 30 } },
  "classes": [
    { "label": "O1", "displayName": "IX",  "class_id": "16", "section_ids": ["3"] },
    { "label": "O2", "displayName": "X",   "class_id": "17", "section_ids": ["3"] },
    { "label": "O3", "displayName": "XI",  "class_id": "18", "section_ids": ["3"] }
  ],
  "timetable": [
    { "day": 1, "classLabel": "O1", "periods": [1, 2] },
    { "day": 1, "classLabel": "O3", "periods": [3, 4] },
    { "day": 2, "classLabel": "O3", "periods": [3, 4] },
    { "day": 3, "classLabel": "O3", "periods": [3] },
    { "day": 3, "classLabel": "O2", "periods": [7] },
    { "day": 4, "classLabel": "O2", "periods": [1, 2] },
    { "day": 4, "classLabel": "O3", "periods": [3, 4] },
    { "day": 5, "classLabel": "O1", "periods": [2, 3] },
    { "day": 5, "classLabel": "O2", "periods": [7, 8] }
  ],
  "weeks": [
    { "number": 8, "from": "05/10/2026", "till": "09/10/2026" },
    { "number": 9, "from": "12/10/2026", "till": "16/10/2026" }
  ],
  "keys": { "gemini": "", "groq": "", "openrouter": "" },
  "models": { "gemini": "", "groq": "", "openrouter": "" },
  "assessmentMethods": ["Oral questioning", "Textbook activity solved and checked", "Google Form quiz (sometimes)"],
  "activityStyle": "Simple classroom activities: board explanation with worked examples, notebook work, textbook activities, think-pair-share, exit question. No apps or worksheets.",
  "notificationTemplate": "The following topics are planned for *{subject}* from {from} to {till}:\n\n{classes}"
}
```

### Rules derived from the profile (computed in code, never by AI)
- **Lesson duration** = number of periods × period minutes for that day
  (`dayOverrides[day].periodMinutes` if present, else `periodMinutes`).
  Example: Friday O1 periods [2, 3] → 2 × 30 = **60**; Monday O1 [1, 2] → 2 × 40 = **80**.
- **sequenceId** = BEAMS `day_id`: the lesson's number for that class in the week — first lesson "1",
  second "2", and so on in timetable order (Monday first). Counted across the whole week even when
  only one day is requested. Example: O2 Wednesday "1", Thursday "2", Friday "3"; O1 Monday "1",
  Friday "2"; O3 Monday "1" … Thursday "4".
- **dayId** = weekday for dates and headers: Monday = "1", Tuesday = "2", Wednesday = "3",
  Thursday = "4", Friday = "5". It is never sent to BEAMS.
- **cycle_id** = the week number as a string.
- **week_from / week_till** = from the profile's week table.
- **label** = `"<classLabel> Day <sequenceId> - <short topic from AI>"`.

### Source types
`textbook`, `sow`, `calendar`, `timetable`, `template`, `other`.

### Page object
`{ profileId, sourceId, pageNo, text }` — one row per PDF page (or one row for an image source).

### Plan object
`{ profileId, classLabel, weekNo, dayId, date, request, outputType, data, createdAt }`
where `data` is the final merged plan object.

### Progress object
`{ profileId, classLabel, lastTopic, updatedAt }`.

---

## 6. BEAMS JSON — exact output format

The output is always an **array**, even for one plan. One array per lesson when shown on screen.

### Field ownership

| Field | Filled by |
|---|---|
| label | code (prefix) + AI (short topic) |
| class_id, section_ids, subject_id, lp_type, acad_year_id | code |
| topic | AI |
| week_from, week_till | code |
| attainment_targets_html | AI |
| book_ref | code prefix + AI chapter (`<bookRef>, Ch <n> <title>`) |
| duration, day_id, term_id, cycle_id, collaboration_team | code |
| learning_outcomes_html | AI |
| activities | AI (times checked by code) |

### Formatting rules
- IDs are **strings** (`"18"`). `duration` and `time` are **numbers**.
- Dates are `dd/mm/yyyy`.
- `attainment_targets_html`: one `<p>` per syllabus statement, starting with its reference number.
- `learning_outcomes_html`: exactly three `<p>`: `<em>Knowledge:</em>`, `<em>Skills:</em>`, `<em>Attitudes:</em>`.
- `activities`: 3–4 teacher activities in order (starter, explanation, practice, plenary),
  each with exactly 1 student activity (2 only if truly needed). Plain text, no HTML.
- The sum of all `time` values must equal `duration` **exactly**.
- Field order must match the example below.

### Example (real, approved plan)

```json
[
  {
    "label": "O1 Day 2 - Calculating file sizes",
    "class_id": "16",
    "section_ids": ["3"],
    "subject_id": "97",
    "lp_type": "1",
    "acad_year_id": "35",
    "topic": "1.3 Data storage and compression: calculation of image and sound file sizes",
    "week_from": "12/10/2026",
    "week_till": "16/10/2026",
    "attainment_targets_html": "<p>1.3.2 Calculate the file size of an image file and a sound file, using information given</p>",
    "book_ref": "Cambridge IGCSE and O Level Computer Science (2nd Ed.), Williams & Watson, Ch 1 Data representation",
    "duration": 60,
    "day_id": "2",
    "learning_outcomes_html": "<p><em>Knowledge:</em> Students know the formulas: image size = resolution x colour depth, and sound size = sample rate x sample resolution x length of sample.</p><p><em>Skills:</em> Students can calculate image and sound file sizes and convert the answer into KiB or MiB.</p><p><em>Attitudes:</em> Students show working step by step and check their units.</p>",
    "term_id": "1",
    "cycle_id": "9",
    "collaboration_team": ["102558"],
    "activities": [
      {
        "content_teacher_activity": "Starter: Teacher asks recap questions on storage units (how many bytes in a KiB, bits in a byte, KiB in a MiB).",
        "students": [
          { "student_activity": "Students answer orally.", "time": 10, "resources": "Whiteboard", "assessment": "Oral questioning" }
        ]
      },
      {
        "content_teacher_activity": "Explanation: Teacher writes the two formulas on the board and works two examples step by step.",
        "students": [
          { "student_activity": "Students copy both formulas and worked examples in notebooks and answer questions during the explanation.", "time": 20, "resources": "Whiteboard, notebook", "assessment": "Questioning during explanation" }
        ]
      },
      {
        "content_teacher_activity": "Practice: Teacher asks students to read textbook section 1.3.2 Calculation of file size and solve Activity 1.16 questions 1 and 3.",
        "students": [
          { "student_activity": "Students solve the textbook activity in notebooks, showing working, and check with a partner.", "time": 20, "resources": "Textbook, notebook", "assessment": "Textbook activity solved and checked" }
        ]
      },
      {
        "content_teacher_activity": "Plenary: Teacher discusses answers, then shares a short Google Form quiz (5 questions on file size calculations and units).",
        "students": [
          { "student_activity": "Students correct their work, then attempt the Google Form quiz.", "time": 10, "resources": "Whiteboard, Google Form", "assessment": "Google Form quiz" }
        ]
      }
    ]
  }
]
```

---

## 7. Generation pipeline

For every request:

1. **Parse request (code first).** Supported forms:
   - By day: `Monday, week 9` → every lesson that day.
   - By class: `O3, week 9` or `11C, week 9` or `XI, week 9` → every lesson of that class that week.
   - Single: `O2, week 9, Thursday` → one lesson.
   If code cannot parse it, ask Gemini to convert the request to
   `{ "day": number|null, "classLabel": string|null, "week": number }` and then continue in code.
2. **Build the lesson list (code)** from timetable + weeks: classLabel, dayId (weekday), sequenceId
   (BEAMS `day_id`), date, duration.
3. **Decide the topic (AI-assisted).** Input: SOW text, last covered topic for that class, any teacher notes.
   For several lessons of the same class in one week, topics must follow on from each other in order.
4. **Retrieve book pages (code).** Search MiniSearch with the topic words, take the top 3–5 pages
   (max ~12,000 characters total).
5. **Call AI** with the prompt from `ai/prompts.js` and the JSON schema from `ai/schema.js`.
   Ask only for the AI-owned fields.
6. **Merge (code).** Combine the code fields + AI fields in the exact field order of Section 6.
7. **Validate (code).** See Section 9. If invalid, send the error list back to the AI once
   ("fix only these problems, return the full JSON again"). If still invalid, show the plan with
   a red warning and the error list — never silently drop it.
8. **Save** to `plans`, then **update `progress`** with the new topic.

Lessons in one request are generated **one at a time** (sequentially), with a visible progress
indicator (`Generating 2 of 4…`). This respects free rate limits.

---

## 8. AI layer

### Providers
- **Gemini (default)** via `@google/genai`: use `responseMimeType: "application/json"` and `responseSchema`.
- **Groq** and **OpenRouter**: OpenAI-compatible chat completions via `fetch`,
  with `response_format: { "type": "json_object" }` and the schema described in the prompt.

### Model names
- Never hard-code model names in logic.
- On the Setup page, a **Load models** button lists models available to the key
  (Gemini: models list API). Default to the first model whose name contains `flash`.
- The chosen model is stored in `profile.models`.

### Fallback and retries (`ai/index.js`)
```
for provider in [gemini, groq, openrouter] where a key exists:
    try up to 3 times with backoff (2s, 5s, 10s) on HTTP 429 / 500 / 503 / network error
    on success → return
    on 400/401/403 (bad request / bad key) → do not retry, move to next provider
if all fail → throw a friendly error: what failed + what the teacher can do
```
Show the provider that produced each plan in small grey text on its card.

### Prompt rules (`ai/prompts.js`)
All prompt text lives in this one file. The system prompt must include:
- Role: lesson planner for the teacher's subject and syllabus code, Beaconhouse.
- Follow the SOW; continue from the last covered topic.
- The activity style and assessment methods from the profile.
- "Only name a textbook activity, exercise or section if it appears in the provided book pages.
  Otherwise write 'textbook questions on <topic>'. Never invent page numbers."
- "Use the exact syllabus reference numbers from the SOW/book pages."
- The exact durations and the rule that times must add up exactly.
- Return JSON only, matching the schema.

### Privacy
- Keys are stored only in the browser (IndexedDB inside the profile). Show a note:
  "Your key is stored only on this computer."
- Never include student names, marks, or any personal data in prompts.

---

## 9. Validation rules (`lib/validate.js`)

Return a list of human-readable errors (empty list = valid). Check:
1. Output is an array; each plan has every field from Section 6, in that order.
2. IDs are non-empty strings; `duration` and every `time` are positive integers.
3. Dates match `dd/mm/yyyy`.
4. 3–4 activities; each has 1–2 student entries; no HTML in activity text.
5. Sum of `time` === `duration`.
6. `attainment_targets_html` has ≥ 1 `<p>`; `learning_outcomes_html` has exactly the three `<em>` labels.
7. `day_id` is the lesson's number for that class that week ("1", "2", …) and matches `sequenceId`;
   `cycle_id` matches the week.
8. Label starts with `"<classLabel> Day <day_id> - "`.

Auto-fix only safe things in code (e.g. trimming spaces, number strings → numbers).
Never auto-change times; send time errors back to the AI.

---

## 10. Output types (`src/outputs/`)

Each output module exports:
```js
export default {
  id: 'beamsJson',
  name: 'BEAMS JSON',
  render(plans, profile) { /* returns { kind: 'text' | 'file', ... } */ }
};
```
- **beamsJson** — one pretty-printed JSON array per lesson, each with Copy and Download buttons,
  plus "Copy all".
- **notification** — weekly message:
  ```
  The following topics are planned for *Computer Science (2210)* from 12th October to 16th October 2026:

  *Class IX*
  1.3.1 Data Storage — measurement of data storage
  1.3.2 Calculating File Sizes — image and sound file size calculations

  *Class X*
  ...
  ```
  Short lines, no commentary, never mention tests/CATs. Dates written like "12th October".
- **docxPlan** — fills the uploaded school lesson plan template (source type `template`)
  if possible; otherwise builds a clean Word table layout: Name of Teacher, Subject, Topic, Date,
  Class, Duration, Attainment Target, Learning Outcomes, then the activity table with columns
  Content and teacher activity / Student activity / Time / Learning materials and resources /
  Formative assessment, then "How did you meet the individual learning needs", then an empty
  Lesson Evaluation section. One lesson per page. Font Arial.

Adding a new output type = add one file + register it in `outputs/index.js`.

---

## 11. UI and UX rules

- Sidebar: Setup, Sources, Generate, History, Help. Profile switcher at the top.
- Tailwind only. Clean, calm, lots of white space; one accent colour (blue).
- Must work well on a laptop; acceptable on a phone.
- Every action gives feedback: loading spinners, success toasts, clear error messages
  in plain English (no stack traces shown to the user).
- Destructive actions (delete source, delete profile) ask for confirmation.
- First-time users see a small checklist on Generate: "1. Add your API key  2. Upload sources  3. Fill timetable".
- Forms save automatically (debounced) — no "forgot to save" problems.

---

## 12. Coding conventions

- Plain JavaScript with JSDoc comments on exported functions.
- Functional React components and hooks only.
- One component per file; keep files under ~200 lines — split if longer.
- Business logic lives in `lib/`, `ai/`, `outputs/` — not inside page components.
- No global state library; use Dexie live queries + React state.
- Clear names over clever code. Comment the *why*, not the *what*.
- Handle errors at the edges (AI calls, file reading) and show friendly messages.
- Never commit API keys or real textbook files. `.gitignore` must include `node_modules`, `dist`, `.env*`.

---

## 13. Testing

- Use **Vitest** for pure functions in `lib/` (timetable, weeks, validate, notification).
- Each `lib/` task in TASKS.md includes its tests.
- Before finishing any task: run `npm run build` and `npm test`; both must pass.

---

## 14. Deployment

- Cloudflare Pages, connected to the GitHub repo.
- Build command: `npm run build`. Output directory: `dist`.
- `public/_redirects` contains: `/* /index.html 200`.
- No environment variables are needed (keys are entered by each teacher in the app).

---

## 15. How to work on this project

1. Open `TASKS.md`, find the task you were asked to do (e.g. "Do T-14").
2. Read the task's goal, files and "Done when" list.
3. Do only that task. If something outside the task seems needed, ask first.
4. Run `npm run build` and `npm test`.
5. Tick the task's checkbox in `TASKS.md` (`- [x]`).
6. Reply with: what changed, files touched, how to test it in the browser, and the
   suggested git commit message.
