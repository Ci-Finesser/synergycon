# Encryption Library - Complete Usage Guide

**Version**: 1.0  
**Security Level**: Production-Ready  
**Last Updated**: December 30, 2025

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Server-Side Encryption](#server-side-encryption)
4. [Client-Side Encryption](#client-side-encryption)
5. [Hybrid Encryption](#hybrid-encryption)
6. [Use Cases & Examples](#use-cases--examples)
7. [Security Best Practices](#security-best-practices)
8. [API Reference](#api-reference)

---

## Overview

This encryption library provides three types of encryption:

| Type | Use Case | Technology | Performance |
|------|----------|------------|-------------|
| **Server** | Data at rest, database encryption | Node.js crypto (AES-256-GCM) | ⚡ Very Fast |
| **Client** | Browser-side encryption, local storage | Web Crypto API (AES-GCM) | ⚡ Fast |
| **Hybrid** | End-to-end encryption, secure messaging | RSA-OAEP + AES-GCM | 🔒 Most Secure |

### Security Features

✅ **AES-256-GCM** - Industry standard authenticated encryption  
✅ **Unique IVs** - Every encryption uses a fresh initialization vector  
✅ **PBKDF2** - Secure key derivation from passwords  
✅ **Constant-time comparison** - Prevents timing attacks  
✅ **Key rotation support** - Built-in versioning  
✅ **Authenticated encryption** - Detects tampering  

---

## Installation & Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Required for production
ENCRYPTION_KEY=<base64-encoded-32-byte-key>

# Optional: For key rotation
ENCRYPTION_KEY_V1=<previous-key-base64>
ENCRYPTION_KEY_V2=<current-key-base64>
```

### 2. Generate Encryption Key

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Output example:
# xyz123ABC...== (44 characters)
```

### 3. Import the Library

```typescript
// Server-side (API routes, server components)
import { encrypt, decrypt } from '@/lib/encryption';

// Client-side (React components)
import { ClientEncryption } from '@/lib/encryption';

// Hybrid (end-to-end encryption)
import { HybridEncryption } from '@/lib/encryption';
```

---

## Server-Side Encryption

### Basic Usage

```typescript
import { encrypt, decrypt } from '@/lib/encryption';

// Encrypt sensitive data
const encrypted = encrypt('secret password');
console.log(encrypted);
// {
//   encrypted: 'base64...',
//   iv: 'base64...',
//   authTag: 'base64...',
//   timestamp: 1735545600000
// }

// Store in database
await db.users.update({
  where: { id: userId },
  data: { 
    encryptedPassword: JSON.stringify(encrypted)
  }
});

// Later: Decrypt
const decrypted = decrypt(encrypted);
console.log(decrypted); // 'secret password'
```

### Encrypt with Password

```typescript
import { encryptWithPassword, decryptWithPassword } from '@/lib/encryption';

// User provides a password
const userPassword = 'my-secure-password';

// Encrypt data
const encrypted = encryptWithPassword('sensitive data', userPassword);

// Store encrypted.encrypted, encrypted.iv, encrypted.authTag, encrypted.salt

// Later: Decrypt with same password
const decrypted = decryptWithPassword(encrypted, userPassword);
```

### JSON Encryption

```typescript
import { encryptJSON, decryptJSON } from '@/lib/encryption';

// Encrypt an object
const user = {
  email: 'user@example.com',
  ssn: '123-45-6789',
  bankAccount: '9876543210'
};

const encrypted = encryptJSON(user);

// Store in database
await db.sensitiveData.create({
  data: { userId, encryptedData: JSON.stringify(encrypted) }
});

// Later: Decrypt
const decrypted = decryptJSON<typeof user>(encrypted);
console.log(decrypted.email); // 'user@example.com'
```

### Field-Level Encryption

```typescript
import { encryptFields, decryptFields } from '@/lib/encryption';

// Encrypt specific fields
const user = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  ssn: '123-45-6789',
  salary: 100000
};

// Encrypt sensitive fields only
const encrypted = encryptFields(user, ['ssn', 'salary']);

// Result:
// {
//   id: 1,
//   name: 'John Doe',
//   email: 'john@example.com',
//   ssn: { encrypted: '...', iv: '...', authTag: '...' },
//   salary: { encrypted: '...', iv: '...', authTag: '...' }
// }

// Later: Decrypt specific fields
const decrypted = decryptFields(encrypted, ['ssn', 'salary']);
```

### Database Storage Helpers

```typescript
import { encryptForStorage, decryptFromStorage } from '@/lib/encryption';

// Simple one-liner for database storage
const encrypted = encryptForStorage('credit card number');
await db.save({ encryptedData: encrypted });

// Simple one-liner for retrieval
const record = await db.find({ id });
const decrypted = decryptFromStorage(record.encryptedData);
```

### Key Rotation

```typescript
import { rotateKey } from '@/lib/encryption';

// Encrypt with version 1 key
const encrypted = encrypt('data', { version: 1 });

// Later: Rotate to version 2 key
const reencrypted = rotateKey(encrypted, 1, 2);

// Now encrypted with version 2 key
```

---

## Client-Side Encryption

### Basic Usage

```typescript
'use client';

import { ClientEncryption } from '@/lib/encryption';

async function encryptData() {
  // Generate encryption key
  const key = await ClientEncryption.generateKey();
  
  // Encrypt
  const encrypted = await ClientEncryption.encryptData(
    'sensitive message',
    key
  );
  
  // Send to server or store locally
  localStorage.setItem('encryptedData', JSON.stringify(encrypted));
  
  // Later: Decrypt
  const decrypted = await ClientEncryption.decryptData(encrypted, key);
  console.log(decrypted); // 'sensitive message'
}
```

### Password-Based Encryption

```typescript
import { ClientEncryption } from '@/lib/encryption';

// Encrypt with user's password
async function protectWithPassword(data: string, password: string) {
  const encrypted = await ClientEncryption.encryptWithPassword(
    data,
    password
  );
  
  return encrypted;
}

// Decrypt with password
async function decryptWithPassword(encrypted: any, password: string) {
  return await ClientEncryption.decryptWithPassword(
    encrypted,
    password
  );
}
```

### Secure Key Storage

```typescript
import { ClientEncryption } from '@/lib/encryption';

// Generate and store key
async function setupEncryption() {
  const key = await ClientEncryption.generateKey();
  
  // Store key securely (session storage, cleared on browser close)
  await ClientEncryption.SecureKeyStore.store('main-key', key);
}

// Retrieve and use key
async function encryptWithStoredKey(data: string) {
  const key = await ClientEncryption.SecureKeyStore.retrieve('main-key');
  
  if (!key) {
    throw new Error('Encryption key not found');
  }
  
  return await ClientEncryption.encryptData(data, key);
}

// Clear all keys on logout
function clearKeys() {
  ClientEncryption.SecureKeyStore.clearAll();
}
```

### Form Data Encryption

```typescript
import { ClientEncryption } from '@/lib/encryption';

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  
  const formData = {
    name: 'John Doe',
    email: 'john@example.com',
    ssn: '123-45-6789',
    creditCard: '4111111111111111'
  };
  
  // Generate key for this session
  const key = await ClientEncryption.generateKey();
  
  // Encrypt sensitive fields
  const encrypted = await ClientEncryption.encryptFormData(
    formData,
    ['ssn', 'creditCard'],
    key
  );
  
  // Send to server with encrypted fields
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encrypted)
  });
}
```

---

## Hybrid Encryption

### End-to-End Encryption

```typescript
import { HybridEncryption } from '@/lib/encryption';

// CLIENT SIDE: Generate key pair
async function setupE2E() {
  const keyPair = await HybridEncryption.generateKeyPair();
  
  // Share public key with server
  const publicKey = await HybridEncryption.exportPublicKey(keyPair.publicKey);
  
  await fetch('/api/register-key', {
    method: 'POST',
    body: JSON.stringify({ publicKey })
  });
  
  // Store private key securely
  await HybridEncryption.HybridKeyManager.storeKeyPair('my-keys', keyPair);
}

// SERVER SIDE: Encrypt message for client
async function sendEncryptedMessage(userId: string, message: string) {
  // Get user's public key from database
  const user = await db.users.findUnique({ where: { id: userId } });
  const publicKey = await HybridEncryption.importPublicKey(user.publicKey);
  
  // Encrypt message
  const encrypted = await HybridEncryption.encryptWithPublicKey(
    message,
    publicKey
  );
  
  // Send encrypted message
  return encrypted;
}

// CLIENT SIDE: Decrypt received message
async function receiveEncryptedMessage(encrypted: any) {
  // Retrieve private key
  const keyPair = await HybridEncryption.HybridKeyManager.retrieveKeyPair('my-keys');
  
  if (!keyPair) {
    throw new Error('Private key not found');
  }
  
  // Decrypt message
  const decrypted = await HybridEncryption.decryptWithPrivateKey(
    encrypted,
    keyPair.privateKey
  );
  
  console.log('Decrypted message:', decrypted);
}
```

### Secure Messaging System

```typescript
// Complete example: Encrypted chat

// 1. User A generates key pair
const userAKeys = await HybridEncryption.generateKeyPair();
const userAPublicKey = await HybridEncryption.exportPublicKey(userAKeys.publicKey);

// 2. User B generates key pair
const userBKeys = await HybridEncryption.generateKeyPair();
const userBPublicKey = await HybridEncryption.exportPublicKey(userBKeys.publicKey);

// 3. User A sends encrypted message to User B
const messageToB = 'Hello User B!';
const publicKeyB = await HybridEncryption.importPublicKey(userBPublicKey);
const encryptedForB = await HybridEncryption.encryptWithPublicKey(
  messageToB,
  publicKeyB
);

// 4. User B decrypts message from User A
const decryptedMessage = await HybridEncryption.decryptWithPrivateKey(
  encryptedForB,
  userBKeys.privateKey
);

console.log(decryptedMessage); // 'Hello User B!'
```

---

## Use Cases & Examples

### 1. Encrypt User Passwords (Additional Layer)

```typescript
// API route: /api/register
import { encrypt } from '@/lib/encryption';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  
  // Hash password with bcrypt (primary security)
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Encrypt hashed password (additional layer)
  const encrypted = encrypt(hashedPassword);
  
  // Store encrypted data
  await db.users.create({
    data: {
      email,
      encryptedPassword: JSON.stringify(encrypted)
    }
  });
  
  return Response.json({ success: true });
}
```

### 2. Encrypt API Keys in Database

```typescript
import { encryptForStorage, decryptFromStorage } from '@/lib/encryption';

// Store API key
async function storeAPIKey(userId: string, apiKey: string) {
  const encrypted = encryptForStorage(apiKey);
  
  await db.apiKeys.create({
    data: { userId, encryptedKey: encrypted }
  });
}

// Retrieve API key
async function getAPIKey(userId: string): Promise<string> {
  const record = await db.apiKeys.findUnique({ where: { userId } });
  
  if (!record) {
    throw new Error('API key not found');
  }
  
  return decryptFromStorage(record.encryptedKey);
}
```

### 3. Encrypt File Uploads

```typescript
import { encrypt, decrypt } from '@/lib/encryption';
import { writeFile, readFile } from 'fs/promises';

// Encrypt file before storage
async function encryptFile(filePath: string, content: Buffer) {
  const encrypted = encrypt(content);
  
  // Store encrypted data
  await writeFile(
    `${filePath}.encrypted`,
    JSON.stringify(encrypted)
  );
}

// Decrypt file
async function decryptFile(filePath: string): Promise<Buffer> {
  const encrypted = JSON.parse(
    await readFile(`${filePath}.encrypted`, 'utf-8')
  );
  
  const decrypted = decrypt(encrypted);
  return Buffer.from(decrypted, 'utf-8');
}
```

### 4. Secure Session Tokens

```typescript
import { generateToken, hash } from '@/lib/encryption';

// Generate secure session token
function createSession(userId: string) {
  const token = generateToken(32);
  const tokenHash = hash(token);
  
  // Store hash in database
  db.sessions.create({
    data: { userId, tokenHash, expiresAt: new Date(Date.now() + 86400000) }
  });
  
  // Return token to client (not the hash!)
  return token;
}

// Verify session token
async function verifySession(token: string) {
  const tokenHash = hash(token);
  
  const session = await db.sessions.findUnique({
    where: { tokenHash }
  });
  
  return session && session.expiresAt > new Date();
}
```

### 5. Encrypt Email Content

```typescript
import { encryptJSON, decryptJSON } from '@/lib/encryption';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments?: string[];
}

// Store encrypted email
async function saveEncryptedEmail(email: EmailData) {
  const encrypted = encryptJSON(email);
  
  await db.emails.create({
    data: { 
      encryptedContent: JSON.stringify(encrypted),
      createdAt: new Date()
    }
  });
}

// Retrieve and decrypt email
async function getEmail(emailId: string): Promise<EmailData> {
  const record = await db.emails.findUnique({ where: { id: emailId } });
  const encrypted = JSON.parse(record.encryptedContent);
  
  return decryptJSON<EmailData>(encrypted);
}
```

---

## Security Best Practices

### ✅ DO

1. **Always set ENCRYPTION_KEY in production**
   ```bash
   ENCRYPTION_KEY=<your-secure-key>
   ```

2. **Use different keys for different environments**
   ```bash
   # Development
   ENCRYPTION_KEY=dev_key_xyz...
   
   # Production
   ENCRYPTION_KEY=prod_key_abc...
   ```

3. **Rotate keys periodically**
   ```typescript
   // Use versioned keys
   const encrypted = encrypt(data, { version: 2 });
   ```

4. **Combine with hashing for passwords**
   ```typescript
   const hashed = await bcrypt.hash(password, 10);
   const encrypted = encrypt(hashed);
   ```

5. **Clear sensitive data from memory**
   ```typescript
   ClientEncryption.SecureKeyStore.clearAll(); // On logout
   ```

6. **Use HTTPS for all data transmission**
   - Encryption protects data at rest
   - HTTPS protects data in transit

7. **Validate decrypted data**
   ```typescript
   try {
     const decrypted = decrypt(encrypted);
     // Validate decrypted content
     if (!isValid(decrypted)) {
       throw new Error('Invalid data');
     }
   } catch (error) {
     // Handle decryption failure
   }
   ```

### ❌ DON'T

1. **Don't hardcode encryption keys**
   ```typescript
   // ❌ BAD
   const key = Buffer.from('hardcoded-key');
   
   // ✅ GOOD
   const key = process.env.ENCRYPTION_KEY;
   ```

2. **Don't reuse IVs**
   - Library handles this automatically
   - Each encryption gets a unique IV

3. **Don't store keys in localStorage**
   ```typescript
   // ❌ BAD
   localStorage.setItem('key', key);
   
   // ✅ GOOD
   ClientEncryption.SecureKeyStore.store('key', key); // sessionStorage
   ```

4. **Don't encrypt already hashed passwords**
   ```typescript
   // ❌ BAD
   const hashed = await bcrypt.hash(password, 10);
   // Don't encrypt hashed password unless you have a specific reason
   
   // ✅ GOOD
   const hashed = await bcrypt.hash(password, 10);
   // Store hashed password directly
   ```

5. **Don't ignore decryption errors**
   ```typescript
   // ❌ BAD
   const decrypted = decrypt(data); // May throw
   
   // ✅ GOOD
   try {
     const decrypted = decrypt(data);
   } catch (error) {
     logger.error('Decryption failed', error);
     // Handle error appropriately
   }
   ```

---

## API Reference

### Server-Side

```typescript
// Basic encryption
encrypt(data: string | Buffer, options?: EncryptionOptions): EncryptedData
decrypt(encryptedData: EncryptedData, options?: DecryptionOptions): string

// Password-based
encryptWithPassword(data: string | Buffer, password: string): EncryptedData
decryptWithPassword(encryptedData: EncryptedData, password: string): string

// JSON
encryptJSON<T>(data: T, options?: EncryptionOptions): EncryptedData
decryptJSON<T>(encryptedData: EncryptedData, options?: DecryptionOptions): T

// Field encryption
encryptFields<T>(obj: T, fields: (keyof T)[], options?: EncryptionOptions): Record<string, any>
decryptFields<T>(obj: Record<string, any>, fields: string[], options?: DecryptionOptions): Partial<T>

// Utilities
hash(data: string | Buffer): string
generateToken(length?: number): string
constantTimeCompare(a: string, b: string): boolean
generateEncryptionKey(): string
rotateKey(encryptedData: EncryptedData, oldVersion: number, newVersion: number): EncryptedData
```

### Client-Side

```typescript
// Basic encryption
ClientEncryption.encryptData(data: string | ArrayBuffer, key: CryptoKey): Promise<ClientEncryptedData>
ClientEncryption.decryptData(encryptedData: ClientEncryptedData, key: CryptoKey): Promise<string>

// Password-based
ClientEncryption.encryptWithPassword(data: string | ArrayBuffer, password: string): Promise<ClientEncryptedData>
ClientEncryption.decryptWithPassword(encryptedData: ClientEncryptedData, password: string): Promise<string>

// Key management
ClientEncryption.generateKey(): Promise<CryptoKey>
ClientEncryption.generateRandomBytes(length: number): Uint8Array
ClientEncryption.generateToken(length?: number): string

// Secure storage
ClientEncryption.SecureKeyStore.store(keyId: string, key: CryptoKey): Promise<void>
ClientEncryption.SecureKeyStore.retrieve(keyId: string): Promise<CryptoKey | null>
ClientEncryption.SecureKeyStore.remove(keyId: string): void
ClientEncryption.SecureKeyStore.clearAll(): void
```

### Hybrid Encryption

```typescript
// Key pair management
HybridEncryption.generateKeyPair(): Promise<KeyPair>
HybridEncryption.exportPublicKey(publicKey: CryptoKey): Promise<string>
HybridEncryption.exportPrivateKey(privateKey: CryptoKey): Promise<string>
HybridEncryption.importPublicKey(keyData: string): Promise<CryptoKey>
HybridEncryption.importPrivateKey(keyData: string): Promise<CryptoKey>

// Encryption/Decryption
HybridEncryption.encryptWithPublicKey(data: string | ArrayBuffer, publicKey: CryptoKey): Promise<HybridEncryptedData>
HybridEncryption.decryptWithPrivateKey(encryptedData: HybridEncryptedData, privateKey: CryptoKey): Promise<string>

// Key storage
HybridEncryption.HybridKeyManager.generateAndStore(keyId: string): Promise<KeyPair>
HybridEncryption.HybridKeyManager.storeKeyPair(keyId: string, keyPair: KeyPair): Promise<void>
HybridEncryption.HybridKeyManager.retrieveKeyPair(keyId: string): Promise<KeyPair | null>
```

---

## Performance Considerations

| Operation | Time (approx) | Notes |
|-----------|---------------|-------|
| Server AES encryption | < 1ms | Very fast |
| Server AES decryption | < 1ms | Very fast |
| Client AES encryption | 1-5ms | Fast |
| Client AES decryption | 1-5ms | Fast |
| RSA key pair generation | 100-500ms | One-time operation |
| Hybrid encryption | 10-50ms | RSA + AES combined |
| PBKDF2 key derivation | 50-200ms | Intentionally slow |

---

## Troubleshooting

### Error: "ENCRYPTION_KEY is required in production"

**Solution**: Set the environment variable
```bash
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
```

### Error: "Web Crypto API is not available"

**Solution**: Ensure you're in a secure context (HTTPS or localhost)

### Error: "Decryption failed"

**Possible causes**:
1. Wrong encryption key
2. Corrupted data
3. Tampered authentication tag
4. Data too old (if maxAge is set)

---

## Support

For issues or questions:
- Check examples above
- Review API reference
- Check security best practices
- Test with the provided examples

---

**Version**: 1.0  
**Last Updated**: December 30, 2025  
**License**: MIT
