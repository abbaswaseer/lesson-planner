import { nanoid } from 'nanoid';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { controlClasses } from '../../components/Field.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import Textarea from '../../components/Textarea.jsx';
import { useProfileForm } from '../../db/useProfileForm.js';

// Rows get a local key so React keeps the right inputs when one is removed; it is never saved.
const pickFields = (profile) => ({
  activityStyle: profile.activityStyle ?? '',
  assessmentMethods: (profile.assessmentMethods ?? []).map((text) => ({ key: nanoid(), text })),
});

/** Blank entries are left out when saving, so the AI never sees an empty method. */
const toSaved = (rows) => rows.map((row) => row.text.trim()).filter(Boolean);

/**
 * Setup → Teaching style: how the teacher likes to run lessons and check learning.
 * Both are given to the AI when writing plans. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function TeachingStyle({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);
  const methods = draft.assessmentMethods;

  const setMethods = (next) => setField('assessmentMethods', next, { saveValue: toSaved(next) });
  const updateMethod = (key, text) =>
    setMethods(methods.map((row) => (row.key === key ? { ...row, text } : row)));
  const removeMethod = (key) => setMethods(methods.filter((row) => row.key !== key));
  const addMethod = () => setMethods([...methods, { key: nanoid(), text: '' }]);

  return (
    <Card title="Teaching style">
      <div className="space-y-5">
        <Textarea
          label="Activity style"
          hint="Describe the kind of activities you use. The AI follows this when planning."
          placeholder="e.g. Board explanation with worked examples, notebook work, textbook activities, think-pair-share, exit question. No apps or worksheets."
          rows={4}
          value={draft.activityStyle}
          onChange={(event) => setField('activityStyle', event.target.value)}
        />

        <div>
          <p className="text-sm font-medium text-gray-700">Assessment methods</p>
          <p className="mb-2 text-sm text-gray-500">How you check learning. The AI picks from this list.</p>

          <ul className="space-y-2">
            {methods.map((row, index) => (
              <li key={row.key} className="flex gap-2">
                <input
                  aria-label={`Assessment method ${index + 1}`}
                  className={controlClasses(false)}
                  placeholder="e.g. Oral questioning"
                  value={row.text}
                  onChange={(event) => updateMethod(row.key, event.target.value)}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => removeMethod(row.key)}
                  aria-label={`Remove ${row.text || `method ${index + 1}`}`}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          {methods.length === 0 && <p className="text-sm text-gray-500">No methods yet.</p>}

          <Button variant="secondary" className="mt-3" onClick={addMethod}>
            + Add method
          </Button>
        </div>

        <SaveStatus status={status} />
      </div>
    </Card>
  );
}
