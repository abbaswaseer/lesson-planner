import Card from '../../components/Card.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import { useProfileForm } from '../../db/useProfileForm.js';
import { gridFromTimetable, timetableFromGrid } from '../../lib/timetable.js';

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
];

const MIN_PERIODS = 8;

// A soft colour per class so each lesson block stands out in the grid.
const CLASS_COLOURS = [
  'bg-blue-50 border-blue-300',
  'bg-green-50 border-green-300',
  'bg-amber-50 border-amber-300',
  'bg-purple-50 border-purple-300',
  'bg-pink-50 border-pink-300',
  'bg-teal-50 border-teal-300',
];
const EMPTY_CELL = 'bg-white border-gray-200';

const pickFields = (profile) => ({ grid: gridFromTimetable(profile.timetable) });

/**
 * Setup → Timetable: a day × period grid; pick the class taught in each period.
 * Saved as lessons, joining back-to-back periods of the same class. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function TimetableGrid({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);
  const { grid } = draft;
  const labels = (profile.classes ?? []).map((cls) => cls.label).filter(Boolean);

  // Never hide saved periods beyond 8 (e.g. a school with 9 periods).
  const usedPeriods = Object.values(grid).flatMap((day) => Object.keys(day).map(Number));
  const periodCount = Math.max(MIN_PERIODS, ...usedPeriods);
  const periods = Array.from({ length: periodCount }, (_, i) => i + 1);

  const setCell = (day, period, label) => {
    const dayCells = { ...grid[day], [period]: label };
    if (!label) delete dayCells[period];
    const next = { ...grid, [day]: dayCells };
    setField('grid', next, { saveValue: timetableFromGrid(next) });
  };

  const cellColour = (label) => {
    if (!label) return EMPTY_CELL;
    const index = labels.indexOf(label);
    return CLASS_COLOURS[(index < 0 ? labels.length : index) % CLASS_COLOURS.length];
  };

  if (labels.length === 0) {
    return (
      <Card title="Timetable">
        <p className="text-sm text-gray-500">
          Add your classes above first, then fill in the timetable here.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Timetable">
      <p className="mb-4 text-sm text-gray-600">
        Choose the class you teach in each period. Back-to-back periods with the same class count
        as one lesson.
      </p>

      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[640px] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="w-12" />
              {periods.map((period) => (
                <th key={period} scope="col" className="text-xs font-medium text-gray-500">
                  P{period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day.id}>
                <th scope="row" className="pr-1 text-left text-xs font-medium text-gray-600">
                  <abbr title={day.name} className="no-underline">
                    {day.short}
                  </abbr>
                </th>
                {periods.map((period) => {
                  const value = grid[day.id]?.[period] ?? '';
                  return (
                    <td key={period}>
                      <select
                        aria-label={`${day.name} period ${period}`}
                        className={`w-full rounded-md border px-1 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${cellColour(value)}`}
                        value={value}
                        onChange={(event) => setCell(day.id, period, event.target.value)}
                      >
                        <option value="">—</option>
                        {labels.map((label) => (
                          <option key={label} value={label}>
                            {label}
                          </option>
                        ))}
                        {/* Keep a class that was renamed or removed visible, so it can be fixed. */}
                        {value && !labels.includes(value) && (
                          <option value={value}>{value} (not a class)</option>
                        )}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <SaveStatus status={status} />
      </div>
    </Card>
  );
}
