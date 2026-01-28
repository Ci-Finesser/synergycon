/**
 * Central Types Index
 * 
 * This file serves as the single source of truth for all type definitions.
 * All types are consolidated from subdirectories and re-exported for use throughout the application.
 * 
 * IMPORTANT: Use this as the primary import for all types
 * Example: import type { User, Ticket, AuthState } from '@/types'
 */

/* ================================
   USER TYPES
   ================================ */
export type {
  UserType,
  UserRole,
  UserRoles,
  User,
  UserProfile,
  UserSession,
  OTPPurpose,
  OTPCode,
  TicketType as UserTicketType,
  TicketTier,
  TicketDuration,
  PassDuration,
  TicketStatus,
  Ticket as UserTicket,
  TicketOrder,
  AttendeeRegistration,
  SpeakerRole,
  SessionFormat,
  ApplicationStatus,
  SpeakerApplication,
  SpeakerCommunication,
  SponsorshipTier,
  SponsorCategory,
  PartnershipType,
  PartnershipInterest,
  PartnershipApplication,
  SponsorshipBenefits,
  AdminPermission,
  AdminRole,
  InvitationStatus,
  EnterpriseMember,
  ScanType,
  BarcodeScan,
  TemplateType,
  SocialPlatform,
  SharingTemplate,
  ActionCategory,
  LogSeverity,
  AuditLog,
  AttendanceRecord,
  PaymentStatus as UserPaymentStatus,
  Payment,
  IndividualRegistrationDTO,
  EnterpriseRegistrationDTO,
  LoginRequestDTO,
  VerifyOTPDTO,
  SessionDTO,
  PublicProfileDTO,
  FormSecurityFields,
} from './user'

/* ================================
   PAYMENT TYPES
   ================================ */
export type {
  PaymentProvider,
  PaymentCurrency,
  PaymentEnvironment,
  PaymentCustomer,
  TicketItem,
  PaymentMetadata,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  PaymentStatusResponse,
  PaymentStatus,
  OrderPaymentStatus,
  OrderStatus,
  PaymentRecord,
  TicketOrder as PaymentTicketOrder,
  FlutterwavePaymentRequest,
  FlutterwaveResponse,
  FlutterwaveTransaction,
  FlutterwaveWebhookEvent,
  FlutterwaveWebhookPayload,
  PaymentHookState,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentStatusResult,
  RefundStatus,
  RefundRequest,
  RefundRecord,
  PaymentSummary,
  PaymentTransactionReport,
  AdminPaymentUpdateRequest,
  AdminPaymentQueryParams,
  AdminPaymentListResponse,
  AdminPaymentUpdateResponse,
  PaymentStats,
  TicketStats as PaymentTicketStats,
  DailyRevenue,
  PaymentMethodStats,
  PaymentAnalytics,
  AdminPaymentExportRequest,
  AdminPaymentExportResponse,
  AdminRefundRequest,
  AdminRefundResponse,
  AdminPaymentAuditLog,
  AdminPaymentFilterOptions,
} from './payment'

/* ================================
   TICKET TYPES
   ================================ */
export type {
  TicketType as TicketTypeDefinition,
  PublicTicket,
  TicketCreateRequest,
  TicketUpdateRequest,
  TicketDeleteRequest,
  AdminTicketListResponse,
  AdminTicketResponse,
  TicketStats as TicketStatsDefinition,
  TicketQueryParams,
  TicketValidation,
  TicketValidationRequest,
  TicketValidationResponse,
  ValidationStats,
  TicketCheckRequest,
  TicketCheckResponse,
} from './ticket'

/* ================================
   STORE TYPES
   ================================ */
export type {
  AuthState,
  StoreTicket,
  TeamMember,
  TicketsState,
  PermissionStatus,
  Notification,
  NotificationSettings,
  PushSubscriptionData,
  NotificationState,
  NetworkQuality,
  ConnectionType,
  NetworkState,
  CacheStats,
  CacheItem,
  CacheState,
  PWAInstallState,
  SyncRequest,
  SyncQueueState,
} from './stores'

/* ================================
   ADMIN TYPES
   ================================ */
export type {
  AdminUser,
  AdminPermission as AdminPermissionType,
  AdminRole as AdminRoleType,
  AdminSessionInfo,
  AdminDeviceInfo,
  AdminAuditLog,
  TwoFactorConfig,
  TwoFactorVerification,
  AdminStats,
  AdminNotification,
} from './admin'

/* ================================
   UTILITY TYPES
   ================================ */
export type {
  SessionInfo,
  DeviceInfo,
  SecurityEvent,
  RateLimitEntry,
  RateLimitConfig,
  SecureRequestBody,
  BotCheckResult,
  HoneypotConfig,
  HoneypotValidation,
  Registration,
  EmailTemplate,
  EmailData,
  CookieData,
  CookiesStore,
  FileUploadConfig,
  UploadedFile,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  ApiErrorResponse,
  SearchFilter,
  SearchQuery,
  FormValidationError,
  FormValidationResult,
} from './utils'

/* ================================
   ENCRYPTION TYPES
   ================================ */
export type {
  EncryptedData,
  EncryptionOptions,
  DecryptionOptions,
  ClientEncryptedData,
  ClientEncryptionConfig,
  KeyPair,
  SerializedKeyPair,
  HybridEncryptedData,
  HybridKeyPairConfig,
  EncryptionResult,
  DecryptionResult,
  KeyRotationPolicy,
  KeyMetadata,
  EncryptedStorageItem,
  EncryptionStorageConfig,
  EncryptedField,
  FieldEncryptionConfig,
  EncryptionAlgorithm,
  AlgorithmConfig,
} from './encryption'

/* ================================
   HOOK TYPES
   ================================ */
export type {
  ToastActionElement,
  ToastProps,
  ToasterToast,
  ActionType,
  Toast,
  ToastState,
  ToastAction,
  UseToastReturn,
  SecurityState,
  UseFormSecurityReturn,
  BeforeInstallPromptEvent,
  UsePWAReturn,
  UsePaginationReturn,
  UseFetchState,
  UseFetchReturn,
  UseInfiniteScrollReturn,
  UseLocalStorageReturn,
  UseDebouncedReturn,
  UseDebouncedOptions,
  UseThrottledReturn,
  UseThrottledOptions,
  UseAdminPaymentsReturn,
  AsyncHookState,
  AsyncHookReturn,
  AnalyticsResult,
  PaymentsListResult,
} from './hooks'

/* ================================
   COMPONENT TYPES
   ================================ */
export type {
  Speaker,
  SpeakerSocials,
  SpeakerCardProps,
  SpeakerBioModalProps,
  SpeakerSectionProps,
  Partner,
  PartnerCardProps,
  PartnerSectionProps,
  BioModalProps,
  Sponsor,
  MergedSponsor,
  SponsorCardProps,
  SponsorSectionProps,
  ButtonVariant,
  ButtonSize,
  ButtonProps,
  InputProps,
  HoneypotFieldsProps,
  FormFieldProps,
  FormSectionProps,
  ModalProps,
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  BadgeVariant,
  BadgeProps,
  LoaderProps,
  AlertVariant,
  AlertProps,
  Admin,
  AdminUsersManagerProps,
  TwoFactorVerificationProps,
  VideoLightboxProps,
  NewsletterWelcomeEmailProps,
  EmailComponentProps,
  SectionProps,
  PaginationProps,
  TabItem,
  TabsProps,
} from './components'

/* ================================
   TYPE CONSTANTS & ENUMS
   ================================ */

// User role options
export const USER_ROLES = {
  ATTENDEE: 'attendee',
  SPEAKER: 'speaker',
  SPONSOR: 'sponsor',
  PARTNER: 'partner',
  ADMIN: 'admin',
} as const

// User type options
export const USER_TYPES = {
  INDIVIDUAL: 'individual',
  ENTERPRISE: 'enterprise',
} as const

// Ticket status options
export const TICKET_STATUSES = {
  ACTIVE: 'active',
  USED: 'used',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

// Payment status options
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

// Admin roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const

// Sponsorship tiers
export const SPONSORSHIP_TIERS = {
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
  ECOSYSTEM: 'ecosystem',
  PRINCIPAL: 'principal',
} as const

// Alert variants
export const ALERT_VARIANTS = {
  DEFAULT: 'default',
  DESTRUCTIVE: 'destructive',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
} as const

// Button variants
export const BUTTON_VARIANTS = {
  DEFAULT: 'default',
  DESTRUCTIVE: 'destructive',
  OUTLINE: 'outline',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  LINK: 'link',
} as const

// Button sizes
export const BUTTON_SIZES = {
  DEFAULT: 'default',
  SM: 'sm',
  LG: 'lg',
  ICON: 'icon',
  ICON_SM: 'icon-sm',
  ICON_LG: 'icon-lg',
} as const

/* ================================
   STORAGE TYPES
   ================================ */
export type {
  BucketVisibility,
  BucketConfig,
  Bucket,
  BucketCreateOptions,
  StorageFile,
  FileMetadata,
  FileObject,
  FileListOptions,
  UploadOptions,
  UploadProgress,
  UploadResult,
  UploadState,
  MultiUploadState,
  DownloadOptions,
  DownloadResult,
  DownloadState,
  DownloadProgress,
  ImageFormat,
  ResizeMode,
  ImageTransformOptions,
  OptimizedImage,
  ResponsiveImageSet,
  SignedUrlOptions,
  SignedUrl,
  SignedUploadUrl,
  StorageErrorCode,
  StorageError,
  StorageUploadRequest,
  StorageDownloadRequest,
  StorageDeleteRequest,
  StorageListRequest,
  StorageSignedUrlRequest,
  StorageApiResponse,
  UseStorageUploadOptions,
  UseStorageDownloadOptions,
  UseStorageListOptions,
  UseStorageDeleteOptions,
  StorageBucketId,
  FileValidationResult,
  FileInfo,
} from './storage'

export {
  StorageException,
  STORAGE_BUCKETS,
  validateFile,
  formatBytes,
  getFileExtension,
  generateUniqueFilename,
} from './storage'

/* ================================
   EMAIL TYPES
   ================================ */
export type {
  EmailType,
  EmailLog,
  EmailLogMetadata,
  CreateEmailLogInput,
  EmailLogResult,
  EmailAnalytics,
  EmailLogFilters,
} from './email'
