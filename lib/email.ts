/**
 * Email Sending Utility
 * Handles all email sending operations with proper error handling and logging
 */

import { getResend, isResendConfigured } from './resend'
import { render } from '@react-email/render'
import { logSecurityEvent } from './security-logger'
import { logEmailSuccess, logEmailFailure } from './email-logger'
import type { CreateEmailOptions } from 'resend'
import type { EmailType, EmailLogMetadata } from '@/types/email'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  component?: React.ReactElement
  from?: string
  /** Email type for logging purposes */
  emailType?: EmailType
  /** Additional metadata to store with the email log */
  logMetadata?: EmailLogMetadata
  /** Recipient name for logging (optional) */
  recipientName?: string
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

const DEFAULT_FROM = 'SynergyCon <noreply@synergycon.live>'

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const recipient = Array.isArray(options.to) ? options.to[0] : options.to
  const recipientList = Array.isArray(options.to) ? options.to.join(', ') : options.to

  // Check if Resend is configured
  if (!isResendConfigured()) {
    console.warn('[Email] Resend not configured. Email would not be sent in production.')
    
    // Log the failure if email type is provided
    if (options.emailType) {
      await logEmailFailure(
        options.emailType,
        recipient,
        options.subject,
        'Email service not configured',
        options.logMetadata
      )
    }
    
    return {
      success: false,
      error: 'Email service not configured',
    }
  }

  try {
    const resend = getResend()

    // If a React component is provided, render it to HTML
    let html = options.html
    if (options.component) {
      html = await render(options.component)
    }

    // Send the email - use type assertion for Resend's complex union type
    const response = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: html,
      text: options.text,
    } as CreateEmailOptions)

    if (response.error) {
      console.error('[Email] Resend error:', response.error)
      logSecurityEvent({
        type: 'email_failed',
        endpoint: 'email/send',
        details: `Failed to send email to ${recipientList}: ${response.error.message}`,
      })
      
      // Log to database if email type is provided
      if (options.emailType) {
        await logEmailFailure(
          options.emailType,
          recipient,
          options.subject,
          response.error.message || 'Failed to send email',
          options.logMetadata
        )
      }
      
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
      }
    }

    console.log(`[Email] Sent successfully (ID: ${response.data?.id})`)
    logSecurityEvent({
      type: 'email_sent',
      endpoint: 'email/send',
      details: `Email sent to ${recipientList} (ID: ${response.data?.id})`,
    })
    
    // Log success to database if email type is provided
    if (options.emailType && response.data?.id) {
      await logEmailSuccess(
        options.emailType,
        recipient,
        options.subject,
        response.data.id,
        options.logMetadata
      )
    }
    
    return {
      success: true,
      id: response.data?.id,
    }
  } catch (error) {
    console.error('[Email] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logSecurityEvent({
      type: 'email_failed',
      endpoint: 'email/send',
      details: `Unexpected error sending email: ${errorMessage}`,
    })
    
    // Log to database if email type is provided
    if (options.emailType) {
      await logEmailFailure(
        options.emailType,
        recipient,
        options.subject,
        errorMessage,
        options.logMetadata
      )
    }
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Send OTP email for login
 */
export async function sendOTPEmail(
  email: string,
  code: string,
  expiresInMinutes: number = 10
): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SynergyCon 2.0</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Login Verification Code</p>
      </div>

      <div style="padding: 40px; background: white;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Hello,
        </p>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
          You requested a login verification code for your SynergyCon account. Please use the code below to complete your login:
        </p>

        <div style="text-align: center; margin: 40px 0;">
          <div style="background: #f0f0f0; padding: 30px; border-radius: 8px; border: 2px dashed #8B5CF6;">
            <p style="color: #333; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 5px;">
              ${code}
            </p>
          </div>
        </div>

        <div style="background: #FFF3CD; padding: 15px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #FFC107;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⏱️ This code expires in ${expiresInMinutes} minutes.</strong> Do not share this code with anyone.
          </p>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If you did not request this code, please ignore this email or contact our support team immediately.
        </p>
      </div>

      <div style="padding: 20px; text-align: center; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        <p style="margin: 0;">© 2026 SynergyCon. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `

  const result = await sendEmail({
    to: email,
    subject: 'SynergyCon Login Verification Code',
    html,
    emailType: 'otp_verification',
    logMetadata: {
      expires_in_minutes: expiresInMinutes,
    },
  })

  // Audit log OTP emails specifically (security-sensitive)
  logSecurityEvent({
    type: result.success ? 'otp_email_sent' : 'otp_email_failed',
    endpoint: 'email/otp',
    details: result.success
      ? `OTP email sent to ${email} (expires in ${expiresInMinutes} mins)`
      : `Failed to send OTP email to ${email}: ${result.error}`,
  })

  return result
}

/**
 * Send ticket transfer notification
 */
export async function sendTicketTransferEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  ticketNumber: string,
  ticketType: string
): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SynergyCon 2.0</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Ticket Transfer</p>
      </div>

      <div style="padding: 40px; background: white;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Hi ${recipientName},
        </p>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
          Good news! <strong>${senderName}</strong> has transferred a SynergyCon ticket to you. Here are your ticket details:
        </p>

        <div style="background: #f0f0f0; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8B5CF6;">
          <p style="margin: 0 0 15px 0; color: #333; font-size: 14px;">
            <strong>Ticket Number:</strong> ${ticketNumber}
          </p>
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Ticket Type:</strong> ${ticketType}
          </p>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          You can now use this ticket to check in at the SynergyCon event. Visit your dashboard to download your ticket details.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://synergycon.live/dashboard/tickets" style="background-color: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Your Tickets
          </a>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Thank you for attending SynergyCon 2.0!
        </p>
      </div>

      <div style="padding: 20px; text-align: center; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        <p style="margin: 0;">© 2026 SynergyCon. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `

  const result = await sendEmail({
    to: recipientEmail,
    subject: `SynergyCon Ticket Transfer from ${senderName}`,
    html,
    emailType: 'ticket_transfer',
    recipientName: recipientName,
    logMetadata: {
      ticket_number: ticketNumber,
      ticket_type: ticketType,
      sender_name: senderName,
    },
  })

  // Audit log ticket transfers (important for tracking)
  logSecurityEvent({
    type: result.success ? 'ticket_transfer_email_sent' : 'ticket_transfer_email_failed',
    endpoint: 'email/ticket-transfer',
    details: result.success
      ? `Ticket transfer email sent: ${ticketNumber} from ${senderName} to ${recipientEmail}`
      : `Failed to send ticket transfer email to ${recipientEmail}: ${result.error}`,
  })

  return result
}

/**
 * 
 * Send team ticket purchase confirmation
 */
export async function sendTeamTicketPurchaseEmail(
  teamMemberEmail: string,
  teamMemberName: string,
  organizer: string,
  ticketType: string
): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SynergyCon 2.0</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Team Ticket Assigned</p>
      </div>

      <div style="padding: 40px; background: white;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Hi ${teamMemberName},
        </p>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
          <strong>${organizer}</strong> has purchased a team ticket for SynergyCon 2.0 and assigned it to you. Here are your ticket details:
        </p>

        <div style="background: #f0f0f0; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8B5CF6;">
          <p style="margin: 0 0 15px 0; color: #333; font-size: 14px;">
            <strong>Ticket Type:</strong> ${ticketType}
          </p>
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Status:</strong> Confirmed
          </p>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Your ticket is ready for check-in at the event. You can download your full ticket details and QR code from your dashboard.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://synergycon.live/dashboard/tickets" style="background-color: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Your Ticket
          </a>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          We're excited to have you at SynergyCon 2.0!
        </p>
      </div>

      <div style="padding: 20px; text-align: center; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        <p style="margin: 0;">© 2026 SynergyCon. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: teamMemberEmail,
    subject: `Your SynergyCon Ticket from ${organizer}`,
    html,
    emailType: 'team_ticket_assignment',
    recipientName: teamMemberName,
    logMetadata: {
      organizer,
      ticket_type: ticketType,
    },
  })
}

/**
 * Send speaker application received notification
 */
export async function sendSpeakerApplicationEmail(
  email: string,
  name: string,
  topic: string
): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SynergyCon 2.0</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Application Received</p>
      </div>

      <div style="padding: 40px; background: white;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Hi ${name},
        </p>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
          Thank you for applying to speak at SynergyCon 2.0! We've received your application and our team is reviewing it carefully.
        </p>

        <div style="background: #f0f0f0; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8B5CF6;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Topic:</strong> ${topic}
          </p>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          <strong>What happens next:</strong>
        </p>
        <ul style="color: #666; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          <li>Our team will review your submission (typically 2-3 weeks)</li>
          <li>We'll evaluate your topic, experience, and fit with the conference</li>
          <li>You'll receive an email with our decision and next steps</li>
          <li>Selected speakers will receive additional details and requirements</li>
        </ul>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Thank you for your interest in sharing your expertise with Nigeria's creative economy leaders!
        </p>
      </div>

      <div style="padding: 20px; text-align: center; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        <p style="margin: 0;">© 2026 SynergyCon. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: 'SynergyCon Speaker Application Received',
    html,
    emailType: 'speaker_application',
    recipientName: name,
    logMetadata: {
      topic,
    },
  })
}

/**
 * Send partnership application received notification
 */
export async function sendPartnershipApplicationEmail(
  email: string,
  companyName: string,
  contactPerson: string,
  tier: string
): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SynergyCon 2.0</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Partnership Inquiry Received</p>
      </div>

      <div style="padding: 40px; background: white;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Hi ${contactPerson},
        </p>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
          Thank you for your interest in partnering with SynergyCon 2.0! We've received your application and appreciate your engagement with our vision.
        </p>

        <div style="background: #f0f0f0; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8B5CF6;">
          <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">
            <strong>Organization:</strong> ${companyName}
          </p>
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Partnership Tier:</strong> ${tier}
          </p>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          <strong>What happens next:</strong>
        </p>
        <ul style="color: #666; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          <li>Our partnership team will review your application</li>
          <li>We'll assess the fit and mutual benefits (typically 1-5 days)</li>
          <li>You'll be contacted with our decision and partnership details</li>
          <li>Approved partners will receive a formal agreement and onboarding guide</li>
        </ul>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          We look forward to exploring partnership opportunities with ${companyName}!
        </p>
      </div>

      <div style="padding: 20px; text-align: center; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        <p style="margin: 0;">© 2026 SynergyCon. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: `Partnership Application Received - ${companyName}`,
    html,
    emailType: 'partner_confirmation',
    recipientName: contactPerson,
    logMetadata: {
      company_name: companyName,
      partnership_tier: tier,
    },
  })
}

/**
 * Ticket Confirmation Email (Receipt)
 * Sent after successful payment - contains order details as a receipt
 */
export interface TicketConfirmationEmailOptions {
  email: string
  name: string
  orderNumber: string
  amount: number
  currency: string
  tickets: string  // e.g., "2x VIP Pass, 1x Standard Pass"
  paidAt: Date
}

export async function sendTicketConfirmationEmail(
  options: TicketConfirmationEmailOptions
): Promise<EmailResult> {
  const { email, name, orderNumber, amount, currency, tickets, paidAt } = options
  
  const currencySymbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency
  const formattedAmount = `${currencySymbol}${amount.toLocaleString()}`
  const formattedDate = paidAt.toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SynergyCon 2.0</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Payment Confirmation</p>
      </div>

      <div style="padding: 40px; background: white;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Hi ${name},
        </p>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
          Thank you for your purchase! Your payment has been successfully processed. Here's your receipt:
        </p>

        <div style="background: #f0f0f0; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8B5CF6;">
          <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
            Order Receipt
          </h3>
          <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">
            <strong>Order Number:</strong> ${orderNumber}
          </p>
          <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">
            <strong>Tickets:</strong> ${tickets}
          </p>
          <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">
            <strong>Amount Paid:</strong> ${formattedAmount}
          </p>
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Payment Date:</strong> ${formattedDate}
          </p>
        </div>

        <div style="background: #E8F5E9; padding: 15px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #4CAF50;">
          <p style="margin: 0; color: #2E7D32; font-size: 14px;">
            <strong>✅ Payment Successful!</strong> Your tickets are confirmed and ready for the event.
          </p>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          <strong>What's next?</strong>
        </p>
        <ul style="color: #666; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          <li>Check your email for your login details if you're a new user</li>
          <li>Log in to your dashboard to view and download your tickets</li>
          <li>Save this email as your payment receipt</li>
          <li>Mark your calendar for SynergyCon 2.0!</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://synergycon.live/dashboard/tickets" style="background-color: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Your Tickets
          </a>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          We're excited to see you at SynergyCon 2.0!
        </p>
      </div>

      <div style="padding: 20px; text-align: center; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        <p style="margin: 0;">© 2026 SynergyCon. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated receipt. Please save for your records.</p>
      </div>
    </div>
  `

  const result = await sendEmail({
    to: email,
    subject: `SynergyCon 2.0 Payment Receipt - Order ${orderNumber}`,
    html,
    emailType: 'ticket_confirmation',
    recipientName: name,
    logMetadata: {
      order_id: orderNumber,
      amount: String(amount),
      currency,
      tickets,
    },
  })

  logSecurityEvent({
    type: result.success ? 'ticket_confirmation_email_sent' : 'ticket_confirmation_email_failed',
    endpoint: 'email/ticket-confirmation',
    details: result.success
      ? `Ticket confirmation sent to ${email} for order ${orderNumber}`
      : `Failed to send ticket confirmation to ${email}: ${result.error}`,
  })

  return result
}

/**
 * Welcome Email for New Users
 * Sent to new users after their first ticket purchase
 * Includes login instructions using the magic link OTP system
 */
export interface WelcomeEmailOptions {
  email: string
  name: string
}

export async function sendWelcomeEmail(
  options: WelcomeEmailOptions
): Promise<EmailResult> {
  const { email, name } = options
  
  const loginUrl = `https://synergycon.live/login?email=${encodeURIComponent(email)}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SynergyCon!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your account is ready</p>
      </div>

      <div style="padding: 40px; background: white;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Hi ${name},
        </p>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
          Welcome to the SynergyCon community! Your account has been created and you're all set to access your tickets, connect with attendees, and get the most out of Nigeria's premier Creative Economy conference.
        </p>

        <div style="background: linear-gradient(135deg, #8B5CF620 0%, #EC489920 100%); padding: 25px; border-radius: 8px; margin: 30px 0; border: 1px solid #8B5CF640;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">
            🔐 Your Login Details
          </h3>
          <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">
            <strong>Email:</strong> ${email}
          </p>
          <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5;">
            We use passwordless login for security. When you click "Login", we'll send a one-time verification code to your email. Simply enter the code to access your account.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #8B5CF6; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Login to Your Account
          </a>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          <strong>What you can do in your dashboard:</strong>
        </p>
        <ul style="color: #666; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          <li>📱 View and download your tickets</li>
          <li>👤 Complete your attendee profile</li>
          <li>🤝 Connect with other attendees</li>
          <li>📅 Browse the event schedule</li>
          <li>🎯 Bookmark sessions you want to attend</li>
        </ul>

        <div style="background: #FFF3CD; padding: 15px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #FFC107;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>💡 Tip:</strong> Complete your profile to make the most of networking opportunities at SynergyCon!
          </p>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          We're thrilled to have you join us at SynergyCon 2.0!
        </p>
      </div>

      <div style="padding: 20px; text-align: center; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        <p style="margin: 0;">© 2026 SynergyCon. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `

  const result = await sendEmail({
    to: email,
    subject: 'Welcome to SynergyCon! Your Account is Ready',
    html,
    emailType: 'welcome',
    recipientName: name,
  })

  logSecurityEvent({
    type: result.success ? 'welcome_email_sent' : 'welcome_email_failed',
    endpoint: 'email/welcome',
    details: result.success
      ? `Welcome email sent to ${email}`
      : `Failed to send welcome email to ${email}: ${result.error}`,
  })

  return result
}

/**
 * Order Pending Email
 * Sent when a ticket order is submitted with pending payment status
 * Dark monochrome theme
 */
export interface OrderPendingEmailOptions {
  email: string
  name: string
  orderNumber: string
  tickets: string // e.g., "2x VIP, 1x VVIP"
  totalAmount: number
  currency?: string
}

export async function sendOrderPendingEmail(
  options: OrderPendingEmailOptions
): Promise<EmailResult> {
  const { email, name, orderNumber, tickets, totalAmount, currency = 'NGN' } = options
  
  const currencySymbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency
  const formattedAmount = `${currencySymbol}${totalAmount.toLocaleString()}`
  const orderDate = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0A0A;">
      <div style="background-color: #171717; padding: 40px; text-align: center; border-bottom: 1px solid #262626;">
        <h1 style="color: #FAFAFA; font-size: 28px; margin: 0;">SynergyCon 2.0</h1>
        <p style="color: #A3A3A3; font-size: 16px; margin: 10px 0 0 0;">Order Confirmation</p>
      </div>

      <div style="padding: 40px; background-color: #0F0F0F;">
        <p style="color: #FAFAFA; font-size: 18px; margin-bottom: 20px;">
          Hi ${name},
        </p>

        <p style="color: #D4D4D4; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Thank you for your ticket order! We've received your registration and your tickets are reserved. To complete your purchase, please proceed with payment using the details below:
        </p>

        <div style="background-color: #171717; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #FAFAFA;">
          <h3 style="margin: 0 0 20px 0; color: #FAFAFA; font-size: 18px; border-bottom: 1px solid #262626; padding-bottom: 10px;">
            Order Details
          </h3>
          <p style="margin: 0 0 10px 0; color: #D4D4D4; font-size: 14px;">
            <strong style="color: #FAFAFA;">Order Number:</strong> ${orderNumber}
          </p>
          <p style="margin: 0 0 10px 0; color: #D4D4D4; font-size: 14px;">
            <strong style="color: #FAFAFA;">Tickets:</strong> ${tickets}
          </p>
          <p style="margin: 0 0 10px 0; color: #D4D4D4; font-size: 14px;">
            <strong style="color: #FAFAFA;">Amount Due:</strong> ${formattedAmount}
          </p>
          <p style="margin: 0; color: #D4D4D4; font-size: 14px;">
            <strong style="color: #FAFAFA;">Order Date:</strong> ${orderDate}
          </p>
        </div>

        <div style="background-color: #1A1A1A; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #262626;">
          <p style="margin: 0 0 10px 0; color: #FAFAFA; font-size: 16px; font-weight: bold;">
            💳 Payment Required
          </p>
          <p style="margin: 0; color: #A3A3A3; font-size: 14px; line-height: 1.6;">
            Your order has been created but payment is still pending. You will receive a follow-up email shortly with instructions on how to complete your payment. Please reference your order number <strong style="color: #FAFAFA;">${orderNumber}</strong> when making payment.
          </p>
        </div>

        <p style="color: #D4D4D4; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          <strong style="color: #FAFAFA;">What happens next?</strong>
        </p>
        <ul style="color: #A3A3A3; font-size: 14px; line-height: 1.8; margin-bottom: 30px; padding-left: 20px;">
          <li>Look out for an email with payment instructions</li>
          <li>Complete payment using your order number as reference</li>
          <li>Once payment is confirmed, your tickets will be sent to this email</li>
          <li>Present your tickets at the venue on event day</li>
        </ul>

        <div style="text-align: center; margin: 40px 0;">
          <a href="https://synergycon.live" style="background-color: #FAFAFA; color: #0A0A0A; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Visit SynergyCon
          </a>
        </div>

        <p style="color: #D4D4D4; font-size: 14px; line-height: 1.6;">
          We're excited to see you at SynergyCon 2.0 - Nigeria's Premier Creative Economy Conference!
        </p>
      </div>

      <div style="padding: 30px; text-align: center; background-color: #0A0A0A; border-top: 1px solid #262626; font-size: 12px;">
        <p style="margin: 0; color: #737373;">© 2026 SynergyCon. All rights reserved.</p>
        <p style="margin: 10px 0 0 0; color: #737373;">
          Questions? Contact us at <a href="mailto:support@synergycon.live" style="color: #A3A3A3;">support@synergycon.live</a>
        </p>
      </div>
    </div>
  `

  const result = await sendEmail({
    to: email,
    subject: `SynergyCon 2.0 - Order Received (${orderNumber})`,
    html,
    emailType: 'order_pending',
    recipientName: name,
    logMetadata: {
      order_id: orderNumber,
      amount: String(totalAmount),
      currency,
      tickets,
    },
  })

  logSecurityEvent({
    type: result.success ? 'order_pending_email_sent' : 'order_pending_email_failed',
    endpoint: 'email/order-pending',
    details: result.success
      ? `Order pending email sent to ${email} for order ${orderNumber}`
      : `Failed to send order pending email to ${email}: ${result.error}`,
  })

  return result
}

