import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/admin-auth'
import { logSecurityEvent } from '@/lib/security-logger'
import { createClient } from '@/lib/supabase/server'

// Gallery item validation schema
const GalleryItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  type: z.enum(['image', 'video', 'text']),
  media_url: z.string().url().nullable().optional(),
  youtube_url: z.string().url().nullable().optional(),
  content: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  display_order: z.number().int().min(0).optional(),
})

const GalleryItemUpdateSchema = GalleryItemSchema.partial().extend({
  id: z.string().uuid('Invalid gallery item ID'),
})

// GET - Fetch all gallery items with optional filtering
export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const supabase = await createClient()
    let query = supabase
      .from('gallery_items')
      .select('*')
      .order('display_order', { ascending: true })

    // Apply filters
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching gallery items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery items' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Gallery GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new gallery item
export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await req.json()

    // Validate data
    const validationResult = GalleryItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get current max display_order if not provided
    let displayOrder = validationResult.data.display_order
    if (displayOrder === undefined) {
      const { data: maxOrderData } = await supabase
        .from('gallery_items')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()
      
      displayOrder = (maxOrderData?.display_order || 0) + 1
    }

    const { data, error } = await supabase
      .from('gallery_items')
      .insert([{ ...validationResult.data, display_order: displayOrder }])
      .select()
      .single()

    if (error) {
      console.error('Error creating gallery item:', error)
      return NextResponse.json(
        { error: 'Failed to create gallery item' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'admin_action',
      endpoint: '/api/admin/gallery',
      clientId: session.userId,
      details: `Gallery item created: ${data.title}`,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Gallery POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update an existing gallery item
export async function PATCH(req: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await req.json()

    // Validate data
    const validationResult = GalleryItemUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { id, ...updateData } = validationResult.data

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('gallery_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating gallery item:', error)
      return NextResponse.json(
        { error: 'Failed to update gallery item' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    logSecurityEvent({
      type: 'admin_action',
      endpoint: '/api/admin/gallery',
      clientId: session.userId,
      details: `Gallery item updated: ${id} (${Object.keys(updateData).join(', ')})`,
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Gallery PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a gallery item
export async function DELETE(req: NextRequest) {
  try {
    const session = await verifyAdminSession()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Gallery item ID is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidSchema = z.string().uuid()
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid gallery item ID format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting gallery item:', error)
      return NextResponse.json(
        { error: 'Failed to delete gallery item' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'admin_action',
      endpoint: '/api/admin/gallery',
      clientId: session.userId,
      details: `Gallery item deleted: ${id}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gallery DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
