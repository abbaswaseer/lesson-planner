import { forwardRef } from 'react';

const VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

/**
 * Standard button.
 * @param {{ variant?: 'primary' | 'secondary' | 'danger' }} props Plus any normal <button> props.
 */
// forwardRef so ConfirmDialog can put keyboard focus on its Cancel button.
const Button = forwardRef(function Button(
  { variant = 'primary', type = 'button', className = '', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
});

export default Button;
