/**
 * Admin Partnership Applications API
 * PATCH /api/admin/applications/partnerships - Update partnership application status
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
    const { id, status, createSponsor } = data

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
      .from('partnership_applications')
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
      .from('partnership_applications')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)

    if (updateError) {
      console.error('[Admin Partnership Applications] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      )
    }

    // If approved and createSponsor flag is true, create a draft sponsor entry
    let sponsorCreated = false
    if (status === 'approved' && createSponsor) {
      // Map partnership tier to sponsor tier
      const tierMapping: Record<string, string> = {
        platinum: 'principal',
        diamond: 'principal',
        gold: 'ecosystem',
        silver: 'ecosystem',
        none: 'ecosystem',
      }

      const { error: insertError } = await supabase.from('sponsors').insert([
        {
          application_id: id,
          name: application.company_name,
          logo_url: `https://via.placeholder.com/400x200?text=${encodeURIComponent(application.company_name)}`,
          website: application.website || null,
          description: application.company_description || '',
          bio: application.why_partner || '',
          tier: tierMapping[application.partnership_tier] || 'ecosystem',
          category: 'other',
          contact_email: application.email,
          contact_phone: application.phone,
          featured: false,
          display_order: 999,
          status: 'draft',
        },
      ])

      if (insertError) {
        console.error('[Admin Partnership Applications] Sponsor creation error:', insertError)
        // Don't fail the whole operation, just log it
      } else {
        sponsorCreated = true
      }
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      action_type: 'partnership_application_status_changed',
      action_category: 'admin',
      action_description: `Partnership application ${status}: ${application.company_name}`,
      entity_type: 'partnership_application',
      entity_id: id,
      metadata: {
        old_status: application.status,
        new_status: status,
        company_name: application.company_name,
        sponsor_created: sponsorCreated,
      },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      severity: 'info',
    })

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      sponsorCreated,
    })
  } catch (error) {
    console.error('[Admin Partnership Applications] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
