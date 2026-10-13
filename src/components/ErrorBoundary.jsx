import { Component } from 'react';

/**
 * Last safety net: if a page crashes, show a calm message instead of a blank screen or a stack trace.
 * React only supports this as a class component, so it is the one exception to "functions only".
 * @param {{ children: React.ReactNode }} props
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Kept in the browser console for whoever maintains the app; never shown to the teacher.
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="max-w-xl rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800" role="alert">
        <p className="font-semibold">Something went wrong on this page.</p>
        <p className="mt-2">
          Your saved data is safe. Reload the page to continue. If it happens again, export a backup on the Setup
          page.
        </p>
        <button
          type="button"
          className="mt-4 rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }
}
