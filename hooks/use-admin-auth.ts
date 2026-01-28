/**
 * useAdminAuth Hook
 *
 * Provides secure admin authentication state and API utilities.
 * Uses encrypted storage for token persistence.
 *
 * @module hooks/use-admin-auth
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  initializeAdminToken,
} from '@/lib/admin-token';

interface UseAdminAuthReturn {
  /** Whether the auth state has been loaded */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The current admin token (null if not authenticated) */
  token: string | null;
  /** Login with a token */
  login: (token: string) => Promise<void>;
  /** Logout and clear token */
  logout: () => void;
  /** Make an authenticated fetch request */
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  /** Get authorization headers */
  getAuthHeaders: () => HeadersInit;
}

/**
 * Hook for managing admin authentication with secure token storage
 *
 * @example
 * ```tsx
 * function AdminPage() {
 *   const { isLoading, isAuthenticated, authFetch, logout } = useAdminAuth();
 *
 *   if (isLoading) return <Loading />;
 *   if (!isAuthenticated) return <Redirect to="/login" />;
 *
 *   const fetchData = async () => {
 *     const response = await authFetch('/api/admin/data');
 *     const data = await response.json();
 *   };
 *
 *   return <AdminContent />;
 * }
 * ```
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Initialize token on mount
  useEffect(() => {
    initializeAdminToken()
      .then((loadedToken) => {
        setToken(loadedToken);
        tokenRef.current = loadedToken;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Login handler
  const login = useCallback(async (newToken: string) => {
    await setAdminToken(newToken);
    setToken(newToken);
    tokenRef.current = newToken;
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    clearAdminToken();
    setToken(null);
    tokenRef.current = null;
  }, []);

  // Get auth headers
  const getAuthHeaders = useCallback((): HeadersInit => {
    const currentToken = tokenRef.current;
    if (!currentToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${currentToken}`,
    };
  }, []);

  // Authenticated fetch
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const currentToken = tokenRef.current;
      if (!currentToken) {
        throw new Error('Not authenticated');
      }

      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${currentToken}`);

      return fetch(url, {
        ...options,
        headers,
      });
    },
    []
  );

  return {
    isLoading,
    isAuthenticated: !!token,
    token,
    login,
    logout,
    authFetch,
    getAuthHeaders,
  };
}

export default useAdminAuth;
