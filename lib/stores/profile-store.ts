import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types/user'

/**
 * Profile form data matching UserProfile structure
 */
export interface ProfileFormData {
  // Personal Information
  full_name: string
  phone?: string
  avatar_url?: string
  bio?: string
  
  // Public Profile Fields
  public_name?: string
  public_title?: string
  public_company?: string
  public_bio?: string
  public_linkedin_url?: string
  public_twitter_url?: string
  public_instagram_url?: string
  public_website_url?: string
  
  // Private Information
  organization?: string
  industry?: string
  dietary_requirements?: string
  special_needs?: string
}

/**
 * Profile change tracking
 */
export interface ProfileChange {
  field: keyof ProfileFormData
  oldValue: any
  newValue: any
  timestamp: Date
}

/**
 * Profile validation result
 */
export interface ProfileValidationResult {
  isValid: boolean
  errors: Partial<Record<keyof ProfileFormData, string>>
}

/**
 * Enhanced Profile Store State
 */
interface ProfileState {
  // Original profile data
  originalProfile: UserProfile | null
  
  // Form state
  formData: ProfileFormData
  isEditing: boolean
  isSaving: boolean
  isLoading: boolean
  isDirty: boolean
  errors: Partial<Record<keyof ProfileFormData, string>>
  
  // Tracking changes
  changes: ProfileChange[]
  lastSavedAt?: Date
  
  // Computed properties
  completionPercentage: number
  
  // Actions - Form Management
  setFormData: (data: Partial<ProfileFormData>) => void
  setField: (field: keyof ProfileFormData, value: any) => void
  setIsEditing: (editing: boolean) => void
  setIsSaving: (saving: boolean) => void
  setIsLoading: (loading: boolean) => void
  
  // Actions - Error Handling
  setError: (field: keyof ProfileFormData, error: string) => void
  clearError: (field: keyof ProfileFormData) => void
  clearErrors: () => void
  
  // Actions - Profile Operations
  loadProfile: (profile: UserProfile) => void
  resetForm: () => void
  discardChanges: () => void
  saveProfile: () => Promise<boolean>
  
  // Actions - Change Tracking
  getChanges: () => ProfileChange[]
  clearChanges: () => void
  
  // Actions - Validation
  validateProfile: () => ProfileValidationResult
  validateField: (field: keyof ProfileFormData, value: any) => string | null
  
  // Actions - Computed
  getCompletionPercentage: () => number
  hasChanges: () => boolean
}

/**
 * Initial form data
 */
const getInitialFormData = (): ProfileFormData => ({
  full_name: '',
  phone: '',
  avatar_url: '',
  bio: '',
  public_name: '',
  public_title: '',
  public_company: '',
  public_bio: '',
  public_linkedin_url: '',
  public_twitter_url: '',
  public_instagram_url: '',
  public_website_url: '',
  organization: '',
  industry: '',
  dietary_requirements: '',
  special_needs: '',
})

/**
 * Profile Validation Rules
 */
const validateProfileField = (field: keyof ProfileFormData, value: any): string | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null // Optional fields are ok being empty
  }

  switch (field) {
    case 'full_name':
      if (typeof value !== 'string' || value.trim().length < 2) {
        return 'Full name must be at least 2 characters'
      }
      if (value.trim().length > 100) {
        return 'Full name must not exceed 100 characters'
      }
      return null

    case 'phone':
      if (!/^\+?[\d\s\-()]+$/.test(value)) {
        return 'Invalid phone number format'
      }
      return null

    case 'public_title':
    case 'public_company':
      if (typeof value === 'string' && value.trim().length > 100) {
        return 'This field must not exceed 100 characters'
      }
      return null

    case 'public_website_url':
    case 'public_linkedin_url':
    case 'public_twitter_url':
    case 'public_instagram_url':
      if (typeof value === 'string' && value.trim()) {
        try {
          new URL(value)
        } catch {
          return 'Invalid URL format'
        }
      }
      return null

    default:
      return null
  }
}

/**
 * Calculate profile completion percentage
 */
const calculateCompletionPercentage = (data: ProfileFormData): number => {
  const importantFields: (keyof ProfileFormData)[] = [
    'full_name',
    'public_name',
    'public_title',
    'organization',
  ]

  const filledFields = importantFields.filter(
    (field) => data[field] && String(data[field]).trim() !== ''
  ).length

  return Math.round((filledFields / importantFields.length) * 100)
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      originalProfile: null,
      formData: getInitialFormData(),
      isEditing: false,
      isSaving: false,
      isLoading: false,
      isDirty: false,
      errors: {},
      changes: [],
      completionPercentage: 0,

      setFormData: (data) =>
        set((state) => {
          const newFormData = { ...state.formData, ...data }
          return {
            formData: newFormData,
            isDirty: true,
            completionPercentage: calculateCompletionPercentage(newFormData),
          }
        }),

      setField: (field, value) =>
        set((state) => {
          const newFormData = { ...state.formData, [field]: value }
          const error = validateProfileField(field, value)
          
          return {
            formData: newFormData,
            isDirty: true,
            completionPercentage: calculateCompletionPercentage(newFormData),
            errors: {
              ...state.errors,
              [field]: error || undefined,
            },
          }
        }),

      setIsEditing: (editing) => set({ isEditing: editing }),
      
      setIsSaving: (saving) => set({ isSaving: saving }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (field, error) =>
        set((state) => ({
          errors: { ...state.errors, [field]: error },
        })),

      clearError: (field) =>
        set((state) => {
          const { [field]: _, ...rest } = state.errors
          return { errors: rest }
        }),

      clearErrors: () => set({ errors: {} }),

      loadProfile: (profile: UserProfile) => {
        const formData: ProfileFormData = {
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          avatar_url: profile.avatar_url || '',
          bio: profile.bio || '',
          public_name: profile.public_name || '',
          public_title: profile.public_title || '',
          public_company: profile.public_company || '',
          public_bio: profile.public_bio || '',
          public_linkedin_url: profile.public_linkedin_url || '',
          public_twitter_url: profile.public_twitter_url || '',
          public_instagram_url: profile.public_instagram_url || '',
          public_website_url: profile.public_website_url || '',
          organization: profile.organization || '',
          industry: profile.industry || '',
          dietary_requirements: profile.dietary_requirements || '',
          special_needs: profile.special_needs || '',
        }

        set({
          originalProfile: profile,
          formData,
          isDirty: false,
          errors: {},
          changes: [],
          completionPercentage: calculateCompletionPercentage(formData),
        })
      },

      resetForm: () => {
        const initialData = getInitialFormData()
        set({
          formData: initialData,
          isDirty: false,
          isEditing: false,
          errors: {},
          changes: [],
          completionPercentage: 0,
        })
      },

      discardChanges: () => {
        const { originalProfile } = get()
        if (originalProfile) {
          get().loadProfile(originalProfile)
        } else {
          get().resetForm()
        }
      },

      saveProfile: async () => {
        const { formData, validateProfile } = get()
        
        // Validate before saving
        const validation = validateProfile()
        if (!validation.isValid) {
          set({ errors: validation.errors })
          return false
        }

        set({ isSaving: true, errors: {} })

        try {
          const res = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.message || 'Failed to update profile')
          }

          const updatedProfile = await res.json()
          
          set({
            isEditing: false,
            isDirty: false,
            changes: [],
            lastSavedAt: new Date(),
            originalProfile: updatedProfile.data,
          })
          
          return true
        } catch (error: any) {
          console.error('Profile update error:', error)
          set({ 
            errors: { 
              full_name: error.message || 'Failed to save profile' 
            } 
          })
          return false
        } finally {
          set({ isSaving: false })
        }
      },

      getChanges: () => {
        const { formData, originalProfile, changes } = get()
        
        if (!originalProfile) return changes
        
        const newChanges: ProfileChange[] = []
        
        Object.keys(formData).forEach((key) => {
          const field = key as keyof ProfileFormData
          const oldValue = originalProfile[field as keyof UserProfile]
          const newValue = formData[field]
          
          if (oldValue !== newValue) {
            newChanges.push({
              field,
              oldValue,
              newValue,
              timestamp: new Date(),
            })
          }
        })
        
        return newChanges
      },

      clearChanges: () => set({ changes: [] }),

      validateProfile: (): ProfileValidationResult => {
        const { formData } = get()
        const errors: Partial<Record<keyof ProfileFormData, string>> = {}
        
        // Validate required fields
        if (!formData.full_name || !formData.full_name.trim()) {
          errors.full_name = 'Full name is required'
        }
        
        // Validate all fields
        Object.keys(formData).forEach((key) => {
          const field = key as keyof ProfileFormData
          const error = validateProfileField(field, formData[field])
          if (error) {
            errors[field] = error
          }
        })
        
        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        }
      },

      validateField: (field, value) => {
        return validateProfileField(field, value)
      },

      getCompletionPercentage: () => {
        const { formData } = get()
        return calculateCompletionPercentage(formData)
      },

      hasChanges: () => {
        const { originalProfile, formData } = get()
        
        if (!originalProfile) {
          return Object.values(formData).some(v => v && String(v).trim() !== '')
        }
        
        return Object.keys(formData).some(
          (key) => formData[key as keyof ProfileFormData] !== 
                   originalProfile[key as keyof UserProfile]
        )
      },
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({
        formData: state.formData,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)
