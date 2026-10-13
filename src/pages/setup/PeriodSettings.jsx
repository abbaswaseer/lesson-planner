import Card from '../../components/Card.jsx';
import { controlClasses } from '../../components/Field.jsx';
import Input from '../../components/Input.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import { useProfileForm } from '../../db/useProfileForm.js';
import { inputsFromOverrides, overridesFromInputs, parseMinutes } from '../../lib/periods.js';

const DAYS = [
  { id: '1', name: 'Monday' },
  { id: '2', name: 'Tuesday' },
  { id: '3', name: 'Wednesday' },
  { id: '4', name: 'Thursday' },
  { id: '5', name: 'Friday' },
];

const pickFields = (profile) => ({
  periodMinutes: profile.periodMinutes ? String(profile.periodMinutes) : '',
  dayOverrides: inputsFromOverrides(profile.dayOverrides),
});

/**
 * Setup → Periods: the usual period length and any days with shorter or longer periods.
 * Lesson durations are worked out from these. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function PeriodSettings({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);
  const defaultMinutes = parseMinutes(draft.periodMinutes);
  const defaultMissing = draft.periodMinutes.trim() === '';

  const setDefault = (text) => {
    const minutes = parseMinutes(text);
    // Only a valid number is saved, so durations never use a bad value.
    setField('periodMinutes', text, { save: minutes !== null, saveValue: minutes });
  };

  const setDay = (dayId, text) => {
    const next = { ...draft.dayOverrides, [dayId]: text };
    setField('dayOverrides', next, { saveValue: overridesFromInputs(next) });
  };

  return (
    <Card title="Periods">
      <div className="space-y-5">
        <div className="max-w-xs">
          <Input
            label="Period length (minutes)"
            placeholder="40"
            inputMode="numeric"
            value={draft.periodMinutes}
            onChange={(event) => setDefault(event.target.value)}
            error={
              defaultMinutes === null && !defaultMissing
                ? 'Enter whole minutes between 1 and 180.'
                : defaultMissing
                  ? 'Enter the usual length of one period.'
                  : undefined
            }
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">
            Different on some days? Enter that day's period length. Leave blank to use the usual length.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {DAYS.map((day) => {
              const text = draft.dayOverrides[day.id];
              const invalid = text.trim() !== '' && parseMinutes(text) === null;
              const id = `period-day-${day.id}`;
              return (
                <div key={day.id}>
                  <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-600">
                    {day.name}
                  </label>
                  <input
                    id={id}
                    className={controlClasses(invalid)}
                    inputMode="numeric"
                    placeholder={defaultMinutes ? String(defaultMinutes) : ''}
                    value={text}
                    onChange={(event) => setDay(day.id, event.target.value)}
                  />
                  {invalid && <p className="mt-1 text-xs text-red-600">Whole minutes only.</p>}
                </div>
              );
            })}
          </div>
        </div>

        <SaveStatus status={status} />
      </div>
    </Card>
  );
}
