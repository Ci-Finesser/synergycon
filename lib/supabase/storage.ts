/**
 * Supabase Storage Utilities
 * Server and client-side storage operations with comprehensive error handling
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Bucket,
  BucketCreateOptions,
  FileObject,
  FileListOptions,
  UploadOptions,
  UploadResult,
  DownloadOptions,
  DownloadResult,
  ImageTransformOptions,
  SignedUrlOptions,
  SignedUrl,
  SignedUploadUrl,
  StorageError,
  StorageErrorCode,
  StorageException,
  BucketConfig,
  ResponsiveImageSet,
  OptimizedImage,
  FileValidationResult,
} from '@/types/storage'
import { validateFile, generateUniqueFilename, formatBytes } from '@/types/storage'

/* ================================
   ERROR HANDLING
   ================================ */

function mapStorageError(error: unknown): StorageError {
  // Handle Supabase storage error objects
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { message: string; statusCode?: string; error?: string }
    const message = supabaseError.message || supabaseError.error || 'Unknown storage error'
    const statusCode = supabaseError.statusCode ? parseInt(supabaseError.statusCode, 10) : undefined

    // Map common Supabase storage errors
    if (message.includes('not found') || message.includes('Not Found')) {
      return {
        code: 'FILE_NOT_FOUND',
        message: 'The requested file or bucket was not found',
        statusCode: 404,
      }
    }
    if (message.includes('already exists')) {
      return {
        code: 'BUCKET_ALREADY_EXISTS',
        message: 'A bucket with this name already exists',
        statusCode: 409,
      }
    }
    if (message.includes('too large') || message.includes('exceeds')) {
      return {
        code: 'FILE_TOO_LARGE',
        message: 'The file size exceeds the allowed limit',
        statusCode: 413,
      }
    }
    if (message.includes('mime type') || message.includes('content type')) {
      return {
        code: 'INVALID_MIME_TYPE',
        message: 'The file type is not allowed',
        statusCode: 415,
      }
    }
    if (message.includes('permission') || message.includes('unauthorized') || message.includes('Unauthorized')) {
      return {
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to perform this operation',
        statusCode: 403,
      }
    }
    if (message.includes('rate limit')) {
      return {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later',
        statusCode: 429,
      }
    }
    if (message.includes('quota') || message.includes('storage limit')) {
      return {
        code: 'STORAGE_QUOTA_EXCEEDED',
        message: 'Storage quota has been exceeded',
        statusCode: 507,
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message,
      statusCode,
      cause: error instanceof Error ? error : undefined,
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection',
      cause: error,
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      cause: error,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
  }
}

/* ================================
   BUCKET MANAGEMENT
   ================================ */

export async function listBuckets(
  supabase: SupabaseClient
): Promise<{ data: Bucket[] | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data: data as Bucket[], error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function getBucket(
  supabase: SupabaseClient,
  bucketId: string
): Promise<{ data: Bucket | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketId)
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data: data as Bucket, error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function createBucket(
  supabase: SupabaseClient,
  bucketId: string,
  options: BucketCreateOptions = {}
): Promise<{ data: { name: string } | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.createBucket(bucketId, {
      public: options.public ?? false,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes,
    })
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function updateBucket(
  supabase: SupabaseClient,
  bucketId: string,
  options: BucketCreateOptions
): Promise<{ data: { message: string } | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.updateBucket(bucketId, {
      public: options.public ?? false,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes,
    })
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function deleteBucket(
  supabase: SupabaseClient,
  bucketId: string
): Promise<{ data: { message: string } | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.deleteBucket(bucketId)
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function emptyBucket(
  supabase: SupabaseClient,
  bucketId: string
): Promise<{ data: { message: string } | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.emptyBucket(bucketId)
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

/* ================================
   FILE OPERATIONS
   ================================ */

export async function listFiles(
  supabase: SupabaseClient,
  bucketId: string,
  path: string = '',
  options: FileListOptions = {}
): Promise<{ data: FileObject[] | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucketId).list(path, {
      limit: options.limit ?? 100,
      offset: options.offset ?? 0,
      sortBy: options.sortBy,
      search: options.search,
    })
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data: data as unknown as FileObject[], error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function uploadFile(
  supabase: SupabaseClient,
  bucketId: string,
  path: string,
  file: File | Blob | ArrayBuffer,
  options: UploadOptions = {}
): Promise<{ data: UploadResult | null; error: StorageError | null }> {
  try {
    // Validate file if it's a File object
    if (file instanceof File) {
      // Get bucket config for validation
      const { data: bucket } = await getBucket(supabase, bucketId)
      if (bucket) {
        const validation = validateFile(file, {
          allowedMimeTypes: bucket.allowed_mime_types ?? undefined,
          fileSizeLimit: bucket.file_size_limit ?? undefined,
        })
        if (!validation.valid) {
          return {
            data: null,
            error: {
              code: validation.error?.includes('size') ? 'FILE_TOO_LARGE' : 'INVALID_MIME_TYPE',
              message: validation.error || 'File validation failed',
            },
          }
        }
      }
    }

    const { data, error } = await supabase.storage.from(bucketId).upload(path, file, {
      cacheControl: options.cacheControl ?? '3600',
      contentType: options.contentType,
      upsert: options.upsert ?? false,
      duplex: options.duplex,
    })

    if (error) {
      return { data: null, error: mapStorageError(error) }
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage.from(bucketId).getPublicUrl(path)

    return {
      data: {
        path: data.path,
        id: data.id,
        fullPath: urlData.publicUrl,
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function uploadFileWithValidation(
  supabase: SupabaseClient,
  bucketId: string,
  file: File,
  config: Pick<BucketConfig, 'allowedMimeTypes' | 'fileSizeLimit'>,
  options: UploadOptions & { generateUniqueName?: boolean; folder?: string } = {}
): Promise<{ data: UploadResult | null; error: StorageError | null }> {
  // Validate file
  const validation = validateFile(file, config)
  if (!validation.valid) {
    return {
      data: null,
      error: {
        code: validation.error?.includes('size') ? 'FILE_TOO_LARGE' : 'INVALID_MIME_TYPE',
        message: validation.error || 'File validation failed',
      },
    }
  }

  // Generate path
  const filename = options.generateUniqueName ? generateUniqueFilename(file.name) : file.name
  const path = options.folder ? `${options.folder}/${filename}` : filename

  return uploadFile(supabase, bucketId, path, file, {
    ...options,
    contentType: file.type,
  })
}

export async function downloadFile(
  supabase: SupabaseClient,
  bucketId: string,
  path: string,
  options: DownloadOptions = {}
): Promise<{ data: DownloadResult | null; error: StorageError | null }> {
  try {
    const transformOptions = options.transform ? {
      width: options.transform.width,
      height: options.transform.height,
      resize: options.transform.resize,
      format: options.transform.format === 'origin' ? 'origin' as const : undefined,
      quality: options.transform.quality,
    } : undefined
    const { data, error } = await supabase.storage.from(bucketId).download(path, {
      transform: transformOptions,
    })

    if (error) {
      return { data: null, error: mapStorageError(error) }
    }

    return {
      data: {
        data,
        filename: path.split('/').pop(),
        contentType: data.type,
        size: data.size,
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function moveFile(
  supabase: SupabaseClient,
  bucketId: string,
  fromPath: string,
  toPath: string
): Promise<{ data: { message: string } | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucketId).move(fromPath, toPath)
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function copyFile(
  supabase: SupabaseClient,
  bucketId: string,
  fromPath: string,
  toPath: string
): Promise<{ data: { path: string } | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucketId).copy(fromPath, toPath)
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function deleteFile(
  supabase: SupabaseClient,
  bucketId: string,
  path: string
): Promise<{ data: FileObject[] | null; error: StorageError | null }> {
  return deleteFiles(supabase, bucketId, [path])
}

export async function deleteFiles(
  supabase: SupabaseClient,
  bucketId: string,
  paths: string[]
): Promise<{ data: FileObject[] | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucketId).remove(paths)
    if (error) {
      return { data: null, error: mapStorageError(error) }
    }
    return { data: data as unknown as FileObject[], error: null }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

/* ================================
   URL GENERATION
   ================================ */

export function getPublicUrl(
  supabase: SupabaseClient,
  bucketId: string,
  path: string,
  options?: { download?: string | boolean; transform?: ImageTransformOptions }
): string {
  const supabaseOptions = options ? {
    download: options.download,
    transform: options.transform ? {
      width: options.transform.width,
      height: options.transform.height,
      resize: options.transform.resize,
      quality: options.transform.quality,
    } : undefined,
  } : undefined
  const { data } = supabase.storage.from(bucketId).getPublicUrl(path, supabaseOptions)
  return data.publicUrl
}

export async function createSignedUrl(
  supabase: SupabaseClient,
  bucketId: string,
  path: string,
  options: SignedUrlOptions = {}
): Promise<{ data: SignedUrl | null; error: StorageError | null }> {
  try {
    const expiresIn = options.expiresIn ?? 3600 // 1 hour default
    const transformOptions = options.transform ? {
      width: options.transform.width,
      height: options.transform.height,
      resize: options.transform.resize,
      quality: options.transform.quality,
    } : undefined
    
    const { data, error } = await supabase.storage.from(bucketId).createSignedUrl(path, expiresIn, {
      download: options.download,
      transform: transformOptions,
    })

    if (error) {
      return { data: null, error: mapStorageError(error) }
    }

    return {
      data: {
        signedUrl: data.signedUrl,
        path,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function createSignedUrls(
  supabase: SupabaseClient,
  bucketId: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<{ data: SignedUrl[] | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucketId).createSignedUrls(paths, expiresIn)

    if (error) {
      return { data: null, error: mapStorageError(error) }
    }

    return {
      data: data.map((item) => ({
        signedUrl: item.signedUrl,
        path: item.path ?? '',
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      })),
      error: null,
    }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

export async function createSignedUploadUrl(
  supabase: SupabaseClient,
  bucketId: string,
  path: string
): Promise<{ data: SignedUploadUrl | null; error: StorageError | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucketId).createSignedUploadUrl(path)

    if (error) {
      return { data: null, error: mapStorageError(error) }
    }

    return {
      data: {
        signedUrl: data.signedUrl,
        path: data.path,
        token: data.token,
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

/* ================================
   IMAGE OPTIMIZATION
   ================================ */

export function getTransformedUrl(
  supabase: SupabaseClient,
  bucketId: string,
  path: string,
  transform: ImageTransformOptions
): string {
  return getPublicUrl(supabase, bucketId, path, { transform })
}

export function generateResponsiveImages(
  supabase: SupabaseClient,
  bucketId: string,
  path: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920],
  options: { format?: ImageTransformOptions['format']; quality?: number } = {}
): ResponsiveImageSet {
  const { format = 'webp', quality = 80 } = options
  const originalUrl = getPublicUrl(supabase, bucketId, path)

  const variants: OptimizedImage[] = widths.map((width) => ({
    url: getTransformedUrl(supabase, bucketId, path, {
      width,
      format,
      quality,
    }),
    width,
    format,
    quality,
  }))

  const srcset = variants.map((v) => `${v.url} ${v.width}w`).join(', ')

  return {
    original: originalUrl,
    srcset,
    variants,
  }
}

export function getOptimizedImageUrl(
  supabase: SupabaseClient,
  bucketId: string,
  path: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: ImageTransformOptions['format']
  } = {}
): string {
  const { width, height, quality = 80, format = 'webp' } = options

  return getTransformedUrl(supabase, bucketId, path, {
    width,
    height,
    quality,
    format,
  })
}

export function getThumbnailUrl(
  supabase: SupabaseClient,
  bucketId: string,
  path: string,
  size: number = 150
): string {
  return getTransformedUrl(supabase, bucketId, path, {
    width: size,
    height: size,
    resize: 'cover',
    format: 'webp',
    quality: 70,
  })
}

/* ================================
   HELPER FUNCTIONS
   ================================ */

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

export function isDocumentFile(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ]
  return documentTypes.includes(mimeType)
}

export function getFileTypeIcon(mimeType: string): string {
  if (isImageFile(mimeType)) return '🖼️'
  if (isVideoFile(mimeType)) return '🎬'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('word')) return '📘'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📗'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📙'
  return '📄'
}

export function sanitizePath(path: string): string {
  return path
    .replace(/\\/g, '/') // Replace backslashes
    .replace(/\/+/g, '/') // Remove duplicate slashes
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/$/, '') // Remove trailing slash
    .split('/')
    .map((segment) => segment.replace(/[^a-zA-Z0-9-_.]/g, '-'))
    .join('/')
}

export function joinPaths(...paths: string[]): string {
  return paths
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')
}

/* ================================
   SERVER-SIDE UTILITIES
   ================================ */

/**
 * Initialize buckets based on configuration
 * Should be called during app setup or migration
 */
export async function initializeBuckets(
  supabase: SupabaseClient,
  buckets: Record<string, { id: string; public?: boolean; allowedMimeTypes?: string[]; fileSizeLimit?: number }>
): Promise<{ created: string[]; existing: string[]; errors: { bucket: string; error: StorageError }[] }> {
  const created: string[] = []
  const existing: string[] = []
  const errors: { bucket: string; error: StorageError }[] = []

  for (const [key, config] of Object.entries(buckets)) {
    const { data: existingBucket } = await getBucket(supabase, config.id)

    if (existingBucket) {
      existing.push(config.id)
      continue
    }

    const { error } = await createBucket(supabase, config.id, {
      public: config.public,
      allowedMimeTypes: config.allowedMimeTypes,
      fileSizeLimit: config.fileSizeLimit,
    })

    if (error) {
      // Ignore "already exists" errors
      if (error.code !== 'BUCKET_ALREADY_EXISTS') {
        errors.push({ bucket: config.id, error })
      } else {
        existing.push(config.id)
      }
    } else {
      created.push(config.id)
    }
  }

  return { created, existing, errors }
}

/**
 * Get storage usage statistics for a bucket
 */
export async function getBucketStats(
  supabase: SupabaseClient,
  bucketId: string
): Promise<{
  data: { fileCount: number; totalSize: number; formattedSize: string } | null
  error: StorageError | null
}> {
  try {
    let totalSize = 0
    let fileCount = 0
    let offset = 0
    const limit = 1000

    // Paginate through all files
    while (true) {
      const { data: files, error } = await listFiles(supabase, bucketId, '', { limit, offset })

      if (error) {
        return { data: null, error }
      }

      if (!files || files.length === 0) break

      for (const file of files) {
        if (file.metadata?.size) {
          totalSize += file.metadata.size as number
          fileCount++
        }
      }

      if (files.length < limit) break
      offset += limit
    }

    return {
      data: {
        fileCount,
        totalSize,
        formattedSize: formatBytes(totalSize),
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: mapStorageError(err) }
  }
}

// Re-export types and utilities
export { validateFile, generateUniqueFilename, formatBytes }
export type { StorageError, StorageErrorCode, StorageException }
