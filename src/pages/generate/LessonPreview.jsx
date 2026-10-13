import { describeLessons, noLessonsMessage } from '../../lib/lessonPreview.js';

/**
 * Live preview of which lessons a request means, e.g. "Thursday 15/10/2026 — O2 (80 min), O3 (80 min)".
 * @param {{ profile: object, text: string, parsed: object | null, lessons: object[] }} props
 */
export default function LessonPreview({ profile, text, parsed, lessons }) {
  if (!text.trim()) return null;
  if (lessons.length === 0) {
    return <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{noLessonsMessage(profile, parsed)}</p>;
  }
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800" aria-live="polite">
      <p className="mb-1 text-xs font-medium uppercase text-gray-500">
        {lessons.length} lesson{lessons.length > 1 ? 's' : ''} · week {parsed.week}
      </p>
      <ul className="space-y-0.5">
        {describeLessons(lessons).map((line) => (
          <li key={line.day}>
            <span className="font-medium">{line.day}</span> — {line.classes}
          </li>
        ))}
      </ul>
    </div>
  );
}
