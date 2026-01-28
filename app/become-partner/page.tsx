"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { HoneypotFields } from "@/components/ui/honeypot-fields"
import { useSearchParams } from "next/navigation"
import { useFormSecurity } from "@/hooks/use-form-security"
import { useNetworkStore } from "@/lib/stores/network-store"
import { useSyncQueueStore } from "@/lib/stores/sync-queue-store"
import { useToast } from "@/hooks/use-toast"

type TierType = "silver" | "gold" | "platinum" | "diamond" | "none" | null

export default function BecomePartnerPage() {
  const searchParams = useSearchParams()
  const tierParam = searchParams.get("tier") as TierType
  const { isOnline } = useNetworkStore()
  const { addToQueue } = useSyncQueueStore()
  const { toast } = useToast()

  const [selectedTier, setSelectedTier] = useState<TierType>(tierParam)
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    website: "",
    company_description: "",
    partnership_interests: [] as string[],
    marketing_reach: "",
    why_partner: "",
    additional_notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()

  const partnershipInterestOptions = [
    "Media Partnership",
    "In-Kind Sponsorship",
    "Community Partnership",
    "Technology Partnership",
    "Event Co-hosting",
    "Brand Collaboration",
    "Product Showcase",
    "Workshop/Session Sponsorship",
  ]

  useEffect(() => {
    if (tierParam) {
      setSelectedTier(tierParam)
    }
  }, [tierParam])

  const getTierDisplayName = (tier: TierType) => {
    const tierMap: Record<string, string> = {
      silver: "Silver Sponsor",
      gold: "Gold Sponsor",
      platinum: "Platinum Sponsor",
      diamond: "Diamond Sponsor",
      none: "Other Partnership",
    }
    return tier ? tierMap[tier] : ""
  }

  const getTierPrice = (tier: TierType) => {
    const priceMap: Record<string, string> = {
      silver: "₦4,000,000",
      gold: "₦8,000,000",
      platinum: "₦15,000,000",
      diamond: "₦25,000,000",
      none: "",
    }
    return tier ? priceMap[tier] : ""
  }

  const getTierBenefits = (tier: TierType) => {
    const benefits: Record<string, string[]> = {
      silver: [
        "Shared exhibition space",
        "2 VIP passes",
        "Logo on website",
        "Social media recognition",
        "Listing in event program",
      ],
      gold: [
        "Standard exhibition booth",
        "4 VIP passes",
        "Logo on website and materials",
        "Social media mentions",
        "Quarter-page ad in program",
        "Networking opportunities",
      ],
      platinum: [
        "Premium booth at exhibition space",
        "Speaking opportunity in panel discussion",
        "6 VIP passes",
        "Logo on stage backdrop and website",
        "Social media recognition",
        "Half-page ad in event program",
        "Attendee networking access",
      ],
      diamond: [
        "Exclusive title sponsor recognition",
        "Prime booth location at exhibition",
        "Speaking slot in keynote session",
        "10 VIP passes with premium seating",
        "Logo on all marketing materials",
        "Dedicated social media campaign",
        "Full-page ad in event program",
        "Post-event attendee data access",
      ],
      none: [
        "Brand visibility to 1000+ attendees",
        "Access to Creative Economy leaders",
        "Custom partnership opportunities",
        "Networking access",
      ],
    }
    return tier ? benefits[tier] : []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Debug: Log form data before submission
    console.log('[BecomePartner] Form submission triggered')
    console.log('[BecomePartner] formData:', JSON.stringify(formData, null, 2))
    console.log('[BecomePartner] selectedTier:', selectedTier)
    console.log('[BecomePartner] honeypotFields:', honeypotFields)
    console.log('[BecomePartner] csrfToken:', csrfToken ? 'present' : 'MISSING')
    console.log('[BecomePartner] formStartTime:', formStartTime)

    try {
      const requestBody = {
        ...formData,
        partnership_tier: selectedTier,
        ...honeypotFields,
        _csrf: csrfToken,
        _formStartTime: formStartTime,
      }
      console.log('[BecomePartner] Full request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('/api/become-partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('[BecomePartner] Response status:', response.status)

      if (response.ok) {
        setSubmitted(true)
        toast({
          title: "Success!",
          description: "Your partnership inquiry has been submitted successfully.",
          variant: "default",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        
        // Extract field-specific errors if available
        let errorMessage = errorData.error || 'Failed to submit your application'
        if (errorData.details?.fieldErrors) {
          const fieldErrors = Object.entries(errorData.details.fieldErrors)
            .map(([field, errors]) => `${field.replace(/_/g, ' ')}: ${(errors as string[]).join(', ')}`)
            .join('; ')
          if (fieldErrors) {
            errorMessage = `Validation error: ${fieldErrors}`
          }
        }
        
        if (!isOnline) {
          // Queue for later submission
          addToQueue({
            url: '/api/become-partner',
            method: 'POST',
            type: 'partnership_application',
            body: {
              ...formData,
              partnership_tier: selectedTier,
              ...honeypotFields,
              _csrf: csrfToken,
              _formStartTime: formStartTime,
            },
            maxRetries: 3,
            priority: 'normal',
          })
          
          toast({
            title: "You're offline",
            description: "Your application has been saved and will be submitted when connection is restored.",
            variant: "default",
          })
          setSubmitted(true)
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'A network error occurred'
      
      if (!isOnline) {
        // Queue for later submission
        addToQueue({
          url: '/api/become-partner',
          method: 'POST',
          type: 'partnership_application',
          body: {
            ...formData,
            partnership_tier: selectedTier,
            ...honeypotFields,
            _csrf: csrfToken,
            _formStartTime: formStartTime,
          },
          maxRetries: 3,
          priority: 'normal',
        })
        
        toast({
          title: "You're offline",
          description: "Your application has been saved and will be submitted when connection is restored.",
          variant: "default",
        })
        setSubmitted(true)
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      partnership_interests: prev.partnership_interests.includes(interest)
        ? prev.partnership_interests.filter((i) => i !== interest)
        : [...prev.partnership_interests, interest],
    }))
  }

  const renderTierSelection = () => (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg md:text-xl font-bold mb-1.5">Partnership Details</h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          Select your preferred partnership tier to get started
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs md:text-sm font-medium">Preferred Partnership Tier</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedTier("diamond")}
            className="text-left border-[1.5px] border-foreground rounded-xl p-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="font-semibold text-sm md:text-base mb-0.5">Diamond Sponsor</div>
            <div className="text-xs text-muted-foreground">(₦25,000,000)</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier("platinum")}
            className="text-left border-[1.5px] border-foreground rounded-xl p-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="font-semibold text-sm md:text-base mb-0.5">Platinum Sponsor</div>
            <div className="text-xs text-muted-foreground">(₦15,000,000)</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier("gold")}
            className="text-left border-[1.5px] border-foreground rounded-xl p-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="font-semibold text-sm md:text-base mb-0.5">Gold Sponsor</div>
            <div className="text-xs text-muted-foreground">(₦8,000,000)</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier("silver")}
            className="text-left border-[1.5px] border-foreground rounded-xl p-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="font-semibold text-sm md:text-base mb-0.5">Silver Sponsor</div>
            <div className="text-xs text-muted-foreground">(₦4,000,000)</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier("none")}
            className="text-left border-[1.5px] border-foreground rounded-xl p-3 hover:bg-neutral-50 transition-colors sm:col-span-2"
          >
            <div className="font-semibold text-sm md:text-base mb-0.5">Explore Other Partnership Options</div>
            <div className="text-xs text-muted-foreground">Tell us how you'd like to partner with us</div>
          </button>
        </div>
      </div>
    </div>
  )

  const renderForm = () => {
    if (!selectedTier) return null

    const isSpecificTier = selectedTier !== "none"

    return (
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Honeypot fields for bot protection */}
        <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
        
        {/* Selected Tier Display */}
        <div className="bg-neutral-50 rounded-xl p-3 md:p-4 border-[1.5px] border-foreground">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-base md:text-lg font-bold">{getTierDisplayName(selectedTier)}</h3>
            <button
              type="button"
              onClick={() => setSelectedTier(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Change
            </button>
          </div>
          {getTierPrice(selectedTier) && (
            <p className="text-xl md:text-2xl font-bold mb-2">{getTierPrice(selectedTier)}</p>
          )}
        </div>

        {/* Conditional Fields for "None" tier */}
        {!isSpecificTier && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs md:text-sm">
                Partnership Interests <span className="text-muted-foreground">(Select all that apply)</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {partnershipInterestOptions?.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={formData.partnership_interests.includes(interest)}
                      onCheckedChange={() => toggleInterest(interest)}
                    />
                    <label
                      htmlFor={interest}
                      className="text-xs md:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketingReach" className="text-xs md:text-sm">
                Marketing Reach & Audience
              </Label>
              <Textarea
                id="marketingReach"
                placeholder="Tell us about your social media following, newsletter subscribers, community size, or other marketing channels..."
                rows={3}
                required
                className="text-xs md:text-sm resize-none"
                value={formData.marketing_reach}
                onChange={(e) => updateField("marketing_reach", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whyPartner" className="text-xs md:text-sm">
                Why Partner With SynergyCon?
              </Label>
              <Textarea
                id="whyPartner"
                placeholder="Share your goals and what you hope to achieve through this partnership..."
                rows={3}
                required
                className="text-xs md:text-sm resize-none"
                value={formData.why_partner}
                onChange={(e) => updateField("why_partner", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Company Information - Always shown */}
        <div className="space-y-3">
          <h3 className="text-base md:text-lg font-bold">Company Information</h3>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-xs md:text-sm">
              Company/Organization Name
            </Label>
            <Input
              id="companyName"
              placeholder="Your Company Ltd."
              required
              className="text-xs md:text-sm h-9"
              value={formData.company_name}
              onChange={(e) => updateField("company_name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson" className="text-xs md:text-sm">
              Contact Person Name
            </Label>
            <Input
              id="contactPerson"
              placeholder="John Doe"
              required
              className="text-xs md:text-sm h-9"
              value={formData.contact_person}
              onChange={(e) => updateField("contact_person", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs md:text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                required
                className="text-xs md:text-sm h-9"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs md:text-sm">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                required
                className="text-xs md:text-sm h-9"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-xs md:text-sm">
              Company Website (Optional)
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.yourcompany.com"
              className="text-xs md:text-sm h-9"
              value={formData.website}
              onChange={(e) => updateField("website", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyDescription" className="text-xs md:text-sm">
              Company Description
            </Label>
            <Textarea
              id="companyDescription"
              placeholder="Tell us about your company, its mission, and what you do..."
              rows={3}
              required
              className="text-xs md:text-sm resize-none"
              value={formData.company_description}
              onChange={(e) => updateField("company_description", e.target.value)}
            />
          </div>
        </div>

        {/* Additional Notes - Always shown */}
        <div className="space-y-2">
          <Label htmlFor="additionalNotes" className="text-xs md:text-sm">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any other information you'd like to share with us..."
            rows={2}
            className="text-xs md:text-sm resize-none"
            value={formData.additional_notes}
            onChange={(e) => updateField("additional_notes", e.target.value)}
          />
        </div>

        {/* Partnership Benefits - Always shown */}
        <div className="bg-neutral-50 rounded-xl p-4 md:p-5 border-[1.5px] border-neutral-200">
          <h3 className="text-sm md:text-base font-bold mb-3">Partnership Benefits</h3>
          <div className="space-y-2">
            {getTierBenefits(selectedTier)?.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-2 text-sm rounded-xl">
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            We'll review your application and get back to you within 1-5 days.
          </p>
        </div>
      </form>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-[1.5px] border-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5">
          <Link href="/partners">
            <Button variant="ghost" size="sm" className="group -ml-2 rounded-md">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Partners
            </Button>
          </Link>
        </div>
      </div>

      <section className="py-6 md:py-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 md:mb-3 text-balance">
            Partner with SynergyCon 2.0
          </h1>
          <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
            Join leading organizations in supporting Nigeria's Creative Economy. Partner with us to gain visibility,
            connect with innovators, and drive impact.
          </p>
        </div>
      </section>

      <section className="pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-background border-[1.5px] border-foreground rounded-2xl p-5 md:p-6">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-accent-green" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2.5">Application Submitted!</h3>
                <p className="text-muted-foreground text-sm md:text-base mb-5 max-w-md mx-auto">
                  Thank you for your interest in partnering with SynergyCon 2.0. We'll review your application and get
                  back to you within 1-5 days.
                </p>
                <Link href="/partners">
                  <Button variant="outline" className="rounded-xl bg-transparent text-sm">
                    View Our Partners
                  </Button>
                </Link>
              </div>
            ) : (
              <>{!selectedTier ? renderTierSelection() : renderForm()}</>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
