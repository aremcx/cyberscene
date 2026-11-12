import { cn } from '../../lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  hover?: boolean;
}

export function Card({ children, variant = 'default', hover = false, className, ...props }: CardProps) {
  const baseStyles = 'rounded-xl overflow-hidden';

  const variants = {
    default: 'bg-gray-800/50 border border-gray-700/50',
    elevated: 'bg-gray-800/80 shadow-xl shadow-black/20',
    bordered: 'bg-gray-900/50 border border-gray-700',
  };

  const hoverStyles = hover
    ? 'transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5'
    : '';

  return (
    <div className={cn(baseStyles, variants[variant], hoverStyles, className)} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-700/50', className)} {...props}>
      {children}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-700/50', className)} {...props}>
      {children}
    </div>
  );
}
