import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db.js';
import { storageStatus } from '../../lib/storage.js';

/**
 * One line on the Backup card: storage used, and a reminder to keep a backup.
 * Re-checks when sources or plans change, since those take the most space.
 */
export default function StorageInfo() {
  const [status, setStatus] = useState(null);
  const changeKey = useLiveQuery(async () => `${await db.sources.count()}-${await db.plans.count()}`, []);

  useEffect(() => {
    let current = true;
    storageStatus().then((next) => {
      if (current) setStatus(next);
    });
    return () => {
      current = false;
    };
  }, [changeKey]);

  if (!status) return null;
  return (
    <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
      This browser holds <span className="font-medium">{status.used}</span> of Lesson Planner data
      {status.persisted ? ', protected from automatic clearing' : ''}. Export a backup after big changes, such as
      adding a textbook.
    </p>
  );
}
