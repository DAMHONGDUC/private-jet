/** What the backend hands out at sign-in; the HTTP client sends `accessToken` as a bearer token. */
export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

/**
 * Where the member's tokens live between requests. Async because the real
 * store is: an HTTP auth data source writes here at sign-in and clears it at
 * sign-out, and the HTTP client reads it on every call and clears it on a 401.
 */
export interface TokenStore {
  get(): Promise<AuthTokens | null>;
  set(tokens: AuthTokens): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Tokens in memory, gone when the app restarts. Fine for tests and the mock
 * build; the shipping choice is a keychain-backed store (iOS Keychain,
 * Android Keystore, e.g. through react-native-keychain) so a session survives
 * a relaunch without the token sitting in plain storage.
 */
export class InMemoryTokenStore implements TokenStore {
  private tokens: AuthTokens | null = null;

  async get(): Promise<AuthTokens | null> {
    return this.tokens ? { ...this.tokens } : null;
  }

  async set(tokens: AuthTokens): Promise<void> {
    this.tokens = { ...tokens };
  }

  async clear(): Promise<void> {
    this.tokens = null;
  }
}
