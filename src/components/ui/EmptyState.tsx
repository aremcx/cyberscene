import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-16 px-4', className)}>
      {icon && (
        <div className="mb-4 text-5xl opacity-50">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 max-w-md mx-auto mb-6">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
