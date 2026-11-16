export type ToastVariant = 'success' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
}

export const MAX_VISIBLE_TOASTS = 4;

export function createToastItem(
  input: Omit<ToastItem, 'id' | 'createdAt'>,
  id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  createdAt = Date.now()
): ToastItem {
  return {
    id,
    title: input.title,
    message: input.message,
    variant: input.variant,
    createdAt,
  };
}

export function enqueueToast(
  queue: ToastItem[],
  item: ToastItem,
  maxItems = MAX_VISIBLE_TOASTS
): ToastItem[] {
  const next = [item, ...queue.filter((t) => t.id !== item.id)];
  return next.slice(0, maxItems);
}

export function removeToast(queue: ToastItem[], id: string): ToastItem[] {
  return queue.filter((t) => t.id !== id);
}
