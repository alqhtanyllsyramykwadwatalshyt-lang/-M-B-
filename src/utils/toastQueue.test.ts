import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createToastItem,
  enqueueToast,
  removeToast,
  MAX_VISIBLE_TOASTS,
} from './toastQueue.js';

test('createToastItem and enqueueToast prepend newest toast and enforce max limit', () => {
  let queue = [] as ReturnType<typeof createToastItem>[];
  for (let i = 1; i <= MAX_VISIBLE_TOASTS + 2; i++) {
    const item = createToastItem(
      {
        title: `تنبيه ${i}`,
        message: `تفاصيل ${i}`,
        variant: 'success',
      },
      `id-${i}`,
      i * 1000
    );
    queue = enqueueToast(queue, item);
  }

  assert.equal(queue.length, MAX_VISIBLE_TOASTS);
  assert.equal(queue[0].id, `id-${MAX_VISIBLE_TOASTS + 2}`);
  assert.equal(queue[MAX_VISIBLE_TOASTS - 1].id, 'id-3');
});

test('removeToast removes only the matching toast id', () => {
  const t1 = createToastItem({ title: 'A', message: '1', variant: 'info' }, 't1', 1);
  const t2 = createToastItem({ title: 'B', message: '2', variant: 'success' }, 't2', 2);
  const queue = enqueueToast([t1], t2);
  const after = removeToast(queue, 't1');

  assert.equal(after.length, 1);
  assert.equal(after[0].id, 't2');
});
