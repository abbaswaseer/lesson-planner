# TASKS.md — Lesson Planner build plan

## How to use this file
- In Claude Code, say: **"Do T-01 from TASKS.md"** (then T-02, T-03 …). One task per request.
- After each task: test in the browser (`npm run dev`), then commit:
  `git add . && git commit -m "T-01: <message>"`.
- If a task breaks something, undo with `git checkout .` and ask again.
- Claude ticks `- [x]` when a task is done.
- Milestones (🏁) are good points to stop and try the app properly.

---

## Phase 0 — Project setup

- [x] **T-01 Create the project**
  Create a Vite + React (JavaScript) app in the current folder. Remove demo content.
  Add `.gitignore` (node_modules, dist, .env*).
  *Done when:* `npm run dev` shows a blank page with the title "Lesson Planner".

- [x] **T-02 Add Tailwind CSS**
  Install and configure Tailwind. Add base styles in `src/index.css`.
  *Done when:* a test heading styled with Tailwind classes shows blue and bold.

- [x] **T-03 Install core libraries**
  Install with pinned versions: react-router-dom, dexie, dexie-react-hooks, pdfjs-dist,
  minisearch, @google/genai, docx, file-saver, nanoid. Install vitest as a dev dependency
  and add `"test": "vitest run"` to package.json.
  *Done when:* `npm run build` and `npm test` both run without errors.

- [x] **T-04 Folder structure**
  Create the folders and empty starter files listed in CLAUDE.md Section 4.
  *Done when:* the tree matches CLAUDE.md; build still passes.

---

## Phase 1 — Layout and navigation

- [x] **T-05 App layout**
  Build `App.jsx` with a left sidebar and a main content area. Sidebar links: Setup,
  Sources, Generate, History, Help. App name at the top.
  *Done when:* layout shows on desktop; sidebar collapses to a top menu on phones.

- [x] **T-06 Routing**
  Add react-router routes for the five pages, each showing its page title.
  Default route → Generate. Highlight the active link.
  *Done when:* clicking each link changes the page and URL.

- [x] **T-07 Toast notifications**
  Create `Toast.jsx` and a tiny `useToast` hook (success / error / info, auto-hide 3s).
  *Done when:* a test button on Help shows each toast type.

- [x] **T-08 Reusable UI pieces**
  Create `Button`, `Card`, `Input`, `Select`, `Textarea`, `ConfirmDialog` components
  with consistent Tailwind styling.
  *Done when:* Help page temporarily shows each component; remove the demo after.

---

## Phase 2 — Database

- [x] **T-09 Dexie schema**
  In `src/db/db.js`, create the database with the version 1 schema from CLAUDE.md Section 5.
  *Done when:* the browser DevTools → Application → IndexedDB shows `lessonPlanner` with 5 tables.

- [x] **T-10 Profile helpers**
  Add helpers: `createProfile`, `getProfile`, `updateProfile`, `deleteProfile`
  (also deletes its sources, pages, plans, progress), `listProfiles`.
  *Done when:* unit tests (with fake-indexeddb) pass.

- [x] **T-11 Active profile**
  Store the active profile id in localStorage. Add `useActiveProfile()` hook returning
  the live profile object (Dexie live query).
  *Done when:* reloading the page keeps the same active profile.

- [x] **T-12 Profile switcher**
  `ProfileSwitcher.jsx` at the top of the sidebar: dropdown of profiles, "New profile",
  "Rename", "Delete" (with confirm).
  *Done when:* you can create two profiles and switch between them.

- [x] **T-13 Sample profile**
  Add a "Load sample profile" button (Setup page) that creates the example profile
  from CLAUDE.md Section 5.
  *Done when:* clicking it creates and selects the sample profile.

🏁 **Milestone 1:** app shell with profiles saved in the browser.

---

## Phase 3 — Setup page

- [x] **T-14 Basic details form**
  Fields: profile name, teacher name, subject name, subject_id, lp_type, acad_year_id,
  term_id, book reference text. Auto-save (debounced 500ms).
  *Done when:* edits persist after reload.

- [x] **T-15 Classes editor**
  Table of classes: label (e.g. O1), display name (IX), class_id, section_ids
  (comma-separated input saved as an array). Add / remove rows.
  *Done when:* classes persist and show correctly after reload.

- [ ] **T-16 Collaboration team**
  Input for collaboration IDs (comma-separated → array of strings).
  *Done when:* saved as `["102558"]`.

- [ ] **T-17 Period settings**
  Default period minutes (number) and per-day overrides (e.g. Friday = 30).
  *Done when:* saved as `periodMinutes` and `dayOverrides` exactly like CLAUDE.md.

- [ ] **T-18 Timetable grid**
  Grid: rows Monday–Friday, columns periods 1–8. Each cell is a dropdown of class labels
  (or empty). Save as the `timetable` array (consecutive periods of the same class on the
  same day become one entry, e.g. `periods: [1, 2]`).
  *Done when:* the sample timetable shows correctly in the grid and edits are saved.

- [ ] **T-19 Week table**
  Editable table: week number, from date, till date (dd/mm/yyyy). Add row, delete row,
  and "Add next week" (adds +7 days to the last row and the next number).
  *Done when:* adding weeks 10–16 takes a few clicks.

- [ ] **T-20 Activity style and assessment**
  Textarea for activity style; editable list of assessment methods.
  *Done when:* both persist.

- [ ] **T-21 Notification template**
  Textarea for the notification header line with placeholders `{subject}`, `{from}`, `{till}`.
  *Done when:* persists.

- [ ] **T-22 API keys section**
  Password inputs for Gemini (required), Groq and OpenRouter (optional), with show/hide
  toggles and the note "Your key is stored only on this computer." Link to aistudio.google.com.
  *Done when:* keys persist and are hidden by default.

- [ ] **T-23 Test key and load models**
  For each key: "Test" button (small request) and "Load models" button that fills a model
  dropdown. Default Gemini model = first whose name contains "flash".
  *Done when:* a valid Gemini key shows "✓ Working" and a model list; an invalid key shows
  a friendly error.

- [ ] **T-24 Export / Import profile**
  `lib/exportImport.js`: export the whole profile (settings + sources + pages + plans +
  progress) as one `.json` file, **with an option to exclude API keys** (default: exclude).
  Import creates a new profile from that file.
  *Done when:* export → delete profile → import restores everything.

🏁 **Milestone 2:** a teacher can fully set up their profile.

---

## Phase 4 — Core logic (pure functions + tests)

- [ ] **T-25 Week helpers** (`lib/weeks.js`)
  `getWeek(profile, number)`, `dateForDay(week, dayId)` → dd/mm/yyyy,
  `dayName(dayId)`, `formatLongDate("12/10/2026")` → "12th October 2026".
  *Done when:* Vitest tests pass, including 1st/2nd/3rd/11th/21st/22nd suffixes.

- [ ] **T-26 Duration helper** (`lib/timetable.js`)
  `lessonDuration(profile, entry)` = periods × minutes for that day (with overrides).
  *Done when:* tests pass: Monday O1 = 80, Wednesday O3 = 40, Friday O1 = 60.

- [ ] **T-27 Class name matching**
  `findClass(profile, text)` matches "O3", "o3", "11C", "XI", "Class 11", "class XI".
  *Done when:* tests pass for all these forms.

- [ ] **T-28 Request parser**
  `parseRequest(text)` → `{ day, classLabel, week }` for: "Monday, week 9",
  "O3, week 9", "11C week 9", "O2, week 9, Thursday", "thursday wk 9".
  Returns `null` if it cannot parse.
  *Done when:* tests pass for all examples.

- [ ] **T-29 Lesson list builder**
  `buildLessons(profile, parsed)` → array of
  `{ classLabel, class, dayId, dayName, date, weekNo, from, till, duration, periods }`,
  ordered by day then period.
  *Done when:* "Thursday, week 9" returns O2 (80) and O3 (80); "O3, week 9" returns 4 lessons.

- [ ] **T-30 Validator** (`lib/validate.js`)
  Implement every rule in CLAUDE.md Section 9. Return an array of plain-English errors.
  *Done when:* tests pass using the example plan (valid) and 8 broken versions (each fails
  with the right message).

- [ ] **T-31 Merge helper**
  `mergePlan(lesson, profile, aiFields)` → final plan object with fields in the exact order
  of CLAUDE.md Section 6.
  *Done when:* test output matches the example plan's key order exactly.

---

## Phase 5 — Sources page

- [ ] **T-32 Upload area**
  Drag-and-drop + "Choose files" button. Accept PDF, JPG, PNG, DOCX (template only).
  Choose the source type from a dropdown before saving.
  *Done when:* files appear in a pending list with their type.

- [ ] **T-33 PDF to pages** (`lib/pdf.js`)
  Extract text page by page with pdfjs-dist (worker set up correctly for Vite).
  Show a progress bar ("Reading page 120 of 380").
  *Done when:* uploading the textbook creates one `pages` row per page.

- [ ] **T-34 Image sources**
  For JPG/PNG (e.g. timetable photo), send the image once to Gemini and ask for a clean
  text transcription; store it as one page.
  *Done when:* the timetable image becomes readable text in the database.

- [ ] **T-35 Template source**
  For DOCX with type `template`, store the file itself (as a Blob) for the Word output.
  *Done when:* the template is stored and listed.

- [ ] **T-36 Sources list**
  Table: name, type, pages, date added, actions (View text, Delete with confirm).
  *Done when:* deleting a source also deletes its pages.

- [ ] **T-37 Search index** (`lib/search.js`)
  Build a MiniSearch index over the active profile's pages (fields: text; store: sourceId,
  pageNo). Rebuild when sources change. `searchPages(query, { type, limit })`.
  *Done when:* searching "ASCII" returns the character-sets pages first.

- [ ] **T-38 Search test box**
  On Sources: a search box showing top results with page number and a text preview.
  *Done when:* you can quickly check that a topic is found in the book.

🏁 **Milestone 3:** sources uploaded and searchable.

---

## Phase 6 — AI layer

- [ ] **T-39 Gemini provider** (`ai/providers/gemini.js`)
  `callGemini({ key, model, system, user, schema })` using @google/genai with JSON output and
  responseSchema. Returns parsed JSON. Throws typed errors: `RATE_LIMIT`, `BAD_KEY`,
  `SERVER`, `NETWORK`, `BAD_OUTPUT`.
  *Done when:* a test page call returns valid JSON.

- [ ] **T-40 Groq provider** (`ai/providers/groq.js`)
  Same interface via fetch to Groq's OpenAI-compatible endpoint, JSON mode.
  *Done when:* works with a Groq key.

- [ ] **T-41 OpenRouter provider** (`ai/providers/openrouter.js`)
  Same interface via fetch to OpenRouter's OpenAI-compatible endpoint.
  *Done when:* works with an OpenRouter key and a free model.

- [ ] **T-42 Retry and fallback** (`ai/index.js`)
  `generateJson(profile, { system, user, schema })` with the retry/fallback rules in
  CLAUDE.md Section 8. Returns `{ data, provider, model }`.
  *Done when:* with a wrong Gemini key and a valid Groq key, it falls back to Groq.

- [ ] **T-43 AI fields schema** (`ai/schema.js`)
  JSON schema for AI-owned fields only: shortTopic, topic, chapterNumber, chapterTitle,
  attainment_targets_html, learning_outcomes_html, activities.
  *Done when:* schema is accepted by Gemini.

- [ ] **T-44 Prompts** (`ai/prompts.js`)
  Functions: `planSystemPrompt(profile)`, `planUserPrompt({ lesson, lastTopic, notes, sowText, bookPages, previousTopicsThisRequest })`,
  `fixPrompt(plan, errors)`, `topicPrompt(...)` (to choose the next topic from the SOW).
  Follow every prompt rule in CLAUDE.md Section 8.
  *Done when:* prompts read clearly when printed; reviewed by the user.

- [ ] **T-45 Request fallback via AI**
  If `parseRequest` returns null, ask the AI to convert the text to `{ day, classLabel, week }`.
  *Done when:* "plans for my 11th class next Tuesday week 9" works.

---

## Phase 7 — Generate page

- [ ] **T-46 Request form**
  Textarea for the request, optional "Notes for the AI" textarea, output type dropdown,
  Generate button. First-time checklist (key, sources, timetable) when anything is missing.
  *Done when:* the form shows; Generate is disabled until requirements are met.

- [ ] **T-47 Lesson preview**
  As the teacher types, show the parsed lessons ("Thursday 15/10/2026 — O2 (80 min), O3 (80 min)").
  *Done when:* the preview updates live and shows a clear message when not understood.

- [ ] **T-48 Last covered topic boxes**
  For each class in the preview, an editable "Last covered" input pre-filled from `progress`.
  *Done when:* edits save to `progress`.

- [ ] **T-49 Generation pipeline** (`lib/generate.js`)
  Implement CLAUDE.md Section 7 steps 3–8 for one lesson: choose topic → search pages →
  call AI → merge → validate → one fix attempt → return `{ plan, errors, provider }`.
  *Done when:* one lesson produces a valid plan from the real textbook.

- [ ] **T-50 Multi-lesson run**
  Generate lessons one at a time with "Generating 2 of 4…" progress and a Cancel button.
  Topics for the same class follow on from each other within the request.
  *Done when:* "O3, week 9" gives 4 different, consecutive topics.

- [ ] **T-51 Result cards**
  `JsonCard.jsx`: header (class, day, date, duration), pretty JSON, Copy, Download .json,
  provider name in grey, red error list if validation failed.
  *Done when:* copying a card pastes valid JSON into the BEAMS extension.

- [ ] **T-52 Copy all / Download all**
  Buttons to copy or download all plans of the request.
  *Done when:* both work.

- [ ] **T-53 Regenerate one plan**
  "Regenerate" button on each card with an optional short instruction ("make it simpler").
  *Done when:* only that card is replaced.

- [ ] **T-54 Save and progress update**
  Save each plan to `plans`; update `progress.lastTopic` for each class.
  *Done when:* after generating, the "Last covered" boxes show the new topics.

🏁 **Milestone 4:** the main feature works end to end. Compare 5 plans with ones you trust.

---

## Phase 8 — History page

- [ ] **T-55 History list**
  Table of saved plans: date, week, class, topic, output type, created time.
  Filters: class, week. Newest first.
  *Done when:* all generated plans appear.

- [ ] **T-56 View, copy, delete**
  Open a plan in a JsonCard; copy, download, delete (with confirm).
  *Done when:* all actions work.

---

## Phase 9 — Output types

- [ ] **T-57 Output registry** (`outputs/index.js`)
  Register output modules with the interface from CLAUDE.md Section 10. Move BEAMS JSON
  rendering into `outputs/beamsJson.js`.
  *Done when:* Generate uses the registry; nothing else changes visibly.

- [ ] **T-58 Weekly notification output** (`outputs/notification.js`)
  Build the weekly message from the week's plans grouped by class display name, using
  the template and long dates. If plans for the week don't exist yet, generate topics only
  (no full plans) with one AI call.
  *Done when:* output matches the format in CLAUDE.md Section 10 exactly; has a Copy button.

- [ ] **T-59 Word output** (`outputs/docxPlan.js`)
  Create a .docx with one lesson per page following CLAUDE.md Section 10, using the docx library.
  *Done when:* the downloaded file opens in Word and looks like the school layout.

- [ ] **T-60 Word output from uploaded template (stretch)**
  If a `template` source exists, try filling it instead of the built-in layout.
  If filling fails, fall back to the built-in layout and tell the user.
  *Done when:* it works with the school template or falls back cleanly.

🏁 **Milestone 5:** all three outputs work.

---

## Phase 10 — Help, polish, safety

- [ ] **T-61 Help page**
  Step-by-step guide with screenshots placeholders: get a free Gemini key, set up the profile,
  upload sources, generate, copy into BEAMS, export a backup. Plus an FAQ
  ("limit reached", "key not working", "plan has red errors").
  *Done when:* a new teacher could follow it alone.

- [ ] **T-62 Friendly errors everywhere**
  Map all typed errors to plain-English messages with next steps.
  *Done when:* no raw error text or stack trace is ever shown.

- [ ] **T-63 Empty states**
  Helpful empty states for Sources, Generate and History with a link to the next step.
  *Done when:* a brand-new profile never shows a blank page.

- [ ] **T-64 Storage check**
  Request persistent storage (`navigator.storage.persist()`), show used space on Setup,
  and remind to export a backup.
  *Done when:* used storage shows in MB.

- [ ] **T-65 Mobile check**
  Check every page at phone width and fix layout problems.
  *Done when:* all pages are usable on a phone.

- [ ] **T-66 Final test pass**
  Run all tests, build, and manually generate one plan per class. Fix anything broken.
  *Done when:* build and tests pass; three manual plans are valid.

---

## Phase 11 — Deploy

- [ ] **T-67 Cloudflare Pages prep**
  Add `public/_redirects` (`/* /index.html 200`). Write `DEPLOY.md` with the steps.
  *Done when:* `npm run build` → `npm run preview` works with deep links (e.g. /history).

- [ ] **T-68 GitHub**
  Guide the user to create a GitHub repo and push (no keys or textbook files committed).
  *Done when:* code is on GitHub.

- [ ] **T-69 Cloudflare Pages**
  Guide the user: Cloudflare dashboard → Workers & Pages → Create → Pages → connect repo;
  build command `npm run build`; output `dist`.
  *Done when:* the app is live on a `*.pages.dev` link.

🏁 **Milestone 6:** live and shareable with other teachers.

---

## Phase 12 — Optional extras (only after Milestone 6)

- [ ] **T-70 Send to Chrome extension**
  "Send to BEAMS extension" button using `externally_connectable` messaging; update the
  extension to receive the plan and fill the form.

- [ ] **T-71 Shared starter profiles**
  Let a teacher export a profile **without** sources, keys or history, so colleagues can
  import common IDs, weeks and timetable format and just add their own details.

- [ ] **T-72 More output types**
  Ideas: CAT paper outline, Google Form quiz questions, coordination minutes entry.
  Each = one new file in `src/outputs/`.

- [ ] **T-73 Cloud sync (only if teachers ask)**
  Cloudflare Workers + D1 + R2 with a simple login, still on free tiers.
  Plan this as a separate task list before starting.
