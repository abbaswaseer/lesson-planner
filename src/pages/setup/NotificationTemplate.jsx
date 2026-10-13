import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import Textarea from '../../components/Textarea.jsx';
import { SAMPLE_PROFILE } from '../../db/sampleProfile.js';
import { useProfileForm } from '../../db/useProfileForm.js';

const DEFAULT_TEMPLATE = SAMPLE_PROFILE.notificationTemplate;

// Example values for the preview only; the real message is built in T-58.
const EXAMPLE = {
  from: '12th October',
  till: '16th October 2026',
  classes: '*Class IX*\n1.3.1 Data Storage — measurement of data storage\n\n*Class X*\n…',
};

const pickFields = (profile) => ({ notificationTemplate: profile.notificationTemplate ?? '' });

const fillExample = (template, subject) =>
  template
    .replaceAll('{subject}', subject || 'Your subject')
    .replaceAll('{from}', EXAMPLE.from)
    .replaceAll('{till}', EXAMPLE.till)
    .replaceAll('{classes}', EXAMPLE.classes);

/**
 * Setup → Weekly notification: the wording of the weekly topics message. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function NotificationTemplate({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);
  const template = draft.notificationTemplate;

  return (
    <Card title="Weekly notification">
      <div className="space-y-4">
        <Textarea
          label="Message template"
          rows={3}
          placeholder={DEFAULT_TEMPLATE}
          value={template}
          onChange={(event) => setField('notificationTemplate', event.target.value)}
        />
        <div className="text-sm text-gray-500">
          <p>These words are replaced automatically:</p>
          <ul className="mt-1 list-inside list-disc">
            <li>
              <code className="text-gray-700">{'{subject}'}</code> — your subject name
            </li>
            <li>
              <code className="text-gray-700">{'{from}'}</code>, <code className="text-gray-700">{'{till}'}</code> —
              the week's first and last dates
            </li>
            <li>
              <code className="text-gray-700">{'{classes}'}</code> — the topics for each class
            </li>
          </ul>
          <p className="mt-1">Text between *stars* shows in bold on WhatsApp.</p>
        </div>

        {template.trim() && (
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Preview</p>
            <pre className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 font-sans text-sm text-gray-800">
              {fillExample(template, profile.subjectName)}
            </pre>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={template === DEFAULT_TEMPLATE}
            onClick={() => setField('notificationTemplate', DEFAULT_TEMPLATE)}
          >
            Reset to default
          </Button>
          <SaveStatus status={status} />
        </div>
      </div>
    </Card>
  );
}
