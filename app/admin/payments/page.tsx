/**
 * Admin Payments Dashboard
 * 
 * Dashboard for viewing and managing payments
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, RefreshCw, Filter, TrendingUp, WifiOff, Loader2 } from 'lucide-react'
import type {
  PaymentStats,
  PaymentRecord,
  DailyRevenue,
  TicketStats,
  PaymentMethodStats,
  PaymentStatus,
} from '@/types/payment'
import { useNetworkStore } from '@/lib/stores/network-store'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { AdminNavigation } from '@/components/admin-navigation'

export default function AdminPaymentsDashboard() {
  const router = useRouter()
  const { isOnline } = useNetworkStore()
  const { isLoading: isAuthLoading, isAuthenticated, authFetch } = useAdminAuth()
  
  // All useState hooks must be at the top, before any conditional returns
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([])
  const [ticketStats, setTicketStats] = useState<TicketStats[]>([])
  const [tierStats, setTierStats] = useState<TicketStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter states
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 10

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Load analytics data
  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics()
    }
  }, [isAuthenticated, startDate, endDate])

  // Load payments list
  useEffect(() => {
    if (isAuthenticated) {
      loadPayments()
    }
  }, [isAuthenticated, statusFilter, currentPage])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      // Load overview stats
      const overviewRes = await fetch(`/api/admin/payments/analytics?metric=overview&${params}`)
      const overviewData = await overviewRes.json()
      setStats(overviewData.data)

      // Load daily revenue
      const dailyRes = await fetch(`/api/admin/payments/analytics?metric=daily&${params}`)
      const dailyData = await dailyRes.json()
      setDailyRevenue(dailyData.data)

      // Load ticket stats
      const ticketsRes = await fetch(`/api/admin/payments/analytics?metric=tickets&${params}`)
      const ticketsData = await ticketsRes.json()
      setTicketStats(ticketsData.data)

      // Load tier stats
      const tiersRes = await fetch(`/api/admin/payments/analytics?metric=tiers&${params}`)
      const tiersData = await tiersRes.json()
      setTierStats(tiersData.data)

      setLoading(false)
    } catch (err) {
      setError('Failed to load analytics')
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      params.append('limit', ITEMS_PER_PAGE.toString())
      params.append('offset', ((currentPage - 1) * ITEMS_PER_PAGE).toString())

      const res = await fetch(`/api/admin/payments?${params}`)
      const data = await res.json()
      setPayments(data.payments)
    } catch (err) {
      setError('Failed to load payments')
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/payments/export?${params}`)
      const blob = await res.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to export payments')
    }
  }

  const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4']

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <>
        <AdminNavigation />
        <div className="p-8 text-center">Loading...</div>
      </>
    )
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Payments Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage and analyze all payment transactions</p>
            </div>
        <div className="flex gap-2">
          <Button onClick={() => loadAnalytics()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{(stats.totalRevenue / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.successfulTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.successfulTransactions}/{stats.totalTransactions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{(stats.averageTransactionValue / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => `₦${((value as number) / 1000).toFixed(1)}K`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            {tierStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tierStats}
                    dataKey="revenue"
                    nameKey="tier"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {tierStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₦${((value as number) / 1000).toFixed(1)}K`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Email, phone, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value as PaymentStatus | '')}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>All payment transactions with current status</CardDescription>
        </CardHeader>
        <CardContent>
        {payments.length === 0 && (
            <div className="text-center text-muted-foreground py-8">No payments found</div>
          )}

          {/* Simple payments table without UI components */}
          {payments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4 font-semibold">Order ID</th>
                    <th className="text-left py-2 px-4 font-semibold">Customer</th>
                    <th className="text-left py-2 px-4 font-semibold">Amount</th>
                    <th className="text-left py-2 px-4 font-semibold">Status</th>
                    <th className="text-left py-2 px-4 font-semibold">Type</th>
                    <th className="text-left py-2 px-4 font-semibold">Date</th>
                    <th className="text-left py-2 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-mono text-xs">{payment.order_id}</td>
                      <td className="py-2 px-4">
                        <div className="text-sm">
                          <div className="font-medium">{payment.customer_name}</div>
                          <div className="text-xs text-muted-foreground">{payment.customer_email}</div>
                        </div>
                      </td>
                      <td className="py-2 px-4 font-medium">
                        ₦{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            payment.status === 'successful'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : payment.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm">{payment.payment_type || '-'}</td>
                      <td className="py-2 px-4 text-sm">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-2 px-4">
                        <Button variant="ghost" size="sm" onClick={() => {}}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </main>
    </>
  )
}
