import { nanoid } from 'nanoid';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { controlClasses } from '../../components/Field.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import { useProfileForm } from '../../db/useProfileForm.js';
import { nextWeek, parseDate } from '../../lib/weeks.js';

const GRID = 'grid grid-cols-[4.5rem_1fr_1fr_auto] items-start gap-2';

// Rows get a local key so React keeps the right inputs when a row is removed; it is never saved.
const pickFields = (profile) => ({
  weeks: (profile.weeks ?? []).map((week) => ({
    key: nanoid(),
    number: week.number == null ? '' : String(week.number),
    from: week.from ?? '',
    till: week.till ?? '',
  })),
});

const parseWeekNumber = (text) => (/^\d+$/.test(text.trim()) ? Number(text.trim()) : null);

/** Form rows → the shape stored on the profile. Rows are kept even if unfinished, so typing is never lost. */
const toSaved = (rows) =>
  rows.map((row) => ({ number: parseWeekNumber(row.number), from: row.from.trim(), till: row.till.trim() }));

/** Plain-English problem with a row, or null if it is fine. */
function rowProblem(row, duplicateNumbers) {
  const number = parseWeekNumber(row.number);
  if (number === null) return 'Enter the week number.';
  if (duplicateNumbers.has(number)) return `Week ${number} is listed twice.`;
  const from = parseDate(row.from);
  const till = parseDate(row.till);
  if (!from || !till) return 'Write dates as dd/mm/yyyy, e.g. 12/10/2026.';
  if (till < from) return 'The till date is before the from date.';
  return null;
}

/**
 * Setup → Weeks: which dates each school week number covers. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function WeekTable({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);
  const rows = draft.weeks;

  const setRows = (next) => setField('weeks', next, { saveValue: toSaved(next) });
  const updateRow = (key, column, value) =>
    setRows(rows.map((row) => (row.key === key ? { ...row, [column]: value } : row)));
  const removeRow = (key) => setRows(rows.filter((row) => row.key !== key));
  const addBlankRow = () => setRows([...rows, { key: nanoid(), number: '', from: '', till: '' }]);

  const last = rows.at(-1);
  const following = last ? nextWeek(toSaved([last])[0]) : null;
  const addNextWeek = () =>
    setRows([...rows, { key: nanoid(), number: String(following.number), from: following.from, till: following.till }]);

  const numbers = rows.map((row) => parseWeekNumber(row.number)).filter((n) => n !== null);
  const duplicateNumbers = new Set(numbers.filter((n, i) => numbers.indexOf(n) !== i));

  return (
    <Card title="Weeks">
      <p className="mb-4 text-sm text-gray-600">
        The dates of each school week (from Monday to Friday). Fill in one week, then use
        "Add next week" for the rest.
      </p>

      {rows.length > 0 && (
        <div className={`${GRID} mb-2 text-xs font-medium text-gray-500`}>
          <span>Week</span>
          <span>From</span>
          <span>Till</span>
          <span className="sr-only">Delete</span>
        </div>
      )}

      <ul className="space-y-2">
        {rows.map((row) => {
          const problem = rowProblem(row, duplicateNumbers);
          const input = (column, placeholder, label) => (
            <input
              aria-label={`${label}, row for week ${row.number || 'new'}`}
              className={controlClasses(false)}
              // Number pad only for the week number: some phone number pads have no "/".
              inputMode={column === 'number' ? 'numeric' : 'text'}
              placeholder={placeholder}
              value={row[column]}
              onChange={(event) => updateRow(row.key, column, event.target.value)}
            />
          );
          return (
            <li key={row.key}>
              <div className={GRID}>
                {input('number', '9', 'Week number')}
                {input('from', 'dd/mm/yyyy', 'From date')}
                {input('till', 'dd/mm/yyyy', 'Till date')}
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-1"
                  onClick={() => removeRow(row.key)}
                  aria-label={`Delete week ${row.number || 'row'}`}
                >
                  Delete
                </Button>
              </div>
              {problem && <p className="mt-1 text-sm text-red-600">{problem}</p>}
            </li>
          );
        })}
      </ul>

      {rows.length === 0 && <p className="text-sm text-gray-500">No weeks yet.</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={addNextWeek} disabled={!following}>
          + Add next week{following ? ` (${following.number})` : ''}
        </Button>
        <Button variant="secondary" onClick={addBlankRow}>
          + Add row
        </Button>
        <div className="ml-auto">
          <SaveStatus status={status} />
        </div>
      </div>
      {!following && rows.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">Complete the last row to use "Add next week".</p>
      )}
      {rows.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">Use "Add row" to enter your first week.</p>
      )}
    </Card>
  );
}
