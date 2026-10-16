import { DomainError } from '@/core/error/app-error';
import { runQuery } from './run-query';

test('wraps a value as data', async () => {
  await expect(runQuery(async () => 42)).resolves.toEqual({ data: 42 });
});

test('turns a domain error into a plain, serializable AppError', async () => {
  const result = await runQuery(async () => {
    throw new DomainError('SOLD_OUT', 'Gone.');
  });

  expect(result).toEqual({ error: { code: 'SOLD_OUT', message: 'Gone.' } });
  expect(Object.getPrototypeOf(result.error)).toBe(Object.prototype);
});

test('turns anything else into UNKNOWN', async () => {
  const result = await runQuery(async () => {
    throw new Error('boom');
  });

  expect(result).toEqual({ error: { code: 'UNKNOWN', message: 'boom' } });
});
