import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.update_profile'
  | 'user.enable_2fa'
  | 'user.disable_2fa'
  | 'ticket.create'
  | 'ticket.check_in'
  | 'ticket.check_out'
  | 'ticket.cancel'
  | 'admin.login'
  | 'admin.logout'
  | 'admin.create_user'
  | 'admin.update_user'
  | 'admin.delete_user'
  | 'enterprise.create'
  | 'enterprise.invite_member'
  | 'enterprise.remove_member'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refunded'

export interface AuditLogEntry {
  actorId?: string
  actorType: 'user' | 'admin' | 'system'
  actorEmail?: string
  action: AuditAction | string
  resourceType: string
  resourceId?: string
  details?: Record<string, unknown>
  status?: 'success' | 'failure'
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createAdminClient()
    const headersList = await headers()

    const { error } = await supabase.from('audit_logs').insert({
      actor_id: entry.actorId,
      actor_type: entry.actorType,
      actor_email: entry.actorEmail,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      details: entry.details || {},
      status: entry.status || 'success',
      ip_address: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
      user_agent: headersList.get('user-agent'),
    })

    if (error) {
      console.error('Failed to create audit log:', error)
    }
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

export async function getAuditLogs(options: {
  actorId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  limit?: number
  offset?: number
  startDate?: Date
  endDate?: Date
}) {
  const supabase = createAdminClient()

  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (options.actorId) query = query.eq('actor_id', options.actorId)
  if (options.action) query = query.eq('action', options.action)
  if (options.resourceType) query = query.eq('resource_type', options.resourceType)
  if (options.resourceId) query = query.eq('resource_id', options.resourceId)
  if (options.startDate) query = query.gte('created_at', options.startDate.toISOString())
  if (options.endDate) query = query.lte('created_at', options.endDate.toISOString())
  if (options.limit) query = query.limit(options.limit)
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1)

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`)
  return data
}
