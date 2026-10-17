export type AppErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SOLD_OUT'
  | 'UNAUTHORIZED'
  | 'NETWORK'
  | 'UNKNOWN';

/** The serializable error RTK Query keeps in the store. */
export type AppError = { code: AppErrorCode; message: string };

/**
 * Thrown by the domain and data layers. It never reaches Redux as is:
 * `toAppError` turns it into a plain object at the RTK Query boundary.
 */
export class DomainError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

function isDomainError(error: unknown): error is DomainError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'DomainError' &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

export function toAppError(error: unknown): AppError {
  if (isDomainError(error)) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { code: 'UNKNOWN', message: error.message };
  }
  return { code: 'UNKNOWN', message: 'Something went wrong.' };
}
