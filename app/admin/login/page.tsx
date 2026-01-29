"use client"

import { useActionState } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useEffect as useLayoutEffect } from "react"
import { Loader2 } from "lucide-react"
import { loginAdmin } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HoneypotFields } from "@/components/ui/honeypot-fields"
import { TwoFactorVerification } from "@/components/admin/two-factor-verification"
import { useFormSecurity } from "@/hooks/use-form-security"

const initialState = {
  error: null,
  success: false,
  requires2FA: false,
  needsSetup: false,
  email: null,
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const { honeypotFields, updateHoneypot } = useFormSecurity()

  useEffect(() => {
    if (state.success && !state.requires2FA) {
      // Check if user needs to set up 2FA
      if (state.needsSetup) {
        router.push("/admin/2fa-setup")
      } else {
        router.push("/admin")
      }
      router.refresh()
    } else if (state.requires2FA) {
      setShowTwoFactor(true)
    }
  }, [state.success, state.requires2FA, state.needsSetup, router])

  const handleTwoFactorVerified = () => {
    router.push("/admin")
    router.refresh()
  }

  const handleBackToLogin = () => {
    setShowTwoFactor(false)
  }

  // Add anti-scraper meta tags on mount
  useEffect(() => {
    const metaRobots = document.createElement('meta')
    metaRobots.name = 'robots'
    metaRobots.content = 'noindex, nofollow, noarchive, nosnippet'
    document.head.appendChild(metaRobots)

    return () => {
      document.head.removeChild(metaRobots)
    }
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="bg-background border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          {showTwoFactor ? (
            <TwoFactorVerification
              email={state.email || ""}
              onVerified={handleTwoFactorVerified}
              onBack={handleBackToLogin}
            />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Admin Login</h1>
                <p className="text-muted-foreground">Sign in to manage SynergyCon 2.0</p>
              </div>

              <form action={formAction} className="space-y-6">
                {/* Honeypot fields for bot protection */}
                <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
                
                {state.error && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    {state.error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="rounded-xl"
                    placeholder="admin@synergycon.live"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="rounded-xl"
                    placeholder="Enter your password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl text-base h-auto py-3 bg-foreground text-background hover:bg-foreground/90"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
