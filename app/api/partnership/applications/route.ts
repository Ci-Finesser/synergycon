/**
 * Partnership Application API
 * Handles submission and retrieval of partnership applications
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate security (CSRF + honeypot + rate limiting)
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STRICT,
    })
    if (securityError) return securityError

    // Clean security fields
    const data = cleanSecurityFields(body)

    // Validate required fields
    const {
      partnership_type,
      company_name,
      contact_person,
      email,
      phone,
      message,
    } = data

    if (!partnership_type || !company_name || !contact_person || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate partnership type
    const validTypes = ['sponsor', 'exhibitor', 'media', 'vendor']
    if (!validTypes.includes(partnership_type)) {
      return NextResponse.json(
        { error: 'Invalid partnership type' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Insert application
    const { data: application, error } = await supabase
      .from('partnership_applications')
      .insert({
        partnership_type,
        company_name,
        contact_person,
        email,
        phone,
        website: data.website,
        company_description: message,
        message,
        partnership_interests: data.partnership_interests,
        partnership_tier: data.partnership_tier,
        why_partner: data.why_partner || message,
        marketing_reach: data.marketing_reach,
        additional_notes: data.additional_notes,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('[Partnership Application] Insert error:', error)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Log the application
    await supabase.from('audit_logs').insert({
      action_type: 'partnership_application_submitted',
      action_category: 'application',
      action_description: `Partnership application submitted: ${company_name} (${partnership_type})`,
      entity_type: 'partnership_application',
      entity_id: application.id,
      metadata: {
        partnership_type,
        company_name,
        email,
      },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      severity: 'info',
    })

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Partnership application submitted successfully',
    })
  } catch (error) {
    console.error('[Partnership Application] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const supabase = await createServerClient()

    let query = supabase
      .from('partnership_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('partnership_type', type)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error('[Partnership Application] Fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: applications,
    })
  } catch (error) {
    console.error('[Partnership Application] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
