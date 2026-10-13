import { useId } from 'react';
import Field, { controlClasses } from './Field.jsx';

/**
 * Text input with a label.
 * @param {{ label?: string, hint?: string, error?: string }} props Plus any normal <input> props.
 */
export default function Input({ label, hint, error, id, className = '', ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      <input id={inputId} className={`${controlClasses(error)} ${className}`} {...rest} />
    </Field>
  );
}
