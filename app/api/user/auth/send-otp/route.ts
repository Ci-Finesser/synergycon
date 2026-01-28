import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAndSendOTP } from '@/lib/auth/otp'
import { logSecurityEvent } from '@/lib/security-logger'

const schema = z.object({
  email: z.string().email(),
  purpose: z.enum(['login', 'registration', 'verification']).default('login'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, purpose } = schema.parse(body)

    const success = await createAndSendOTP(email, purpose)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'otp_requested',
      endpoint: request.url,
      details: `OTP requested for ${purpose}: ${email}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
