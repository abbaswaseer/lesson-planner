import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import { useProfileForm } from '../../db/useProfileForm.js';

// Text fields only; IDs are kept as strings because BEAMS expects "97", not 97.
const FIELDS = ['name', 'teacherName', 'subjectName', 'subject_id', 'lp_type', 'acad_year_id', 'term_id', 'bookRef'];

const pickFields = (profile) => Object.fromEntries(FIELDS.map((key) => [key, profile[key] ?? '']));

/**
 * Setup → Basic details: names, BEAMS IDs and the book reference. Saves automatically.
 * @param {{ profile: object }} props The active profile.
 */
export default function BasicDetails({ profile }) {
  const { draft, setField, status } = useProfileForm(profile, pickFields);
  const nameMissing = draft.name.trim() === '';

  const field = (key) => ({
    value: draft[key],
    onChange: (event) => setField(key, event.target.value),
  });

  return (
    <Card title="Basic details">
      <div className="space-y-4">
        <Input
          label="Profile name"
          hint="Shown in the profile switcher, e.g. your name and subject."
          value={draft.name}
          // A profile must always have a name, so a blank one is shown but not saved.
          onChange={(event) => setField('name', event.target.value, { save: event.target.value.trim() !== '' })}
          error={nameMissing ? 'Profile name cannot be empty.' : undefined}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Teacher name" placeholder="e.g. Ghulam Abbas" {...field('teacherName')} />
          <Input label="Subject name" placeholder="e.g. Computer Science (2210)" {...field('subjectName')} />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">
            BEAMS IDs — copy these from the BEAMS lesson plan form.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input label="subject_id" placeholder="97" inputMode="numeric" {...field('subject_id')} />
            <Input label="lp_type" placeholder="1" inputMode="numeric" {...field('lp_type')} />
            <Input label="acad_year_id" placeholder="35" inputMode="numeric" {...field('acad_year_id')} />
            <Input label="term_id" placeholder="1" inputMode="numeric" {...field('term_id')} />
          </div>
        </div>

        <Input
          label="Book reference"
          placeholder="e.g. Cambridge IGCSE and O Level Computer Science (2nd Ed.), Williams & Watson"
          hint="The chapter is added after this for each plan."
          {...field('bookRef')}
        />

        <SaveStatus status={status} />
      </div>
    </Card>
  );
}
