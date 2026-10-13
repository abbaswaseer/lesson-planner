import Button from '../../components/Button.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import JsonCard from '../../components/JsonCard.jsx';
import { downloadJson } from '../../lib/download.js';
import { planHeader } from '../../lib/planFiles.js';
import RegenerateButton from './RegenerateButton.jsx';

/**
 * The plans made for this request: Copy all / Download all, then one card per lesson.
 * @param {{ results: object[], onRegenerate: (key: string, instruction: string) => void,
 *   regeneratingKey: string | null, running: boolean }} props
 */
export default function Results({ results, onRegenerate, regeneratingKey, running }) {
  if (results.length === 0) return null;
  const allPlans = () => results.map((result) => result.plan);
  const week = results[0].lesson.weekNo;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-lg font-semibold text-gray-900">
          {results.length} plan{results.length > 1 ? 's' : ''}
        </h2>
        {results.length > 1 && (
          <>
            <CopyButton text={() => JSON.stringify(allPlans(), null, 2)} label="Copy all" />
            <Button size="sm" variant="secondary" onClick={() => downloadJson(`plans-week${week}.json`, allPlans())}>
              Download all
            </Button>
          </>
        )}
      </div>
      {results.map((result) => (
        <JsonCard
          key={result.key}
          plan={result.plan}
          header={planHeader(result.lesson)}
          errors={result.errors}
          provider={result.provider}
          model={result.model}
          busy={regeneratingKey === result.key}
          actions={
            <RegenerateButton
              busy={regeneratingKey === result.key}
              disabled={running || (regeneratingKey !== null && regeneratingKey !== result.key)}
              onRegenerate={(instruction) => onRegenerate(result.key, instruction)}
            />
          }
        />
      ))}
    </section>
  );
}
