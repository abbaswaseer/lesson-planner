import Card from '../../components/Card.jsx';
import GuideSection from './GuideSection.jsx';
import GuideTable from './GuideTable.jsx';
import SchemaCard from './SchemaCard.jsx';
import ExtensionDownloadCard from './ExtensionDownloadCard.jsx';
import { code } from './GuideCode.jsx';
import { EXTENSION_STEPS, FIELD_RULES, OUTPUT_RULES } from './beamsGuideContent.js';

/**
 * The JSON contract and the steps for putting a plan into BEAMS.
 */
export default function JsonSections() {
  return (
    <>
      <GuideSection
        id="json"
        title="JSON rules and schema"
        intro="What the extension receives. The app already follows these rules; use them when checking or fixing a plan."
      >
        <Card title="Output rules">
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {OUTPUT_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>
        <Card title="Who fills each field">
          <GuideTable
            columns={['Field', 'Filled by', 'Rule']}
            rows={FIELD_RULES.map((item) => [code(item.field), item.owner, item.rule])}
          />
        </Card>
        <SchemaCard />
      </GuideSection>

      <GuideSection
        id="extension"
        title="Copy into BEAMS"
        intro="The JSON is ready to paste into the BEAMS Lesson Plan Filler extension."
      >
        <ExtensionDownloadCard />
        <Card title="Fill a lesson plan">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
            {EXTENSION_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            {code('Copy all')} gives one JSON array with every lesson. Use it when the extension
            fills several plans at once; otherwise paste one card at a time.
          </p>
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">Check before submitting.</p>
            <p className="mt-1">
              The AI is good but not perfect. Read each plan quickly, especially the topic and any
              textbook activity numbers. If a card has a red list of problems, press Regenerate
              (optionally with an instruction such as &ldquo;make it simpler&rdquo;) or fix it by
              hand in BEAMS.
            </p>
          </div>
        </Card>
      </GuideSection>
    </>
  );
}
