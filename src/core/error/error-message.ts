import type { AppError } from './app-error';

/** Reads the message off an RTK Query error, which is an `AppError` here. */
export function errorMessage(error: unknown): string {
  const message = (error as Partial<AppError> | undefined)?.message;
  return typeof message === 'string' ? message : 'Something went wrong.';
}
