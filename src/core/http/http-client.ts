import { AppErrorCode, DomainError } from '@/core/error/app-error';
import type { TokenStore } from './token-store';

export enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

/** The header a server reads to run a retried write at most once. */
export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';

const DEFAULT_TIMEOUT_MS = 15_000;

export type HttpClientOptions = {
  /** e.g. `https://api.example.com/v1`; paths are appended to it. */
  baseUrl: string;
  /** Read for the bearer token on every call; cleared on a 401. */
  tokenStore?: TokenStore;
  timeoutMs?: number;
  /** Injected in tests; the global `fetch` otherwise. */
  fetch?: typeof fetch;
};

export type RequestOptions = {
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  /** Sent as JSON. */
  body?: unknown;
  headers?: Record<string, string>;
  /** RTK Query's `signal`: aborts the call when the query is dropped. */
  signal?: AbortSignal;
  /** Sent as `Idempotency-Key`, so a retry of the same write is not applied twice. */
  idempotencyKey?: string;
};

/** The message a server error body carries, as `{ message }` or `{ error: { message } }`. */
function serverMessage(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const { message, error } = body as {
    message?: unknown;
    error?: { message?: unknown };
  };
  if (typeof message === 'string') {
    return message;
  }
  return typeof error?.message === 'string' ? error.message : undefined;
}

/** The domain error for a failed response; the server's message wins when it sends one. */
export function errorForStatus(status: number, body: unknown): DomainError {
  const message = serverMessage(body);
  switch (status) {
    case 401:
      return new DomainError(
        AppErrorCode.Unauthorized,
        message ?? 'Your session has ended. Sign in again.',
      );
    case 404:
      return new DomainError(
        AppErrorCode.NotFound,
        message ?? 'We could not find that.',
      );
    case 409:
    case 422:
      return new DomainError(
        AppErrorCode.Validation,
        message ?? 'Please check the details and try again.',
      );
    default:
      return new DomainError(
        AppErrorCode.Unknown,
        message ?? `The server answered ${status}.`,
      );
  }
}

function parse(text: string): unknown {
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * The one way HTTP data sources reach the backend: JSON in and out, a
 * bearer token from the token store, a timeout, and every failure turned
 * into a `DomainError` so `runQuery` shows it like any other.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchImpl = options.fetch ?? ((...args) => fetch(...args));
  }

  get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...options, method: HttpMethod.Get });
  }

  post<T>(path: string, body?: unknown, options: RequestOptions = {}) {
    return this.request<T>(path, { ...options, body, method: HttpMethod.Post });
  }

  patch<T>(path: string, body?: unknown, options: RequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      body,
      method: HttpMethod.Patch,
    });
  }

  delete<T>(path: string, options: RequestOptions = {}) {
    return this.request<T>(path, { ...options, method: HttpMethod.Delete });
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = HttpMethod.Get, body, signal } = options;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (options.idempotencyKey) {
      headers[IDEMPOTENCY_KEY_HEADER] = options.idempotencyKey;
    }
    const tokens = await this.options.tokenStore?.get();
    if (tokens) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    // One controller for both the timeout and the caller's signal.
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeoutMs);
    const forwardAbort = () => controller.abort();
    if (signal?.aborted) {
      controller.abort();
    } else {
      signal?.addEventListener('abort', forwardAbort);
    }

    let response: Response;
    let text: string;
    try {
      response = await this.fetchImpl(this.url(path, options.query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      text = await response.text();
    } catch {
      throw new DomainError(
        AppErrorCode.Network,
        timedOut
          ? 'The request timed out. Check your connection and try again.'
          : signal?.aborted
          ? 'The request was cancelled.'
          : 'You appear to be offline. Check your connection and try again.',
      );
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', forwardAbort);
    }

    const payload = parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        await this.options.tokenStore?.clear();
      }
      throw errorForStatus(response.status, payload);
    }
    if (text && payload === undefined) {
      throw new DomainError(
        AppErrorCode.Unknown,
        'The server sent a response the app could not read.',
      );
    }
    return payload as T;
  }

  private url(path: string, query: RequestOptions['query']): string {
    const url = `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
    const pairs = Object.entries(query ?? {}).filter(
      (pair): pair is [string, string | number | boolean] =>
        pair[1] !== undefined,
    );
    if (pairs.length === 0) {
      return url;
    }
    const search = pairs
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      )
      .join('&');
    return `${url}?${search}`;
  }
}
