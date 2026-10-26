/**
 * Inline code styling for the BEAMS guide.
 * @param {{ children: React.ReactNode }} props
 */
export function code(children) {
  return (
    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-gray-900">
      {children}
    </code>
  );
}
