/**
 * Public User Profile API - Get profile by slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: 'Profile slug is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get public profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        full_name,
        user_type,
        roles,
        bio,
        company,
        job_title,
        location,
        website,
        twitter_handle,
        linkedin_url,
        instagram_handle,
        profile_slug,
        profile_url,
        avatar_url,
        created_at
      `)
      .eq('profile_slug', slug)
      .eq('is_profile_public', true)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found or private' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('[Profile] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
