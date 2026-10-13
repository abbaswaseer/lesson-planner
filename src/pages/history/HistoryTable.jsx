import { OUTPUT_TYPES } from '../../outputs/index.js';

const createdFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const outputName = (id) => OUTPUT_TYPES.find((type) => type.id === id)?.name ?? id;

/**
 * Saved plans as a table; clicking a row opens that plan.
 * @param {{ plans: object[], openId: number | null, onOpen: (id: number) => void }} props
 */
export default function HistoryTable({ plans, openId, onOpen }) {
  if (plans.length === 0) return <p className="text-sm text-gray-600">No plans match these filters.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
          <tr>
            <th className="py-2 pr-3 font-medium">Date</th>
            <th className="py-2 pr-3 font-medium">Week</th>
            <th className="py-2 pr-3 font-medium">Class</th>
            <th className="py-2 pr-3 font-medium">Topic</th>
            <th className="py-2 pr-3 font-medium">Output</th>
            <th className="py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {plans.map((plan) => (
            <tr
              key={plan.id}
              onClick={() => onOpen(plan.id)}
              className={`cursor-pointer hover:bg-gray-50 ${openId === plan.id ? 'bg-blue-50' : ''}`}
            >
              <td className="whitespace-nowrap py-2 pr-3 text-gray-700">{plan.date}</td>
              <td className="py-2 pr-3 text-gray-700">{plan.weekNo}</td>
              <td className="py-2 pr-3 text-gray-700">{plan.classLabel}</td>
              <td className="max-w-72 py-2 pr-3 text-gray-900">
                <button
                  type="button"
                  className="text-left hover:underline"
                  aria-expanded={openId === plan.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(plan.id);
                  }}
                >
                  {plan.data?.topic || '(no topic)'}
                </button>
                {plan.errors?.length > 0 && <span className="ml-2 text-xs text-red-600">has problems</span>}
              </td>
              <td className="whitespace-nowrap py-2 pr-3 text-gray-700">{outputName(plan.outputType)}</td>
              <td className="whitespace-nowrap py-2 text-gray-500">{createdFormat.format(plan.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
