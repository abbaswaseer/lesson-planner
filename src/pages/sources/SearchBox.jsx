import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { listSources } from '../../db/db.js';
import { searchPages } from '../../lib/search.js';
import { sourceTypeLabel } from '../../lib/sourceTypes.js';

const PREVIEW_CHARS = 200;

/** A short piece of the page around the first word of the query, so the match is visible. */
function preview(text, query) {
  const first = query.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  const at = Math.max(0, text.toLowerCase().indexOf(first));
  const start = Math.max(0, at - 60);
  const piece = text.slice(start, start + PREVIEW_CHARS).replace(/\s+/g, ' ');
  return `${start > 0 ? '…' : ''}${piece}${start + PREVIEW_CHARS < text.length ? '…' : ''}`;
}

/**
 * Try a topic and see which pages the planner would read for it.
 * @param {{ profileId: number }} props
 */
export default function SearchBox({ profileId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  // Re-run the search when sources change, and name each result's source.
  const sources = useLiveQuery(() => listSources(profileId), [profileId]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return undefined;
    }
    let current = true;
    // Short wait so the index is not searched on every key press.
    const timer = setTimeout(async () => {
      try {
        const found = await searchPages(profileId, query, { limit: 5 });
        if (current) setResults(found);
      } catch {
        if (current) setResults([]);
      }
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [profileId, query, sources]);

  const nameOf = (sourceId) => sources?.find((source) => source.id === sourceId)?.name ?? '';

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try a topic, e.g. ASCII character sets"
        aria-label="Search your sources"
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {results?.length === 0 && (
        <p className="text-sm text-gray-600">Nothing found. Try other words, or check the book was uploaded.</p>
      )}
      {results?.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {results.map((result) => (
            <li key={result.id} className="px-4 py-3">
              <p className="text-xs font-medium text-gray-500">
                Page {result.pageNo} · {nameOf(result.sourceId)} ({sourceTypeLabel(result.type)})
              </p>
              <p className="mt-1 text-sm text-gray-800">{preview(result.text, query)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
