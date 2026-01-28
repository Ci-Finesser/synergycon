import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security-logger'
import { sendWelcomeEmail } from '@/lib/email'

// Validation schema for profile creation
const ProfileSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  user_type: z.enum(['attendee', 'speaker', 'partner', 'admin']).default('attendee'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = ProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, full_name, phone, organization, industry, role, user_type } = validation.data

    // Use admin client to bypass RLS
    const supabase = createAdminClient()

    // Check if profile already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A profile with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user profile
    const newUserId = uuidv4()
    const { error: userError, data: newProfile } = await supabase
      .from('user_profiles')
      .insert({
        user_id: newUserId,
        email,
        full_name,
        phone: phone || null,
        user_type,
        organization: organization || null,
        industry: industry || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (userError) {
      console.error('[Profile Create API] Failed to create user profile:', userError)
      logSecurityEvent({
        type: 'api_error',
        endpoint: req.url,
        details: `Profile creation failed: ${userError.message}`,
      })
      return NextResponse.json(
        { success: false, error: 'Failed to create profile. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[Profile Create API] Created new user profile for:', email)

    // Send welcome email
    sendWelcomeEmail({
      email,
      name: full_name,
    }).then((emailResult) => {
      if (emailResult.success) {
        console.log('[Profile Create API] Welcome email sent:', emailResult.id)
      } else {
        console.error('[Profile Create API] Failed to send welcome email:', emailResult.error)
      }
    })

    logSecurityEvent({
      type: 'api_success',
      endpoint: req.url,
      details: `Profile created for: ${email}`,
    })

    return NextResponse.json({
      success: true,
      profile: {
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.full_name,
      },
      message: 'Profile created successfully',
    })
  } catch (error) {
    console.error('[Profile Create API] Error:', error)
    logSecurityEvent({
      type: 'api_error',
      endpoint: req.url,
      details: `Profile creation exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
