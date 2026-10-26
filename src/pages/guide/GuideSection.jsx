/**
 * One section of the BEAMS guide, with a stable anchor so the contents links work.
 * @param {{ id: string, title: string, intro?: string, children: React.ReactNode }} props
 */
export default function GuideSection({ id, title, intro, children }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {intro && <p className="mt-1 text-sm text-gray-600">{intro}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
