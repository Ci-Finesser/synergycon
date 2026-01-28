/**
 * Encryption Library - Main Export
 * 
 * Provides unified access to encryption utilities for both
 * server-side (Node.js) and client-side (browser) environments.
 * 
 * @module encryption
 */

// Server-side encryption (Node.js crypto)
export * from './server';

// Client-side encryption (Web Crypto API)
export * as ClientEncryption from './client';

// Hybrid encryption utilities (export as namespace to avoid conflicts)
export * as HybridEncryption from './hybrid';

/**
 * Encryption library usage guide:
 * 
 * SERVER-SIDE (Node.js):
 * ```typescript
 * import { encrypt, decrypt } from '@/lib/encryption';
 * 
 * const encrypted = encrypt('sensitive data');
 * const decrypted = decrypt(encrypted);
 * ```
 * 
 * CLIENT-SIDE (Browser):
 * ```typescript
 * import { ClientEncryption } from '@/lib/encryption';
 * 
 * const key = await ClientEncryption.generateKey();
 * const encrypted = await ClientEncryption.encryptData('data', key);
 * const decrypted = await ClientEncryption.decryptData(encrypted, key);
 * ```
 * 
 * HYBRID (End-to-End Encryption):
 * ```typescript
 * import { HybridEncryption } from '@/lib/encryption';
 * 
 * // Client generates key pair
 * const keyPair = await HybridEncryption.generateKeyPair();
 * 
 * // Server encrypts with public key
 * const encrypted = await HybridEncryption.encryptWithPublicKey(data, publicKey);
 * 
 * // Client decrypts with private key
 * const decrypted = await HybridEncryption.decryptWithPrivateKey(encrypted, privateKey);
 * ```
 */
