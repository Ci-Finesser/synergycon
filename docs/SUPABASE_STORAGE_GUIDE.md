# Supabase Storage Guide

**Complete guide for using Supabase Storage in SynergyCon 2.0**

**Last Updated**: January 8, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Bucket Configuration](#bucket-configuration)
5. [File Operations](#file-operations)
6. [React Hooks](#react-hooks)
7. [API Routes](#api-routes)
8. [Image Optimization](#image-optimization)
9. [Security Best Practices](#security-best-practices)
10. [Error Handling](#error-handling)
11. [Migration & Setup](#migration--setup)
12. [Examples](#examples)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The SynergyCon Storage system provides a comprehensive, type-safe interface for Supabase Storage with:

- ✅ **Public and Private Buckets** - Configurable access control
- ✅ **File Upload/Download** - With progress tracking
- ✅ **Image Optimization** - Resize, format conversion, quality control
- ✅ **Signed URLs** - Temporary access to private files
- ✅ **Row Level Security (RLS)** - Fine-grained access control
- ✅ **React Hooks** - Easy integration with components
- ✅ **Secure API Routes** - CSRF protection and rate limiting
- ✅ **TypeScript Strict Mode** - Full type safety

### File Structure

```
types/
└── storage.ts           # TypeScript definitions

lib/supabase/
└── storage.ts           # Server/client storage utilities

hooks/
└── use-storage.ts       # React hooks for storage

app/api/storage/
├── upload/route.ts      # File upload endpoint
├── download/route.ts    # File download endpoint
├── delete/route.ts      # File deletion endpoint
├── list/route.ts        # File listing endpoint
└── signed-url/route.ts  # Signed URL generation
```

---

## Quick Start

### 1. Basic File Upload (Client Component)

```tsx
'use client'

import { useStorageUpload, STORAGE_BUCKETS } from '@/hooks/use-storage'

function ImageUploader() {
  const { upload, state, isUploading } = useStorageUpload({
    bucketId: STORAGE_BUCKETS.GALLERY.id,
    onSuccess: (result) => {
      console.log('Uploaded:', result.fullPath)
    },
    onError: (error) => {
      console.error('Upload failed:', error.message)
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await upload(file)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      {isUploading && <p>Uploading: {state.progress.percentage}%</p>}
      {state.status === 'success' && <p>Upload complete!</p>}
      {state.status === 'error' && <p>Error: {state.error}</p>}
    </div>
  )
}
```

### 2. Display Images with Optimization

```tsx
'use client'

import { usePublicUrl, useResponsiveImage } from '@/hooks/use-storage'

function GalleryImage({ imagePath }: { imagePath: string }) {
  // Get optimized URL
  const url = usePublicUrl({
    bucketId: 'gallery',
    path: imagePath,
    transform: { width: 800, format: 'webp', quality: 80 },
  })

  return <img src={url} alt="Gallery image" />
}

function ResponsiveGalleryImage({ imagePath }: { imagePath: string }) {
  // Get responsive image set
  const { srcset, original } = useResponsiveImage({
    bucketId: 'gallery',
    path: imagePath,
    widths: [320, 640, 1024, 1920],
    format: 'webp',
    quality: 80,
  })

  return (
    <img
      src={original}
      srcSet={srcset}
      sizes="(max-width: 768px) 100vw, 50vw"
      alt="Gallery image"
    />
  )
}
```

### 3. Server-Side Upload

```typescript
// In a Server Component or API Route
import { createServerClient } from '@/lib/supabase/server'
import { uploadFile, getPublicUrl } from '@/lib/supabase/storage'

async function uploadImage(file: File) {
  const supabase = await createServerClient()
  
  const { data, error } = await uploadFile(
    supabase,
    'gallery',
    `uploads/${file.name}`,
    file,
    { contentType: file.type, upsert: false }
  )
  
  if (error) throw new Error(error.message)
  
  return getPublicUrl(supabase, 'gallery', data.path)
}
```

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT COMPONENTS                        │
│  useStorageUpload, useStorageDownload, useStorageList       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTES                              │
│  /api/storage/upload, /download, /delete, /list, /signed-url│
│  ├── CSRF Validation                                         │
│  ├── Rate Limiting                                           │
│  └── Access Control                                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  LIB/SUPABASE/STORAGE                        │
│  uploadFile, downloadFile, createSignedUrl, etc.            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE STORAGE                          │
│  Buckets, Files, RLS Policies                               │
└─────────────────────────────────────────────────────────────┘
```

### Security Layers

1. **CSRF Protection** - All mutating operations require valid CSRF token
2. **Rate Limiting** - Per-endpoint rate limits prevent abuse
3. **File Validation** - MIME type and size validation before upload
4. **Access Control** - Authentication required for private buckets
5. **RLS Policies** - Database-level security rules

---

## Bucket Configuration

### Pre-configured Buckets

```typescript
import { STORAGE_BUCKETS } from '@/types/storage'

// Available buckets:
STORAGE_BUCKETS.PUBLIC_ASSETS  // Public assets (logos, icons)
STORAGE_BUCKETS.SPEAKERS       // Speaker profile images
STORAGE_BUCKETS.PARTNERS       // Partner logos
STORAGE_BUCKETS.GALLERY        // Gallery images
STORAGE_BUCKETS.USER_UPLOADS   // Private user uploads
STORAGE_BUCKETS.ADMIN_DOCUMENTS // Admin-only documents
```

### Bucket Properties

| Bucket | ID | Public | Max Size | Allowed Types |
|--------|-----|--------|----------|---------------|
| Public Assets | `public-assets` | ✅ | 10MB | image/*, video/*, PDF |
| Speakers | `speakers` | ✅ | 5MB | JPEG, PNG, WebP |
| Partners | `partners` | ✅ | 2MB | JPEG, PNG, SVG, WebP |
| Gallery | `gallery` | ✅ | 15MB | JPEG, PNG, WebP |
| User Uploads | `user-uploads` | ❌ | 20MB | image/*, PDF, DOC |
| Admin Documents | `admin-documents` | ❌ | 50MB | All types |

### Creating Custom Buckets

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { createBucket } from '@/lib/supabase/storage'

async function setupCustomBucket() {
  const supabase = await createServerClient()
  
  const { data, error } = await createBucket(supabase, 'custom-bucket', {
    public: false,
    fileSizeLimit: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: ['image/*', 'application/pdf'],
  })
  
  if (error) {
    console.error('Failed to create bucket:', error.message)
  }
}
```

---

## File Operations

### Upload Files

```typescript
import { uploadFile, uploadFileWithValidation } from '@/lib/supabase/storage'

// Basic upload
const { data, error } = await uploadFile(supabase, 'gallery', 'photo.jpg', file, {
  contentType: 'image/jpeg',
  cacheControl: '3600',
  upsert: false,
})

// Upload with validation
const { data, error } = await uploadFileWithValidation(
  supabase,
  'gallery',
  file,
  { allowedMimeTypes: ['image/*'], fileSizeLimit: 5 * 1024 * 1024 },
  { generateUniqueName: true, folder: 'uploads' }
)
```

### Download Files

```typescript
import { downloadFile } from '@/lib/supabase/storage'

const { data, error } = await downloadFile(supabase, 'gallery', 'photo.jpg', {
  transform: { width: 800, format: 'webp' }, // Optional transformation
})

if (data) {
  // data.data is a Blob
  // data.filename, data.contentType, data.size available
}
```

### List Files

```typescript
import { listFiles } from '@/lib/supabase/storage'

const { data: files, error } = await listFiles(supabase, 'gallery', 'uploads', {
  limit: 50,
  offset: 0,
  sortBy: { column: 'created_at', order: 'desc' },
  search: 'photo',
})
```

### Delete Files

```typescript
import { deleteFile, deleteFiles } from '@/lib/supabase/storage'

// Single file
const { error } = await deleteFile(supabase, 'gallery', 'photo.jpg')

// Multiple files
const { data, error } = await deleteFiles(supabase, 'gallery', [
  'photo1.jpg',
  'photo2.jpg',
  'photo3.jpg',
])
```

### Move/Copy Files

```typescript
import { moveFile, copyFile } from '@/lib/supabase/storage'

// Move file
await moveFile(supabase, 'gallery', 'old/photo.jpg', 'new/photo.jpg')

// Copy file
await copyFile(supabase, 'gallery', 'original.jpg', 'backup/original.jpg')
```

---

## React Hooks

### useStorageUpload

```tsx
const {
  upload,           // (file: File, path?: string) => Promise<UploadResult | null>
  uploadMultiple,   // (files: File[], folder?: string) => Promise<(UploadResult | null)[]>
  state,           // { status, progress, error?, result? }
  multiState,      // { status, files, completed, failed, total }
  reset,           // () => void
  cancel,          // () => void
  isUploading,     // boolean
} = useStorageUpload({
  bucketId: 'gallery',
  path: 'uploads',           // Optional base path
  options: { upsert: false }, // Upload options
  onProgress: (progress) => console.log(progress.percentage),
  onSuccess: (result) => console.log(result.fullPath),
  onError: (error) => console.error(error.message),
})
```

### useStorageDownload

```tsx
const {
  download,        // () => Promise<DownloadResult | null>
  downloadToDevice, // (filename?: string) => Promise<void>
  state,           // { status, progress, error?, result? }
  reset,           // () => void
  isDownloading,   // boolean
} = useStorageDownload({
  bucketId: 'gallery',
  path: 'photo.jpg',
  autoDownload: false,
  onSuccess: (result) => console.log(result.size),
  onError: (error) => console.error(error.message),
})
```

### useStorageList

```tsx
const {
  fetch,           // () => Promise<FileObject[] | null>
  refresh,         // () => Promise<FileObject[] | null>
  files,           // FileObject[]
  isLoading,       // boolean
  error,           // string | null
  reset,           // () => void
} = useStorageList({
  bucketId: 'gallery',
  path: 'uploads',
  options: { limit: 50, sortBy: { column: 'created_at', order: 'desc' } },
  autoFetch: true,
  onSuccess: (files) => console.log(`Found ${files.length} files`),
  onError: (error) => console.error(error.message),
})
```

### useStorageDelete

```tsx
const {
  deleteFile,      // (path: string) => Promise<boolean>
  deleteFiles,     // (paths: string[]) => Promise<{ success, failed }>
  isDeleting,      // boolean
  error,           // string | null
  reset,           // () => void
} = useStorageDelete({
  bucketId: 'gallery',
  onSuccess: (paths) => console.log(`Deleted: ${paths.join(', ')}`),
  onError: (error) => console.error(error.message),
})
```

### useSignedUrl

```tsx
const {
  generate,        // () => Promise<SignedUrl | null>
  url,             // string | null
  expiresAt,       // Date | null
  isValid,         // boolean
  isLoading,       // boolean
  error,           // string | null
} = useSignedUrl({
  bucketId: 'user-uploads',
  path: 'private/document.pdf',
  options: { expiresIn: 3600 }, // 1 hour
  autoGenerate: true,
})
```

### usePublicUrl

```tsx
const url = usePublicUrl({
  bucketId: 'gallery',
  path: 'photo.jpg',
  transform: { width: 800, format: 'webp', quality: 80 },
})
```

### useResponsiveImage

```tsx
const { original, srcset, variants } = useResponsiveImage({
  bucketId: 'gallery',
  path: 'photo.jpg',
  widths: [320, 640, 1024, 1920],
  format: 'webp',
  quality: 80,
})

// Use in img tag
<img src={original} srcSet={srcset} sizes="100vw" alt="Responsive image" />
```

### useStorage (Combined Hook)

```tsx
const { upload, list, delete: del, getUrl, getSignedUrl } = useStorage({
  bucketId: 'gallery',
  folder: 'uploads',
})

// All operations are scoped to the folder
await upload.upload(file)
await list.refresh()
await del.deleteFile('photo.jpg')
const url = getUrl('photo.jpg', { width: 800 })
const signedUrl = await getSignedUrl('private.pdf', { expiresIn: 3600 })
```

---

## API Routes

### Upload Endpoint

```http
POST /api/storage/upload

Content-Type: multipart/form-data

Fields:
- file: File (required)
- bucketId: string (required)
- path: string (optional)
- _csrf: string (required)
- upsert: "true" | "false" (optional)

Response:
{
  "success": true,
  "data": {
    "path": "uploads/photo.jpg",
    "id": "abc123",
    "fullPath": "https://..."
  }
}
```

### Download Endpoint

```http
GET /api/storage/download?bucketId=gallery&path=photo.jpg&mode=signed&expiresIn=3600

Query Parameters:
- bucketId: string (required)
- path: string (required)
- mode: "url" | "signed" | "blob" (default: "url")
- expiresIn: number (default: 3600)

Response (mode=signed):
{
  "success": true,
  "signedUrl": "https://...",
  "expiresAt": "2026-01-08T12:00:00Z"
}

Response (mode=blob):
[File blob with appropriate headers]
```

### List Endpoint

```http
GET /api/storage/list?bucketId=gallery&path=uploads&limit=50&offset=0&sortBy=created_at&order=desc

Query Parameters:
- bucketId: string (required)
- path: string (default: "")
- limit: number (1-1000, default: 100)
- offset: number (default: 0)
- search: string (optional)
- sortBy: "name" | "created_at" | "updated_at" (optional)
- order: "asc" | "desc" (optional)

Response:
{
  "success": true,
  "files": [...],
  "pagination": { "limit": 50, "offset": 0, "hasMore": true }
}
```

### Delete Endpoint

```http
POST /api/storage/delete

Content-Type: application/json

Body:
{
  "bucketId": "gallery",
  "paths": ["photo1.jpg", "photo2.jpg"],
  "_csrf": "token"
}

Response:
{
  "success": true,
  "deleted": ["photo1.jpg", "photo2.jpg"]
}
```

### Signed URL Endpoint

```http
GET /api/storage/signed-url?bucketId=gallery&path=photo.jpg&expiresIn=3600

POST /api/storage/signed-url
Body: { "bucketId": "gallery", "path": "upload.jpg", "_csrf": "token" }

Response (GET):
{
  "success": true,
  "signedUrl": "https://...",
  "path": "photo.jpg",
  "expiresAt": "2026-01-08T12:00:00Z"
}

Response (POST - upload URL):
{
  "success": true,
  "signedUrl": "https://...",
  "path": "upload.jpg",
  "token": "abc123"
}
```

---

## Image Optimization

### Transform Options

```typescript
interface ImageTransformOptions {
  width?: number      // Resize width in pixels
  height?: number     // Resize height in pixels
  resize?: 'cover' | 'contain' | 'fill'  // Resize mode
  format?: 'origin' | 'avif' | 'webp' | 'png' | 'jpeg'  // Output format
  quality?: number    // Quality 1-100 (for lossy formats)
}
```

### Get Optimized URL

```typescript
import { getOptimizedImageUrl, getThumbnailUrl } from '@/lib/supabase/storage'

// Custom optimization
const url = getOptimizedImageUrl(supabase, 'gallery', 'photo.jpg', {
  width: 800,
  height: 600,
  quality: 80,
  format: 'webp',
})

// Thumbnail (150x150, cover, webp)
const thumb = getThumbnailUrl(supabase, 'gallery', 'photo.jpg', 150)
```

### Responsive Images

```typescript
import { generateResponsiveImages } from '@/lib/supabase/storage'

const { original, srcset, variants } = generateResponsiveImages(
  supabase,
  'gallery',
  'photo.jpg',
  [320, 640, 768, 1024, 1280, 1920], // Widths
  { format: 'webp', quality: 80 }
)

// Result:
// original: "https://...photo.jpg"
// srcset: "https://...?width=320 320w, https://...?width=640 640w, ..."
// variants: [{ url, width, format, quality }, ...]
```

---

## Security Best Practices

### 1. CSRF Protection

All mutating API routes require CSRF tokens:

```tsx
import { useFormSecurity } from '@/hooks/use-form-security'

function UploadForm() {
  const { csrfToken } = useFormSecurity()
  
  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucketId', 'gallery')
    formData.append('_csrf', csrfToken) // Required!
    
    await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    })
  }
}
```

### 2. File Validation

Always validate files before upload:

```typescript
import { validateFile, STORAGE_BUCKETS } from '@/types/storage'

const file = input.files[0]
const validation = validateFile(file, STORAGE_BUCKETS.GALLERY)

if (!validation.valid) {
  alert(validation.error)
  return
}
```

### 3. Rate Limiting

API routes have built-in rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Upload | 20 requests | 15 minutes |
| Download | 100 requests | 15 minutes |
| Delete | 50 requests | 15 minutes |
| List | 200 requests | 15 minutes |
| Signed URL | 100 requests | 15 minutes |

### 4. Access Control

Private buckets require authentication:

```typescript
// Server-side check in API routes
const supabase = await createServerClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
}
```

### 5. Signed URLs for Private Files

Use signed URLs for temporary access to private files:

```typescript
// Generate URL that expires in 1 hour
const { data } = await createSignedUrl(supabase, 'user-uploads', 'private.pdf', {
  expiresIn: 3600,
})

// URL will be: https://...&token=abc123
// Only valid for 1 hour
```

---

## Error Handling

### Error Codes

```typescript
type StorageErrorCode =
  | 'BUCKET_NOT_FOUND'
  | 'BUCKET_ALREADY_EXISTS'
  | 'FILE_NOT_FOUND'
  | 'FILE_TOO_LARGE'
  | 'INVALID_MIME_TYPE'
  | 'UPLOAD_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'DELETE_FAILED'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'INVALID_PATH'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'TRANSFORMATION_FAILED'
  | 'SIGNED_URL_EXPIRED'
  | 'UNKNOWN_ERROR'
```

### Handling Errors

```typescript
import { StorageException } from '@/types/storage'

try {
  const { data, error } = await uploadFile(supabase, 'gallery', 'photo.jpg', file)
  
  if (error) {
    switch (error.code) {
      case 'FILE_TOO_LARGE':
        alert('File is too large. Maximum size is 15MB.')
        break
      case 'INVALID_MIME_TYPE':
        alert('Invalid file type. Only images are allowed.')
        break
      case 'PERMISSION_DENIED':
        alert('You do not have permission to upload files.')
        break
      case 'RATE_LIMITED':
        alert('Too many uploads. Please try again later.')
        break
      default:
        alert(error.message)
    }
    return
  }
  
  console.log('Upload successful:', data.fullPath)
} catch (err) {
  if (err instanceof StorageException) {
    console.error('Storage error:', err.code, err.message)
  } else {
    console.error('Unexpected error:', err)
  }
}
```

---

## Migration & Setup

### 1. Initialize Buckets

Run this during app setup or as a migration:

```typescript
import { createAdminClient } from '@/lib/supabase/server'
import { initializeBuckets } from '@/lib/supabase/storage'
import { STORAGE_BUCKETS } from '@/types/storage'

async function setupStorage() {
  const supabase = createAdminClient()
  
  const { created, existing, errors } = await initializeBuckets(
    supabase,
    STORAGE_BUCKETS
  )
  
  console.log('Created buckets:', created)
  console.log('Existing buckets:', existing)
  console.log('Errors:', errors)
}
```

### 2. RLS Policies (SQL)

Add these policies in Supabase Dashboard or as migrations:

```sql
-- Allow public read for public buckets
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('public-assets', 'speakers', 'partners', 'gallery'));

-- Allow authenticated uploads to public buckets
CREATE POLICY "Authenticated upload access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('public-assets', 'speakers', 'partners', 'gallery'));

-- Allow users to access their own files in private buckets
CREATE POLICY "User private file access"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to upload to their own folder
CREATE POLICY "User private file upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "User private file delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admin-only access for admin-documents bucket
CREATE POLICY "Admin document access"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'admin-documents' 
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);
```

---

## Examples

### Complete File Manager Component

```tsx
'use client'

import { useState } from 'react'
import { useStorage, STORAGE_BUCKETS } from '@/hooks/use-storage'
import { formatBytes } from '@/types/storage'

export function FileManager() {
  const { upload, list, delete: del, getUrl } = useStorage({
    bucketId: STORAGE_BUCKETS.GALLERY.id,
    folder: 'uploads',
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await upload.uploadMultiple(files)
    await list.refresh()
  }

  const handleDelete = async (path: string) => {
    if (confirm('Delete this file?')) {
      await del.deleteFile(path)
      await list.refresh()
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">File Manager</h2>
      
      {/* Upload Section */}
      <div className="mb-4">
        <input
          type="file"
          multiple
          onChange={handleUpload}
          disabled={upload.isUploading}
          className="border p-2"
        />
        {upload.isUploading && (
          <p>Uploading... {upload.multiState.completed}/{upload.multiState.total}</p>
        )}
      </div>

      {/* File List */}
      {list.isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {list.files.map((file) => (
            <div key={file.name} className="border p-2 rounded">
              <img
                src={getUrl(file.name, { width: 200, format: 'webp' })}
                alt={file.name}
                className="w-full h-32 object-cover mb-2"
              />
              <p className="text-sm truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {formatBytes(file.metadata?.size || 0)}
              </p>
              <button
                onClick={() => handleDelete(file.name)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Avatar Upload with Preview

```tsx
'use client'

import { useState } from 'react'
import { useStorageUpload, usePublicUrl, STORAGE_BUCKETS } from '@/hooks/use-storage'

export function AvatarUpload({ currentPath }: { currentPath?: string }) {
  const [path, setPath] = useState(currentPath)
  
  const { upload, state, isUploading } = useStorageUpload({
    bucketId: STORAGE_BUCKETS.SPEAKERS.id,
    onSuccess: (result) => setPath(result.path),
  })

  const avatarUrl = usePublicUrl({
    bucketId: STORAGE_BUCKETS.SPEAKERS.id,
    path: path || '',
    transform: { width: 200, height: 200, resize: 'cover', format: 'webp' },
  })

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
        {path ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file, `avatars/${file.name}`)
          }}
          disabled={isUploading}
          className="hidden"
          id="avatar-input"
        />
        <label
          htmlFor="avatar-input"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isUploading ? `${state.progress.percentage}%` : 'Upload Avatar'}
        </label>
      </div>
    </div>
  )
}
```

---

## Troubleshooting

### Common Issues

**1. "Invalid security token" error**
- Ensure CSRF token is included in the request
- Token may have expired - refresh the page

**2. "File type not allowed" error**
- Check bucket's `allowedMimeTypes` configuration
- Verify file's actual MIME type matches expected type

**3. "File too large" error**
- Check bucket's `fileSizeLimit` configuration
- Compress images before upload

**4. "Authentication required" error**
- User needs to be logged in
- For private buckets, ensure session is valid

**5. Rate limit exceeded**
- Wait for the rate limit window to reset
- Reduce frequency of requests

**6. Signed URL expired**
- Generate a new signed URL
- Consider increasing `expiresIn` value

### Debug Mode

Enable debug logging:

```typescript
// In development, add to .env.local
NEXT_PUBLIC_DEBUG_STORAGE=true

// Then check console for storage operations
```

---

## Related Documentation

- [Project Architecture](architecture/Project_Architecture_Blueprint.md)
- [Security Implementation](features/SECURITY_IMPLEMENTATION.md)
- [API Security](features/SECURITY_QUICK_REFERENCE.md)
- [Migration Guide](migration/MIGRATION_GUIDE.md)

---

**Last Updated**: January 8, 2026  
**Maintained By**: Development Team  
**Version**: 1.0
