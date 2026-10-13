import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const HIDE_AFTER_MS = 3000;

const STYLES = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

const ToastContext = createContext(null);

/**
 * Wrap the app in this once. It holds the visible toasts and draws them
 * in a corner of the screen.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const show = useCallback((type, message) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, type, message }]);
    setTimeout(() => {
      setToasts((list) => list.filter((toast) => toast.id !== id));
    }, HIDE_AFTER_MS);
  }, []);

  // Stable object so components using the hook don't re-render on every toast.
  const api = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
      info: (message) => show('info', message),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 md:inset-x-auto md:right-6 md:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full max-w-sm rounded-lg border px-4 py-3 text-sm shadow-md ${STYLES[toast.type]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Show a short message that hides itself after 3 seconds.
 * Usage: const toast = useToast(); toast.success('Saved');
 * @returns {{ success: (message: string) => void, error: (message: string) => void, info: (message: string) => void }}
 */
export function useToast() {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>.');
  return api;
}
