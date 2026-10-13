import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '../components/Card.jsx';
import { useActiveProfile } from '../db/activeProfile.js';
import { db } from '../db/db.js';
import { setupChecklist } from '../lib/readiness.js';
import Checklist from './generate/Checklist.jsx';
import RequestForm from './generate/RequestForm.jsx';

/**
 * Generate page: type a request, check the lessons, get the plans.
 */
export default function GeneratePage() {
  const profile = useActiveProfile();
  const sourceCount = useLiveQuery(
    () => (profile ? db.sources.where('profileId').equals(profile.id).count() : 0),
    [profile?.id]
  );
  const [form, setForm] = useState({ request: '', notes: '', outputType: 'beamsJson' });

  if (profile === undefined || sourceCount === undefined) return null;
  if (profile === null) {
    return (
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Generate</h1>
        <p className="text-sm text-gray-600">Create a profile on the Setup page first.</p>
      </div>
    );
  }

  const checklist = setupChecklist(profile, sourceCount);
  const ready = checklist.every((item) => item.done);
  const canGenerate = ready && form.request.trim() !== '';

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generate</h1>
      <Checklist items={checklist} />
      <Card>
        <RequestForm
          value={form}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
          onGenerate={() => {}}
          canGenerate={canGenerate}
          busy={false}
        />
      </Card>
    </div>
  );
}
