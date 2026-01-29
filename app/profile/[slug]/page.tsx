/**
 * Public Profile Page - View user profile by slug
 */

import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  MapPin,
  Briefcase,
  Globe,
  Twitter,
  Linkedin,
  Instagram,
  Calendar,
} from "lucide-react"

async function getProfile(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/user/profile/${slug}`, { cache: 'no-store' })

    if (!res.ok) return null

    const data = await res.json()
    return data.profile
  } catch (error) {
    console.error('Profile fetch error:', error)
    return null
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const profile = await getProfile(slug)

  if (!profile) {
    notFound()
  }

  return (
    <main className="min-h-screen py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center pb-8">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-3xl">
                  {profile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {profile.full_name || 'SynergyCon User'}
                </h1>
                {profile.job_title && profile.company && (
                  <p className="text-lg text-muted-foreground mb-2">
                    {profile.job_title} at {profile.company}
                  </p>
                )}
                <div className="flex gap-2">
                  <Badge variant="secondary">{profile.roles?.default || 'attendee'}</Badge>
                  {profile.roles?.supplementary?.map((role: string) => (
                    <Badge key={role} variant="outline">{role}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="text-center">
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4 pt-6 border-t">
              {profile.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.company && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <span>{profile.company}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span>
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Social Links */}
            {(profile.twitter_handle || profile.linkedin_url || profile.instagram_handle) && (
              <div className="flex justify-center gap-4 pt-6 border-t">
                {profile.twitter_handle && (
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a
                      href={`https://twitter.com/${profile.twitter_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  </Button>
                )}

                {profile.linkedin_url && (
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </Button>
                )}

                {profile.instagram_handle && (
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a
                      href={`https://instagram.com/${profile.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
