import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSecurityLogs, getSecurityStats, exportSecurityLogs } from '@/lib/security-logger'

/**
 * Get security logs and statistics (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'logs'
    const type = url.searchParams.get('type')
    const endpoint = url.searchParams.get('endpoint')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const since = url.searchParams.get('since')
    const format = url.searchParams.get('format') as 'json' | 'csv' || 'json'

    // Handle export
    if (action === 'export') {
      const exported = await exportSecurityLogs(format)
      
      return new NextResponse(exported, {
        status: 200,
        headers: {
          'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename=security-logs-${Date.now()}.${format}`,
        },
      })
    }

    // Handle stats
    if (action === 'stats') {
      const timeWindow = parseInt(url.searchParams.get('window') || '3600000') // 1 hour default
      const stats = await getSecurityStats(timeWindow)
      
      return NextResponse.json({
        stats,
        timeWindow,
        timestamp: Date.now(),
      })
    }

    // Default: Return logs
    const filter: any = { limit }
    if (type) filter.type = type
    if (endpoint) filter.endpoint = endpoint
    if (since) filter.since = parseInt(since)

    const logs = await getSecurityLogs(filter)

    return NextResponse.json({
      logs,
      count: logs.length,
      filter,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('[Security Logs] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
