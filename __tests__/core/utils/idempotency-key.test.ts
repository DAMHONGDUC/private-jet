import { newIdempotencyKey } from '@/core/utils/idempotency-key';

test('is shaped like a v4 UUID and differs per checkout', () => {
  const key = newIdempotencyKey();
  expect(key).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  expect(newIdempotencyKey()).not.toBe(key);
});
