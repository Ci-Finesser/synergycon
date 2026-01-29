/**
 * Admin Speakers API
 * Manage speakers for the event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/admin-auth'
import { logSecurityEvent } from '@/lib/security-logger'
import { z } from 'zod'

// Speaker validation schema
const speakerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  bio: z.string().optional().default(''),
  company: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  twitter_url: z.string().nullable().optional(),
  instagram_url: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  featured: z.boolean().optional().default(false),
  display_order: z.number().optional(),
  event_day: z.number().optional().default(1),
  status: z.enum(['draft', 'live']).optional().default('draft'),
})

/**
 * GET /api/admin/speakers
 * List all speakers with optional filters
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
    let query = supabase.from('speakers').select('*')

    // Apply filters
    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }

    const eventDay = searchParams.get('event_day')
    if (eventDay) {
      query = query.eq('event_day', parseInt(eventDay))
    }

    const featured = searchParams.get('featured')
    if (featured !== null) {
      query = query.eq('featured', featured === 'true')
    }

    const search = searchParams.get('search')
    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,topic.ilike.%${search}%`)
    }

    // Order by display_order
    query = query.order('display_order', { ascending: true })

    const { data: speakers, error } = await query

    if (error) {
      console.error('[Admin Speakers] Query error:', error)
      return NextResponse.json({ error: 'Failed to fetch speakers' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      speakers: speakers || [],
      total: speakers?.length || 0,
    })
  } catch (error) {
    console.error('[Admin Speakers] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/speakers
 * Create a new speaker
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
    const validation = speakerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get max display_order
    const { data: maxOrderResult } = await supabase
      .from('speakers')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const displayOrder = validation.data.display_order ?? (maxOrderResult?.display_order ?? 0) + 1

    const { data: speaker, error } = await supabase
      .from('speakers')
      .insert([{
        ...validation.data,
        display_order: displayOrder,
      }])
      .select()
      .single()

    if (error) {
      console.error('[Admin Speakers] Create error:', error)
      return NextResponse.json({ error: 'Failed to create speaker' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_action',
      endpoint: '/api/admin/speakers',
      clientId: adminUser.id,
      details: `Speaker created: ${validation.data.name} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, speaker }, { status: 201 })
  } catch (error) {
    console.error('[Admin Speakers] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/speakers
 * Update an existing speaker
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
      return NextResponse.json({ error: 'Speaker ID is required' }, { status: 400 })
    }

    // Partial validation - only validate provided fields
    const partialSchema = speakerSchema.partial()
    const validation = partialSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: speaker, error } = await supabase
      .from('speakers')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin Speakers] Update error:', error)
      return NextResponse.json({ error: 'Failed to update speaker' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_action',
      endpoint: '/api/admin/speakers',
      clientId: adminUser.id,
      details: `Speaker updated: ${id} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, speaker })
  } catch (error) {
    console.error('[Admin Speakers] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/speakers
 * Delete a speaker
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
      return NextResponse.json({ error: 'Speaker ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get speaker name for logging
    const { data: speaker } = await supabase
      .from('speakers')
      .select('name')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('speakers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin Speakers] Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete speaker' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_user_deleted',
      endpoint: '/api/admin/speakers',
      details: `Speaker deleted: ${speaker?.name || id} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, message: 'Speaker deleted successfully' })
  } catch (error) {
    console.error('[Admin Speakers] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
