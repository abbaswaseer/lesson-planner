import { useState } from 'react';
import { nanoid } from 'nanoid';
import Card from '../components/Card.jsx';
import { useToast } from '../components/Toast.jsx';
import { useActiveProfile } from '../db/activeProfile.js';
import { importSource } from '../lib/sourceImport.js';
import { fileKind, guessType, sourceTypeLabel } from '../lib/sourceTypes.js';
import PendingList from './sources/PendingList.jsx';
import SourcesList from './sources/SourcesList.jsx';
import UploadArea from './sources/UploadArea.jsx';

/**
 * Sources page: upload the textbook, scheme of work and other files the AI plans from.
 */
export default function SourcesPage() {
  const profile = useActiveProfile();
  const toast = useToast();
  const [pending, setPending] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [progress, setProgress] = useState(null);

  const addFiles = (files) => {
    const usable = files.filter((file) => fileKind(file));
    const skipped = files.length - usable.length;
    if (skipped > 0) {
      toast.error(`${skipped} file${skipped > 1 ? 's were' : ' was'} skipped. Use PDF, JPG, PNG or a Word (.docx) template.`);
    }
    const items = usable.map((file) => {
      const kind = fileKind(file);
      return { id: nanoid(), file, kind, type: guessType(file.name, kind) };
    });
    setPending((list) => [...list, ...items]);
  };

  const changeType = (id, type) =>
    setPending((list) => list.map((item) => (item.id === id ? { ...item, type } : item)));
  const remove = (id) => setPending((list) => list.filter((item) => item.id !== id));

  const save = async (id) => {
    const item = pending.find((entry) => entry.id === id);
    setBusyId(id);
    setProgress(null);
    try {
      const { pageCount } = await importSource(profile, item, (message, fraction) => setProgress({ message, fraction }));
      remove(id);
      const pagesText = item.kind === 'pdf' ? ` (${pageCount} pages)` : '';
      toast.success(`Saved "${item.file.name}" as ${sourceTypeLabel(item.type)}${pagesText}.`);
    } catch (error) {
      toast.error(error?.friendly ? error.message : 'Could not save this file. Please try again.');
    } finally {
      setBusyId(null);
      setProgress(null);
    }
  };

  if (profile === undefined) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
      {profile === null ? (
        <p className="text-sm text-gray-600">Create a profile on the Setup page first.</p>
      ) : (
        <>
          <Card title="Add sources">
            <div className="space-y-4">
              <UploadArea onFiles={addFiles} disabled={busyId !== null} />
              {pending.length > 0 && (
                <p className="text-sm text-gray-600">Check the type of each file, then save it.</p>
              )}
              <PendingList
                items={pending}
                onTypeChange={changeType}
                onRemove={remove}
                onSave={save}
                busyId={busyId}
                progress={progress}
              />
            </div>
          </Card>
          <Card title="Your sources">
            <SourcesList profileId={profile.id} />
          </Card>
        </>
      )}
    </div>
  );
}
