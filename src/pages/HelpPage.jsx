import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import { FAQ, STEPS } from './help/helpContent.js';

/**
 * Help page: step-by-step guide for a new teacher, plus answers to common problems.
 */
export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help</h1>
        <p className="mt-1 text-sm text-gray-600">Follow these steps once. After that, you only need Generate.</p>
      </div>

      <ol className="space-y-6">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <Card>
              <h2 className="text-base font-semibold text-gray-900">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {i + 1}
                </span>
                {step.title}
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-gray-700">
                {step.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {/* Placeholder until real screenshots are added. */}
              <div className="mt-4 flex h-28 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-xs text-gray-500">
                Screenshot: {step.screenshot}
              </div>
              {step.link && (
                <Link to={step.link} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
                  {step.linkText} →
                </Link>
              )}
              {step.href && (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  {step.linkText} ↗
                </a>
              )}
            </Card>
          </li>
        ))}
      </ol>

      <Card title="Common problems">
        <div className="divide-y divide-gray-100">
          {FAQ.map((item) => (
            <details key={item.question} className="group py-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 marker:text-gray-400">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-gray-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
