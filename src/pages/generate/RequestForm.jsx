import Button from '../../components/Button.jsx';
import Select from '../../components/Select.jsx';
import Textarea from '../../components/Textarea.jsx';
import { OUTPUT_TYPES } from '../../outputs/index.js';

/**
 * The request box, optional notes for the AI, output type and the Generate button.
 * @param {{ value: { request: string, notes: string, outputType: string },
 *   onChange: (field: string, value: string) => void, onGenerate: () => void,
 *   canGenerate: boolean, busy: boolean, children?: React.ReactNode }} props
 *   `children` is shown under the request box (the lesson preview).
 */
export default function RequestForm({ value, onChange, onGenerate, canGenerate, busy, children }) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canGenerate && !busy) onGenerate();
      }}
    >
      <Textarea
        label="What do you need?"
        hint='For example "Thursday, week 9", "O3, week 9", "O2, week 9, Thursday" or "week 9" (for the notification).'
        rows={2}
        value={value.request}
        onChange={(event) => onChange('request', event.target.value)}
        onKeyDown={(event) => {
          // Enter generates; Shift+Enter still makes a new line.
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (canGenerate && !busy) onGenerate();
          }
        }}
      />
      {children}
      <Textarea
        label="Notes for the AI (optional)"
        hint={'e.g. "Start with a quick revision of last lesson". Never include student names or marks.'}
        rows={2}
        value={value.notes}
        onChange={(event) => onChange('notes', event.target.value)}
      />
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-64 max-w-full">
          <Select
            label="Output"
            value={value.outputType}
            onChange={(event) => onChange('outputType', event.target.value)}
            options={OUTPUT_TYPES.map((type) => ({ value: type.id, label: type.name }))}
          />
        </div>
        <Button type="submit" disabled={!canGenerate || busy}>
          {busy ? 'Generating…' : 'Generate'}
        </Button>
      </div>
    </form>
  );
}
