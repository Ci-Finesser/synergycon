/**
 * Registration API Route
 * POST /api/register - Submit event registration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate security (CSRF, rate limiting, honeypot)
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.NEWSLETTER,
    })
    if (securityError) return securityError

    const cleanData = cleanSecurityFields(body)
    const {
      first_name,
      last_name,
      full_name,
      email,
      phone,
      phone_number,
      organization,
      role,
      industry,
      attendance_reason,
      why_attend,
      expectations,
      dietary_requirements,
      special_needs,
      hear_about,
    } = cleanData

    // Handle both form formats (registration-modal uses first_name/last_name, registration-section uses full_name)
    const finalFullName = full_name || `${first_name || ''} ${last_name || ''}`.trim()
    const finalPhone = phone || phone_number

    // Validate required fields
    if (!finalFullName || !email) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            name: !finalFullName ? 'Name is required' : undefined,
            email: !email ? 'Email is required' : undefined,
          },
        },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Build registration data
    const registrationData: Record<string, any> = {
      full_name: finalFullName,
      email,
      phone_number: finalPhone || null,
      organization: organization || null,
      role: role || null,
      industry: industry || null,
      why_attend: attendance_reason || why_attend || null,
      status: 'pending',
      registration_source: 'early_access', // From waitlist/early access modal
    }

    // Add optional fields if provided (for extended registration form)
    // Note: first_name and last_name are already consolidated into full_name above
    if (expectations) registrationData.expectations = expectations
    if (dietary_requirements) registrationData.dietary_requirements = dietary_requirements
    if (special_needs) registrationData.special_needs = special_needs
    if (hear_about) registrationData.how_did_you_hear = hear_about // Map to correct column name

    // Insert registration
    const { data: registration, error: insertError } = await supabase
      .from('registrations')
      .insert(registrationData)
      .select()
      .single()

    if (insertError) {
      console.error('[Registration] Insert error:', insertError)
      
      // Handle duplicate email
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This email has already been registered. Please use a different email.' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to submit registration' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'registration_submitted',
      endpoint: req.url,
      details: `Registration submitted: ${email}`,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Registration submitted successfully',
        registration,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Registration] Error:', error)
    
    logSecurityEvent({
      type: 'api_handler_exception',
      endpoint: req.url,
      details: `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
