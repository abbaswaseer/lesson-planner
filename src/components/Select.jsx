import { useId } from 'react';
import Field, { controlClasses } from './Field.jsx';

/**
 * Dropdown with a label.
 * @param {{ label?: string, hint?: string, error?: string, placeholder?: string,
 *   options: Array<{ value: string, label: string }> }} props Plus any normal <select> props.
 */
export default function Select({ label, hint, error, placeholder, options, id, className = '', ...rest }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <Field id={selectId} label={label} hint={hint} error={error}>
      <select id={selectId} className={`${controlClasses(error)} ${className}`} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
