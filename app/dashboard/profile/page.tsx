/**
 * Dashboard Profile Management Page
 * User profile management - editing, visibility settings, etc.
 */
"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProfileStore } from "@/lib/stores/profile-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"

export default function ProfilePage() {
  const { user, profile } = useAuthStore()
  const {
    formData,
    isEditing,
    isSaving,
    isDirty,
    completionPercentage,
    errors,
    setField,
    setIsEditing,
    saveProfile,
    discardChanges,
    loadProfile,
    validateField,
  } = useProfileStore()

  // Load profile when it becomes available
  useEffect(() => {
    if (profile) {
      loadProfile(profile)
    }
  }, [profile, loadProfile])

  const handleSave = async () => {
    const success = await saveProfile()
    if (success) {
      // Success feedback handled in store
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setField(field as any, value)
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">Profile Management</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your personal information and visibility settings
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} size="sm" className="w-full sm:w-auto">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleSave} size="sm" disabled={isSaving} className="flex-1 sm:flex-none">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" disabled={isSaving}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Picture & Role */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Profile Picture & Role</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-semibold mb-2">{profile.full_name || user.email}</h3>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge variant="secondary">{user.roles.default}</Badge>
                {user.roles.supplementary?.map((role) => (
                  <Badge key={role} variant="outline">{role}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">User Type: {user.user_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Your basic contact and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                disabled={!isEditing}
                placeholder="Your full name"
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled placeholder="Email address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="+234 XXX XXX XXXX"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry || ''}
                onChange={(e) => handleFieldChange('industry', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Technology, Creative Arts"
              />
              {errors.industry && (
                <p className="text-xs text-destructive">{errors.industry}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Professional Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Your work and professional details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="public_company">Company (Public)</Label>
              <Input
                id="public_company"
                value={formData.public_company || ''}
                onChange={(e) => handleFieldChange('public_company', e.target.value)}
                disabled={!isEditing}
                placeholder="Company name"
              />
              {errors.public_company && (
                <p className="text-xs text-destructive">{errors.public_company}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="public_title">Job Title (Public)</Label>
              <Input
                id="public_title"
                value={formData.public_title || ''}
                onChange={(e) => handleFieldChange('public_title', e.target.value)}
                disabled={!isEditing}
                placeholder="Your role"
              />
              {errors.public_title && (
                <p className="text-xs text-destructive">{errors.public_title}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Social Links</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="public_website_url">Website</Label>
            <Input
              id="public_website_url"
              value={formData.public_website_url || ''}
              onChange={(e) => handleFieldChange('public_website_url', e.target.value)}
              disabled={!isEditing}
              placeholder="https://yourwebsite.com"
            />
            {errors.public_website_url && (
              <p className="text-xs text-destructive">{errors.public_website_url}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="public_linkedin_url">LinkedIn</Label>
              <Input
                id="public_linkedin_url"
                value={formData.public_linkedin_url || ''}
                onChange={(e) => handleFieldChange('public_linkedin_url', e.target.value)}
                disabled={!isEditing}
                placeholder="LinkedIn URL"
              />
              {errors.public_linkedin_url && (
                <p className="text-xs text-destructive">{errors.public_linkedin_url}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="public_twitter_url">Twitter</Label>
              <Input
                id="public_twitter_url"
                value={formData.public_twitter_url || ''}
                onChange={(e) => handleFieldChange('public_twitter_url', e.target.value)}
                disabled={!isEditing}
                placeholder="Twitter URL"
              />
              {errors.public_twitter_url && (
                <p className="text-xs text-destructive">{errors.public_twitter_url}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="public_instagram_url">Instagram</Label>
              <Input
                id="public_instagram_url"
                value={formData.public_instagram_url || ''}
                onChange={(e) => handleFieldChange('public_instagram_url', e.target.value)}
                disabled={!isEditing}
                placeholder="Instagram URL"
              />
              {errors.public_instagram_url && (
                <p className="text-xs text-destructive">{errors.public_instagram_url}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Profile Name */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Public Profile</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            How your name appears to others
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="public_name">Public Name</Label>
            <Input
              id="public_name"
              value={formData.public_name || ""}
              onChange={(e) => handleFieldChange('public_name', e.target.value)}
              disabled={!isEditing}
              placeholder="Name visible to others"
            />
            {errors.public_name && (
              <p className="text-xs text-destructive">{errors.public_name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Set a public name to make your profile visible to others
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Status</span>
              <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Complete your profile to improve visibility and discoverability
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="w-full"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                discardChanges()
                setIsEditing(false)
              }}
              variant="outline"
              disabled={isSaving}
              className="w-full"
              size="lg"
            >
              Discard Changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
