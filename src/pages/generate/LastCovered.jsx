import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { controlClasses } from '../../components/Field.jsx';
import SaveStatus from '../../components/SaveStatus.jsx';
import { getLastTopics, setLastTopic } from '../../db/db.js';
import { createDebouncedSaver } from '../../lib/debouncedSaver.js';

const SAVE_DELAY_MS = 500;

/**
 * One "Last covered" box per class in the request, pre-filled from progress and saved as typed.
 * @param {{ profileId: number, classLabels: string[], onValuesChange: (values: Record<string, string>) => void }} props
 *   `onValuesChange` gets what is shown in the boxes, so Generate uses the latest text even
 *   if the last edit has not been saved yet.
 */
export default function LastCovered({ profileId, classLabels, onValuesChange }) {
  const saved = useLiveQuery(() => getLastTopics(profileId), [profileId]);
  const [edits, setEdits] = useState({});
  const [status, setStatus] = useState('idle');
  const saverRef = useRef(null);

  useEffect(() => {
    const saver = createDebouncedSaver(async (changes) => {
      setStatus('saving');
      try {
        await Promise.all(Object.entries(changes).map(([label, topic]) => setLastTopic(profileId, label, topic)));
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    }, SAVE_DELAY_MS);
    saverRef.current = saver;
    setEdits({});
    return () => {
      saver.flush();
    };
  }, [profileId]);

  // Unsaved edits win over the database; once saved (or updated after generating) the database shows.
  const values = Object.fromEntries(classLabels.map((label) => [label, edits[label] ?? saved?.[label] ?? '']));
  const valuesKey = JSON.stringify(values);
  useEffect(() => {
    onValuesChange(values);
  }, [valuesKey]);

  // After generating, progress changes in the database: show it instead of the old edit.
  useEffect(() => {
    if (!saverRef.current?.hasPending()) setEdits({});
  }, [saved]);

  if (classLabels.length === 0 || saved === undefined) return null;

  const change = (label, topic) => {
    setEdits((current) => ({ ...current, [label]: topic }));
    saverRef.current.queue({ [label]: topic });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Last topic covered</p>
      {classLabels.map((label) => (
        <div key={label} className="flex items-center gap-3">
          <label htmlFor={`last-${label}`} className="w-12 shrink-0 text-sm font-medium text-gray-700">
            {label}
          </label>
          <input
            id={`last-${label}`}
            className={controlClasses(false)}
            placeholder="e.g. 2.1 Types and methods of data transmission"
            value={values[label]}
            onChange={(event) => change(label, event.target.value)}
          />
        </div>
      ))}
      <SaveStatus status={status} />
    </div>
  );
}
