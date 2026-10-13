/**
 * White box with a border, used to group a section of a page.
 * @param {{ title?: string, children: React.ReactNode, className?: string }} props
 */
export default function Card({ title, children, className = '' }) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>}
      {children}
    </section>
  );
}
