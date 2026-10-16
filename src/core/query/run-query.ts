import { toAppError, type AppError } from '@/core/error/app-error';

type QueryResult<T> = { data: T; error?: undefined } | { error: AppError; data?: undefined };

/**
 * Runs a use case inside an RTK Query `queryFn`: its value becomes `data`,
 * anything it throws becomes a serializable `AppError`.
 */
export async function runQuery<T>(task: () => Promise<T>): Promise<QueryResult<T>> {
  try {
    return { data: await task() };
  } catch (error) {
    return { error: toAppError(error) };
  }
}
