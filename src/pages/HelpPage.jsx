import { useToast } from '../components/Toast.jsx';

/**
 * Help page. Content is added in later tasks.
 */
export default function HelpPage() {
  const toast = useToast();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Help</h1>

      {/* Temporary check for T-07; the real Help content replaces this in T-61. */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          onClick={() => toast.success('Saved successfully.')}
        >
          Test success
        </button>
        <button
          type="button"
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          onClick={() => toast.error('Something went wrong. Please try again.')}
        >
          Test error
        </button>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => toast.info('Generating 2 of 4…')}
        >
          Test info
        </button>
      </div>
    </div>
  );
}
