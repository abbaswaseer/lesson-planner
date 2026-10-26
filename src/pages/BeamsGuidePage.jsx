import GuideHeader from './guide/GuideHeader.jsx';
import GettingStartedSections from './guide/GettingStartedSections.jsx';
import ReferenceSections from './guide/ReferenceSections.jsx';
import JsonSections from './guide/JsonSections.jsx';
import ClosingSections from './guide/ClosingSections.jsx';

/**
 * The BEAMS guide: request forms, fixed IDs, timetable, weeks, activity style and the
 * exact JSON the BEAMS Lesson Plan Filler Chrome extension expects.
 */
export default function BeamsGuidePage() {
  return (
    <div className="max-w-4xl space-y-8">
      <GuideHeader />
      <GettingStartedSections />
      <ReferenceSections />
      <JsonSections />
      <ClosingSections />
    </div>
  );
}
