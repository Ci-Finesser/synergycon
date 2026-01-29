/**
 * Admin Schedule API
 * Manage schedule sessions for the event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/admin-auth'
import { logSecurityEvent } from '@/lib/security-logger'
import { z } from 'zod'

// Schedule session validation schema
const scheduleSessionSchema = z.object({
  day: z.number().min(1).max(3),
  district: z.string().optional().default(''),
  date: z.string().optional().default(''),
  time: z.string().min(1, 'Time is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  session_type: z.string().optional().default('Keynote'),
  location: z.string().optional().default(''),
  venue: z.string().optional().default(''),
  speaker: z.string().optional().default('Speaker TBA'),
  capacity: z.number().optional().default(100),
})

/**
 * GET /api/admin/schedule
 * List all schedule sessions with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Build query
    let query = supabase.from('schedule_sessions').select('*')

    // Apply filters
    const day = searchParams.get('day')
    if (day) {
      query = query.eq('day', parseInt(day))
    }

    const sessionType = searchParams.get('session_type')
    if (sessionType) {
      query = query.eq('session_type', sessionType)
    }

    const district = searchParams.get('district')
    if (district) {
      query = query.eq('district', district)
    }

    const search = searchParams.get('search')
    if (search) {
      query = query.or(`title.ilike.%${search}%,speaker.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Order by day and time
    query = query.order('day', { ascending: true }).order('time', { ascending: true })

    const { data: sessions, error } = await query

    if (error) {
      console.error('[Admin Schedule] Query error:', error)
      return NextResponse.json({ error: 'Failed to fetch schedule sessions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
      total: sessions?.length || 0,
    })
  } catch (error) {
    console.error('[Admin Schedule] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/schedule
 * Create a new schedule session
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    const body = await req.json()

    // Validate data
    const validation = scheduleSessionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: session, error } = await supabase
      .from('schedule_sessions')
      .insert([validation.data])
      .select()
      .single()

    if (error) {
      console.error('[Admin Schedule] Create error:', error)
      return NextResponse.json({ error: 'Failed to create schedule session' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_action',
      endpoint: '/api/admin/schedule',      clientId: adminUser.id,      details: `Schedule session created: ${validation.data.title} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, session }, { status: 201 })
  } catch (error) {
    console.error('[Admin Schedule] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/schedule
 * Update an existing schedule session
 */
export async function PATCH(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Partial validation
    const partialSchema = scheduleSessionSchema.partial()
    const validation = partialSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: session, error } = await supabase
      .from('schedule_sessions')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin Schedule] Update error:', error)
      return NextResponse.json({ error: 'Failed to update schedule session' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_action',
      endpoint: '/api/admin/schedule',      clientId: adminUser.id,      details: `Schedule session updated: ${id} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error('[Admin Schedule] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/schedule
 * Delete a schedule session
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get session title for logging
    const { data: session } = await supabase
      .from('schedule_sessions')
      .select('title')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('schedule_sessions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin Schedule] Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete schedule session' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_action',
      endpoint: '/api/admin/schedule',
      clientId: adminUser.id,
      details: `Schedule session deleted: ${session?.title || id} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, message: 'Schedule session deleted successfully' })
  } catch (error) {
    console.error('[Admin Schedule] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
