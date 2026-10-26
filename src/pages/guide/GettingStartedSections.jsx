import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import GuideSection from './GuideSection.jsx';
import GuideTable from './GuideTable.jsx';
import SubjectIdTable from './SubjectIdTable.jsx';
import { code } from './GuideCode.jsx';
import {
  CLASS_IDS,
  FIXED_VALUES,
  PROFILE_ITEMS,
  REQUEST_EXAMPLES,
  SECTION_IDS,
  SOURCE_ITEMS,
} from './beamsGuideContent.js';

/**
 * How to ask, what Setup and Sources provide, the fixed IDs and the subject lookup.
 */
export default function GettingStartedSections() {
  return (
    <>
      <GuideSection
        id="how-to-ask"
        title="How to ask"
        intro="Type a day or class and the week on Generate. The app works out the lessons in code before any AI is called."
      >
        <Card>
          <GuideTable
            columns={['Type this', 'You get']}
            rows={REQUEST_EXAMPLES.map((example) => [code(example.ask), example.result])}
          />
          <p className="mt-3 text-sm text-gray-600">
            You can also add your own notes, for example the last topic covered, a holiday, a test,
            or an instruction such as &ldquo;start with a quick revision&rdquo;. Never include
            student names or marks.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            If the request is not understood, check for a day or class and a week number. If you
            press Generate anyway, the AI tries to read it.
          </p>
        </Card>
      </GuideSection>

      <GuideSection
        id="before-you-generate"
        title="Before you generate"
        intro="The app reads everything below from the active profile. Switch profile in the menu to change subject."
      >
        <Card title="From Setup">
          <GuideTable
            columns={['Profile item', 'What it controls']}
            rows={PROFILE_ITEMS.map((item) => [item.item, item.note])}
          />
          <p className="mt-3 text-sm text-gray-600">
            Each request starts fresh. The app remembers the last topic covered for each class, so
            check that box before generating. If it is empty or wrong, correct it once; it moves on
            automatically after a successful plan. If no last topic is set, the AI picks the next
            logical part of that month&rsquo;s scheme of work and states it in the label.
          </p>
        </Card>
        <Card title="From Sources">
          <GuideTable
            columns={['Source', 'Why it matters']}
            rows={SOURCE_ITEMS.map((item) => [item.source, item.why])}
          />
          <p className="mt-3 text-sm text-gray-600">
            Use{' '}
            <Link to="/sources" className="font-medium text-blue-600 hover:underline">
              Check a topic is found
            </Link>{' '}
            on the Sources page to make sure the textbook was read. If nothing is found, the PDF may
            be a scan (pictures of pages).
          </p>
        </Card>
      </GuideSection>

      <GuideSection
        id="fixed-values"
        title="Fixed values"
        intro="These values go into every plan. Set them once on Setup."
      >
        <Card>
          <GuideTable
            columns={['Field', 'Value', 'Note']}
            rows={FIXED_VALUES.map((item) => [code(item.name), code(item.value), item.note])}
          />
          <p className="mt-3 text-sm text-gray-600">
            {code('collaboration_team')} is sent exactly as you enter it on Setup. The extension
            guide uses the employee number and name; BEAMS itself only uses the number. Entering
            just the number is fine if that is what your extension expects.
          </p>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Class IDs">
            <GuideTable
              columns={['Label', 'Class', 'class_id']}
              rows={CLASS_IDS.map((item) => [code(item.label), item.display, code(item.id)])}
            />
            <p className="mt-3 text-sm text-gray-600">
              If you teach a class that is not listed, add it on Setup with its BEAMS IDs.
            </p>
          </Card>
          <Card title="Section IDs">
            <GuideTable
              columns={['Section', 'section_id']}
              rows={SECTION_IDS.map((item) => [code(item.section), code(item.id)])}
            />
            <p className="mt-3 text-sm text-gray-600">
              Set the sections you actually teach for each class on Setup → Classes. The extension
              guide leaves them blank on purpose, so fill them in before generating. Section C, for
              example, is {code('["3"]')}.
            </p>
          </Card>
        </div>
      </GuideSection>

      <GuideSection
        id="subject-ids"
        title="Subject IDs"
        intro="These are the subject_id values from the BEAMS dropdown. Computer Science 2210 is the default."
      >
        <Card>
          <SubjectIdTable />
          <p className="mt-3 text-sm text-gray-600">
            The app sends the subject_id of the active profile. Change it on Setup → Basic details.
            If a subject is not in this list, copy its ID from the BEAMS dropdown and use that.
          </p>
        </Card>
      </GuideSection>
    </>
  );
}
