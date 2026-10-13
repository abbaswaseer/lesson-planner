import { useId } from 'react';
import Field, { controlClasses } from './Field.jsx';

/**
 * Multi-line text box with a label.
 * @param {{ label?: string, hint?: string, error?: string }} props Plus any normal <textarea> props.
 */
export default function Textarea({ label, hint, error, id, rows = 4, className = '', ...rest }) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  return (
    <Field id={textareaId} label={label} hint={hint} error={error}>
      <textarea id={textareaId} rows={rows} className={`${controlClasses(error)} ${className}`} {...rest} />
    </Field>
  );
}
