"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"
import type { TwoFactorVerificationProps } from '@/types/components'

// Re-export for backward compatibility
export type { TwoFactorVerificationProps }

export function TwoFactorVerification({ email, onVerified, onBack }: TwoFactorVerificationProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleResendCode = async () => {
    setLoading(true)
    setError(null)
    setCode("")

    try {
      const response = await fetch("/api/admin/auth/2fa/send-code", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send code")
      }

      setCodeSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/auth/2fa/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid code")
      }

      onVerified()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-accent-blue/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-accent-blue" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit code sent to <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {codeSent && !error && (
          <div className="p-4 rounded-xl bg-accent-green/10 text-accent-green text-sm border border-accent-green/20">
            Code sent successfully! Check your email.
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="2fa-code">Verification Code</Label>
          <Input
            id="2fa-code"
            name="2fa-code"
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="rounded-xl text-center text-2xl tracking-widest"
            placeholder="000000"
            autoComplete="off"
            autoFocus
          />
          <p className="text-xs text-muted-foreground text-center">
            Code expires in 10 minutes
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-xl text-base h-auto py-3 bg-foreground text-background hover:bg-foreground/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Continue"
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendCode}
            disabled={loading}
            className="flex-1 rounded-xl"
          >
            Resend Code
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="flex-1 rounded-xl"
          >
            Back
          </Button>
        </div>
      </form>
    </div>
  )
}
