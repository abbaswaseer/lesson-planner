import Card from '../../components/Card.jsx';
import GuideSection from './GuideSection.jsx';
import GuideTable from './GuideTable.jsx';
import { code } from './GuideCode.jsx';
import { ACTIVITY_AVOID, ACTIVITY_DO, ACTIVITY_EXAMPLE, TIMETABLE, WEEKS } from './beamsGuideContent.js';

/**
 * The Computer Science timetable, Term 1 weeks and the recommended activity style.
 */
export default function ReferenceSections() {
  return (
    <>
      <GuideSection
        id="timetable-weeks"
        title="Timetable and weeks"
        intro="The guide's Computer Science 2210 timetable and Term 1 week dates."
      >
        <Card title="Timetable (40-minute periods)">
          <GuideTable
            columns={['Day', 'Class', 'Periods', 'Duration', 'day_id']}
            rows={TIMETABLE.map((entry) => [
              entry.day,
              code(entry.classLabel),
              entry.periods,
              `${entry.duration} min`,
              code(entry.sequenceId),
            ])}
          />
          <p className="mt-3 text-sm text-gray-600">
            {code('day_id')} is the lesson number for that class in the week — its 1st, 2nd, 3rd
            lesson, not the weekday. O2&rsquo;s Wednesday lesson is {code('"1"')}, Thursday{' '}
            {code('"2"')} and Friday {code('"3"')}. It is counted across the whole week, so asking
            for Friday alone still gives {code('"3"')}.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            The app fills it in automatically from Setup → Timetable, and writes the same number in
            the label ({code('O2 Day 3 - ...')}).
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Duration is periods × period length. If your Friday periods are shorter, set the Friday
            override on Setup → Periods; the app recalculates. 8CS and PSHE lessons are skipped
            unless you ask for them.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            The app does not use a fixed timetable. It reads Setup → Timetable, so edit it there when
            your timetable changes.
          </p>
        </Card>
        <Card title="Weeks (Term 1 2026)">
          <GuideTable
            columns={['Week', 'From (Monday)', 'Till (Friday)']}
            rows={WEEKS.map((week) => [code(String(week.number)), week.from, week.till])}
            fixed
          />
          <p className="mt-3 text-sm text-gray-600">
            The app takes these dates from Setup → Weeks and writes {code('cycle_id')} as the week
            number. Check that Setup matches this table. If your school uses different week numbers
            or dates, use yours.
          </p>
        </Card>
      </GuideSection>

      <GuideSection
        id="activity-style"
        title="Activity style"
        intro="Keep activities simple and realistic for a normal classroom with a whiteboard and the textbook."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Use">
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {ACTIVITY_DO.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card title="Avoid">
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {ACTIVITY_AVOID.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
        <Card title="80-minute example">
          <GuideTable
            columns={['Stage', 'Time', 'Teacher', 'Students']}
            rows={ACTIVITY_EXAMPLE.map((item) => [
              item.stage,
              `${item.time} min`,
              item.teacher,
              item.student,
            ])}
          />
          <p className="mt-3 text-sm text-gray-600">
            Resources stay simple: textbook, whiteboard, notebook, with a projector only if really
            needed. Assessment stays simple: oral questioning, checking notebooks, peer checking and
            an exit question.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Name a textbook activity, exercise or section only if it appears in the uploaded book
            pages. Otherwise the AI writes &ldquo;textbook questions on &lt;topic&gt;&rdquo;. It never
            invents page numbers.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Your own wording on Setup → Teaching style overrides this list. The AI follows what you
            write there.
          </p>
        </Card>
      </GuideSection>
    </>
  );
}
