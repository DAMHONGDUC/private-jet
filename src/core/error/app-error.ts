export enum AppErrorCode {
  NotFound = 'NOT_FOUND',
  Validation = 'VALIDATION',
  SoldOut = 'SOLD_OUT',
  Unauthorized = 'UNAUTHORIZED',
  Network = 'NETWORK',
  Unknown = 'UNKNOWN',
}

/** `error.name` of a `DomainError`, which survives where `instanceof` does not. */
const DOMAIN_ERROR_NAME = 'DomainError';

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
    this.name = DOMAIN_ERROR_NAME;
    this.code = code;
  }
}

function isDomainError(error: unknown): error is DomainError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === DOMAIN_ERROR_NAME &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

export function toAppError(error: unknown): AppError {
  if (isDomainError(error)) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { code: AppErrorCode.Unknown, message: error.message };
  }
  return { code: AppErrorCode.Unknown, message: 'Something went wrong.' };
}
