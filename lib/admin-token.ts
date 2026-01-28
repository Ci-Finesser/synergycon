/**
 * Secure Admin Token Management
 *
 * Provides secure storage and retrieval of admin authentication tokens.
 * Uses encrypted localStorage for token persistence.
 *
 * @module admin-token
 */

import { secureStorageAsync } from './secure-storage';

const ADMIN_TOKEN_KEY = 'admin_auth_token';

// In-memory cache for synchronous access
let cachedToken: string | null = null;
let tokenLoadPromise: Promise<string | null> | null = null;

/**
 * Initialize and load the admin token into memory
 * Call this early in the app lifecycle for admin pages
 */
export async function initializeAdminToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  if (tokenLoadPromise) return tokenLoadPromise;

  tokenLoadPromise = (async () => {
    try {
      cachedToken = await secureStorageAsync.getItem(ADMIN_TOKEN_KEY);
      return cachedToken;
    } catch (error) {
      console.error('Failed to load admin token:', error);
      return null;
    } finally {
      tokenLoadPromise = null;
    }
  })();

  return tokenLoadPromise;
}

/**
 * Get the admin token (async - recommended)
 */
export async function getAdminToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  return initializeAdminToken();
}

/**
 * Get the admin token synchronously (uses cached value)
 * Returns null if token hasn't been loaded yet
 * Use getAdminToken() for reliable access
 */
export function getAdminTokenSync(): string | null {
  return cachedToken;
}

/**
 * Set the admin token (stores encrypted)
 */
export async function setAdminToken(token: string): Promise<void> {
  cachedToken = token;
  await secureStorageAsync.setItem(ADMIN_TOKEN_KEY, token);
}

/**
 * Clear the admin token (logout)
 */
export function clearAdminToken(): void {
  cachedToken = null;
  secureStorageAsync.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * Check if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminToken();
  return !!token;
}

/**
 * Create authorization headers with the admin token
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAdminToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Create authorization headers synchronously (uses cached token)
 * Throws if token is not cached
 */
export function getAuthHeadersSync(): HeadersInit {
  if (!cachedToken) {
    throw new Error('Token not loaded. Call initializeAdminToken() first.');
  }
  return {
    Authorization: `Bearer ${cachedToken}`,
  };
}

/**
 * React hook helper - use in useEffect to initialize token
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   initializeAdminToken().then(token => {
 *     if (!token) router.push('/login');
 *   });
 * }, []);
 * ```
 */
export { initializeAdminToken as useAdminTokenInit };
