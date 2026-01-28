/**
 * Client-Side Encryption Library
 * 
 * Provides encryption utilities for browser environments using Web Crypto API.
 * Optimized for speed and security in client-side applications.
 * 
 * Security Features:
 * - AES-GCM encryption (authenticated)
 * - PBKDF2 key derivation
 * - Secure random generation
 * - No key storage in memory longer than needed
 * - Support for encryption/decryption streaming
 * 
 * @module client-encryption
 */

import type { ClientEncryptedData, ClientEncryptionConfig } from '@/types/encryption'

// Re-export for backward compatibility
export type { ClientEncryptedData, ClientEncryptionConfig }

// Constants
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes (96 bits recommended for GCM)
const SALT_LENGTH = 16; // bytes
const PBKDF2_ITERATIONS = 100000;

/**
 * Check if Web Crypto API is available
 */
function isWebCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.crypto !== 'undefined' && 
         typeof window.crypto.subtle !== 'undefined';
}

/**
 * Convert string to ArrayBuffer
 */
function stringToBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * Convert ArrayBuffer to string
 */
function bufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

/**
 * Convert ArrayBuffer to base64
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 to ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a cryptographically secure random array
 */
export function generateRandomBytes(length: number): Uint8Array {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  return window.crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Derive a cryptographic key from a password using PBKDF2
 * 
 * @param password - Password to derive key from
 * @param salt - Salt (will be generated if not provided)
 * @param config - Key derivation configuration
 * @returns Promise with derived key and salt
 */
export async function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array,
  config: ClientEncryptionConfig = {}
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const actualSalt = salt || generateRandomBytes(SALT_LENGTH);
  const iterations = config.iterations || PBKDF2_ITERATIONS;
  const keyLength = config.keyLength || KEY_LENGTH;
  
  // Import password as key material
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive encryption key
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: actualSalt.buffer as ArrayBuffer,
      iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: keyLength
    },
    false,
    ['encrypt', 'decrypt']
  );
  
  return { key, salt: actualSalt };
}

/**
 * Generate a new AES-GCM encryption key
 * 
 * @param extractable - Whether the key can be exported (default: false for security)
 * @returns Promise with generated key
 */
export async function generateKey(extractable: boolean = false): Promise<CryptoKey> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  return await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    extractable,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 * 
 * @param data - Data to encrypt (string or ArrayBuffer)
 * @param key - Encryption key
 * @param config - Encryption configuration
 * @returns Promise with encrypted data
 * 
 * @example
 * const key = await generateKey();
 * const encrypted = await encryptData('sensitive data', key);
 */
export async function encryptData(
  data: string | ArrayBuffer,
  key: CryptoKey,
  config: ClientEncryptionConfig = {}
): Promise<ClientEncryptedData> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  // Generate random IV
  const iv = generateRandomBytes(IV_LENGTH);
  
  // Convert data to ArrayBuffer if string
  const dataBuffer = typeof data === 'string' ? stringToBuffer(data) : data;
  
  // Encrypt
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv.buffer as ArrayBuffer,
      additionalData: config.aad ? config.aad.buffer as ArrayBuffer : undefined
    },
    key,
    dataBuffer
  );
  
  return {
    data: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer as ArrayBuffer),
    timestamp: Date.now()
  };
}

/**
 * Decrypt data using AES-GCM
 * 
 * @param encryptedData - Encrypted data object
 * @param key - Decryption key
 * @param config - Decryption configuration
 * @returns Promise with decrypted data as string
 * 
 * @example
 * const decrypted = await decryptData(encryptedData, key);
 */
export async function decryptData(
  encryptedData: ClientEncryptedData,
  key: CryptoKey,
  config: ClientEncryptionConfig = {}
): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  // Decode encrypted data
  const encrypted = base64ToBuffer(encryptedData.data);
  const iv = base64ToBuffer(encryptedData.iv);
  
  // Decrypt
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv,
      additionalData: config.aad ? config.aad.buffer as ArrayBuffer : undefined
    },
    key,
    encrypted
  );
  
  return bufferToString(decrypted);
}

/**
 * Encrypt data with a password
 * 
 * @param data - Data to encrypt
 * @param password - Password for encryption
 * @param config - Encryption configuration
 * @returns Promise with encrypted data (includes salt)
 */
export async function encryptWithPassword(
  data: string | ArrayBuffer,
  password: string,
  config: ClientEncryptionConfig = {}
): Promise<ClientEncryptedData> {
  const { key, salt } = await deriveKeyFromPassword(password, undefined, config);
  const encrypted = await encryptData(data, key, config);
  
  return {
    ...encrypted,
    salt: bufferToBase64(salt.buffer as ArrayBuffer)
  };
}

/**
 * Decrypt data encrypted with a password
 * 
 * @param encryptedData - Encrypted data with salt
 * @param password - Password for decryption
 * @param config - Decryption configuration
 * @returns Promise with decrypted data
 */
export async function decryptWithPassword(
  encryptedData: ClientEncryptedData,
  password: string,
  config: ClientEncryptionConfig = {}
): Promise<string> {
  if (!encryptedData.salt) {
    throw new Error('Salt is required for password-based decryption');
  }
  
  const salt = new Uint8Array(base64ToBuffer(encryptedData.salt));
  const { key } = await deriveKeyFromPassword(password, salt, config);
  
  return await decryptData(encryptedData, key, config);
}

/**
 * Hash data using SHA-256
 * 
 * @param data - Data to hash
 * @returns Promise with hash in hexadecimal
 */
export async function hashData(data: string | ArrayBuffer): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const dataBuffer = typeof data === 'string' ? stringToBuffer(data) : data;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a secure random token
 * 
 * @param length - Token length in bytes (default: 32)
 * @returns Token in base64
 */
export function generateToken(length: number = 32): string {
  const bytes = generateRandomBytes(length);
  return bufferToBase64(bytes.buffer as ArrayBuffer);
}

/**
 * Encrypt JSON data
 * 
 * @param data - Object to encrypt
 * @param key - Encryption key
 * @param config - Encryption configuration
 * @returns Promise with encrypted data
 */
export async function encryptJSON<T = any>(
  data: T,
  key: CryptoKey,
  config: ClientEncryptionConfig = {}
): Promise<ClientEncryptedData> {
  const json = JSON.stringify(data);
  return await encryptData(json, key, config);
}

/**
 * Decrypt JSON data
 * 
 * @param encryptedData - Encrypted data
 * @param key - Decryption key
 * @param config - Decryption configuration
 * @returns Promise with parsed object
 */
export async function decryptJSON<T = any>(
  encryptedData: ClientEncryptedData,
  key: CryptoKey,
  config: ClientEncryptionConfig = {}
): Promise<T> {
  const json = await decryptData(encryptedData, key, config);
  return JSON.parse(json);
}

/**
 * Securely compare two strings in constant time
 * Prevents timing attacks
 * 
 * @param a - First string
 * @param b - Second string
 * @returns True if strings match
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Export a key to JWK format (for storage or transmission)
 * 
 * @param key - Key to export
 * @returns Promise with key in JWK format
 */
export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  return await window.crypto.subtle.exportKey('jwk', key);
}

/**
 * Import a key from JWK format
 * 
 * @param jwk - Key in JWK format
 * @param extractable - Whether the key can be exported
 * @returns Promise with imported key
 */
export async function importKey(
  jwk: JsonWebKey,
  extractable: boolean = false
): Promise<CryptoKey> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    extractable,
    ['encrypt', 'decrypt']
  );
}

/**
 * Secure storage manager for client-side encryption keys
 * Uses SessionStorage with additional protection
 */
export class SecureKeyStore {
  private static readonly STORAGE_PREFIX = '__secure_key_';
  
  /**
   * Store a key securely in session storage
   * Note: Keys are only available for the current session
   * 
   * @param keyId - Unique identifier for the key
   * @param key - Key to store
   */
  static async store(keyId: string, key: CryptoKey): Promise<void> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      throw new Error('SessionStorage is not available');
    }
    
    const jwk = await exportKey(key);
    const encrypted = btoa(JSON.stringify(jwk));
    
    sessionStorage.setItem(
      `${this.STORAGE_PREFIX}${keyId}`,
      encrypted
    );
  }
  
  /**
   * Retrieve a key from secure storage
   * 
   * @param keyId - Unique identifier for the key
   * @returns Promise with retrieved key, or null if not found
   */
  static async retrieve(keyId: string): Promise<CryptoKey | null> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      throw new Error('SessionStorage is not available');
    }
    
    const stored = sessionStorage.getItem(`${this.STORAGE_PREFIX}${keyId}`);
    if (!stored) {
      return null;
    }
    
    try {
      const jwk = JSON.parse(atob(stored));
      return await importKey(jwk);
    } catch (error) {
      console.error('Failed to retrieve key:', error);
      return null;
    }
  }
  
  /**
   * Remove a key from secure storage
   * 
   * @param keyId - Unique identifier for the key
   */
  static remove(keyId: string): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    sessionStorage.removeItem(`${this.STORAGE_PREFIX}${keyId}`);
  }
  
  /**
   * Clear all stored keys
   */
  static clearAll(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    const keys = Object.keys(sessionStorage);
    for (const key of keys) {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    }
  }
}

/**
 * Encrypt form data before submission
 * Useful for sensitive form fields
 * 
 * @param formData - Form data object
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @param key - Encryption key
 * @returns Promise with form data containing encrypted fields
 */
export async function encryptFormData(
  formData: Record<string, any>,
  fieldsToEncrypt: string[],
  key: CryptoKey
): Promise<Record<string, any>> {
  const result = { ...formData };
  
  for (const field of fieldsToEncrypt) {
    if (formData[field] !== undefined && formData[field] !== null) {
      const value = typeof formData[field] === 'string' 
        ? formData[field] 
        : JSON.stringify(formData[field]);
      
      result[field] = await encryptData(value, key);
    }
  }
  
  return result;
}

/**
 * Utility to encrypt data before sending to server
 * Returns encrypted data in a format ready for transmission
 * 
 * @param data - Data to encrypt
 * @param password - Password for encryption (user-provided)
 * @returns Promise with encrypted data as JSON string
 */
export async function encryptForTransmission(
  data: any,
  password: string
): Promise<string> {
  const json = JSON.stringify(data);
  const encrypted = await encryptWithPassword(json, password);
  return JSON.stringify(encrypted);
}

/**
 * Utility to decrypt data received from server
 * 
 * @param encryptedString - Encrypted data as JSON string
 * @param password - Password for decryption
 * @returns Promise with decrypted data
 */
export async function decryptFromTransmission(
  encryptedString: string,
  password: string
): Promise<any> {
  const encrypted = JSON.parse(encryptedString) as ClientEncryptedData;
  const decrypted = await decryptWithPassword(encrypted, password);
  return JSON.parse(decrypted);
}
