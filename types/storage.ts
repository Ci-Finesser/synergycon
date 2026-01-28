/**
 * Supabase Storage Types
 * Complete TypeScript definitions for storage operations
 */

/* ================================
   BUCKET TYPES
   ================================ */

export type BucketVisibility = 'public' | 'private'

export interface BucketConfig {
  /** Unique bucket identifier */
  id: string
  /** Human-readable bucket name */
  name: string
  /** Whether the bucket is publicly accessible */
  public: boolean
  /** Allowed MIME types (e.g., 'image/*', 'application/pdf') */
  allowedMimeTypes?: string[]
  /** Maximum file size in bytes */
  fileSizeLimit?: number
  /** Additional bucket metadata */
  metadata?: Record<string, unknown>
}

export interface Bucket {
  id: string
  name: string
  owner: string
  public: boolean
  created_at: string
  updated_at: string
  file_size_limit: number | null
  allowed_mime_types: string[] | null
}

export interface BucketCreateOptions {
  public?: boolean
  fileSizeLimit?: number
  allowedMimeTypes?: string[]
}

/* ================================
   FILE TYPES
   ================================ */

export interface StorageFile {
  id: string
  name: string
  bucket_id: string
  owner: string | null
  created_at: string
  updated_at: string
  last_accessed_at: string
  metadata: FileMetadata | null
}

export interface FileMetadata {
  /** Original file size in bytes */
  size: number
  /** MIME type of the file */
  mimetype: string
  /** Cache control header */
  cacheControl?: string
  /** Content type header */
  contentType?: string
  /** Last modified timestamp */
  lastModified?: string
  /** Custom metadata */
  [key: string]: unknown
}

export interface FileObject {
  name: string
  id: string | null
  updated_at: string | null
  created_at: string | null
  last_accessed_at: string | null
  metadata: FileMetadata | null
}

export interface FileListOptions {
  /** Maximum number of files to return */
  limit?: number
  /** Number of files to skip */
  offset?: number
  /** Column to sort by */
  sortBy?: {
    column: 'name' | 'created_at' | 'updated_at' | 'last_accessed_at'
    order: 'asc' | 'desc'
  }
  /** Search query to filter files */
  search?: string
}

/* ================================
   UPLOAD TYPES
   ================================ */

export interface UploadOptions {
  /** Cache control header for the file */
  cacheControl?: string
  /** Content type override */
  contentType?: string
  /** Upsert if file exists */
  upsert?: boolean
  /** Duplex mode for streaming */
  duplex?: 'half'
  /** Custom metadata to attach to the file */
  metadata?: Record<string, unknown>
}

export interface UploadProgress {
  /** Bytes uploaded so far */
  loaded: number
  /** Total bytes to upload */
  total: number
  /** Upload percentage (0-100) */
  percentage: number
  /** Upload speed in bytes per second */
  speed?: number
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number
}

export interface UploadResult {
  /** Path to the uploaded file */
  path: string
  /** Unique file ID */
  id: string
  /** Full URL to the file (for public buckets) */
  fullPath: string
}

export interface UploadState {
  /** Current upload status */
  status: 'idle' | 'uploading' | 'success' | 'error'
  /** Upload progress information */
  progress: UploadProgress
  /** Error message if status is 'error' */
  error?: string
  /** Result if status is 'success' */
  result?: UploadResult
}

export interface MultiUploadState {
  /** Overall status */
  status: 'idle' | 'uploading' | 'success' | 'error' | 'partial'
  /** Individual file upload states */
  files: Map<string, UploadState>
  /** Number of successfully uploaded files */
  completed: number
  /** Number of failed uploads */
  failed: number
  /** Total number of files */
  total: number
}

/* ================================
   DOWNLOAD TYPES
   ================================ */

export interface DownloadOptions {
  /** Transform the file (for images) */
  transform?: ImageTransformOptions
}

export interface DownloadResult {
  /** Blob data of the file */
  data: Blob
  /** Suggested filename */
  filename?: string
  /** MIME type */
  contentType?: string
  /** File size in bytes */
  size?: number
}

export interface DownloadState {
  /** Current download status */
  status: 'idle' | 'downloading' | 'success' | 'error'
  /** Download progress */
  progress: DownloadProgress
  /** Error message if status is 'error' */
  error?: string
  /** Result if status is 'success' */
  result?: DownloadResult
}

export interface DownloadProgress {
  /** Bytes downloaded so far */
  loaded: number
  /** Total bytes to download (if known) */
  total: number | null
  /** Download percentage (0-100), null if total unknown */
  percentage: number | null
}

/* ================================
   IMAGE TRANSFORMATION TYPES
   ================================ */

export type ImageFormat = 'origin' | 'avif' | 'webp' | 'png' | 'jpeg'
export type ResizeMode = 'cover' | 'contain' | 'fill'

export interface ImageTransformOptions {
  /** Resize width in pixels */
  width?: number
  /** Resize height in pixels */
  height?: number
  /** Resize mode */
  resize?: ResizeMode
  /** Output format */
  format?: ImageFormat
  /** Quality for lossy formats (1-100) */
  quality?: number
}

export interface OptimizedImage {
  /** URL to the optimized image */
  url: string
  /** Width of the optimized image */
  width?: number
  /** Height of the optimized image */
  height?: number
  /** Format of the optimized image */
  format: ImageFormat
  /** Quality setting applied */
  quality?: number
}

export interface ResponsiveImageSet {
  /** Original image URL */
  original: string
  /** Srcset string for responsive images */
  srcset: string
  /** Array of optimized image variants */
  variants: OptimizedImage[]
}

/* ================================
   SIGNED URL TYPES
   ================================ */

export interface SignedUrlOptions {
  /** Expiration time in seconds (default: 3600 = 1 hour) */
  expiresIn?: number
  /** Apply image transformations */
  transform?: ImageTransformOptions
  /** Force download with specific filename */
  download?: string | boolean
}

export interface SignedUrl {
  /** The signed URL */
  signedUrl: string
  /** URL path */
  path: string
  /** Token for the URL */
  token?: string
  /** Expiration timestamp */
  expiresAt?: Date
}

export interface SignedUploadUrl {
  /** The signed upload URL */
  signedUrl: string
  /** Path where file will be uploaded */
  path: string
  /** Token for the upload */
  token: string
}

/* ================================
   ERROR TYPES
   ================================ */

export type StorageErrorCode =
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

export interface StorageError {
  /** Error code for programmatic handling */
  code: StorageErrorCode
  /** Human-readable error message */
  message: string
  /** HTTP status code if applicable */
  statusCode?: number
  /** Original error for debugging */
  cause?: Error
  /** Additional error details */
  details?: Record<string, unknown>
}

export class StorageException extends Error {
  readonly code: StorageErrorCode
  readonly statusCode?: number
  readonly details?: Record<string, unknown>

  constructor(error: StorageError) {
    super(error.message)
    this.name = 'StorageException'
    this.code = error.code
    this.statusCode = error.statusCode
    this.details = error.details
    if (error.cause) {
      this.cause = error.cause
    }
  }

  toJSON(): StorageError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    }
  }
}

/* ================================
   API REQUEST/RESPONSE TYPES
   ================================ */

export interface StorageUploadRequest {
  /** Target bucket ID */
  bucketId: string
  /** File path within the bucket */
  path: string
  /** File content type */
  contentType: string
  /** Whether to upsert */
  upsert?: boolean
  /** Custom metadata */
  metadata?: Record<string, unknown>
}

export interface StorageDownloadRequest {
  /** Target bucket ID */
  bucketId: string
  /** File path within the bucket */
  path: string
  /** Image transformations */
  transform?: ImageTransformOptions
}

export interface StorageDeleteRequest {
  /** Target bucket ID */
  bucketId: string
  /** File paths to delete */
  paths: string[]
}

export interface StorageListRequest {
  /** Target bucket ID */
  bucketId: string
  /** Folder path to list */
  path?: string
  /** List options */
  options?: FileListOptions
}

export interface StorageSignedUrlRequest {
  /** Target bucket ID */
  bucketId: string
  /** File path within the bucket */
  path: string
  /** Signed URL options */
  options?: SignedUrlOptions
}

export interface StorageApiResponse<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean
  /** Response data if successful */
  data?: T
  /** Error information if failed */
  error?: StorageError
}

/* ================================
   HOOK TYPES
   ================================ */

export interface UseStorageUploadOptions {
  /** Target bucket ID */
  bucketId: string
  /** File path within the bucket (optional, can be set per upload) */
  path?: string
  /** Upload options */
  options?: UploadOptions
  /** Callback on upload progress */
  onProgress?: (progress: UploadProgress) => void
  /** Callback on upload success */
  onSuccess?: (result: UploadResult) => void
  /** Callback on upload error */
  onError?: (error: StorageError) => void
}

export interface UseStorageDownloadOptions {
  /** Target bucket ID */
  bucketId: string
  /** File path within the bucket */
  path: string
  /** Download options */
  options?: DownloadOptions
  /** Auto-download on mount */
  autoDownload?: boolean
  /** Callback on download success */
  onSuccess?: (result: DownloadResult) => void
  /** Callback on download error */
  onError?: (error: StorageError) => void
}

export interface UseStorageListOptions {
  /** Target bucket ID */
  bucketId: string
  /** Folder path to list */
  path?: string
  /** List options */
  options?: FileListOptions
  /** Auto-fetch on mount */
  autoFetch?: boolean
  /** Callback on list success */
  onSuccess?: (files: FileObject[]) => void
  /** Callback on list error */
  onError?: (error: StorageError) => void
}

export interface UseStorageDeleteOptions {
  /** Target bucket ID */
  bucketId: string
  /** Callback on delete success */
  onSuccess?: (paths: string[]) => void
  /** Callback on delete error */
  onError?: (error: StorageError) => void
}

/* ================================
   BUCKET CONFIGURATIONS
   ================================ */

/** Pre-configured bucket definitions for the application */
export const STORAGE_BUCKETS = {
  /** Public assets bucket (logos, icons, etc.) */
  PUBLIC_ASSETS: {
    id: 'public-assets',
    name: 'Public Assets',
    public: true,
    allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  },
  /** Speaker profile images */
  SPEAKERS: {
    id: 'speakers',
    name: 'Speaker Images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  /** Partner logos */
  PARTNERS: {
    id: 'partners',
    name: 'Partner Logos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    fileSizeLimit: 2 * 1024 * 1024, // 2MB
  },
  /** Gallery images */
  GALLERY: {
    id: 'gallery',
    name: 'Gallery Images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 15 * 1024 * 1024, // 15MB
  },
  /** Private user uploads */
  USER_UPLOADS: {
    id: 'user-uploads',
    name: 'User Uploads',
    public: false,
    allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    fileSizeLimit: 20 * 1024 * 1024, // 20MB
  },
  /** Admin-only documents */
  ADMIN_DOCUMENTS: {
    id: 'admin-documents',
    name: 'Admin Documents',
    public: false,
    allowedMimeTypes: ['*/*'],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
  },
} as const satisfies Record<string, BucketConfig>

export type StorageBucketId = keyof typeof STORAGE_BUCKETS

/* ================================
   HELPER TYPES
   ================================ */

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
}

export function validateFile(
  file: File,
  config: Pick<BucketConfig, 'allowedMimeTypes' | 'fileSizeLimit'>
): FileValidationResult {
  // Check file size
  if (config.fileSizeLimit && file.size > config.fileSizeLimit) {
    return {
      valid: false,
      error: `File size exceeds limit of ${formatBytes(config.fileSizeLimit)}`,
    }
  }

  // Check MIME type
  if (config.allowedMimeTypes && config.allowedMimeTypes.length > 0) {
    const isAllowed = config.allowedMimeTypes.some((pattern) => {
      if (pattern === '*/*') return true
      if (pattern.endsWith('/*')) {
        const [type] = pattern.split('/')
        return file.type.startsWith(`${type}/`)
      }
      return file.type === pattern
    })

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
      }
    }
  }

  return { valid: true }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot !== -1 ? filename.slice(lastDot + 1).toLowerCase() : ''
}

export function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName)
  const baseName = originalName.slice(0, originalName.lastIndexOf('.') || originalName.length)
  const sanitizedBase = baseName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return ext ? `${sanitizedBase}-${timestamp}-${random}.${ext}` : `${sanitizedBase}-${timestamp}-${random}`
}
