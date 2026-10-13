import Button from '../../components/Button.jsx';

/**
 * "Generating 2 of 4…" with a progress bar, a busy note when the AI is retrying, and Cancel.
 * @param {{ progress: { done: number, total: number, message: string } | null, retryNote?: string,
 *   onCancel: () => void }} props
 */
export default function RunProgress({ progress, retryNote = '', onCancel }) {
  if (!progress) return null;
  const fraction = progress.total ? progress.done / progress.total : 0;
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="flex-1 text-sm font-medium text-blue-900">{progress.message}</p>
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-100">
        <div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${Math.round(fraction * 100)}%` }} />
      </div>
      {retryNote && <p className="mt-2 text-xs text-blue-800">{retryNote}</p>}
    </div>
  );
}
