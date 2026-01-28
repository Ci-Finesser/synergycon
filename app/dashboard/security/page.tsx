/**
 * Dashboard Security Page
 * Manage user security settings, 2FA, sessions, and authentication
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Key,
  Smartphone,
  Activity,
  TriangleAlert,
  CheckCircle2,
  Copy,
  Download,
  LogOut,
  Monitor,
  MapPin,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: string
  device: string
  location: string
  ip_address: string
  last_active: string
  is_current: boolean
  created_at: string
}

interface LoginHistory {
  id: string
  device: string
  location: string
  ip_address: string
  timestamp: string
  status: 'success' | 'failed'
}

export default function SecurityPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { toast } = useToast()

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup' | 'complete'>('qr')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  // Sessions State
  const [sessions, setSessions] = useState<Session[]>([])
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])

  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  const [isSessionsLoading, setIsSessionsLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      loadSecurityData()
    }
  }, [user, router])

  const loadSecurityData = async () => {
    await Promise.all([
      checkTwoFactorStatus(),
      loadSessions(),
      loadLoginHistory(),
    ])
    setIsLoading(false)
  }

  const checkTwoFactorStatus = async () => {
    try {
      const res = await fetch('/api/user/auth/2fa/status')
      const data = await res.json()
      if (res.ok) {
        setTwoFactorEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error)
    }
  }

  const loadSessions = async () => {
    setIsSessionsLoading(true)
    try {
      const res = await fetch('/api/user/sessions')
      const data = await res.json()
      if (res.ok) {
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setIsSessionsLoading(false)
    }
  }

  const loadLoginHistory = async () => {
    setIsHistoryLoading(true)
    try {
      const res = await fetch('/api/user/security/login-history')
      const data = await res.json()
      if (res.ok) {
        setLoginHistory(data.history || [])
      }
    } catch (error) {
      console.error('Error loading login history:', error)
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const startSetup = async () => {
    setIsSettingUp(true)
    setSetupStep('qr')

    try {
      const res = await fetch('/api/user/auth/2fa/setup', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else {
        toast({
          title: "Error",
          description: "Failed to start 2FA setup",
          variant: "destructive",
        })
        setIsSettingUp(false)
      }
    } catch (error) {
      console.error('Error starting 2FA setup:', error)
      toast({
        title: "Error",
        description: "Failed to start 2FA setup",
        variant: "destructive",
      })
      setIsSettingUp(false)
    }
  }

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch('/api/user/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verificationCode,
          secret,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setBackupCodes(data.backupCodes)
        setSetupStep('backup')
        toast({
          title: "Success",
          description: "2FA verified successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || 'Invalid verification code',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error)
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      })
    }
  }

  const completeSetup = () => {
    setSetupStep('complete')
    setTwoFactorEnabled(true)
    setTimeout(() => {
      setIsSettingUp(false)
      setSetupStep('qr')
      setVerificationCode('')
    }, 2000)
  }

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) {
      return
    }

    try {
      const res = await fetch('/api/user/auth/2fa/disable', {
        method: 'POST',
      })

      if (res.ok) {
        setTwoFactorEnabled(false)
        toast({
          title: "Success",
          description: "2FA disabled successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to disable 2FA",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      })
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    })
  }

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'synergycon-2fa-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast({
      title: "Downloaded",
      description: "Backup codes saved to file",
    })
  }

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return
    }

    try {
      const res = await fetch(`/api/user/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId))
        toast({
          title: "Success",
          description: "Session revoked successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to revoke session",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error revoking session:', error)
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      })
    }
  }

  const revokeAllSessions = async () => {
    if (!confirm('Are you sure you want to revoke all sessions except the current one?')) {
      return
    }

    try {
      const res = await fetch('/api/user/sessions/revoke-all', {
        method: 'POST',
      })

      if (res.ok) {
        await loadSessions()
        toast({
          title: "Success",
          description: "All other sessions revoked",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to revoke sessions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error revoking sessions:', error)
      toast({
        title: "Error",
        description: "Failed to revoke sessions",
        variant: "destructive",
      })
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold">Security Settings</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your account security and authentication settings
        </p>
      </div>

      {/* Security Status Alert */}
      <Alert className={twoFactorEnabled ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}>
        {twoFactorEnabled ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400 text-sm">
              Your account is protected with two-factor authentication
            </AlertDescription>
          </>
        ) : (
          <>
            <TriangleAlert className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-sm">
              Enable two-factor authentication for enhanced security
            </AlertDescription>
          </>
        )}
      </Alert>

      <Tabs defaultValue="2fa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="history">Login History</TabsTrigger>
        </TabsList>

        {/* Two-Factor Authentication Tab */}
        <TabsContent value="2fa" className="space-y-4">
          {!isSettingUp ? (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      twoFactorEnabled ? 'bg-green-100 dark:bg-green-950' : 'bg-muted'
                    }`}>
                      <Shield className={`h-6 w-6 ${
                        twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl mb-2">
                        Two-Factor Authentication
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {twoFactorEnabled
                          ? 'Two-factor authentication is currently enabled for your account.'
                          : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
                      </CardDescription>
                      {twoFactorEnabled && (
                        <div className="flex items-center gap-2 text-green-600 mt-3">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {twoFactorEnabled ? (
                    <Button
                      variant="outline"
                      onClick={disable2FA}
                      size="sm"
                    >
                      Disable
                    </Button>
                  ) : (
                    <Button
                      onClick={startSetup}
                      size="sm"
                    >
                      Enable 2FA
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 sm:p-8">
                {/* QR Code Step */}
                {setupStep === 'qr' && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Smartphone className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Scan QR Code</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-8">
                      Use an authenticator app (Google Authenticator, Authy, etc.) to scan this QR code
                    </p>

                    {qrCode && (
                      <div className="bg-white p-4 sm:p-6 rounded-xl inline-block mb-6">
                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 sm:w-64 sm:h-64" />
                      </div>
                    )}

                    <div className="bg-muted p-4 rounded-xl mb-6">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        Or enter this code manually:
                      </p>
                      <code className="font-mono text-base sm:text-lg font-bold break-all">{secret}</code>
                    </div>

                    <Button
                      onClick={() => setSetupStep('verify')}
                      className="w-full sm:w-auto"
                    >
                      Next: Verify Code
                    </Button>
                  </div>
                )}

                {/* Verification Step */}
                {setupStep === 'verify' && (
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Key className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Enter Verification Code</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-8">
                      Enter the 6-digit code from your authenticator app
                    </p>

                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      className="text-center text-xl sm:text-2xl font-mono tracking-wider mb-6"
                      maxLength={6}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSetupStep('qr')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={verifyAndEnable}
                        className="flex-1"
                        disabled={verificationCode.length !== 6}
                      >
                        Verify & Enable
                      </Button>
                    </div>
                  </div>
                )}

                {/* Backup Codes Step */}
                {setupStep === 'backup' && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center mx-auto mb-6">
                      <Key className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Save Your Backup Codes</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-8">
                      Store these codes in a safe place. You can use them to access your account if you lose your device.
                    </p>

                    <div className="bg-muted p-4 sm:p-6 rounded-xl mb-6">
                      <div className="grid grid-cols-2 gap-2 text-left font-mono text-xs sm:text-sm">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-muted-foreground">{index + 1}.</span>
                            <span>{code}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mb-6">
                      <Button
                        variant="outline"
                        onClick={copyBackupCodes}
                        className="flex-1"
                        size="sm"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Codes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={downloadBackupCodes}
                        className="flex-1"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <Button
                      onClick={completeSetup}
                      className="w-full"
                    >
                      I've Saved My Codes
                    </Button>
                  </div>
                )}

                {/* Complete Step */}
                {setupStep === 'complete' && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">2FA Enabled Successfully!</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Your account is now protected with two-factor authentication.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Box */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
                What is Two-Factor Authentication?
              </h4>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                Two-factor authentication (2FA) adds an extra layer of security to your account. 
                When enabled, you'll need to enter a code from your authenticator app in addition 
                to your password when logging in.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Active Sessions</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Devices currently logged into your account
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSessions}
                    disabled={isSessionsLoading}
                  >
                    {isSessionsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                  {sessions.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={revokeAllSessions}
                    >
                      Revoke All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {isSessionsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No active sessions found
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Monitor className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{session.device}</p>
                            {session.is_current && (
                              <Badge variant="default" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location}
                            </span>
                            <span>IP: {session.ip_address}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(session.last_active)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!session.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeSession(session.id)}
                          className="flex-shrink-0"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Login History</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Recent login attempts to your account
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadLoginHistory}
                  disabled={isHistoryLoading}
                >
                  {isHistoryLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {isHistoryLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : loginHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No login history found
                  </div>
                ) : (
                  loginHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          entry.status === 'success' 
                            ? 'bg-green-100 dark:bg-green-950' 
                            : 'bg-red-100 dark:bg-red-950'
                        }`}>
                          <Activity className={`w-5 h-5 ${
                            entry.status === 'success' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{entry.device}</p>
                            <Badge 
                              variant={entry.status === 'success' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {entry.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {entry.location}
                            </span>
                            <span>IP: {entry.ip_address}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
