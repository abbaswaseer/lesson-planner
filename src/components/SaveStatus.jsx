const TEXT = {
  idle: '',
  saving: 'Saving…',
  saved: '✓ All changes saved',
  error: 'Could not save. Check your browser storage and try again.',
};

/**
 * Small line under an auto-saving form so teachers know their edits are kept.
 * @param {{ status: 'idle' | 'saving' | 'saved' | 'error' }} props
 */
export default function SaveStatus({ status }) {
  const colour = status === 'error' ? 'text-red-600' : 'text-gray-500';
  return (
    <p className={`min-h-5 text-xs ${colour}`} role="status" aria-live="polite">
      {TEXT[status]}
    </p>
  );
}
