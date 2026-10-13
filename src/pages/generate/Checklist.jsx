import { Link } from 'react-router-dom';

/**
 * First-time checklist: what still needs setting up, each with a link to where to do it.
 * Hidden once everything is done.
 * @param {{ items: Array<{ id: string, label: string, done: boolean, link: string }> }} props
 */
export default function Checklist({ items }) {
  if (items.every((item) => item.done)) return null;
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-medium text-blue-900">Before your first plan:</p>
      <ol className="mt-2 space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={item.id} className={item.done ? 'text-gray-500 line-through' : 'text-blue-900'}>
            {i + 1}.{' '}
            {item.done ? (
              item.label
            ) : (
              <Link to={item.link} className="underline hover:text-blue-700">
                {item.label}
              </Link>
            )}
            {item.done && <span className="sr-only"> (done)</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
