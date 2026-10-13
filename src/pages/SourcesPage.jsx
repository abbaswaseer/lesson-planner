import { useState } from 'react';
import { nanoid } from 'nanoid';
import Card from '../components/Card.jsx';
import { useToast } from '../components/Toast.jsx';
import { useActiveProfile } from '../db/activeProfile.js';
import { fileKind, guessType } from '../lib/sourceTypes.js';
import PendingList from './sources/PendingList.jsx';
import UploadArea from './sources/UploadArea.jsx';

/**
 * Sources page: upload the textbook, scheme of work and other files the AI plans from.
 */
export default function SourcesPage() {
  const profile = useActiveProfile();
  const toast = useToast();
  const [pending, setPending] = useState([]);

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

  if (profile === undefined) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
      {profile === null ? (
        <p className="text-sm text-gray-600">Create a profile on the Setup page first.</p>
      ) : (
        <Card title="Add sources">
          <div className="space-y-4">
            <UploadArea onFiles={addFiles} />
            {pending.length > 0 && (
              <p className="text-sm text-gray-600">Check the type of each file, then save it.</p>
            )}
            <PendingList items={pending} onTypeChange={changeType} onRemove={remove} />
          </div>
        </Card>
      )}
    </div>
  );
}
