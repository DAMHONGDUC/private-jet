import { AppErrorCode } from '@/core/error/app-error';
import { HttpClient, HttpMethod } from '@/core/http/http-client';
import { InMemoryTokenStore } from '@/core/http/token-store';

type FakeResponse = { ok: boolean; status: number; text: () => Promise<string> };

const respond = (status: number, body?: unknown): FakeResponse => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (body === undefined ? '' : JSON.stringify(body)),
});

function setup(
  handler: (url: string, init: RequestInit) => Promise<FakeResponse>,
  timeoutMs?: number,
) {
  const fetchMock = jest.fn(handler);
  const tokenStore = new InMemoryTokenStore();
  const client = new HttpClient({
    baseUrl: 'https://api.test/v1/',
    tokenStore,
    timeoutMs,
    fetch: fetchMock as unknown as typeof fetch,
  });
  return { client, fetchMock, tokenStore };
}

/** Never answers; rejects like fetch does once its signal aborts, or at once if it already has. */
const hang = (_url: string, init: RequestInit) =>
  new Promise<FakeResponse>((_resolve, reject) => {
    const abort = () =>
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    if (init.signal?.aborted) {
      abort();
    }
    init.signal?.addEventListener('abort', abort);
  });

test('sends JSON with the bearer token and the idempotency key, and parses the reply', async () => {
  const { client, fetchMock, tokenStore } = setup(async () =>
    respond(201, { id: 'bk-1' }),
  );
  await tokenStore.set({ accessToken: 'abc' });

  const result = await client.post<{ id: string }>(
    '/bookings',
    { seats: 2 },
    { idempotencyKey: 'key-1', query: { expand: 'legs', skip: undefined } },
  );

  expect(result).toEqual({ id: 'bk-1' });
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe('https://api.test/v1/bookings?expand=legs');
  expect(init.method).toBe(HttpMethod.Post);
  expect(init.body).toBe('{"seats":2}');
  expect(init.headers).toMatchObject({
    Authorization: 'Bearer abc',
    'Content-Type': 'application/json',
    'Idempotency-Key': 'key-1',
  });
});

test('an empty success body resolves to undefined', async () => {
  const { client } = setup(async () => respond(204));
  await expect(client.delete('/cards/1')).resolves.toBeUndefined();
});

test.each([
  [404, AppErrorCode.NotFound],
  [409, AppErrorCode.Validation],
  [422, AppErrorCode.Validation],
  [500, AppErrorCode.Unknown],
])('maps status %i to %s, keeping the server message', async (status, code) => {
  const { client } = setup(async () =>
    respond(status, { error: { message: 'From the server.' } }),
  );
  await expect(client.get('/x')).rejects.toMatchObject({
    name: 'DomainError',
    code,
    message: 'From the server.',
  });
});

test('a 401 clears the stored tokens and reports UNAUTHORIZED', async () => {
  const { client, tokenStore } = setup(async () => respond(401));
  await tokenStore.set({ accessToken: 'stale' });

  await expect(client.get('/me')).rejects.toMatchObject({
    code: AppErrorCode.Unauthorized,
  });
  expect(await tokenStore.get()).toBeNull();
});

test('a failed connection is a NETWORK error', async () => {
  const { client } = setup(async () => {
    throw new TypeError('Network request failed');
  });
  await expect(client.get('/x')).rejects.toMatchObject({
    code: AppErrorCode.Network,
    message: expect.stringContaining('offline'),
  });
});

test('a call that outlasts the timeout is aborted as a NETWORK error', async () => {
  const { client, fetchMock } = setup(hang, 5);
  await expect(client.get('/slow')).rejects.toMatchObject({
    code: AppErrorCode.Network,
    message: expect.stringContaining('timed out'),
  });
  expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(true);
});

test("the caller's signal aborts the call", async () => {
  const { client } = setup(hang);
  const controller = new AbortController();

  const call = client.get('/x', { signal: controller.signal });
  controller.abort();

  await expect(call).rejects.toMatchObject({
    code: AppErrorCode.Network,
    message: 'The request was cancelled.',
  });
});

test('a success body that is not JSON is UNKNOWN', async () => {
  const { client } = setup(async () => ({
    ok: true,
    status: 200,
    text: async () => '<html>',
  }));
  await expect(client.get('/x')).rejects.toMatchObject({
    code: AppErrorCode.Unknown,
  });
});
