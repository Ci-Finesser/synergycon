/**
 * Admin Speaker Applications API
 * PATCH /api/admin/applications/speakers - Update speaker application status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/admin-auth'

export async function PATCH(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    const body = await req.json()

    // Validate security (CSRF, rate limiting, honeypot)
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STRICT,
    })
    if (securityError) return securityError

    const data = cleanSecurityFields(body)
    const { id, status, createSpeaker } = data

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, approved, or rejected' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get the application first
    const { data: application, error: fetchError } = await supabase
      .from('speaker_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update the application status
    const { error: updateError } = await supabase
      .from('speaker_applications')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)

    if (updateError) {
      console.error('[Admin Speaker Applications] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      )
    }

    // If approved and createSpeaker flag is true, create a draft speaker entry
    let speakerCreated = false
    if (status === 'approved' && createSpeaker) {
      const { error: insertError } = await supabase.from('speakers').insert([
        {
          application_id: id,
          name: `${application.first_name} ${application.last_name}`,
          title: application.position || '',
          bio: application.bio || '',
          company: application.company || '',
          topic: application.topic_title || '',
          linkedin_url: application.linkedin || null,
          event_day: 1,
          featured: false,
          display_order: 999,
          status: 'draft',
        },
      ])

      if (insertError) {
        console.error('[Admin Speaker Applications] Speaker creation error:', insertError)
        // Don't fail the whole operation, just log it
      } else {
        speakerCreated = true
      }
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      action_type: 'speaker_application_status_changed',
      action_category: 'admin',
      action_description: `Speaker application ${status}: ${application.first_name} ${application.last_name}`,
      entity_type: 'speaker_application',
      entity_id: id,
      metadata: {
        old_status: application.status,
        new_status: status,
        applicant_name: `${application.first_name} ${application.last_name}`,
        speaker_created: speakerCreated,
      },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      severity: 'info',
    })

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      speakerCreated,
    })
  } catch (error) {
    console.error('[Admin Speaker Applications] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
