/**
 * Encryption Types
 * Centralized type definitions for encryption/decryption operations
 */

/* ================================
   SERVER-SIDE ENCRYPTION TYPES
   ================================ */

export interface EncryptedData {
  /** Encrypted data in base64 format */
  encrypted: string
  /** Initialization vector in base64 */
  iv: string
  /** Authentication tag in base64 */
  authTag: string
  /** Salt used for key derivation (if applicable) */
  salt?: string
  /** Timestamp of encryption */
  timestamp: number
  /** Version for key rotation support */
  version?: number
}

export interface EncryptionOptions {
  /** Custom encryption key (32 bytes) */
  key?: Buffer
  /** Key version for rotation support */
  version?: number
  /** Additional authenticated data */
  aad?: Buffer
}

export interface DecryptionOptions {
  /** Custom decryption key (32 bytes) */
  key?: Buffer
  /** Additional authenticated data (must match encryption) */
  aad?: Buffer
  /** Maximum age in milliseconds (0 = no limit) */
  maxAge?: number
}

/* ================================
   CLIENT-SIDE ENCRYPTION TYPES
   ================================ */

export interface ClientEncryptedData {
  /** Encrypted data in base64 */
  data: string
  /** Initialization vector in base64 */
  iv: string
  /** Salt for key derivation (if used) */
  salt?: string
  /** Timestamp of encryption */
  timestamp: number
}

export interface ClientEncryptionConfig {
  /** Number of PBKDF2 iterations (default: 100000) */
  iterations?: number
  /** Key length in bits (default: 256) */
  keyLength?: number
  /** Additional authenticated data */
  aad?: Uint8Array
}

/* ================================
   HYBRID ENCRYPTION TYPES
   ================================ */

export interface KeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export interface SerializedKeyPair {
  publicKey: string
  privateKey: string
}

export interface HybridEncryptedData {
  /** Encrypted AES key (encrypted with RSA public key) */
  encryptedKey: string
  /** Encrypted data (encrypted with AES) */
  encryptedData: string
  /** Initialization vector for AES */
  iv: string
  /** Timestamp */
  timestamp: number
}

export interface HybridKeyPairConfig {
  /** RSA key size in bits (2048, 3072, or 4096) */
  keySize?: number
  /** Whether to return CryptoKey or serialized format */
  serialize?: boolean
}

/* ================================
   ENCRYPTION RESULT TYPES
   ================================ */

export interface EncryptionResult {
  success: boolean
  data?: EncryptedData | ClientEncryptedData | HybridEncryptedData
  error?: {
    message: string
    code: string
  }
}

export interface DecryptionResult<T = string> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
}

/* ================================
   KEY MANAGEMENT TYPES
   ================================ */

export interface KeyRotationPolicy {
  enabled: boolean
  rotationInterval: number // in days
  maxVersions: number
  archiveOldKeys: boolean
}

export interface KeyMetadata {
  id: string
  algorithm: string
  keySize: number
  createdAt: Date
  rotatedAt?: Date
  expiresAt?: Date
  version: number
}

/* ================================
   ENCRYPTION STORAGE TYPES
   ================================ */

export interface EncryptedStorageItem {
  key: string
  encryptedData: EncryptedData
  metadata?: Record<string, any>
}

export interface EncryptionStorageConfig {
  prefix?: string
  ttl?: number // time to live in milliseconds
  keyDerivation?: boolean
}

/* ================================
   FIELD-LEVEL ENCRYPTION TYPES
   ================================ */

export interface EncryptedField {
  field: string
  value: any
  encrypted: boolean
  timestamp: number
}

export interface FieldEncryptionConfig {
  fields: string[]
  algorithm: 'aes-256-gcm' | 'aes-256-cbc'
  keyRotation?: KeyRotationPolicy
}

export type EncryptionAlgorithm = 'aes-256-gcm' | 'aes-256-cbc' | 'rsa-oaep' | 'hybrid'

export interface AlgorithmConfig {
  algorithm: EncryptionAlgorithm
  iterations?: number
  keySize?: number
  ivLength?: number
  tagLength?: number
}
