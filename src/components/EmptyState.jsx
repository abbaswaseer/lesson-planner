import { Link } from 'react-router-dom';

/**
 * Friendly placeholder for a page with nothing to show yet, pointing to the next step.
 * @param {{ title: string, text: string, linkTo?: string, linkText?: string }} props
 */
export default function EmptyState({ title, text, linkTo, linkText }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <p className="text-base font-medium text-gray-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">{text}</p>
      {linkTo && (
        <Link
          to={linkTo}
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}

/** The same message on every page that needs a profile first. */
export function NoProfile() {
  return (
    <EmptyState
      title="No profile yet"
      text="Start by creating your profile, or load the sample to look around."
      linkTo="/setup"
      linkText="Go to Setup"
    />
  );
}
