import { useState } from 'react';
import { setActiveProfileId, useActiveProfile } from '../db/activeProfile.js';
import { createSampleProfile } from '../db/sampleProfile.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { useToast } from '../components/Toast.jsx';
import BasicDetails from './setup/BasicDetails.jsx';
import ClassesEditor from './setup/ClassesEditor.jsx';
import PeriodSettings from './setup/PeriodSettings.jsx';
import TimetableGrid from './setup/TimetableGrid.jsx';
import WeekTable from './setup/WeekTable.jsx';
import TeachingStyle from './setup/TeachingStyle.jsx';

/**
 * Setup page: the active profile's settings, one card per section. Every card saves itself.
 */
export default function SetupPage() {
  const profile = useActiveProfile();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const loadSample = async () => {
    setLoading(true);
    try {
      setActiveProfileId(await createSampleProfile());
      toast.success('Sample profile loaded and selected.');
    } catch {
      toast.error('Could not load the sample profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Setup</h1>

      {profile === null && (
        <p className="text-sm text-gray-600">
          Create a profile with the switcher in the menu, or load the sample below to get started.
        </p>
      )}

      {/* key: remount the forms when switching profile so no values carry over. */}
      {profile && (
        <>
          <BasicDetails key={`basic-${profile.id}`} profile={profile} />
          <ClassesEditor key={`classes-${profile.id}`} profile={profile} />
          <PeriodSettings key={`periods-${profile.id}`} profile={profile} />
          <TimetableGrid key={`timetable-${profile.id}`} profile={profile} />
          <WeekTable key={`weeks-${profile.id}`} profile={profile} />
          <TeachingStyle key={`style-${profile.id}`} profile={profile} />
        </>
      )}

      <Card title="Try it with a sample">
        <p className="mb-4 text-sm text-gray-600">
          Adds a ready-made profile for a Computer Science teacher (classes, timetable and weeks
          filled in) so you can see how everything works. Add your own API key before generating.
        </p>
        <Button variant="secondary" onClick={loadSample} disabled={loading}>
          {loading ? 'Loading…' : 'Load sample profile'}
        </Button>
      </Card>
    </div>
  );
}
