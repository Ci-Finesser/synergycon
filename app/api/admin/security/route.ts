import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get security metrics
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Failed login attempts
    const { count: failedLogins24h } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'login')
      .eq('metadata->>success', 'false')
      .gte('created_at', last24Hours.toISOString())

    // Active sessions
    const { count: activeSessions } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', now.toISOString())

    // OTP attempts
    const { count: otpAttempts24h } = await supabase
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24Hours.toISOString())

    // Recent audit logs
    const { data: recentLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    // Suspicious activities (high OTP attempts)
    const { data: suspiciousIPs } = await supabase
      .from('audit_logs')
      .select('ip_address')
      .gte('created_at', last24Hours.toISOString())
      .not('ip_address', 'is', null)

    // Count by IP
    const ipCounts = suspiciousIPs?.reduce((acc: any, log: any) => {
      acc[log.ip_address] = (acc[log.ip_address] || 0) + 1
      return acc
    }, {})

    const suspiciousActivity = Object.entries(ipCounts || {})
      .filter(([_, count]) => (count as number) > 20)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a: any, b: any) => b.count - a.count)

    return NextResponse.json({
      success: true,
      metrics: {
        failedLogins24h: failedLogins24h || 0,
        activeSessions: activeSessions || 0,
        otpAttempts24h: otpAttempts24h || 0,
        suspiciousActivity,
      },
      recentLogs: recentLogs || [],
    })
  } catch (error: any) {
    console.error('Error fetching security metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch security metrics' },
      { status: 500 }
    )
  }
}
