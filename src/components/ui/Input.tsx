import { cn } from '../../lib/utils';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-gray-900/50 text-gray-100 placeholder-gray-500',
            'border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
            'transition-colors duration-200',
            icon ? 'pl-10 pr-4' : 'px-4',
            'py-2.5 text-sm',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
