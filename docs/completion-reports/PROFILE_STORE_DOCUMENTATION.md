# Enhanced Profile Store Documentation

## Overview
The `useProfileStore` is a comprehensive Zustand-based state management solution for the dashboard profile management system. It provides robust form state management, validation, change tracking, and persistence.

## Architecture

### State Structure
```typescript
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
}
```

## Key Features

### 1. Form Management
- **setFormData()** - Update multiple fields at once
- **setField()** - Update individual fields with automatic validation
- **loadProfile()** - Load profile from UserProfile type
- **resetForm()** - Reset to initial state
- **discardChanges()** - Revert to original profile data

### 2. Validation System
- **Built-in field validation** for:
  - Full name (2-100 characters)
  - Phone numbers (format validation)
  - Biographical text (max 500 chars)
  - URLs (LinkedIn, Twitter, Instagram, website)
  - Character limits on public fields

- **validateProfile()** - Validate entire form
- **validateField()** - Validate individual field
- **clearError()** - Clear specific field error
- **clearErrors()** - Clear all errors

### 3. Change Tracking
- **getChanges()** - Returns all modified fields with old/new values
- **hasChanges()** - Boolean check for any modifications
- **isDirty** - Reactive property for unsaved changes
- **lastSavedAt** - Timestamp of last save

### 4. Profile Completion
- **completionPercentage** - Auto-calculated profile completion (0-100%)
- **getCompletionPercentage()** - Explicit getter method
- Tracks: full_name, public_name, public_title, organization

### 5. Persistence
- Uses Zustand's persist middleware
- Stores under key: `profile-storage`
- Persists formData and lastSavedAt
- Automatic localStorage integration

### 6. API Integration
- **saveProfile()** - PATCH request to `/api/user/profile`
- Automatic error handling and display
- Updates originalProfile on success
- Clears isDirty flag after save

## Usage Example

### Basic Setup
```tsx
import { useProfileStore } from '@/lib/stores/profile-store'

export default function ProfilePage() {
  const {
    formData,
    isEditing,
    isDirty,
    completionPercentage,
    errors,
    setField,
    setIsEditing,
    saveProfile,
    loadProfile,
  } = useProfileStore()

  // Load profile on mount
  useEffect(() => {
    if (profile) {
      loadProfile(profile)
    }
  }, [profile, loadProfile])

  // Update field
  const handleChange = (field, value) => {
    setField(field, value)
  }

  // Save changes
  const handleSave = async () => {
    const success = await saveProfile()
  }

  return (
    <div>
      {/* Form fields */}
      <input
        value={formData.full_name}
        onChange={(e) => handleChange('full_name', e.target.value)}
      />
      {errors.full_name && <span>{errors.full_name}</span>}

      {/* Show completion */}
      <ProgressBar value={completionPercentage} />

      {/* Save button */}
      <button onClick={handleSave} disabled={!isDirty}>
        Save Changes
      </button>
    </div>
  )
}
```

## Field Mapping

### ProfileFormData Fields
```typescript
// Personal Information
- full_name: string
- phone?: string
- avatar_url?: string
- bio?: string

// Public Profile
- public_name?: string
- public_title?: string
- public_company?: string
- public_bio?: string
- public_linkedin_url?: string
- public_twitter_url?: string
- public_instagram_url?: string
- public_website_url?: string

// Private Information
- organization?: string
- industry?: string
- dietary_requirements?: string
- special_needs?: string
```

## Validation Rules

| Field | Rules |
|-------|-------|
| full_name | Required, 2-100 characters |
| phone | Optional, format validation |
| bio/public_bio | Max 500 characters |
| public_name | Max 100 characters |
| public_title | Max 100 characters |
| public_company | Max 100 characters |
| URLs | Valid URL format when provided |

## Integration with Dashboard

### Profile Page Features
1. **Edit Mode Toggle** - Switch between view/edit modes
2. **Real-time Validation** - Validates on field change
3. **Error Display** - Shows field-level error messages
4. **Progress Indicator** - Visual profile completion percentage
5. **Change Tracking** - Shows if form has unsaved changes
6. **Discard Changes** - Revert to original data
7. **Save Feedback** - Loading states and error handling

### Components Using Store
- `app/dashboard/profile/page.tsx` - Main profile management UI
- Can be extended to other dashboard sections

## Best Practices

1. **Always Load Profile on Mount**
   ```tsx
   useEffect(() => {
     if (profile) loadProfile(profile)
   }, [profile, loadProfile])
   ```

2. **Use Proper Field Update Handler**
   ```tsx
   const handleChange = (field, value) => {
     setField(field, value) // Includes validation
   }
   ```

3. **Check isDirty Before Save**
   ```tsx
   <button disabled={!isDirty || isSaving}>
     Save
   </button>
   ```

4. **Handle Validation Errors**
   ```tsx
   {errors[field] && (
     <p className="error">{errors[field]}</p>
   )}
   ```

5. **Use Completion Percentage for UX**
   ```tsx
   <ProgressBar value={completionPercentage} />
   <span>{completionPercentage}% Complete</span>
   ```

## API Contract

### PATCH /api/user/profile
**Request Body:**
```typescript
ProfileFormData
```

**Response:**
```typescript
{
  success: boolean
  data: UserProfile
  message?: string
}
```

**Error Handling:**
- 400 - Validation errors
- 401 - Unauthorized
- 500 - Server error

## Performance Considerations

1. **Memoization** - useProfileStore is already memoized via Zustand
2. **Validation** - Field validation runs on each field change
3. **Persistence** - localStorage writes happen on state changes
4. **API Calls** - Debounced via button click (not auto-save)

## Future Enhancements

- [ ] Auto-save functionality with debouncing
- [ ] Image upload for avatar_url
- [ ] Batch validation before save
- [ ] Undo/redo functionality
- [ ] Profile visibility toggle
- [ ] Social account verification
- [ ] Profile preview mode
