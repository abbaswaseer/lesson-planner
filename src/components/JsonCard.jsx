import { downloadText } from '../lib/download.js';
import { planFileName } from '../lib/planFiles.js';
import { planText } from '../outputs/beamsJson.js';
import Button from './Button.jsx';
import CopyButton from './CopyButton.jsx';

/**
 * One lesson's BEAMS JSON: header, the JSON (always an array), Copy, Download,
 * which AI made it, and a red error list if it failed validation.
 * @param {{ plan: object, header: string, errors?: string[], provider?: string, model?: string,
 *   actions?: React.ReactNode, busy?: boolean }} props `actions` adds buttons (e.g. Regenerate, Delete).
 */
export default function JsonCard({ plan, header, errors = [], provider, model, actions, busy = false }) {
  const json = planText(plan);
  return (
    <article className={`rounded-lg border bg-white shadow-sm ${errors.length ? 'border-red-300' : 'border-gray-200'}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
        {/* Full width on phones, so the buttons wrap below the title instead of squeezing it. */}
        <div className="min-w-0 flex-1 basis-full sm:basis-0">
          <h3 className="text-sm font-semibold text-gray-900">{header}</h3>
          <p className="truncate text-xs text-gray-500">{plan.topic}</p>
        </div>
        <CopyButton text={json} />
        <Button size="sm" variant="secondary" onClick={() => downloadText(planFileName(plan), json)}>
          Download
        </Button>
        {actions}
      </div>

      {errors.length > 0 && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <p className="font-medium">This plan has problems. Fix them by hand or press Regenerate:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <pre
        className={`max-h-96 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed text-gray-800 ${busy ? 'opacity-40' : ''}`}
      >
        {json}
      </pre>

      {provider && (
        <p className="px-4 pb-2 text-right text-xs text-gray-400">
          Made with {provider}
          {model ? ` (${model})` : ''}
        </p>
      )}
    </article>
  );
}
