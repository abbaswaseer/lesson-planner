import Card from '../../components/Card.jsx';
import {
  EXTENSION_DOWNLOAD,
  EXTENSION_INSTALL_STEPS,
  EXTENSION_SAFETY,
} from './beamsGuideContent.js';

/**
 * Download link for the extension zip, plus its one-time install steps and safety rules.
 */
export default function ExtensionDownloadCard() {
  return (
    <Card title="Get the extension">
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3">
        <a
          href={EXTENSION_DOWNLOAD.url}
          download={EXTENSION_DOWNLOAD.fileName}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Download {EXTENSION_DOWNLOAD.fileName}
        </a>
        <p className="text-sm text-blue-900">
          Version {EXTENSION_DOWNLOAD.version} · about {EXTENSION_DOWNLOAD.size}
        </p>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        The zip contains the extension, its README, the project instructions and two sample plans.
        Unzip it once and keep the folder where you put it.
      </p>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">Install once in Chrome</h3>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-gray-700">
        {EXTENSION_INSTALL_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <p className="font-medium">What the extension will not do</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {EXTENSION_SAFETY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
