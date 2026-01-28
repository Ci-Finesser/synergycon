"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2, CheckCircle2, Mail } from "lucide-react"

export default function TwoFactorSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"intro" | "verify" | "complete">("intro")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/auth/2fa/send-code", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send code")
      }

      setCodeSent(true)
      setStep("verify")
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
      // Verify the code
      const verifyResponse = await fetch("/api/admin/auth/2fa/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Invalid code")
      }

      // Enable 2FA
      const enableResponse = await fetch("/api/admin/auth/2fa/enable", {
        method: "POST",
      })

      const enableData = await enableResponse.json()

      if (!enableResponse.ok) {
        throw new Error(enableData.error || "Failed to enable 2FA")
      }

      setStep("complete")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    router.push("/admin")
    router.refresh()
  }

  const handleResendCode = async () => {
    setCode("")
    setError(null)
    await handleSendCode()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="bg-background border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          {step === "intro" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent-blue/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-accent-blue" />
                </div>
              </div>

              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Secure Your Account</h1>
                <p className="text-muted-foreground">
                  Two-factor authentication is required for all admin accounts. We'll send a verification code to your email.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/20">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Email Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Each time you log in, you'll receive a 6-digit code via email that expires in 10 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full rounded-xl text-base h-auto py-3 bg-foreground text-background hover:bg-foreground/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Enable 2FA"
                  )}
                </Button>
              </div>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-accent-green" />
                </div>
              </div>

              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Enter Verification Code</h1>
                <p className="text-muted-foreground">
                  We've sent a 6-digit code to your email. Enter it below to complete setup.
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
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
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="rounded-xl text-center text-2xl tracking-widest"
                    placeholder="000000"
                    autoComplete="off"
                  />
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
                    "Verify Code"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full rounded-xl"
                >
                  Resend Code
                </Button>
              </form>
            </>
          )}

          {step === "complete" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-accent-green" />
                </div>
              </div>

              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">All Set!</h1>
                <p className="text-muted-foreground">
                  Two-factor authentication has been successfully enabled for your account.
                </p>
              </div>

              <Button
                onClick={handleComplete}
                className="w-full rounded-xl text-base h-auto py-3 bg-foreground text-background hover:bg-foreground/90"
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
