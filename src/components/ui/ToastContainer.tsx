import { cn } from '../../lib/utils';
import type { Toast } from '../../types';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const toastStyles = {
  success: 'border-emerald-500/50 bg-emerald-500/10',
  error: 'border-red-500/50 bg-red-500/10',
  warning: 'border-amber-500/50 bg-amber-500/10',
  info: 'border-blue-500/50 bg-blue-500/10',
};

const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
            'animate-slide-in-right',
            toastStyles[toast.type]
          )}
        >
          <span className="text-lg flex-shrink-0">{toastIcons[toast.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-100">{toast.title}</p>
            {toast.description && (
              <p className="text-sm text-gray-400 mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
