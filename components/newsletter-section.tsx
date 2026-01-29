"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HoneypotFields } from "@/components/ui/honeypot-fields"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useState } from "react"
import { useFormSecurity } from "@/hooks/use-form-security"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (!email || !email.includes("@")) {
        setErrorMessage("Please enter a valid email address.")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          _csrf: csrfToken,
          _formStartTime: formStartTime,
          ...honeypotFields,
        }),
      })

      let data: any
      try {
        data = await response.json()
      } catch {
        data = null
      }

      if (response.ok) {
        setIsSuccess(true)
        setEmail("")
        // Reset success state after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000)
      } else {
        const message = data?.error || "Something went wrong. Please try again."
        setErrorMessage(message)
      }
    } catch (err) {
      setErrorMessage("Failed to subscribe. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-foreground text-background rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-balance">Don&apos;t Miss a Beat</h2>
          <p className="text-lg md:text-xl mb-10 text-background/80 text-pretty">
            Be the first to know about speaker reveals, session drops, and exclusive access opportunities for March 27.
          </p>

          {isSuccess ? (
            <div className="flex items-center justify-center gap-3 py-4">
              <CheckCircle2 className="w-6 h-6 text-accent-green" />
              <span className="text-lg font-medium">Thanks for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              {/* Honeypot fields for bot protection */}
              <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
              
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 bg-background text-foreground border-0 flex-1 rounded-full px-6"
              />
              {errorMessage ? (
                <p className="text-red-500 text-sm sm:text-base sm:mt-0 mt-[-8px]" aria-live="polite">
                  {errorMessage}
                </p>
              ) : null}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-background text-foreground hover:bg-background/90 h-14 px-8 rounded-full font-medium whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
