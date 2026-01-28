"use client"

import type React from "react"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HoneypotFields } from "@/components/ui/honeypot-fields"
import { useFormSecurity } from "@/hooks/use-form-security"
import { useToast } from "@/hooks/use-toast"

// Global function to open the modal programmatically (SSR-safe)
export function openRegistrationModal() {
  if (typeof window === 'undefined') return
  const modal = document.getElementById("registration-modal")
  if (modal) {
    modal.classList.remove("hidden")
    document.body.style.overflow = "hidden"
  }
}

// Inner component that uses useSearchParams
function RegistrationModalInner() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    industry: "",
    attendance_reason: "",
    expectations: "",
    dietary_requirements: "",
    special_needs: "",
    hear_about: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleClose = useCallback(() => {
    const modal = document.getElementById("registration-modal")
    if (modal) {
      modal.classList.add("hidden")
      document.body.style.overflow = "unset"
    }
    // Remove URL parameter when closing
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('m')) {
        url.searchParams.delete('m')
        router.replace(url.pathname + url.search, { scroll: false })
      }
    }
  }, [router])

  // Check for URL parameter to auto-open modal
  useEffect(() => {
    const modalParam = searchParams.get('m')
    if (modalParam === 'registration_waitlist') {
      setError(null) // Clear any previous errors
      openRegistrationModal()
    }
  }, [searchParams])

  // Clear error when modal becomes visible (triggered by external button)
  useEffect(() => {
    const modal = document.getElementById("registration-modal")
    if (!modal) return
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isVisible = !modal.classList.contains('hidden')
          if (isVisible) {
            setError(null)
          }
        }
      })
    })
    
    observer.observe(modal, { attributes: true })
    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: "pending",
          _csrf: csrfToken,
          _formStartTime: formStartTime,
          ...honeypotFields,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        toast({
          title: "Registration Submitted!",
          description: "We'll review your registration and send you a confirmation email soon.",
        })
        setTimeout(() => {
          handleClose()
          setSubmitted(false)
          setFormData({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            organization: "",
            role: "",
            industry: "",
            attendance_reason: "",
            expectations: "",
            dietary_requirements: "",
            special_needs: "",
            hear_about: "",
          })
          setError(null)
        }, 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || "Failed to submit registration. Please try again."
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = "A network error occurred. Please try again."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  return (
    <div
      id="registration-modal"
      className="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={handleClose}
    >
      <div
        className="relative bg-background rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-lg md:max-w-2xl h-[85vh] md:h-auto md:max-h-[90vh] overflow-hidden mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 z-20 bg-background border-b px-6 md:px-8 py-4 md:py-5 flex items-center justify-between rounded-t-3xl md:rounded-t-3xl">
          <div>
            <h2 className="text-lg md:text-xl font-bold">Get Early Access</h2>
            <p className="text-xs md:text-sm text-muted-foreground">SynergyCon 2.0</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Inline Error Display */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">Registration Failed</p>
                <p className="text-destructive/80">{error}</p>
              </div>
            </div>
          )}

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
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Registration Submitted!</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Thank you for your interest in SynergyCon 2.0. We'll review your registration and send you a
                confirmation email soon.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 md:mb-8">
                <p className="text-muted-foreground text-sm md:text-base">
                  Register your interest for Nigeria's premier Creative Economy conference and be the first to know when tickets go on sale.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* Honeypot fields for bot protection */}
                <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
                
                {/* Personal Information */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="first_name" className="text-xs md:text-sm">
                        First Name *
                      </Label>
                      <Input
                        id="first_name"
                        required
                        value={formData.first_name}
                        onChange={(e) => updateField("first_name", e.target.value)}
                        className="text-sm md:text-base h-10 md:h-11"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="last_name" className="text-xs md:text-sm">
                        Last Name *
                      </Label>
                      <Input
                        id="last_name"
                        required
                        value={formData.last_name}
                        onChange={(e) => updateField("last_name", e.target.value)}
                        className="text-sm md:text-base h-10 md:h-11"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="email" className="text-xs md:text-sm">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="text-sm md:text-base h-10 md:h-11"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="phone" className="text-xs md:text-sm">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="text-sm md:text-base h-10 md:h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">Professional Information</h3>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="organization" className="text-xs md:text-sm">
                      Organization/Company *
                    </Label>
                    <Input
                      id="organization"
                      required
                      value={formData.organization}
                      onChange={(e) => updateField("organization", e.target.value)}
                      className="text-sm md:text-base h-10 md:h-11"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="role" className="text-xs md:text-sm">
                        Your Role/Title *
                      </Label>
                      <Input
                        id="role"
                        required
                        value={formData.role}
                        onChange={(e) => updateField("role", e.target.value)}
                        className="text-sm md:text-base h-10 md:h-11"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="industry" className="text-xs md:text-sm">
                        Industry *
                      </Label>
                      <Input
                        id="industry"
                        required
                        value={formData.industry}
                        onChange={(e) => updateField("industry", e.target.value)}
                        placeholder="e.g., Tech, Creative, Finance"
                        className="text-sm md:text-base h-10 md:h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Event-Related Questions */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">About Your Attendance</h3>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="attendance_reason" className="text-xs md:text-sm">
                      Why do you want to attend SynergyCon 2.0? *
                    </Label>
                    <Textarea
                      id="attendance_reason"
                      required
                      value={formData.attendance_reason}
                      onChange={(e) => updateField("attendance_reason", e.target.value)}
                      rows={3}
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="expectations" className="text-xs md:text-sm">
                      What are you hoping to gain from the conference?
                    </Label>
                    <Textarea
                      id="expectations"
                      value={formData.expectations}
                      onChange={(e) => updateField("expectations", e.target.value)}
                      rows={3}
                      className="text-sm md:text-base"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">Additional Information</h3>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="dietary_requirements" className="text-xs md:text-sm">
                      Dietary Requirements
                    </Label>
                    <Input
                      id="dietary_requirements"
                      value={formData.dietary_requirements}
                      onChange={(e) => updateField("dietary_requirements", e.target.value)}
                      placeholder="e.g., Vegetarian, Halal, Allergies"
                      className="text-sm md:text-base h-10 md:h-11"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="special_needs" className="text-xs md:text-sm">
                      Special Needs/Accessibility Requirements
                    </Label>
                    <Input
                      id="special_needs"
                      value={formData.special_needs}
                      onChange={(e) => updateField("special_needs", e.target.value)}
                      className="text-sm md:text-base h-10 md:h-11"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="hear_about" className="text-xs md:text-sm">
                      How did you hear about SynergyCon?
                    </Label>
                    <Input
                      id="hear_about"
                      value={formData.hear_about}
                      onChange={(e) => updateField("hear_about", e.target.value)}
                      placeholder="e.g., Social media, Friend, Newsletter"
                      className="text-sm md:text-base h-10 md:h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full rounded-xl text-sm md:text-base h-auto py-3 md:py-4 bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>

                <p className="text-[10px] md:text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to receive email communications about SynergyCon 2.0. We'll review
                  your registration and notify you of your spot confirmation.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrapper component with Suspense for useSearchParams
export function RegistrationModal() {
  return (
    <Suspense fallback={null}>
      <RegistrationModalInner />
    </Suspense>
  )
}
