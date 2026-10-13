import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Button from '../../components/Button.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { useToast } from '../../components/Toast.jsx';
import { deleteSource, listSources } from '../../db/db.js';
import { sourceTypeLabel } from '../../lib/sourceTypes.js';
import SourceTextViewer from './SourceTextViewer.jsx';

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Table of the profile's saved sources, with View text and Delete.
 * @param {{ profileId: number }} props
 */
export default function SourcesList({ profileId }) {
  const toast = useToast();
  const sources = useLiveQuery(() => listSources(profileId), [profileId]);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const confirmDelete = async () => {
    const source = deleting;
    setDeleting(null);
    try {
      await deleteSource(source.id);
      toast.success(`Deleted "${source.name}".`);
    } catch {
      toast.error('Could not delete this source. Please try again.');
    }
  };

  if (sources === undefined) return null;
  if (sources.length === 0) {
    return <p className="text-sm text-gray-600">No sources yet. Add your textbook and scheme of work above.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
            <tr>
              <th className="py-2 pr-3 font-medium">Name</th>
              <th className="py-2 pr-3 font-medium">Type</th>
              <th className="py-2 pr-3 font-medium">Pages</th>
              <th className="py-2 pr-3 font-medium">Added</th>
              <th className="py-2 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sources.map((source) => (
              <tr key={source.id}>
                <td className="max-w-56 truncate py-2 pr-3 text-gray-900" title={source.name}>
                  {source.name}
                </td>
                <td className="py-2 pr-3 text-gray-700">{sourceTypeLabel(source.type)}</td>
                <td className="py-2 pr-3 text-gray-700">{source.type === 'template' ? '—' : source.pageCount}</td>
                <td className="whitespace-nowrap py-2 pr-3 text-gray-700">{dateFormat.format(source.addedAt)}</td>
                <td className="py-2">
                  <div className="flex justify-end gap-2">
                    {source.type !== 'template' && (
                      <Button size="sm" variant="secondary" onClick={() => setViewing(source)}>
                        View text
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => setDeleting(source)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && <SourceTextViewer source={viewing} onClose={() => setViewing(null)} />}
      <ConfirmDialog
        open={deleting !== null}
        title={`Delete "${deleting?.name}"?`}
        message="Its text will be removed from this browser. Plans you already made are kept."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
