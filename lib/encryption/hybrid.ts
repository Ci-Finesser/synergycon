/**
 * Hybrid Encryption Module
 * 
 * Implements RSA-OAEP + AES-GCM hybrid encryption for end-to-end encryption.
 * Uses asymmetric encryption for key exchange and symmetric encryption for data.
 * 
 * Features:
 * - RSA key pair generation (2048-4096 bits)
 * - Hybrid encryption (RSA + AES)
 * - Public key encryption
 * - Private key decryption
 * - Key serialization/deserialization
 * - Perfect for end-to-end encrypted messaging
 * 
 * @module hybrid-encryption
 */

import type { KeyPair, SerializedKeyPair, HybridEncryptedData } from '@/types/encryption'

// Re-export for backward compatibility
export type { KeyPair, SerializedKeyPair, HybridEncryptedData }

// Constants
const RSA_ALGORITHM = 'RSA-OAEP';
const RSA_KEY_SIZE = 2048; // bits (can be 2048, 3072, or 4096)
const AES_ALGORITHM = 'AES-GCM';
const AES_KEY_SIZE = 256; // bits
const IV_LENGTH = 12; // bytes

/**
 * Check if Web Crypto API is available
 */
function isWebCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.crypto !== 'undefined' && 
         typeof window.crypto.subtle !== 'undefined';
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
 * Generate an RSA key pair for asymmetric encryption
 * 
 * @param keySize - RSA key size in bits (2048, 3072, or 4096)
 * @param extractable - Whether keys can be exported
 * @returns Promise with key pair
 * 
 * @example
 * const keyPair = await generateKeyPair();
 * // Store publicKey for encryption, keep privateKey secure
 */
export async function generateKeyPair(
  keySize: number = RSA_KEY_SIZE,
  extractable: boolean = true
): Promise<KeyPair> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: RSA_ALGORITHM,
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256'
    },
    extractable,
    ['encrypt', 'decrypt']
  );
  
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey
  };
}

/**
 * Export a public key to base64 format
 * 
 * @param publicKey - Public key to export
 * @returns Promise with base64 encoded public key
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const exported = await window.crypto.subtle.exportKey('spki', publicKey);
  return bufferToBase64(exported);
}

/**
 * Export a private key to base64 format
 * 
 * @param privateKey - Private key to export
 * @returns Promise with base64 encoded private key
 */
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
  return bufferToBase64(exported);
}

/**
 * Import a public key from base64 format
 * 
 * @param keyData - Base64 encoded public key
 * @returns Promise with imported public key
 */
export async function importPublicKey(keyData: string): Promise<CryptoKey> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const keyBuffer = base64ToBuffer(keyData);
  
  return await window.crypto.subtle.importKey(
    'spki',
    keyBuffer,
    {
      name: RSA_ALGORITHM,
      hash: 'SHA-256'
    },
    true,
    ['encrypt']
  );
}

/**
 * Import a private key from base64 format
 * 
 * @param keyData - Base64 encoded private key
 * @returns Promise with imported private key
 */
export async function importPrivateKey(keyData: string): Promise<CryptoKey> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const keyBuffer = base64ToBuffer(keyData);
  
  return await window.crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: RSA_ALGORITHM,
      hash: 'SHA-256'
    },
    true,
    ['decrypt']
  );
}

/**
 * Export a key pair to serialized format
 * 
 * @param keyPair - Key pair to export
 * @returns Promise with serialized key pair
 */
export async function exportKeyPair(keyPair: KeyPair): Promise<SerializedKeyPair> {
  const [publicKey, privateKey] = await Promise.all([
    exportPublicKey(keyPair.publicKey),
    exportPrivateKey(keyPair.privateKey)
  ]);
  
  return { publicKey, privateKey };
}

/**
 * Import a key pair from serialized format
 * 
 * @param serialized - Serialized key pair
 * @returns Promise with key pair
 */
export async function importKeyPair(serialized: SerializedKeyPair): Promise<KeyPair> {
  const [publicKey, privateKey] = await Promise.all([
    importPublicKey(serialized.publicKey),
    importPrivateKey(serialized.privateKey)
  ]);
  
  return { publicKey, privateKey };
}

/**
 * Encrypt data using hybrid encryption (RSA + AES)
 * 
 * Process:
 * 1. Generate random AES key
 * 2. Encrypt data with AES key
 * 3. Encrypt AES key with RSA public key
 * 
 * @param data - Data to encrypt (string or ArrayBuffer)
 * @param publicKey - RSA public key for encryption
 * @returns Promise with hybrid encrypted data
 * 
 * @example
 * const encrypted = await encryptWithPublicKey('secret message', publicKey);
 * // Send encrypted data to recipient who has the private key
 */
export async function encryptWithPublicKey(
  data: string | ArrayBuffer,
  publicKey: CryptoKey
): Promise<HybridEncryptedData> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  // Generate random AES key
  const aesKey = await window.crypto.subtle.generateKey(
    {
      name: AES_ALGORITHM,
      length: AES_KEY_SIZE
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Generate random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Convert data to buffer
  const dataBuffer = typeof data === 'string' ? stringToBuffer(data) : data;
  
  // Encrypt data with AES key
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: AES_ALGORITHM,
      iv
    },
    aesKey,
    dataBuffer
  );
  
  // Export AES key to raw format
  const aesKeyBuffer = await window.crypto.subtle.exportKey('raw', aesKey);
  
  // Encrypt AES key with RSA public key
  const encryptedKey = await window.crypto.subtle.encrypt(
    {
      name: RSA_ALGORITHM
    },
    publicKey,
    aesKeyBuffer
  );
  
  return {
    encryptedKey: bufferToBase64(encryptedKey),
    encryptedData: bufferToBase64(encryptedData),
    iv: bufferToBase64(iv.buffer as ArrayBuffer),
    timestamp: Date.now()
  };
}

/**
 * Decrypt data using hybrid encryption (RSA + AES)
 * 
 * Process:
 * 1. Decrypt AES key using RSA private key
 * 2. Decrypt data using decrypted AES key
 * 
 * @param encryptedData - Hybrid encrypted data
 * @param privateKey - RSA private key for decryption
 * @returns Promise with decrypted data as string
 * 
 * @example
 * const decrypted = await decryptWithPrivateKey(encryptedData, privateKey);
 */
export async function decryptWithPrivateKey(
  encryptedData: HybridEncryptedData,
  privateKey: CryptoKey
): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  // Decode encrypted data
  const encryptedKeyBuffer = base64ToBuffer(encryptedData.encryptedKey);
  const encryptedDataBuffer = base64ToBuffer(encryptedData.encryptedData);
  const iv = base64ToBuffer(encryptedData.iv);
  
  // Decrypt AES key with RSA private key
  const aesKeyBuffer = await window.crypto.subtle.decrypt(
    {
      name: RSA_ALGORITHM
    },
    privateKey,
    encryptedKeyBuffer
  );
  
  // Import AES key
  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    aesKeyBuffer,
    {
      name: AES_ALGORITHM,
      length: AES_KEY_SIZE
    },
    false,
    ['decrypt']
  );
  
  // Decrypt data with AES key
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: AES_ALGORITHM,
      iv
    },
    aesKey,
    encryptedDataBuffer
  );
  
  return bufferToString(decryptedData);
}

/**
 * Encrypt JSON data with public key
 * 
 * @param data - Object to encrypt
 * @param publicKey - RSA public key
 * @returns Promise with encrypted data
 */
export async function encryptJSONWithPublicKey<T = any>(
  data: T,
  publicKey: CryptoKey
): Promise<HybridEncryptedData> {
  const json = JSON.stringify(data);
  return await encryptWithPublicKey(json, publicKey);
}

/**
 * Decrypt JSON data with private key
 * 
 * @param encryptedData - Encrypted data
 * @param privateKey - RSA private key
 * @returns Promise with parsed object
 */
export async function decryptJSONWithPrivateKey<T = any>(
  encryptedData: HybridEncryptedData,
  privateKey: CryptoKey
): Promise<T> {
  const json = await decryptWithPrivateKey(encryptedData, privateKey);
  return JSON.parse(json);
}

/**
 * Sign data with private key (for authentication)
 * 
 * @param data - Data to sign
 * @param privateKey - RSA private key
 * @returns Promise with signature in base64
 */
export async function signData(
  data: string | ArrayBuffer,
  privateKey: CryptoKey
): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const dataBuffer = typeof data === 'string' ? stringToBuffer(data) : data;
  
  const signature = await window.crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32
    },
    privateKey,
    dataBuffer
  );
  
  return bufferToBase64(signature);
}

/**
 * Verify signature with public key
 * 
 * @param data - Original data
 * @param signature - Signature in base64
 * @param publicKey - RSA public key
 * @returns Promise with verification result
 */
export async function verifySignature(
  data: string | ArrayBuffer,
  signature: string,
  publicKey: CryptoKey
): Promise<boolean> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }
  
  const dataBuffer = typeof data === 'string' ? stringToBuffer(data) : data;
  const signatureBuffer = base64ToBuffer(signature);
  
  return await window.crypto.subtle.verify(
    {
      name: 'RSA-PSS',
      saltLength: 32
    },
    publicKey,
    signatureBuffer,
    dataBuffer
  );
}

/**
 * Secure key pair manager for client-side storage
 */
export class HybridKeyManager {
  private static readonly STORAGE_KEY_PREFIX = '__hybrid_key_';
  
  /**
   * Generate and store a new key pair
   * 
   * @param keyId - Unique identifier for this key pair
   * @param keySize - RSA key size (default: 2048)
   * @returns Promise with generated key pair
   */
  static async generateAndStore(keyId: string, keySize?: number): Promise<KeyPair> {
    const keyPair = await generateKeyPair(keySize);
    await this.storeKeyPair(keyId, keyPair);
    return keyPair;
  }
  
  /**
   * Store a key pair securely
   * 
   * @param keyId - Unique identifier
   * @param keyPair - Key pair to store
   */
  static async storeKeyPair(keyId: string, keyPair: KeyPair): Promise<void> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      throw new Error('SessionStorage is not available');
    }
    
    const serialized = await exportKeyPair(keyPair);
    sessionStorage.setItem(
      `${this.STORAGE_KEY_PREFIX}${keyId}`,
      JSON.stringify(serialized)
    );
  }
  
  /**
   * Retrieve a stored key pair
   * 
   * @param keyId - Unique identifier
   * @returns Promise with key pair or null if not found
   */
  static async retrieveKeyPair(keyId: string): Promise<KeyPair | null> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      throw new Error('SessionStorage is not available');
    }
    
    const stored = sessionStorage.getItem(`${this.STORAGE_KEY_PREFIX}${keyId}`);
    if (!stored) {
      return null;
    }
    
    try {
      const serialized = JSON.parse(stored) as SerializedKeyPair;
      return await importKeyPair(serialized);
    } catch (error) {
      console.error('Failed to retrieve key pair:', error);
      return null;
    }
  }
  
  /**
   * Remove a stored key pair
   * 
   * @param keyId - Unique identifier
   */
  static removeKeyPair(keyId: string): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    sessionStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${keyId}`);
  }
  
  /**
   * Clear all stored key pairs
   */
  static clearAll(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    const keys = Object.keys(sessionStorage);
    for (const key of keys) {
      if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    }
  }
}
