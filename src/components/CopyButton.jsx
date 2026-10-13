import { useEffect, useState } from 'react';
import Button from './Button.jsx';

/**
 * Copies text to the clipboard and says "Copied ✓" for a moment.
 * @param {{ text: string | (() => string), label?: string, size?: 'md' | 'sm', variant?: string }} props
 *   `text` may be a function, so large text is only built when clicked.
 */
export default function CopyButton({ text, label = 'Copy', size = 'sm', variant = 'secondary' }) {
  const [state, setState] = useState('idle'); // idle | copied | failed

  useEffect(() => {
    if (state === 'idle') return undefined;
    const timer = setTimeout(() => setState('idle'), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(typeof text === 'function' ? text() : text);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  const shown = { idle: label, copied: 'Copied ✓', failed: 'Copy failed' }[state];
  return (
    <Button size={size} variant={variant} onClick={copy} aria-live="polite">
      {shown}
    </Button>
  );
}
