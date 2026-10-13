import Button from '../../components/Button.jsx';
import { typesForKind } from '../../lib/sourceTypes.js';

/**
 * Files chosen but not saved yet. The teacher checks each file's type, then saves it.
 * @param {{ items: Array<{ id: string, file: File, kind: string, type: string }>,
 *   onTypeChange: (id: string, type: string) => void, onRemove: (id: string) => void,
 *   onSave?: (id: string) => void, busyId?: string | null,
 *   progress?: { message: string, fraction: number } | null }} props
 */
export default function PendingList({ items, onTypeChange, onRemove, onSave, busyId = null, progress = null }) {
  if (items.length === 0) return null;
  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {items.map((item) => {
        const busy = busyId === item.id;
        return (
          <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{item.file.name}</p>
              <p className="text-xs text-gray-500">
                {busy && progress ? progress.message : `${(item.file.size / 1024 / 1024).toFixed(1)} MB`}
              </p>
              {busy && progress && (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width]"
                    style={{ width: `${Math.round(progress.fraction * 100)}%` }}
                  />
                </div>
              )}
            </div>
            <label className="sr-only" htmlFor={`type-${item.id}`}>
              Source type for {item.file.name}
            </label>
            <select
              id={`type-${item.id}`}
              value={item.type}
              disabled={busyId !== null}
              onChange={(event) => onTypeChange(item.id, event.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              {typesForKind(item.kind).map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {onSave && (
              <Button size="sm" onClick={() => onSave(item.id)} disabled={busyId !== null}>
                {busy ? 'Saving…' : 'Save'}
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => onRemove(item.id)} disabled={busyId !== null}>
              Remove
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
