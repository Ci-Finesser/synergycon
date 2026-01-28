# Profile Store Quick Reference

## Quick Start

### Import & Setup
```tsx
import { useProfileStore } from '@/lib/stores/profile-store'

const MyComponent = () => {
  const store = useProfileStore()
  // ... use store
}
```

### Common Patterns

#### 1. Load Profile on Mount
```tsx
useEffect(() => {
  if (profile) {
    loadProfile(profile)
  }
}, [profile, loadProfile])
```

#### 2. Update Single Field
```tsx
setField('full_name', 'John Doe')
```

#### 3. Update Multiple Fields
```tsx
setFormData({
  full_name: 'John',
  public_title: 'Designer',
  organization: 'SynergyCon'
})
```

#### 4. Save Changes
```tsx
const success = await saveProfile()
if (success) {
  // Profile saved
}
```

#### 5. Discard Changes
```tsx
discardChanges() // Revert to original
```

#### 6. Check for Changes
```tsx
if (isDirty) {
  // User has unsaved changes
}
```

#### 7. Show Errors
```tsx
{errors.full_name && (
  <ErrorMessage>{errors.full_name}</ErrorMessage>
)}
```

#### 8. Display Completion
```tsx
<ProgressBar value={completionPercentage} />
<span>{completionPercentage}% Complete</span>
```

## Store API Reference

### State Properties
| Property | Type | Purpose |
|----------|------|---------|
| originalProfile | UserProfile \| null | Original profile data |
| formData | ProfileFormData | Current form values |
| isEditing | boolean | Edit mode active |
| isSaving | boolean | API request pending |
| isLoading | boolean | Loading profile |
| isDirty | boolean | Has unsaved changes |
| errors | Record<field, error> | Field-level errors |
| changes | ProfileChange[] | Change history |
| completionPercentage | number | Profile completion (0-100) |

### State Methods
| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| setFormData | Partial<ProfileFormData> | void | Update multiple fields |
| setField | field, value | void | Update single field with validation |
| setIsEditing | boolean | void | Toggle edit mode |
| setIsSaving | boolean | void | Update saving state |
| setIsLoading | boolean | void | Update loading state |
| setError | field, error | void | Set field error |
| clearError | field | void | Clear specific error |
| clearErrors | - | void | Clear all errors |
| loadProfile | UserProfile | void | Load profile data |
| resetForm | - | void | Reset to initial state |
| discardChanges | - | void | Revert to original |
| saveProfile | - | Promise<boolean> | Save to API |
| getChanges | - | ProfileChange[] | Get all changes |
| clearChanges | - | void | Clear change history |
| validateProfile | - | ValidationResult | Validate entire form |
| validateField | field, value | string \| null | Validate single field |
| getCompletionPercentage | - | number | Get completion % |
| hasChanges | - | boolean | Check if modified |

## ProfileFormData Fields

### Personal Information
- `full_name`: string - Required
- `phone`: string (optional)
- `avatar_url`: string (optional)
- `bio`: string (optional, max 500 chars)

### Public Profile
- `public_name`: string (optional, max 100 chars)
- `public_title`: string (optional, max 100 chars)
- `public_company`: string (optional, max 100 chars)
- `public_bio`: string (optional, max 500 chars)
- `public_linkedin_url`: string (optional, URL validated)
- `public_twitter_url`: string (optional, URL validated)
- `public_instagram_url`: string (optional, URL validated)
- `public_website_url`: string (optional, URL validated)

### Private Information
- `organization`: string (optional)
- `industry`: string (optional)
- `dietary_requirements`: string (optional)
- `special_needs`: string (optional)

## Error Handling

### Display Field Error
```tsx
<div>
  <Input
    value={formData.full_name}
    onChange={(e) => setField('full_name', e.target.value)}
  />
  {errors.full_name && (
    <p className="text-destructive text-sm">{errors.full_name}</p>
  )}
</div>
```

### Validate Before Save
```tsx
const validation = validateProfile()
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors)
  return
}
```

### Handle Save Errors
```tsx
const success = await saveProfile()
if (!success) {
  // Errors are already in store.errors
  toast.error('Failed to save profile')
}
```

## Complete Example Component

```tsx
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useProfileStore } from '@/lib/stores/profile-store'

export default function ProfileForm() {
  const { profile } = useAuthStore()
  const {
    formData,
    isEditing,
    isDirty,
    isSaving,
    completionPercentage,
    errors,
    setField,
    setIsEditing,
    saveProfile,
    discardChanges,
    loadProfile,
  } = useProfileStore()

  // Load profile on mount
  useEffect(() => {
    if (profile) {
      loadProfile(profile)
    }
  }, [profile, loadProfile])

  const handleChange = (field, value) => {
    setField(field as any, value)
  }

  const handleSave = async () => {
    const success = await saveProfile()
    if (success) {
      alert('Profile saved successfully!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1>Profile Management</h1>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <div className="space-x-2">
            <button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Completion */}
      <div className="space-y-2">
        <label>Profile Completion</label>
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-blue-500 h-2 rounded transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <span className="text-sm">{completionPercentage}%</span>
      </div>

      {/* Form Fields */}
      <div>
        <label>Full Name</label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          disabled={!isEditing}
        />
        {errors.full_name && (
          <p className="text-red-500 text-sm">{errors.full_name}</p>
        )}
      </div>

      <div>
        <label>Public Name</label>
        <input
          type="text"
          value={formData.public_name || ''}
          onChange={(e) => handleChange('public_name', e.target.value)}
          disabled={!isEditing}
        />
        {errors.public_name && (
          <p className="text-red-500 text-sm">{errors.public_name}</p>
        )}
      </div>

      {/* More fields... */}

      {/* Action Buttons */}
      {isEditing && (
        <div className="space-x-2 pt-4">
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => {
              discardChanges()
              setIsEditing(false)
            }}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Discard
          </button>
        </div>
      )}
    </div>
  )
}
```

## Tips & Tricks

### 1. Real-time Validation
Fields validate automatically as user types, no need to validate on save.

### 2. Track Changes
Use `isDirty` to enable/disable save button:
```tsx
<button disabled={!isDirty || isSaving}>Save</button>
```

### 3. Show What Changed
Get actual changes:
```tsx
const changes = getChanges()
changes.forEach(change => {
  console.log(`${change.field}: ${change.oldValue} → ${change.newValue}`)
})
```

### 4. Optional Fields
Optional fields don't require validation, user can leave them empty.

### 5. Profile Preview
Use `completionPercentage` to encourage users to fill profile:
```tsx
{completionPercentage < 75 && (
  <Alert>Complete your profile to increase visibility</Alert>
)}
```

### 6. Undo Changes
Single button to revert all changes:
```tsx
<button onClick={discardChanges}>Undo All Changes</button>
```

## Troubleshooting

### Changes not saved?
- Check `isDirty` flag - must be true to enable save
- Verify `isSaving` is false (no pending request)
- Check errors - validation may be blocking save

### Validation errors persist?
- Call `clearError(field)` to clear specific error
- Call `clearErrors()` to clear all errors
- Or `setField()` again to re-validate

### Data lost on refresh?
- Store uses localStorage persistence
- Data should hydrate automatically
- Check browser localStorage for `profile-storage` key

### Form not loading profile?
- Ensure `profile` from useAuthStore is loaded
- Call `loadProfile(profile)` in useEffect
- Check that `profile` is not null/undefined

## API Endpoint

**PATCH /api/user/profile**

Request:
```json
{
  "full_name": "John Doe",
  "public_name": "John",
  "public_title": "Designer",
  ...
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "full_name": "John Doe",
    ...
  }
}
```
