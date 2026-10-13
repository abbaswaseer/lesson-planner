import { forwardRef } from 'react';

const VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SIZES = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-2.5 py-1 text-xs',
};

/**
 * Standard button.
 * @param {{ variant?: 'primary' | 'secondary' | 'danger', size?: 'md' | 'sm' }} props
 *   Plus any normal <button> props.
 */
// forwardRef so ConfirmDialog can put keyboard focus on its Cancel button.
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', type = 'button', className = '', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
});

export default Button;
