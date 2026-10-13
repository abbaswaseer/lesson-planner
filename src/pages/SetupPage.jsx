import { useState } from 'react';
import { setActiveProfileId } from '../db/activeProfile.js';
import { createSampleProfile } from '../db/sampleProfile.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { useToast } from '../components/Toast.jsx';

/**
 * Setup page: the teacher's profile settings. Forms are added in T-14 onwards.
 */
export default function SetupPage() {
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
