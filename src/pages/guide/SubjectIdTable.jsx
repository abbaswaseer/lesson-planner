import { useMemo, useState } from 'react';
import { SUBJECT_IDS } from './beamsGuideContent.js';
import GuideTable from './GuideTable.jsx';

/**
 * The BEAMS subject_id lookup, with a search box because the list is long.
 */
export default function SubjectIdTable() {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SUBJECT_IDS.filter(
      (item) => !needle || item.subject.toLowerCase().includes(needle) || item.id.includes(needle)
    );
  }, [query]);

  return (
    <div className="space-y-2">
      <label htmlFor="subject-search" className="sr-only">
        Search subjects
      </label>
      <input
        id="subject-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search a subject or ID, e.g. Biology or 5090…"
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <GuideTable
        columns={['Subject (syllabus)', 'subject_id']}
        rows={rows.map((item) => [
          <span key="subject">
            {item.subject}
            {item.note && <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">{item.note}</span>}
          </span>,
          <code key="id" className="font-mono text-xs text-gray-900">"{item.id}"</code>,
        ])}
        empty="No subject matches that search. Copy the ID from the BEAMS dropdown instead."
        fixed
      />
      <p className="text-xs text-gray-500">
        Showing {rows.length} of {SUBJECT_IDS.length} subjects. IDs are strings in the JSON.
      </p>
    </div>
  );
}
