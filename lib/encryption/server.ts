/**
 * Server-Side Encryption Library
 * 
 * Provides robust encryption/decryption utilities for sensitive data at rest.
 * Uses AES-256-GCM for encryption and PBKDF2 for key derivation.
 * 
 * Security Features:
 * - AES-256-GCM encryption (authenticated encryption)
 * - Unique IV for each encryption
 * - PBKDF2 key derivation with salt
 * - Constant-time comparison for security
 * - Automatic key rotation support
 * - Secure random generation
 * 
 * @module server-encryption
 */

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync, createHmac } from 'crypto';
import type { EncryptedData, EncryptionOptions, DecryptionOptions } from '@/types/encryption'

// Re-export for backward compatibility
export type { EncryptedData, EncryptionOptions, DecryptionOptions }

// Encryption constants
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits / 8 = 32 bytes
const IV_LENGTH = 16; // 128 bits / 8 = 16 bytes
const SALT_LENGTH = 16; // 128 bits / 8 = 16 bytes
const PBKDF2_ITERATIONS = 100000;
const ENCODING = 'hex' as const;

/**
 * Get the primary encryption key from environment
 * Falls back to a generated key in development (NOT for production!)
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (!envKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY environment variable is required in production');
    }
    console.warn('⚠️  WARNING: Using generated encryption key. Set ENCRYPTION_KEY in production!');
    // Generate a key for development only
    return randomBytes(KEY_LENGTH);
  }
  
  // Decode the base64 key
  const key = Buffer.from(envKey, 'base64');
  
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (256 bits)`);
  }
  
  return key;
}

/**
 * Get encryption key by version (supports key rotation)
 */
function getKeyByVersion(version?: number): Buffer {
  if (version === undefined) {
    return getEncryptionKey();
  }
  
  // Support multiple key versions for rotation
  const versionKey = process.env[`ENCRYPTION_KEY_V${version}`];
  if (versionKey) {
    const key = Buffer.from(versionKey, 'base64');
    if (key.length !== KEY_LENGTH) {
      throw new Error(`Encryption key v${version} must be ${KEY_LENGTH} bytes`);
    }
    return key;
  }
  
  // Fall back to primary key
  return getEncryptionKey();
}

/**
 * Derive a key from a password using PBKDF2
 * 
 * @param password - Password to derive key from
 * @param salt - Salt for key derivation (generates new if not provided)
 * @returns Object containing derived key and salt
 */
export function deriveKey(password: string, salt?: Buffer): { key: Buffer; salt: Buffer } {
  const actualSalt = salt || randomBytes(SALT_LENGTH);
  const key = pbkdf2Sync(password, actualSalt as any, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  
  return { key, salt: actualSalt };
}

/**
 * Encrypt data using AES-256-GCM
 * 
 * @param data - Data to encrypt (string or Buffer)
 * @param options - Encryption options
 * @returns Encrypted data with metadata
 * 
 * @example
 * const encrypted = await encrypt('sensitive data');
 * // Store encrypted.encrypted, encrypted.iv, encrypted.authTag
 */
export function encrypt(
  data: string | Buffer,
  options: EncryptionOptions = {}
): EncryptedData {
  try {
    // Get or generate encryption key
    const key = options.key || getKeyByVersion(options.version);
    
    // Generate random IV
    const iv = randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key as any, iv as any);
    
    // Add additional authenticated data if provided
    if (options.aad) {
      cipher.setAAD(options.aad as any);
    }
    
    // Convert data to buffer if string
    const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    
    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(dataBuffer as any),
      cipher.final()
    ] as any);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted.toString(ENCODING),
      iv: iv.toString(ENCODING),
      authTag: authTag.toString(ENCODING),
      timestamp: Date.now(),
      version: options.version
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt data with a password (includes salt)
 * 
 * @param data - Data to encrypt
 * @param password - Password for encryption
 * @returns Encrypted data with salt
 */
export function encryptWithPassword(
  data: string | Buffer,
  password: string
): EncryptedData {
  const { key, salt } = deriveKey(password);
  const result = encrypt(data, { key });
  
  return {
    ...result,
    salt: salt.toString(ENCODING)
  };
}

/**
 * Decrypt data using AES-256-GCM
 * 
 * @param encryptedData - Encrypted data object
 * @param options - Decryption options
 * @returns Decrypted data as string
 * 
 * @example
 * const decrypted = await decrypt(encryptedData);
 */
export function decrypt(
  encryptedData: EncryptedData,
  options: DecryptionOptions = {}
): string {
  try {
    // Check age if maxAge is specified
    if (options.maxAge && options.maxAge > 0) {
      const age = Date.now() - encryptedData.timestamp;
      if (age > options.maxAge) {
        throw new Error('Encrypted data has expired');
      }
    }
    
    // Get decryption key
    const key = options.key || getKeyByVersion(encryptedData.version);
    
    // Decode encrypted data
    const encrypted = Buffer.from(encryptedData.encrypted, ENCODING);
    const iv = Buffer.from(encryptedData.iv, ENCODING);
    const authTag = Buffer.from(encryptedData.authTag, ENCODING);
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key as any, iv as any);
    decipher.setAuthTag(authTag as any);
    
    // Add additional authenticated data if provided
    if (options.aad) {
      decipher.setAAD(options.aad as any);
    }
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted as any),
      decipher.final()
    ] as any);
    
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data encrypted with a password
 * 
 * @param encryptedData - Encrypted data with salt
 * @param password - Password for decryption
 * @returns Decrypted data
 */
export function decryptWithPassword(
  encryptedData: EncryptedData,
  password: string
): string {
  if (!encryptedData.salt) {
    throw new Error('Salt is required for password-based decryption');
  }
  
  const salt = Buffer.from(encryptedData.salt, ENCODING);
  const { key } = deriveKey(password, salt);
  
  return decrypt(encryptedData, { key });
}

/**
 * Hash data using SHA-256
 * 
 * @param data - Data to hash
 * @returns Hash in hexadecimal
 */
export function hash(data: string | Buffer): string {
  return createHmac('sha256', getEncryptionKey() as any)
    .update(typeof data === 'string' ? Buffer.from(data, 'utf8') : (data as any))
    .digest('hex');
}

/**
 * Create a secure token
 * 
 * @param length - Token length in bytes (default: 32)
 * @returns Secure random token in base64
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString(ENCODING);
}

/**
 * Compare two strings in constant time to prevent timing attacks
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
 * Encrypt JSON data
 * 
 * @param data - Object to encrypt
 * @param options - Encryption options
 * @returns Encrypted data
 */
export function encryptJSON<T = any>(
  data: T,
  options: EncryptionOptions = {}
): EncryptedData {
  const json = JSON.stringify(data);
  return encrypt(json, options);
}

/**
 * Decrypt JSON data
 * 
 * @param encryptedData - Encrypted data
 * @param options - Decryption options
 * @returns Parsed object
 */
export function decryptJSON<T = any>(
  encryptedData: EncryptedData,
  options: DecryptionOptions = {}
): T {
  const json = decrypt(encryptedData, options);
  return JSON.parse(json);
}

/**
 * Encrypt sensitive fields in an object
 * 
 * @param obj - Object with fields to encrypt
 * @param fields - Array of field names to encrypt
 * @param options - Encryption options
 * @returns Object with encrypted fields
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  options: EncryptionOptions = {}
): Record<string, any> {
  const result: Record<string, any> = { ...obj };
  
  for (const field of fields) {
    if (obj[field] !== undefined && obj[field] !== null) {
      const value = typeof obj[field] === 'string' 
        ? obj[field] 
        : JSON.stringify(obj[field]);
      
      result[field as string] = encrypt(value, options);
    }
  }
  
  return result;
}

/**
 * Decrypt sensitive fields in an object
 * 
 * @param obj - Object with encrypted fields
 * @param fields - Array of field names to decrypt
 * @param options - Decryption options
 * @returns Object with decrypted fields
 */
export function decryptFields<T extends Record<string, any>>(
  obj: Record<string, any>,
  fields: string[],
  options: DecryptionOptions = {}
): Partial<T> {
  const result: Record<string, any> = { ...obj };
  
  for (const field of fields) {
    if (obj[field] && typeof obj[field] === 'object' && 'encrypted' in obj[field]) {
      try {
        const decrypted = decrypt(obj[field], options);
        
        // Try to parse as JSON, otherwise use as string
        try {
          result[field] = JSON.parse(decrypted);
        } catch {
          result[field] = decrypted;
        }
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        result[field] = null;
      }
    }
  }
  
  return result as Partial<T>;
}

/**
 * Generate a new encryption key
 * 
 * @returns New encryption key in base64
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Encrypt data for database storage
 * Convenience wrapper with consistent options
 */
export function encryptForStorage(data: string | Buffer): string {
  const encrypted = encrypt(data);
  return JSON.stringify(encrypted);
}

/**
 * Decrypt data from database storage
 * Convenience wrapper with consistent options
 */
export function decryptFromStorage(encryptedString: string): string {
  const encrypted = JSON.parse(encryptedString) as EncryptedData;
  return decrypt(encrypted);
}

/**
 * Key rotation helper - re-encrypt data with new key
 * 
 * @param encryptedData - Data encrypted with old key
 * @param oldVersion - Old key version
 * @param newVersion - New key version
 * @returns Data encrypted with new key
 */
export function rotateKey(
  encryptedData: EncryptedData,
  oldVersion: number,
  newVersion: number
): EncryptedData {
  // Decrypt with old key
  const decrypted = decrypt(encryptedData, { key: getKeyByVersion(oldVersion) });
  
  // Re-encrypt with new key
  return encrypt(decrypted, { version: newVersion });
}
