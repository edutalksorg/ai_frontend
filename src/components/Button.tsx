import React from 'react';
import { classNames } from '../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20 active:scale-[0.98] active:translate-y-0.5';

    const variantClasses = {
      primary: 'bg-primary-600 dark:bg-blue-600 text-white hover:bg-primary-700 dark:hover:bg-blue-500 shadow-lg shadow-primary-500/20 dark:shadow-blue-500/20 hover:shadow-xl active:bg-primary-800 dark:active:bg-blue-700',
      secondary: 'bg-secondary-600 dark:bg-violet-600 text-white hover:bg-secondary-700 dark:hover:bg-violet-500 shadow-lg shadow-secondary-500/20 dark:shadow-violet-500/20 hover:shadow-xl active:bg-secondary-800 dark:active:bg-violet-700',
      outline: 'border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-primary-500 dark:hover:border-blue-500 active:bg-slate-100 dark:active:bg-white/10',
      ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 active:bg-slate-200 dark:active:bg-white/10',
      danger: 'bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-500 shadow-lg shadow-red-500/20 dark:shadow-red-500/40 hover:shadow-xl active:bg-red-800',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-xs gap-2 rounded-lg',
      md: 'px-6 py-3 text-sm gap-2.5 rounded-xl',
      lg: 'px-8 py-4 text-base gap-3 rounded-2xl',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classNames(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClass,
          disabledClass,
          className
        )}
        {...props}
      >
        {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
