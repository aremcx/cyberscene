/**
 * Toast Hook
 * Manages toast notifications across the application.
 */

import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '../types';
import { generateId } from '../lib/utils';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 5000) => {
      const id = generateId();
      const toast: Toast = { id, type, title, description, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string) => addToast('success', title, description),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => addToast('error', title, description, 8000),
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string) => addToast('warning', title, description),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) => addToast('info', title, description),
    [addToast]
  );

  return { toasts, addToast, removeToast, success, error, warning, info };
}
