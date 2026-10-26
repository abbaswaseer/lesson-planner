import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import { CONTENTS, EXTENSION_DOWNLOAD, QUICK_START } from './beamsGuideContent.js';

/**
 * Title, the "most of this is done for you" note, the four quick steps and the contents links.
 */
export default function GuideHeader() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">BEAMS guide</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          How your lesson plans become BEAMS JSON, and what the BEAMS Lesson Plan Filler Chrome
          extension expects. This is the reference for Cambridge O Level at Beaconhouse Nawabshah
          Campus, mainly Computer Science 2210.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">Most of this is done for you.</p>
        <p className="mt-1">
          The app fills in class, section, subject, dates, duration, day and week from your Setup
          profile. The AI writes only the topic, attainment targets, learning outcomes and
          activities. Use this page to check a plan, set up a subject, or see exactly what the
          extension receives.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="min-w-0 flex-1">
          <span className="font-medium">Need the Chrome extension?</span> Download it here, then
          follow the install steps under{' '}
          <a href="#extension" className="font-medium underline hover:no-underline">
            Copy into BEAMS
          </a>
          .
        </p>
        <a
          href={EXTENSION_DOWNLOAD.url}
          download={EXTENSION_DOWNLOAD.fileName}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          Download {EXTENSION_DOWNLOAD.fileName}
        </a>
      </div>

      <section aria-labelledby="quick-start">
        <h2 id="quick-start" className="text-lg font-semibold text-gray-900">
          The four steps
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {QUICK_START.map((step, index) => (
            <Card key={step.title}>
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {index + 1}
                </span>
                {step.title}
              </p>
              <p className="mt-2 text-sm text-gray-600">{step.text}</p>
              {step.to && (
                <Link to={step.to} className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
                  {step.linkText} →
                </Link>
              )}
            </Card>
          ))}
        </div>
      </section>

      <nav aria-label="On this page" className="flex flex-wrap gap-2">
        {CONTENTS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
