import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '../components/Card.jsx';
import { useActiveProfile } from '../db/activeProfile.js';
import { db } from '../db/db.js';
import { setupChecklist } from '../lib/readiness.js';
import { parseRequest } from '../lib/request.js';
import { buildLessons } from '../lib/timetable.js';
import Checklist from './generate/Checklist.jsx';
import LastCovered from './generate/LastCovered.jsx';
import LessonPreview from './generate/LessonPreview.jsx';
import NotificationCard from './generate/NotificationCard.jsx';
import RequestForm from './generate/RequestForm.jsx';
import Results from './generate/Results.jsx';
import RunProgress from './generate/RunProgress.jsx';
import { useGeneration } from './generate/useGeneration.js';

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

  // Worked out in code on every key press; the AI is only asked on Generate.
  const parsed = useMemo(() => (profile ? parseRequest(form.request, profile) : null), [profile, form.request]);
  const lessons = useMemo(() => (parsed ? buildLessons(profile, parsed) : []), [profile, parsed]);
  const classLabels = useMemo(() => [...new Set(lessons.map((lesson) => lesson.classLabel))], [lessons]);
  const [lastTopics, setLastTopics] = useState({});
  const generation = useGeneration(profile);

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
          onGenerate={() => generation.start({ ...form, parsed, lastTopics })}
          canGenerate={canGenerate}
          busy={generation.running || generation.regeneratingKey !== null}
        >
          <LessonPreview profile={profile} text={form.request} parsed={parsed} lessons={lessons} />
          <LastCovered profileId={profile.id} classLabels={classLabels} onValuesChange={setLastTopics} />
        </RequestForm>
      </Card>
      <RunProgress progress={generation.progress} retryNote={generation.retryNote} onCancel={generation.cancel} />
      {generation.error && (
        <p className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {generation.error}
        </p>
      )}
      <NotificationCard text={generation.notice} />
      <Results
        results={generation.results}
        onRegenerate={generation.regenerate}
        regeneratingKey={generation.regeneratingKey}
        running={generation.running}
      />
    </div>
  );
}
