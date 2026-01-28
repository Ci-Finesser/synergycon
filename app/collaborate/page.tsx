"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HoneypotFields } from "@/components/ui/honeypot-fields"
import { useFormSecurity } from "@/hooks/use-form-security"
import Link from "next/link"

export default function CollaboratePage() {
  const [partnershipType, setPartnershipType] = useState("sponsor")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch("/api/partnership/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partnership_type: partnershipType,
          company_name: formData.get("company-name"),
          contact_person: formData.get("contact-name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          _csrf: csrfToken,
          _formStartTime: formStartTime,
          _honeypot: honeypotFields,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application")
      }

      setSubmitted(true)

      // Reset form after delay
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground mb-6 md:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 lg:p-12">
          {submitted ? (
            <div className="text-center py-8 md:py-12">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4 md:mb-6">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-accent-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Partnership Request Submitted!</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Thank you for your interest in partnering with SynergyCon 2.0. Our team will review your request and get
                back to you shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">Partner With SynergyCon 2.0</h1>
                <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
                  Join us in shaping Nigeria's Creative Economy. Tell us how you'd like to partner with SynergyCon 2.0.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Honeypot fields for bot protection */}
                <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
                
                <div className="space-y-3 md:space-y-4">
                  <Label htmlFor="partnership-type" className="text-sm md:text-base font-semibold">
                    Partnership Type *
                  </Label>
                  <RadioGroup
                    value={partnershipType}
                    onValueChange={setPartnershipType}
                    className="grid grid-cols-2 gap-3 md:gap-4"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3 border-2 rounded-xl p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="sponsor" id="sponsor" />
                      <Label htmlFor="sponsor" className="cursor-pointer text-sm md:text-base">
                        Sponsor
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3 border-2 rounded-xl p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="exhibitor" id="exhibitor" />
                      <Label htmlFor="exhibitor" className="cursor-pointer text-sm md:text-base">
                        Exhibitor
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3 border-2 rounded-xl p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="media" id="media" />
                      <Label htmlFor="media" className="cursor-pointer text-sm md:text-base">
                        Media
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3 border-2 rounded-xl p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="vendor" id="vendor" />
                      <Label htmlFor="vendor" className="cursor-pointer text-sm md:text-base">
                        Vendor
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label htmlFor="company-name" className="text-sm md:text-base">
                    Company Name *
                  </Label>
                  <Input
                    id="company-name"
                    name="company-name"
                    placeholder="Enter your company name"
                    required
                    className="text-sm md:text-base h-11 md:h-12"
                  />
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label htmlFor="contact-name" className="text-sm md:text-base">
                    Contact Name *
                  </Label>
                  <Input
                    id="contact-name"
                    name="contact-name"
                    placeholder="Your full name"
                    required
                    className="text-sm md:text-base h-11 md:h-12"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="email" className="text-sm md:text-base">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="text-sm md:text-base h-11 md:h-12"
                    />
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="phone" className="text-sm md:text-base">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+234 XXX XXX XXXX"
                      required
                      className="text-sm md:text-base h-11 md:h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label htmlFor="message" className="text-sm md:text-base">
                    Tell us about your partnership interest
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Share more details about how you'd like to partner with SynergyCon 2.0..."
                    rows={5}
                    className="text-sm md:text-base"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl py-4 md:py-5 text-base md:text-lg bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Partnership Request"}
                </Button>

                <p className="text-xs md:text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to be contacted by our partnership team regarding collaboration
                  opportunities for SynergyCon 2.0.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
