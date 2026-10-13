/**
 * Label, hint and error text around one form control.
 * Shared by Input, Select and Textarea so they all look the same.
 * @param {{ id: string, label?: string, hint?: string, error?: string, children: React.ReactNode }} props
 */
export default function Field({ id, label, hint, error, children }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        hint && <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}

/** Tailwind classes shared by every text-like control. */
export function controlClasses(error) {
  const border = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  return `block w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 ${border}`;
}
