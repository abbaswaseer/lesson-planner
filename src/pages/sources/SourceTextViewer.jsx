import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Button from '../../components/Button.jsx';
import { db } from '../../db/db.js';

/**
 * Pop-up showing a source's stored text one page at a time, so the teacher can check
 * the PDF was read properly.
 * @param {{ source: { id: number, name: string, pageCount: number }, onClose: () => void }} props
 */
export default function SourceTextViewer({ source, onClose }) {
  const [pageNo, setPageNo] = useState(1);
  const total = source.pageCount || 1;
  const page = useLiveQuery(
    () => db.pages.where('sourceId').equals(source.id).and((row) => row.pageNo === pageNo).first(),
    [source.id, pageNo]
  );

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const goTo = (value) => setPageNo(Math.min(total, Math.max(1, Number(value) || 1)));

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-3">
          <h2 id="viewer-title" className="truncate font-semibold text-gray-900">
            {source.name}
          </h2>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        <pre className="flex-1 overflow-y-auto whitespace-pre-wrap px-5 py-4 font-sans text-sm text-gray-800">
          {page === undefined ? 'Loading…' : page?.text || '(This page has no text.)'}
        </pre>
        {total > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-gray-200 px-5 py-3 text-sm">
            <Button size="sm" variant="secondary" onClick={() => goTo(pageNo - 1)} disabled={pageNo <= 1}>
              Previous
            </Button>
            <label className="flex items-center gap-2 text-gray-700">
              Page
              <input
                type="number"
                min={1}
                max={total}
                value={pageNo}
                onChange={(event) => goTo(event.target.value)}
                className="w-20 rounded-md border border-gray-300 px-2 py-1"
              />
              of {total}
            </label>
            <Button size="sm" variant="secondary" onClick={() => goTo(pageNo + 1)} disabled={pageNo >= total}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
