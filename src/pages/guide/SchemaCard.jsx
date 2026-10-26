import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { downloadText } from '../../lib/download.js';
import { SCHEMA_JSON } from './beamsGuideContent.js';

/**
 * The exact JSON shape, with buttons to copy or download it.
 */
export default function SchemaCard() {
  return (
    <Card title="One plan — JSON schema">
      <div className="mb-3 flex flex-wrap gap-2">
        <CopyButton text={SCHEMA_JSON} label="Copy schema" />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => downloadText('beams-plan-schema.json', SCHEMA_JSON)}
        >
          Download .json
        </Button>
      </div>
      <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-800">
        {SCHEMA_JSON}
      </pre>
      <p className="mt-3 text-xs text-gray-500">
        These are placeholders. The app replaces every value with the real class, dates, times and
        AI-written content. The output is always an array, even for one plan.
      </p>
    </Card>
  );
}
