import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import GuideSection from './GuideSection.jsx';
import { CHECKLIST, OTHER_SUBJECT_ASK, OTHER_SUBJECT_NOTES } from './beamsGuideContent.js';

/**
 * Planning another subject, and the final checklist before submitting.
 */
export default function ClosingSections() {
  return (
    <>
      <GuideSection
        id="other-subjects"
        title="Other subjects"
        intro="The extension guide also shows a request like this:"
      >
        <Card>
          <p className="rounded-md bg-gray-50 p-3 font-mono text-sm text-gray-800">{OTHER_SUBJECT_ASK}</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
            {OTHER_SUBJECT_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Card>
      </GuideSection>

      <GuideSection
        id="checklist"
        title="Checklist"
        intro="Run through this before you submit a plan in BEAMS."
      >
        <Card>
          <ul className="space-y-2 text-sm text-gray-700">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-gray-300"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Back to{' '}
            <Link to="/generate" className="font-medium text-blue-600 hover:underline">
              Generate
            </Link>{' '}
            or{' '}
            <Link to="/help" className="font-medium text-blue-600 hover:underline">
              Help
            </Link>
            .
          </p>
        </Card>
      </GuideSection>
    </>
  );
}
