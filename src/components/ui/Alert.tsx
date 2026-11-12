import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const variants = {
  info: {
    container: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    icon: 'text-blue-400',
  },
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    icon: 'text-emerald-400',
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    icon: 'text-amber-400',
  },
  error: {
    container: 'bg-red-500/10 border-red-500/20 text-red-300',
    icon: 'text-red-400',
  },
};

const defaultIcons = {
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Alert({ variant, title, children, className, icon }: AlertProps) {
  const styles = variants[variant];

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', styles.container, className)}>
      <div className={cn('flex-shrink-0', styles.icon)}>
        {icon || defaultIcons[variant]}
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
