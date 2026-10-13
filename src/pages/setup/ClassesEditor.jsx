import { nanoid } from 'nanoid';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { controlClasses } from '../../components/Field.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import { useProfileForm } from '../../db/useProfileForm.js';
import { formatIdList, parseIdList } from '../../lib/idList.js';

const COLUMNS = [
  { key: 'label', title: 'Label', placeholder: 'O1' },
  { key: 'displayName', title: 'Display name', placeholder: 'IX' },
  { key: 'class_id', title: 'class_id', placeholder: '16' },
  { key: 'sectionText', title: 'section_ids', placeholder: '3 or 3, 4' },
];

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr_1.4fr_auto] sm:items-center';

// Rows get a local key so React keeps the right inputs when a row is removed; it is never saved.
const pickFields = (profile) => ({
  classes: (profile.classes ?? []).map((cls) => ({
    key: nanoid(),
    label: cls.label ?? '',
    displayName: cls.displayName ?? '',
    class_id: cls.class_id ?? '',
    sectionText: formatIdList(cls.section_ids),
  })),
});

/** Form rows → the shape stored on the profile (CLAUDE.md Section 5). */
const toSaved = (rows) =>
  rows.map((row) => ({
    label: row.label.trim(),
    displayName: row.displayName.trim(),
    class_id: row.class_id.trim(),
    section_ids: parseIdList(row.sectionText),
  }));

/**
 * Setup → Classes: one row per class the teacher plans for. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function ClassesEditor({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);
  const rows = draft.classes;

  const setRows = (next) => setField('classes', next, { saveValue: toSaved(next) });
  const updateRow = (key, column, value) =>
    setRows(rows.map((row) => (row.key === key ? { ...row, [column]: value } : row)));
  const addRow = () =>
    setRows([...rows, { key: nanoid(), label: '', displayName: '', class_id: '', sectionText: '' }]);
  const removeRow = (key) => setRows(rows.filter((row) => row.key !== key));

  // Labels link classes to the timetable, so each must be unique.
  const labels = rows.map((row) => row.label.trim().toLowerCase()).filter(Boolean);
  const duplicates = new Set(labels.filter((label, i) => labels.indexOf(label) !== i));

  return (
    <Card title="Classes">
      <p className="mb-4 text-sm text-gray-600">
        Label is your short name for the class (used in the timetable and requests). Display name
        is how it appears in messages. IDs come from BEAMS.
      </p>

      {rows.length > 0 && (
        <div className={`${GRID} mb-2 hidden text-xs font-medium text-gray-500 sm:grid`}>
          {COLUMNS.map((column) => (
            <span key={column.key}>{column.title}</span>
          ))}
          <span className="sr-only">Remove</span>
        </div>
      )}

      <ul className="space-y-3">
        {rows.map((row, index) => {
          const duplicate = duplicates.has(row.label.trim().toLowerCase());
          return (
            <li key={row.key} className="rounded-md border border-gray-200 p-3 sm:border-0 sm:p-0">
              <div className={GRID}>
                {COLUMNS.map((column) => {
                  const id = `class-${row.key}-${column.key}`;
                  const error = column.key === 'label' && duplicate;
                  return (
                    <div key={column.key}>
                      <label htmlFor={id} className="mb-1 block text-xs text-gray-500 sm:sr-only">
                        {column.title} (class {index + 1})
                      </label>
                      <input
                        id={id}
                        className={controlClasses(error)}
                        placeholder={column.placeholder}
                        value={row[column.key]}
                        onChange={(event) => updateRow(row.key, column.key, event.target.value)}
                      />
                    </div>
                  );
                })}
                <Button
                  variant="secondary"
                  size="sm"
                  className="col-span-2 sm:col-span-1"
                  onClick={() => removeRow(row.key)}
                  aria-label={`Remove class ${row.label || index + 1}`}
                >
                  Remove
                </Button>
              </div>
              {duplicate && (
                <p className="mt-1 text-sm text-red-600">Two classes have the label "{row.label.trim()}".</p>
              )}
            </li>
          );
        })}
      </ul>

      {rows.length === 0 && <p className="text-sm text-gray-500">No classes yet.</p>}

      <div className="mt-4 flex items-center justify-between gap-4">
        <Button variant="secondary" onClick={addRow}>
          + Add class
        </Button>
        <SaveStatus status={status} />
      </div>
    </Card>
  );
}
