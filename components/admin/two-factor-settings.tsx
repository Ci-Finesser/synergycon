"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle2, Loader2, RefreshCw } from "lucide-react"

interface TwoFactorSettingsProps {
  adminId: string
}

export function TwoFactorSettings({ adminId }: TwoFactorSettingsProps) {
  const [status, setStatus] = useState<{ enabled: boolean; verified: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [testLoading, setTestLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/auth/2fa/status")
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
      }
    } catch (error) {
      console.error("Error fetching 2FA status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestCode = async () => {
    setTestLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/auth/2fa/send-code", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test code")
      }

      setMessage({
        type: "success",
        text: "Test code sent to your email! Check your inbox.",
      })
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to send test code",
      })
    } finally {
      setTestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-accent-green" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">Email-based verification for enhanced security</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
          <div className="flex items-center gap-3">
            {status?.enabled ? (
              <CheckCircle2 className="w-5 h-5 text-accent-green" />
            ) : (
              <Shield className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-sm">Status</p>
              <p className="text-sm text-muted-foreground">
                {status?.enabled ? "Enabled and Active" : "Not Configured"}
              </p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium">
            {status?.enabled ? "Active" : "Inactive"}
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-accent-green/10 text-accent-green border-accent-green/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Two-factor authentication is mandatory for all admin accounts
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              A 6-digit code is sent to your email each time you log in
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Verification codes expire after 10 minutes
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleTestCode}
            disabled={testLoading || !status?.enabled}
            variant="outline"
            className="w-full rounded-xl"
          >
            {testLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Test Code...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Send Test Code
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Test your 2FA setup by sending a verification code to your email
          </p>
        </div>
      </div>
    </div>
  )
}
