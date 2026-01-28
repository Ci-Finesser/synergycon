/**
 * Speaker Application API Route
 * POST /api/apply-speaker - Submit speaker application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { sendSpeakerApplicationEmail } from '@/lib/email'
import { logSecurityEvent } from '@/lib/security-logger'

export async function POST(req: NextRequest) {
  try {
    // Validate security
    const body = await req.json()
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.NEWSLETTER,
    })
    if (securityError) return securityError

    const cleanData = cleanSecurityFields(body)
    const {
      first_name,
      last_name,
      email,
      phone,
      linkedin,
      company,
      position,
      bio,
      session_type,
      topic_title,
      topic_description,
      speaking_experience,
      availability,
      additional_notes,
    } = cleanData

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !topic_title || !topic_description) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            first_name: !first_name ? 'First name is required' : undefined,
            last_name: !last_name ? 'Last name is required' : undefined,
            email: !email ? 'Email is required' : undefined,
            phone: !phone ? 'Phone is required' : undefined,
            topic_title: !topic_title ? 'Topic title is required' : undefined,
            topic_description: !topic_description ? 'Topic description is required' : undefined,
          },
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Insert application
    const { data: application, error: insertError } = await supabase
      .from('speaker_applications')
      .insert({
        first_name,
        last_name,
        email,
        phone,
        linkedin: linkedin || null,
        company: company || null,
        position: position || null,
        bio: bio || null,
        session_type: session_type || 'keynote',
        topic_title,
        topic_description,
        speaking_experience: speaking_experience || null,
        availability: availability || null,
        additional_notes: additional_notes || null,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Speaker Application] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'speaker_application_submitted',
      endpoint: req.url,
      details: `Speaker application submitted: ${email} - ${topic_title}`,
    })

    // Send confirmation email
    const emailResult = await sendSpeakerApplicationEmail(email, `${first_name} ${last_name}`, topic_title)

    if (!emailResult.success) {
      console.warn(`[Speaker Application] Failed to send confirmation email: ${emailResult.error}`)
      // Continue anyway - application is created
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        application,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Speaker Application] Error:', error)

    logSecurityEvent({
      type: 'api_handler_exception',
      endpoint: req.url,
      details: `Speaker application error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
