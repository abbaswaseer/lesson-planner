import { useState } from 'react';
import Button from '../../components/Button.jsx';

/**
 * "Regenerate" with an optional short instruction ("make it simpler").
 * @param {{ onRegenerate: (instruction: string) => void, busy: boolean, disabled?: boolean }} props
 */
export default function RegenerateButton({ onRegenerate, busy, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)} disabled={disabled || busy}>
        {busy ? 'Regenerating…' : 'Regenerate'}
      </Button>
    );
  }

  const go = () => {
    onRegenerate(instruction);
    setOpen(false);
    setInstruction('');
  };

  return (
    <form
      className="flex w-full items-center gap-2 sm:w-auto"
      onSubmit={(event) => {
        event.preventDefault();
        go();
      }}
    >
      <input
        autoFocus
        className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs sm:w-56"
        placeholder="Optional: e.g. make it simpler"
        aria-label="Instruction for the new version"
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      />
      <Button size="sm" type="submit">
        Go
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </form>
  );
}
