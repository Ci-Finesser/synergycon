import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cleanSecurityFields, securePost, validateRequestSecurity } from '@/lib/api-security'
import { createAdminClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security-logger'
import { sendPartnershipApplicationEmail } from '@/lib/email'
import { RATE_LIMITS } from '@/lib/rate-limit'

// Define the validation schema using Zod
const partnershipSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  contact_person: z.string().min(1, 'Contact person is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(50),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  company_description: z.string().min(1, 'Company description is required').max(5000),
  partnership_interests: z.array(z.string()).optional(),
  marketing_reach: z.string().optional(),
  why_partner: z.string().optional(),
  additional_notes: z.string().optional(),
  partnership_tier: z.enum(['silver', 'gold', 'platinum', 'diamond', 'none']).nullable(),
}).strip()

// Define the handler for the securePost wrapper
export async function POST(req: NextRequest) {
 const body = await req.json()

 const securityError = await validateRequestSecurity(req, body, {
   rateLimit: RATE_LIMITS.STRICT,
 })
 if (securityError) return securityError

  const cleanData = cleanSecurityFields(body)

  const validationResult = partnershipSchema.safeParse(cleanData)

  if (!validationResult.success) {
    console.warn('[API] Partnership application validation failed', validationResult.error.flatten())
    return NextResponse.json(
      { error: 'Invalid data provided.', details: validationResult.error.flatten() },
      { status: 400 }
    )
  }

  const validatedData = validationResult.data

  const dataToInsert = {
    ...validatedData,
    partnership_interests: validatedData.partnership_interests?.join(', '),
    status: 'pending',
  }

  try {
  const supabase = createAdminClient()

    const { error } = await supabase.from('partnership_applications').insert([dataToInsert])

    if (error) {
      console.error('[API] Error inserting partnership application:', error)
      logSecurityEvent({
        type: 'db_insert_error',
        endpoint: req.url,
        // clientId: req.credentials === 'include' ? req.headers.get('x-forwarded-for') : undefined,
        userAgent: req.headers.get('user-agent') || undefined,
        details: `Failed to insert partnership application for ${validatedData.company_name}. Error: ${error.message}`,
        // error: error.message,
      })
      return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'successful_submission',
      endpoint: req.url,
      details: `Successfully received partnership application from ${validatedData.company_name}.`,
    })

    // Send confirmation email
    const tierDisplay = validatedData.partnership_tier === 'none' ? 'Other Partnership' : validatedData.partnership_tier?.toUpperCase() || 'Inquiry'
    const emailResult = await sendPartnershipApplicationEmail(
      validatedData.email,
      validatedData.company_name,
      validatedData.contact_person,
      tierDisplay
    )

    if (!emailResult.success) {
      console.warn(`[Partnership Application] Failed to send confirmation email: ${emailResult.error}`)
      // Continue anyway - application is created
    }

    return NextResponse.json({ success: true, message: 'Application submitted successfully.' })
  } catch (error: any) {
    console.error('[API] Unexpected error in partnership application handler:', error)
    logSecurityEvent({
      type: 'api_handler_exception',
      endpoint: req.url,
      details: `Unexpected error: ${error.message}`,
      // error: error.message,
    })
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
