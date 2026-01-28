/**
 * Secure Local Storage Utility
 *
 * Provides encrypted localStorage with a familiar API.
 * Uses Web Crypto API for client-side encryption.
 *
 * Features:
 * - AES-GCM encryption for all stored data
 * - Automatic key derivation from app secret
 * - Same API as native localStorage
 * - SSR-safe (graceful no-op on server)
 * - Works with Zustand persist middleware
 * - Optional encryption bypass for non-sensitive data
 *
 * @module secure-storage
 */

import { ClientEncryption } from './encryption';

// Storage key for the derived encryption key
const KEY_STORAGE = '__synergycon_storage_key__';

// Prefix for encrypted items to identify them
const ENCRYPTED_PREFIX = '__enc__:';

// App-specific salt for key derivation (not secret, just unique to app)
const APP_SALT = 'synergycon-2026-secure-storage';

// Cache the encryption key in memory for performance
let cachedKey: CryptoKey | null = null;
let keyPromise: Promise<CryptoKey> | null = null;

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Check if Web Crypto is available
 */
function isCryptoAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined'
  );
}

/**
 * Generate a unique device/session identifier
 * This is used to derive the encryption key
 */
function getDeviceId(): string {
  if (!isBrowser()) return 'server';

  // Try to get existing device ID
  let deviceId = localStorage.getItem('__device_id__');

  if (!deviceId) {
    // Generate new device ID
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    deviceId = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join(
      ''
    );
    localStorage.setItem('__device_id__', deviceId);
  }

  return deviceId;
}

/**
 * Get or create the encryption key
 * The key is derived from a combination of app salt and device ID
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // Return cached key if available
  if (cachedKey) return cachedKey;

  // Return existing promise if key generation is in progress
  if (keyPromise) return keyPromise;

  keyPromise = (async () => {
    if (!isCryptoAvailable()) {
      throw new Error('Web Crypto API not available');
    }

    // Create a password from app salt and device ID
    const password = `${APP_SALT}:${getDeviceId()}`;

    // Check if we have a stored salt for this device
    let saltBase64 = localStorage.getItem(KEY_STORAGE);
    let salt: Uint8Array;

    if (saltBase64) {
      // Decode existing salt
      const binary = atob(saltBase64);
      salt = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        salt[i] = binary.charCodeAt(i);
      }
    } else {
      // Generate new salt
      salt = ClientEncryption.generateRandomBytes(16);
      // Store the salt (not secret, just needs to be consistent)
      let binary = '';
      for (let i = 0; i < salt.length; i++) {
        binary += String.fromCharCode(salt[i]);
      }
      localStorage.setItem(KEY_STORAGE, btoa(binary));
    }

    // Derive key from password
    const { key } = await ClientEncryption.deriveKeyFromPassword(password, salt);
    cachedKey = key;
    return key;
  })();

  try {
    return await keyPromise;
  } finally {
    keyPromise = null;
  }
}

/**
 * Encrypt a value for storage
 */
async function encryptValue(value: string): Promise<string> {
  const key = await getEncryptionKey();
  const encrypted = await ClientEncryption.encryptData(value, key);
  return ENCRYPTED_PREFIX + JSON.stringify(encrypted);
}

/**
 * Decrypt a value from storage
 */
async function decryptValue(encrypted: string): Promise<string> {
  if (!encrypted.startsWith(ENCRYPTED_PREFIX)) {
    // Return as-is if not encrypted (legacy data)
    return encrypted;
  }

  const key = await getEncryptionKey();
  const data = JSON.parse(encrypted.slice(ENCRYPTED_PREFIX.length));
  return await ClientEncryption.decryptData(data, key);
}

/**
 * Secure localStorage wrapper with async encryption
 *
 * Use this for explicitly encrypted storage operations
 */
export const secureStorageAsync = {
  /**
   * Get an item from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    if (!isBrowser()) return null;

    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return await decryptValue(encrypted);
    } catch (error) {
      console.warn(`Failed to decrypt storage key "${key}":`, error);
      // If decryption fails, remove the corrupted item
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Set an item in secure storage
   */
  async setItem(key: string, value: string): Promise<void> {
    if (!isBrowser()) return;

    try {
      const encrypted = await encryptValue(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`Failed to encrypt storage key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Remove an item from secure storage
   */
  removeItem(key: string): void {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
  },

  /**
   * Clear all items from storage
   */
  clear(): void {
    if (!isBrowser()) return;
    // Preserve device ID and key storage
    const deviceId = localStorage.getItem('__device_id__');
    const keySalt = localStorage.getItem(KEY_STORAGE);
    localStorage.clear();
    if (deviceId) localStorage.setItem('__device_id__', deviceId);
    if (keySalt) localStorage.setItem(KEY_STORAGE, keySalt);
  },
};

/**
 * Synchronous secure storage interface
 *
 * Uses a cache to provide synchronous access while
 * encrypting/decrypting in the background.
 *
 * Compatible with Zustand persist middleware.
 */
class SecureStorage implements Storage {
  private cache = new Map<string, string>();
  private pendingWrites = new Map<string, Promise<void>>();
  private initialized = false;

  get length(): number {
    if (!isBrowser()) return 0;
    return localStorage.length;
  }

  key(index: number): string | null {
    if (!isBrowser()) return null;
    return localStorage.key(index);
  }

  getItem(key: string): string | null {
    if (!isBrowser()) return null;

    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }

    // Get from localStorage
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    // If encrypted, decrypt in background and return null for now
    if (stored.startsWith(ENCRYPTED_PREFIX)) {
      // Start background decryption
      this.decryptAndCache(key, stored);
      // Return null on first access (will be cached on next access)
      return null;
    }

    // Return plain value
    return stored;
  }

  setItem(key: string, value: string): void {
    if (!isBrowser()) return;

    // Update cache immediately for synchronous access
    this.cache.set(key, value);

    // Encrypt and store in background
    const writePromise = (async () => {
      try {
        if (isCryptoAvailable()) {
          const encrypted = await encryptValue(value);
          localStorage.setItem(key, encrypted);
        } else {
          // Fallback to plain storage if crypto not available
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.error(`Secure storage write failed for "${key}":`, error);
        // Fallback to plain storage
        localStorage.setItem(key, value);
      }
    })();

    this.pendingWrites.set(key, writePromise);
  }

  removeItem(key: string): void {
    if (!isBrowser()) return;
    this.cache.delete(key);
    localStorage.removeItem(key);
  }

  clear(): void {
    if (!isBrowser()) return;
    this.cache.clear();
    secureStorageAsync.clear();
  }

  private async decryptAndCache(key: string, encrypted: string): Promise<void> {
    try {
      const decrypted = await decryptValue(encrypted);
      this.cache.set(key, decrypted);
    } catch (error) {
      console.warn(`Failed to decrypt "${key}", removing corrupted data`);
      localStorage.removeItem(key);
    }
  }

  /**
   * Initialize the secure storage by decrypting all encrypted items
   * Call this early in app initialization for best performance
   */
  async initialize(): Promise<void> {
    if (!isBrowser() || this.initialized) return;

    const decryptPromises: Promise<void>[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key);
      if (value?.startsWith(ENCRYPTED_PREFIX)) {
        decryptPromises.push(this.decryptAndCache(key, value));
      }
    }

    await Promise.all(decryptPromises);
    this.initialized = true;
  }

  /**
   * Wait for all pending writes to complete
   * Useful before navigation or when data consistency is critical
   */
  async flush(): Promise<void> {
    await Promise.all(this.pendingWrites.values());
    this.pendingWrites.clear();
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

/**
 * Create a Zustand persist storage adapter
 *
 * @example
 * ```typescript
 * import { create } from 'zustand'
 * import { persist } from 'zustand/middleware'
 * import { createSecureZustandStorage } from '@/lib/secure-storage'
 *
 * const useStore = create(
 *   persist(
 *     (set) => ({ ... }),
 *     {
 *       name: 'my-store',
 *       storage: createSecureZustandStorage(),
 *     }
 *   )
 * )
 * ```
 */
export function createSecureZustandStorage() {
  return {
    getItem: async (name: string): Promise<string | null> => {
      return secureStorageAsync.getItem(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
      return secureStorageAsync.setItem(name, value);
    },
    removeItem: (name: string): void => {
      secureStorageAsync.removeItem(name);
    },
  };
}

/**
 * Lightweight secure storage for simple key-value pairs
 * Non-sensitive data that still benefits from obfuscation
 */
export const securePreferences = {
  /**
   * Get a preference value
   */
  async get<T = string>(key: string): Promise<T | null> {
    const value = await secureStorageAsync.getItem(`pref:${key}`);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  /**
   * Set a preference value
   */
  async set<T = string>(key: string, value: T): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await secureStorageAsync.setItem(`pref:${key}`, serialized);
  },

  /**
   * Remove a preference
   */
  remove(key: string): void {
    secureStorageAsync.removeItem(`pref:${key}`);
  },
};

// Export types
export type { SecureStorage };
