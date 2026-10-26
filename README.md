# BSS Lesson Planner

An AI lesson-planning web app for Cambridge O Level teachers at Beaconhouse School System.
It turns a short request like **“O3, week 9”** into complete lesson plans, saved in your browser
and ready to paste into BEAMS.

**Live app:** <https://lesson-planner-8v2.pages.dev>

No account, server or school login is needed. Each teacher enters their own free AI key, and all
profiles, sources and plans stay in their own browser.

## What it does

- Works out **which lessons you teach** from your timetable and week table.
- Writes the **topic, attainment targets, learning outcomes and activities** with AI.
- Fills the **BEAMS fields** (class, section, subject, dates, duration, day, week, collaboration team) in code.
- Makes **BEAMS-ready JSON**, a **weekly topic notification**, or a **Word lesson plan**.
- Keeps a **History** of plans and remembers the **last topic covered** for each class.
- Supports several profiles, so you can plan another subject such as Biology.

## Quick start

1. **Open the app:** <https://lesson-planner-8v2.pages.dev>
2. **Add an AI key.** Get a free Gemini key from <https://aistudio.google.com/apikey>, then paste it
   on **Setup → AI keys** and press **Test**. Groq and OpenRouter keys are optional backups.
3. **Set up your profile.** On **Setup**, enter your name, subject, BEAMS IDs (subject, academic
   year, term, collaboration team), classes and sections, period length, timetable and week dates.
   Everything saves automatically.
4. **Upload your sources.** On **Sources**, add the textbook PDF and the scheme of work PDF. The
   academic calendar, a timetable photo and a Word template are optional.
5. **Generate.** On **Generate**, type a request, check the lessons shown, and press **Generate**:
   - `Thursday, week 9` — every class you teach that day
   - `O3, week 9` — every O3 lesson that week
   - `O2, week 9, Thursday` — one lesson
6. **Copy into BEAMS.** Choose **BEAMS JSON**, press **Copy**, then paste it into the
   [BEAMS Lesson Plan Filler extension](#beams-chrome-extension). Check the form and click
   **Update** yourself.

A fuller walkthrough is on the in-app **Help** page and the **BEAMS guide**:
<https://lesson-planner-8v2.pages.dev/beams>

## Outputs

| Output | What it is |
|---|---|
| **BEAMS JSON** | One plan per card, or one array for the whole request, ready for the Chrome extension. |
| **Weekly topic notification** | The topics planned for a week, using your notification template. |
| **Word lesson plan** | An editable `.docx` in the school layout, one lesson per page. |

## BEAMS Chrome extension

The extension fills a BEAMS lesson-plan form from the generated JSON.

- **Download:** <https://lesson-planner-8v2.pages.dev/downloads/beams-lp-filler.zip>
- Unzip it somewhere permanent.
- Open `chrome://extensions`, turn on **Developer mode**, press **Load unpacked**, and choose the
  `beams-lp-filler` folder.
- Pin it to the toolbar.

It never clicks **Update** and never changes Campus, Students, Attainment Targets, Approval Batch
or Approving Authority. You always check and submit the form yourself. Full install steps and
safety notes are on the **BEAMS guide**.

## Privacy

- Your profile, uploaded sources and plans are stored in the browser's IndexedDB. They are not
  uploaded to this project.
- Only the lesson details, the relevant scheme-of-work and book text, and (when you upload a
  timetable photo) that image are sent to the AI provider, using your own key.
- Never type student names or marks into the notes.
- Clearing browser data deletes everything. Use **Setup → Backup → Export** regularly.

## Run it locally

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev        # development server
npm test           # unit tests
npm run build      # production build in dist/
npm run preview    # preview the production build
```

To publish changes to Cloudflare Pages:

```bash
npm run deploy
```

See [DEPLOY.md](DEPLOY.md) for deployment and troubleshooting details.

## Project structure

```text
src/
  ai/        AI prompts, JSON schema and request understanding
  db/        Dexie/IndexedDB storage, profiles, plans and backup
  lib/       Timetable, request parsing, merge, validation and helpers
  outputs/   BEAMS JSON, notification and Word output
  pages/     Setup, Sources, Generate, History, Help and the BEAMS guide
  components/ Shared UI
public/      Static assets, including the extension zip
```

## Documentation

- [CLAUDE.md](CLAUDE.md) — the full project specification, data model and rules.
- [Project-Instructions-BEAMS-Planner.md](Project-Instructions-BEAMS-Planner.md) — the teacher’s
  original BEAMS/extension instructions.
- [DEPLOY.md](DEPLOY.md) — deploying to Cloudflare Pages.

## Notes for contributors

- Plans are generated one lesson at a time, so timeouts and rate limits are handled per lesson.
- BEAMS `day_id` is the **lesson number for that class in the week** (`1`, `2`, `3` …), **not** the
  weekday. O2 Wednesday is `"1"`, Thursday `"2"`, Friday `"3"`.
- Run `npm test` before pushing. `npm run build` must also pass.
- Pushing to GitHub does **not** update the live site; run `npm run deploy`.
