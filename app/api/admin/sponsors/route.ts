/**
 * Admin Sponsors API
 * Manage sponsors/partners for the event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/admin-auth'
import { logSecurityEvent } from '@/lib/security-logger'
import { z } from 'zod'

// Sponsor validation schema
const sponsorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logo_url: z.string().min(1, 'Logo URL is required'),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  tier: z.enum(['principal', 'ecosystem']).optional().default('ecosystem'),
  category: z.string().nullable().optional(),
  sub_category: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  featured: z.boolean().optional().default(false),
  display_order: z.number().optional(),
  status: z.enum(['draft', 'live']).optional().default('draft'),
})

/**
 * GET /api/admin/sponsors
 * List all sponsors with optional filters
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
    let query = supabase.from('sponsors').select('*')

    // Apply filters
    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }

    const tier = searchParams.get('tier')
    if (tier) {
      query = query.eq('tier', tier)
    }

    const category = searchParams.get('category')
    if (category) {
      query = query.eq('category', category)
    }

    const featured = searchParams.get('featured')
    if (featured !== null) {
      query = query.eq('featured', featured === 'true')
    }

    const search = searchParams.get('search')
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Order by display_order
    query = query.order('display_order', { ascending: true })

    const { data: sponsors, error } = await query

    if (error) {
      console.error('[Admin Sponsors] Query error:', error)
      return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sponsors: sponsors || [],
      total: sponsors?.length || 0,
    })
  } catch (error) {
    console.error('[Admin Sponsors] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/sponsors
 * Create a new sponsor
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
    const validation = sponsorSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get max display_order
    const { data: maxOrderResult } = await supabase
      .from('sponsors')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const displayOrder = validation.data.display_order ?? (maxOrderResult?.display_order ?? 0) + 1

    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .insert([{
        ...validation.data,
        display_order: displayOrder,
      }])
      .select()
      .single()

    if (error) {
      console.error('[Admin Sponsors] Create error:', error)
      return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_user_updated',
      endpoint: '/api/admin/sponsors',
      clientId: adminUser.id,
      details: `Sponsor created: ${validation.data.name} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, sponsor }, { status: 201 })
  } catch (error) {
    console.error('[Admin Sponsors] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/sponsors
 * Update an existing sponsor
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
      return NextResponse.json({ error: 'Sponsor ID is required' }, { status: 400 })
    }

    // Partial validation
    const partialSchema = sponsorSchema.partial()
    const validation = partialSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin Sponsors] Update error:', error)
      return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_user_updated',
      endpoint: '/api/admin/sponsors',
      clientId: adminUser.id,
      details: `Sponsor updated: ${id} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, sponsor })
  } catch (error) {
    console.error('[Admin Sponsors] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/sponsors
 * Delete a sponsor
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
      return NextResponse.json({ error: 'Sponsor ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get sponsor name for logging
    const { data: sponsor } = await supabase
      .from('sponsors')
      .select('name')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin Sponsors] Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_user_deleted',
      endpoint: '/api/admin/sponsors',
      details: `Sponsor deleted: ${sponsor?.name || id} by ${adminUser.email}`,
    })

    return NextResponse.json({ success: true, message: 'Sponsor deleted successfully' })
  } catch (error) {
    console.error('[Admin Sponsors] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
