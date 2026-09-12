import React from 'react';
import { cn } from '../../utils/cn';

/**
 * ButtonProps defines what properties (inputs) our Button component accepts.
 * By extending React.ButtonHTMLAttributes<HTMLButtonElement>, our custom Button
 * automatically inherits all standard HTML button properties like onClick, disabled, type, etc.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * Reusable Button component with developer-focused styling.
 * Prevents code duplication across pages and guarantees consistent hover/active states.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  // Base classes applied to every button
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  // Variant classes controlling colors, borders, and backgrounds
  const variantStyles = {
    primary:
      'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-[0.99] shadow-sm font-semibold',
    secondary:
      'bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-850 hover:border-zinc-700 active:scale-[0.99]',
    outline:
      'border border-zinc-750 text-zinc-300 hover:border-zinc-500 hover:text-white bg-transparent active:scale-[0.99]',
    ghost:
      'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/70',
  };

  // Size classes controlling padding and font sizes
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
