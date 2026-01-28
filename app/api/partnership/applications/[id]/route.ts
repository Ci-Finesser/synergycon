/**
 * Partnership Application Status Update API
 * Admin endpoint to update application status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Validate security
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STRICT,
    })
    if (securityError) return securityError

    const data = cleanSecurityFields(body)
    const { status, notes } = data

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Check if admin (you should implement proper admin auth check)
    // For now, just update the application

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (notes) {
      updateData.additional_notes = notes
    }

    const { data: application, error } = await supabase
      .from('partnership_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Partnership Status Update] Error:', error)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    // Log the status change
    await supabase.from('audit_logs').insert({
      action_type: 'partnership_application_status_changed',
      action_category: 'admin',
      action_description: `Partnership application ${status}: ${application.company_name}`,
      entity_type: 'partnership_application',
      entity_id: id,
      metadata: {
        old_status: 'pending',
        new_status: status,
        company_name: application.company_name,
      },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      severity: 'info',
    })

    return NextResponse.json({
      success: true,
      data: application,
      message: `Application ${status} successfully`,
    })
  } catch (error) {
    console.error('[Partnership Status Update] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const { error } = await supabase
      .from('partnership_applications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Partnership Delete] Error:', error)
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      )
    }

    // Log the deletion
    await supabase.from('audit_logs').insert({
      action_type: 'partnership_application_deleted',
      action_category: 'admin',
      action_description: `Partnership application deleted: ${id}`,
      entity_type: 'partnership_application',
      entity_id: id,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      severity: 'warning',
    })

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    })
  } catch (error) {
    console.error('[Partnership Delete] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
