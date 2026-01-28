
//  Storage React Hooks
//  Client-side hooks for Supabase Storage operations with state management
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  uploadFile,
  uploadFileWithValidation,
  downloadFile,
  listFiles,
  deleteFiles,
  createSignedUrl,
  getPublicUrl,
  getTransformedUrl,
  generateResponsiveImages,
} from '@/lib/supabase/storage'
import type {
  UploadOptions,
  UploadProgress,
  UploadResult,
  UploadState,
  MultiUploadState,
  DownloadOptions,
  DownloadResult,
  DownloadState,
  DownloadProgress,
  FileObject,
  FileListOptions,
  StorageError,
  SignedUrl,
  SignedUrlOptions,
  ImageTransformOptions,
  BucketConfig,
  UseStorageUploadOptions,
  UseStorageDownloadOptions,
  UseStorageListOptions,
  UseStorageDeleteOptions,
  ResponsiveImageSet,
} from '@/types/storage'
import { STORAGE_BUCKETS, validateFile, generateUniqueFilename } from '@/types/storage'

/* ================================
   UPLOAD HOOK
   ================================ */

interface UseStorageUploadReturn {
  /** Upload a file */
  upload: (file: File, path?: string) => Promise<UploadResult | null>
  /** Upload multiple files */
  uploadMultiple: (files: File[], folder?: string) => Promise<(UploadResult | null)[]>
  /** Current upload state */
  state: UploadState
  /** Multi-file upload state */
  multiState: MultiUploadState
  /** Reset upload state */
  reset: () => void
  /** Cancel current upload */
  cancel: () => void
  /** Whether upload is in progress */
  isUploading: boolean
}

const initialUploadState: UploadState = {
  status: 'idle',
  progress: { loaded: 0, total: 0, percentage: 0 },
}

const initialMultiState: MultiUploadState = {
  status: 'idle',
  files: new Map(),
  completed: 0,
  failed: 0,
  total: 0,
}

export function useStorageUpload(options: UseStorageUploadOptions): UseStorageUploadReturn {
  const { bucketId, path: basePath, options: uploadOptions, onProgress, onSuccess, onError } = options

  const [state, setState] = useState<UploadState>(initialUploadState)
  const [multiState, setMultiState] = useState<MultiUploadState>(initialMultiState)
  const abortControllerRef = useRef<AbortController | null>(null)
  const supabase = createBrowserClient()

  const reset = useCallback(() => {
    setState(initialUploadState)
    setMultiState(initialMultiState)
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState((prev) => ({ ...prev, status: 'idle' }))
  }, [])

  const upload = useCallback(
    async (file: File, path?: string): Promise<UploadResult | null> => {
      abortControllerRef.current = new AbortController()

      const filePath = path || (basePath ? `${basePath}/${file.name}` : file.name)

      // Update state to uploading
      setState({
        status: 'uploading',
        progress: { loaded: 0, total: file.size, percentage: 0 },
      })

      try {
        // Simulate progress (Supabase doesn't provide real progress)
        const progressInterval = setInterval(() => {
          setState((prev) => {
            if (prev.status !== 'uploading') {
              clearInterval(progressInterval)
              return prev
            }
            const newLoaded = Math.min(prev.progress.loaded + file.size * 0.1, file.size * 0.9)
            const newProgress: UploadProgress = {
              loaded: newLoaded,
              total: file.size,
              percentage: Math.round((newLoaded / file.size) * 100),
            }
            onProgress?.(newProgress)
            return { ...prev, progress: newProgress }
          })
        }, 100)

        const { data, error } = await uploadFile(supabase, bucketId, filePath, file, {
          ...uploadOptions,
          contentType: file.type,
        })

        clearInterval(progressInterval)

        if (error) {
          setState({
            status: 'error',
            progress: { loaded: 0, total: file.size, percentage: 0 },
            error: error.message,
          })
          onError?.(error)
          return null
        }

        const result = data!
        setState({
          status: 'success',
          progress: { loaded: file.size, total: file.size, percentage: 100 },
          result,
        })
        onSuccess?.(result)
        return result
      } catch (err) {
        const error: StorageError = {
          code: 'UPLOAD_FAILED',
          message: err instanceof Error ? err.message : 'Upload failed',
        }
        setState({
          status: 'error',
          progress: { loaded: 0, total: file.size, percentage: 0 },
          error: error.message,
        })
        onError?.(error)
        return null
      }
    },
    [bucketId, basePath, uploadOptions, supabase, onProgress, onSuccess, onError]
  )

  const uploadMultiple = useCallback(
    async (files: File[], folder?: string): Promise<(UploadResult | null)[]> => {
      const fileMap = new Map<string, UploadState>()
      files.forEach((file) => {
        fileMap.set(file.name, { ...initialUploadState })
      })

      setMultiState({
        status: 'uploading',
        files: fileMap,
        completed: 0,
        failed: 0,
        total: files.length,
      })

      const results: (UploadResult | null)[] = []

      for (const file of files) {
        const filePath = folder ? `${folder}/${generateUniqueFilename(file.name)}` : generateUniqueFilename(file.name)

        // Update file state to uploading
        setMultiState((prev) => {
          const newFiles = new Map(prev.files)
          newFiles.set(file.name, { status: 'uploading', progress: { loaded: 0, total: file.size, percentage: 0 } })
          return { ...prev, files: newFiles }
        })

        const { data, error } = await uploadFile(supabase, bucketId, filePath, file, {
          ...uploadOptions,
          contentType: file.type,
        })

        if (error) {
          setMultiState((prev) => {
            const newFiles = new Map(prev.files)
            newFiles.set(file.name, {
              status: 'error',
              progress: { loaded: 0, total: file.size, percentage: 0 },
              error: error.message,
            })
            return { ...prev, files: newFiles, failed: prev.failed + 1 }
          })
          results.push(null)
        } else {
          setMultiState((prev) => {
            const newFiles = new Map(prev.files)
            newFiles.set(file.name, {
              status: 'success',
              progress: { loaded: file.size, total: file.size, percentage: 100 },
              result: data!,
            })
            return { ...prev, files: newFiles, completed: prev.completed + 1 }
          })
          results.push(data)
        }
      }

      setMultiState((prev) => ({
        ...prev,
        status: prev.failed === prev.total ? 'error' : prev.failed > 0 ? 'partial' : 'success',
      }))

      return results
    },
    [bucketId, uploadOptions, supabase]
  )

  return {
    upload,
    uploadMultiple,
    state,
    multiState,
    reset,
    cancel,
    isUploading: state.status === 'uploading' || multiState.status === 'uploading',
  }
}

/* ================================
   DOWNLOAD HOOK
   ================================ */

interface UseStorageDownloadReturn {
  /** Download the file */
  download: () => Promise<DownloadResult | null>
  /** Download and trigger browser save dialog */
  downloadToDevice: (filename?: string) => Promise<void>
  /** Current download state */
  state: DownloadState
  /** Reset download state */
  reset: () => void
  /** Whether download is in progress */
  isDownloading: boolean
}

const initialDownloadState: DownloadState = {
  status: 'idle',
  progress: { loaded: 0, total: null, percentage: null },
}

export function useStorageDownload(options: UseStorageDownloadOptions): UseStorageDownloadReturn {
  const { bucketId, path, options: downloadOptions, autoDownload, onSuccess, onError } = options

  const [state, setState] = useState<DownloadState>(initialDownloadState)
  const supabase = createBrowserClient()

  const reset = useCallback(() => {
    setState(initialDownloadState)
  }, [])

  const download = useCallback(async (): Promise<DownloadResult | null> => {
    setState({
      status: 'downloading',
      progress: { loaded: 0, total: null, percentage: null },
    })

    try {
      const { data, error } = await downloadFile(supabase, bucketId, path, downloadOptions)

      if (error) {
        setState({
          status: 'error',
          progress: { loaded: 0, total: null, percentage: null },
          error: error.message,
        })
        onError?.(error)
        return null
      }

      const result = data!
      setState({
        status: 'success',
        progress: { loaded: result.size || 0, total: result.size || null, percentage: 100 },
        result,
      })
      onSuccess?.(result)
      return result
    } catch (err) {
      const error: StorageError = {
        code: 'DOWNLOAD_FAILED',
        message: err instanceof Error ? err.message : 'Download failed',
      }
      setState({
        status: 'error',
        progress: { loaded: 0, total: null, percentage: null },
        error: error.message,
      })
      onError?.(error)
      return null
    }
  }, [bucketId, path, downloadOptions, supabase, onSuccess, onError])

  const downloadToDevice = useCallback(
    async (filename?: string) => {
      const result = await download()
      if (result) {
        const url = URL.createObjectURL(result.data)
        const a = document.createElement('a')
        a.href = url
        a.download = filename || result.filename || 'download'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    },
    [download]
  )

  useEffect(() => {
    if (autoDownload) {
      download()
    }
  }, [autoDownload, download])

  return {
    download,
    downloadToDevice,
    state,
    reset,
    isDownloading: state.status === 'downloading',
  }
}

/* ================================
   LIST HOOK
   ================================ */

interface UseStorageListReturn {
  /** Fetch the file list */
  fetch: () => Promise<FileObject[] | null>
  /** Refresh the file list */
  refresh: () => Promise<FileObject[] | null>
  /** Files in the folder */
  files: FileObject[]
  /** Whether list is loading */
  isLoading: boolean
  /** Error if any */
  error: string | null
  /** Reset state */
  reset: () => void
}

export function useStorageList(options: UseStorageListOptions): UseStorageListReturn {
  const { bucketId, path = '', options: listOptions, autoFetch = true, onSuccess, onError } = options

  const [files, setFiles] = useState<FileObject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  const fetch = useCallback(async (): Promise<FileObject[] | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: storageError } = await listFiles(supabase, bucketId, path, listOptions)

      if (storageError) {
        setError(storageError.message)
        onError?.(storageError)
        return null
      }

      const result = data || []
      setFiles(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list files'
      setError(errorMessage)
      onError?.({ code: 'UNKNOWN_ERROR', message: errorMessage })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [bucketId, path, listOptions, supabase, onSuccess, onError])

  const refresh = useCallback(async () => {
    return fetch()
  }, [fetch])

  const reset = useCallback(() => {
    setFiles([])
    setIsLoading(false)
    setError(null)
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetch()
    }
  }, [autoFetch, fetch])

  return {
    fetch,
    refresh,
    files,
    isLoading,
    error,
    reset,
  }
}

/* ================================
   DELETE HOOK
   ================================ */

interface UseStorageDeleteReturn {
  /** Delete a single file */
  deleteFile: (path: string) => Promise<boolean>
  /** Delete multiple files */
  deleteFiles: (paths: string[]) => Promise<{ success: string[]; failed: string[] }>
  /** Whether delete is in progress */
  isDeleting: boolean
  /** Error if any */
  error: string | null
  /** Reset state */
  reset: () => void
}

export function useStorageDelete(options: UseStorageDeleteOptions): UseStorageDeleteReturn {
  const { bucketId, onSuccess, onError } = options

  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  const reset = useCallback(() => {
    setIsDeleting(false)
    setError(null)
  }, [])

  const deleteFileFn = useCallback(
    async (path: string): Promise<boolean> => {
      setIsDeleting(true)
      setError(null)

      try {
        const { error: storageError } = await deleteFiles(supabase, bucketId, [path])

        if (storageError) {
          setError(storageError.message)
          onError?.(storageError)
          return false
        }

        onSuccess?.([path])
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Delete failed'
        setError(errorMessage)
        onError?.({ code: 'DELETE_FAILED', message: errorMessage })
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [bucketId, supabase, onSuccess, onError]
  )

  const deleteFilesFn = useCallback(
    async (paths: string[]): Promise<{ success: string[]; failed: string[] }> => {
      setIsDeleting(true)
      setError(null)

      const success: string[] = []
      const failed: string[] = []

      try {
        const { data, error: storageError } = await deleteFiles(supabase, bucketId, paths)

        if (storageError) {
          failed.push(...paths)
          setError(storageError.message)
          onError?.(storageError)
        } else if (data) {
          success.push(...paths)
          onSuccess?.(paths)
        }
      } catch (err) {
        failed.push(...paths)
        const errorMessage = err instanceof Error ? err.message : 'Delete failed'
        setError(errorMessage)
        onError?.({ code: 'DELETE_FAILED', message: errorMessage })
      } finally {
        setIsDeleting(false)
      }

      return { success, failed }
    },
    [bucketId, supabase, onSuccess, onError]
  )

  return {
    deleteFile: deleteFileFn,
    deleteFiles: deleteFilesFn,
    isDeleting,
    error,
    reset,
  }
}

/* ================================
   SIGNED URL HOOK
   ================================ */

interface UseSignedUrlOptions {
  bucketId: string
  path: string
  options?: SignedUrlOptions
  autoGenerate?: boolean
}

interface UseSignedUrlReturn {
  /** Generate signed URL */
  generate: () => Promise<SignedUrl | null>
  /** Current signed URL */
  url: string | null
  /** Expiration timestamp */
  expiresAt: Date | null
  /** Whether URL is still valid */
  isValid: boolean
  /** Whether generating */
  isLoading: boolean
  /** Error if any */
  error: string | null
}

export function useSignedUrl(options: UseSignedUrlOptions): UseSignedUrlReturn {
  const { bucketId, path, options: urlOptions, autoGenerate = true } = options

  const [url, setUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  const isValid = expiresAt ? expiresAt > new Date() : false

  const generate = useCallback(async (): Promise<SignedUrl | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: storageError } = await createSignedUrl(supabase, bucketId, path, urlOptions)

      if (storageError) {
        setError(storageError.message)
        return null
      }

      if (data) {
        setUrl(data.signedUrl)
        setExpiresAt(data.expiresAt || null)
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate signed URL'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [bucketId, path, urlOptions, supabase])

  useEffect(() => {
    if (autoGenerate) {
      generate()
    }
  }, [autoGenerate, generate])

  // Auto-refresh before expiration
  useEffect(() => {
    if (!expiresAt) return

    const msUntilExpiry = expiresAt.getTime() - Date.now()
    const refreshBuffer = 60 * 1000 // 1 minute before expiry

    if (msUntilExpiry > refreshBuffer) {
      const timeout = setTimeout(() => {
        generate()
      }, msUntilExpiry - refreshBuffer)

      return () => clearTimeout(timeout)
    }
  }, [expiresAt, generate])

  return {
    generate,
    url,
    expiresAt,
    isValid,
    isLoading,
    error,
  }
}

/* ================================
   PUBLIC URL HOOK
   ================================ */

interface UsePublicUrlOptions {
  bucketId: string
  path: string
  transform?: ImageTransformOptions
}

export function usePublicUrl(options: UsePublicUrlOptions): string {
  const { bucketId, path, transform } = options
  const supabase = createBrowserClient()

  if (transform) {
    return getTransformedUrl(supabase, bucketId, path, transform)
  }

  return getPublicUrl(supabase, bucketId, path)
}

/* ================================
   RESPONSIVE IMAGE HOOK
   ================================ */

interface UseResponsiveImageOptions {
  bucketId: string
  path: string
  widths?: number[]
  format?: ImageTransformOptions['format']
  quality?: number
}

export function useResponsiveImage(options: UseResponsiveImageOptions): ResponsiveImageSet {
  const { bucketId, path, widths, format, quality } = options
  const supabase = createBrowserClient()

  return generateResponsiveImages(supabase, bucketId, path, widths, { format, quality })
}

/* ================================
   FILE VALIDATION HOOK
   ================================ */

interface UseFileValidationOptions {
  allowedMimeTypes?: string[]
  fileSizeLimit?: number
}

interface UseFileValidationReturn {
  /** Validate a file */
  validate: (file: File) => { valid: boolean; error?: string }
  /** Validate multiple files */
  validateMultiple: (files: File[]) => { valid: File[]; invalid: { file: File; error: string }[] }
}

export function useFileValidation(options: UseFileValidationOptions): UseFileValidationReturn {
  const validate = useCallback(
    (file: File) => {
      return validateFile(file, options)
    },
    [options]
  )

  const validateMultiple = useCallback(
    (files: File[]) => {
      const valid: File[] = []
      const invalid: { file: File; error: string }[] = []

      for (const file of files) {
        const result = validateFile(file, options)
        if (result.valid) {
          valid.push(file)
        } else {
          invalid.push({ file, error: result.error || 'Validation failed' })
        }
      }

      return { valid, invalid }
    },
    [options]
  )

  return { validate, validateMultiple }
}

/* ================================
   COMBINED STORAGE HOOK
   ================================ */

interface UseStorageOptions {
  bucketId: string
  folder?: string
}

interface UseStorageReturn {
  /** Upload utilities */
  upload: UseStorageUploadReturn
  /** List utilities */
  list: UseStorageListReturn
  /** Delete utilities */
  delete: UseStorageDeleteReturn
  /** Get public URL */
  getUrl: (path: string, transform?: ImageTransformOptions) => string
  /** Get signed URL */
  getSignedUrl: (path: string, options?: SignedUrlOptions) => Promise<SignedUrl | null>
}

export function useStorage(options: UseStorageOptions): UseStorageReturn {
  const { bucketId, folder = '' } = options
  const supabase = createBrowserClient()

  const uploadHook = useStorageUpload({ bucketId, path: folder })
  const listHook = useStorageList({ bucketId, path: folder })
  const deleteHook = useStorageDelete({ bucketId })

  const getUrl = useCallback(
    (path: string, transform?: ImageTransformOptions) => {
      const fullPath = folder ? `${folder}/${path}` : path
      if (transform) {
        return getTransformedUrl(supabase, bucketId, fullPath, transform)
      }
      return getPublicUrl(supabase, bucketId, fullPath)
    },
    [bucketId, folder, supabase]
  )

  const getSignedUrlFn = useCallback(
    async (path: string, urlOptions?: SignedUrlOptions) => {
      const fullPath = folder ? `${folder}/${path}` : path
      const { data } = await createSignedUrl(supabase, bucketId, fullPath, urlOptions)
      return data
    },
    [bucketId, folder, supabase]
  )

  return {
    upload: uploadHook,
    list: listHook,
    delete: deleteHook,
    getUrl,
    getSignedUrl: getSignedUrlFn,
  }
}

// Export bucket configs for convenience
export { STORAGE_BUCKETS }
