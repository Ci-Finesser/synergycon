"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HoneypotFields } from "@/components/ui/honeypot-fields"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useState } from "react"
import { useFormSecurity } from "@/hooks/use-form-security"

export function RegistrationSection() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    organization: "",
    role: "",
    why_attend: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          _csrf: csrfToken,
          _formStartTime: formStartTime,
          ...honeypotFields,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit registration')
      }

      setIsSuccess(true)
      setFormData({
        full_name: "",
        email: "",
        phone_number: "",
        organization: "",
        role: "",
        why_attend: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (isSuccess) {
    return (
      <section id="register" className="py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-background border-2 border-accent-green rounded-3xl p-12 md:p-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-accent-green mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Registration Received!</h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Thank you for your interest in SynergyCon 2.0. We'll review your application and send you an email to
              confirm your spot or add you to our waitlist.
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-2 rounded-full">
              Register Another Person
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="register" className="py-20 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-6 text-balance">
            Claim Your Place in History
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Join 5,000+ visionaries, creators, and industry leaders on March 26, 2026 at National Theatre, Lagos. 
            Spaces are limited—secure yours now.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot fields for bot protection */}
          <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
          
          <div className="bg-background border border-border rounded-2xl p-8 md:p-10 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="Company or Institution"
                  value={formData.organization}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                name="role"
                placeholder="e.g., Creative Director, Entrepreneur, Developer"
                value={formData.role}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why_attend">Why do you want to attend SynergyCon?</Label>
              <Textarea
                id="why_attend"
                name="why_attend"
                placeholder="Tell us what you hope to gain from attending..."
                value={formData.why_attend}
                onChange={handleChange}
                rows={4}
                className="resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-foreground text-background hover:bg-foreground/90 h-14 text-base rounded-full font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              * Required fields. We'll review your application and respond within 48 hours.
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
