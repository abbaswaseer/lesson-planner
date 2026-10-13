import CopyButton from '../../components/CopyButton.jsx';

/**
 * The weekly topic notification, ready to paste into WhatsApp or the school portal.
 * @param {{ text: string }} props
 */
export default function NotificationCard({ text }) {
  if (!text) return null;
  return (
    <article className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <h3 className="flex-1 text-sm font-semibold text-gray-900">Weekly topic notification</h3>
        <CopyButton text={text} />
      </div>
      <pre className="whitespace-pre-wrap px-4 py-3 font-sans text-sm text-gray-800">{text}</pre>
    </article>
  );
}
