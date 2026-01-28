/**
 * CSRF Token Generation API Route
 * 
 * This endpoint generates and returns a CSRF token for form submissions.
 * The token is also stored in an HTTP-only cookie for validation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateAndStoreCSRFToken } from '@/lib/csrf'

export async function GET(req: NextRequest) {
  try {
    const token = await generateAndStoreCSRFToken()
    
    return NextResponse.json({
      token,
      expiresIn: 86400, // 24 hours in seconds
    })
  } catch (error) {
    console.error('[CSRF] Token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
