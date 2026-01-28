"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HoneypotFields } from "@/components/ui/honeypot-fields"
import { useFormSecurity } from "@/hooks/use-form-security"
import { useNetworkStore } from "@/lib/stores/network-store"
import { useSyncQueueStore } from "@/lib/stores/sync-queue-store"
import { useToast } from "@/hooks/use-toast"

export default function ApplySpeakerPage() {
  const { isOnline } = useNetworkStore()
  const { addToQueue } = useSyncQueueStore()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    linkedin: "",
    company: "",
    position: "",
    bio: "",
    session_type: "keynote",
    topic_title: "",
    topic_description: "",
    speaking_experience: "",
    availability: "",
    additional_notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
try {
      const response = await fetch('/api/apply-speaker', {
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
          title: "Application Submitted!",
          description: "Thank you for applying. We'll review your submission and get back to you within 2-3 weeks.",
          variant: "default",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to submit your application'
        
        if (!isOnline) {
          // Queue for later submission
          addToQueue({
            url: '/api/apply-speaker',
            method: 'POST',
            type: 'speaker_application',
            body: {
              ...formData,
              status: "pending",
              _csrf: csrfToken,
              _formStartTime: formStartTime,
              ...honeypotFields,
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
          url: '/api/apply-speaker',
          method: 'POST',
          type: 'speaker_application',
          body: {
            ...formData,
            status: "pending",
            _csrf: csrfToken,
            _formStartTime: formStartTime,
            ...honeypotFields,
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

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5">
          <Link href="/">
            <Button variant="ghost" size="sm" className="group -ml-2 rounded-md">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <section className="py-6 md:py-8 lg:py-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2.5 md:mb-3 text-balance">
            Become a Speaker at SynergyCon 2.0
          </h1>
          <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
            Share your expertise and insights with Nigeria's creative and digital economy leaders. Join our lineup of
            visionary speakers shaping the future.
          </p>
        </div>
      </section>

      <section className="pb-12 md:pb-16 lg:pb-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-background border-[1.5px] border-foreground rounded-2xl p-5 md:p-6">
            {submitted ? (
              <div className="text-center py-8 md:py-12">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-accent-green" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Application Submitted!</h3>
                <p className="text-muted-foreground text-sm md:text-base mb-6">
                  Thank you for applying to speak at SynergyCon 2.0. We'll review your application and get back to you
                  within 2-3 weeks.
                </p>
                <Link href="/speakers">
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    View Our Speakers
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* Honeypot fields for bot protection */}
                <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
                
                {/* Personal Information */}
                <div className="space-y-3.5 md:space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">Personal Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs md:text-sm">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        required
                        className="text-sm md:text-base h-10 md:h-11"
                        value={formData.first_name}
                        onChange={(e) => updateField("first_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs md:text-sm">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        required
                        className="text-sm md:text-base h-10 md:h-11"
                        value={formData.last_name}
                        onChange={(e) => updateField("last_name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs md:text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="text-sm md:text-base h-10 md:h-11"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs md:text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 XXX XXX XXXX"
                      required
                      className="text-sm md:text-base h-10 md:h-11"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="linkedin" className="text-xs md:text-sm">
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="text-sm md:text-base h-10 md:h-11"
                      value={formData.linkedin}
                      onChange={(e) => updateField("linkedin", e.target.value)}
                    />
                  </div>
                </div>

                {/* Professional Background */}
                <div className="space-y-3.5 md:space-y-4 pt-5 md:pt-6 border-t">
                  <h2 className="text-lg md:text-xl font-semibold">Professional Background</h2>

                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-xs md:text-sm">
                      Current Company/Organization
                    </Label>
                    <Input
                      id="company"
                      placeholder="Your company name"
                      required
                      className="text-sm md:text-base h-10 md:h-11"
                      value={formData.company}
                      onChange={(e) => updateField("company", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="position" className="text-xs md:text-sm">
                      Job Title/Position
                    </Label>
                    <Input
                      id="position"
                      placeholder="e.g., CEO, Creative Director"
                      required
                      className="text-sm md:text-base h-10 md:h-11"
                      value={formData.position}
                      onChange={(e) => updateField("position", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs md:text-sm">
                      Professional Bio (Max 300 words)
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about your professional journey, achievements, and expertise..."
                      rows={5}
                      required
                      className="text-sm md:text-base resize-none"
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used in our promotional materials if your application is accepted.
                    </p>
                  </div>
                </div>

                {/* Speaking Topic */}
                <div className="space-y-3.5 md:space-y-4 pt-5 md:pt-6 border-t">
                  <h2 className="text-lg md:text-xl font-semibold">Speaking Proposal</h2>

                  <div className="space-y-1.5">
                    <Label htmlFor="sessionType" className="text-xs md:text-sm">
                      Preferred Session Type
                    </Label>
                    <RadioGroup
                      value={formData.session_type}
                      onValueChange={(value) => updateField("session_type", value)}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3"
                    >
                      <div className="flex items-center space-x-2 border-[1.5px] border-foreground rounded-lg p-2.5 md:p-3 cursor-pointer hover:bg-neutral-50">
                        <RadioGroupItem value="keynote" id="keynote" />
                        <Label htmlFor="keynote" className="cursor-pointer text-xs md:text-sm">
                          Keynote Speech
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border-[1.5px] border-foreground rounded-lg p-2.5 md:p-3 cursor-pointer hover:bg-neutral-50">
                        <RadioGroupItem value="panel" id="panel" />
                        <Label htmlFor="panel" className="cursor-pointer text-xs md:text-sm">
                          Panel Discussion
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border-[1.5px] border-foreground rounded-lg p-2.5 md:p-3 cursor-pointer hover:bg-neutral-50">
                        <RadioGroupItem value="workshop" id="workshop" />
                        <Label htmlFor="workshop" className="cursor-pointer text-xs md:text-sm">
                          Workshop
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border-[1.5px] border-foreground rounded-lg p-2.5 md:p-3 cursor-pointer hover:bg-neutral-50">
                        <RadioGroupItem value="fireside" id="fireside" />
                        <Label htmlFor="fireside" className="cursor-pointer text-xs md:text-sm">
                          Fireside Chat
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="topicTitle" className="text-xs md:text-sm">
                      Proposed Topic Title
                    </Label>
                    <Input
                      id="topicTitle"
                      placeholder="e.g., 'Building Sustainable Creative Businesses in Nigeria'"
                      required
                      className="text-sm md:text-base h-10 md:h-11"
                      value={formData.topic_title}
                      onChange={(e) => updateField("topic_title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="topicDescription" className="text-xs md:text-sm">
                      Topic Description
                    </Label>
                    <Textarea
                      id="topicDescription"
                      placeholder="Describe your proposed topic, key takeaways, and why it's relevant to SynergyCon attendees..."
                      rows={5}
                      required
                      className="text-sm md:text-base resize-none"
                      value={formData.topic_description}
                      onChange={(e) => updateField("topic_description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="speakingExperience" className="text-xs md:text-sm">
                      Previous Speaking Experience
                    </Label>
                    <Textarea
                      id="speakingExperience"
                      placeholder="List any conferences, events, or platforms where you've spoken. Include links if available..."
                      rows={3}
                      className="text-sm md:text-base resize-none"
                      value={formData.speaking_experience}
                      onChange={(e) => updateField("speaking_experience", e.target.value)}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-3.5 md:space-y-4 pt-5 md:pt-6 border-t">
                  <h2 className="text-lg md:text-xl font-semibold">Additional Information</h2>

                  <div className="space-y-1.5">
                    <Label htmlFor="availability" className="text-xs md:text-sm">
                      Your Availability (Optional)
                    </Label>
                    <Textarea
                      id="availability"
                      placeholder="Let us know your preferred dates or any scheduling constraints..."
                      rows={2}
                      className="text-sm md:text-base resize-none"
                      value={formData.availability}
                      onChange={(e) => updateField("availability", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="additionalNotes" className="text-xs md:text-sm">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any other information you'd like to share..."
                      rows={2}
                      className="text-sm md:text-base resize-none"
                      value={formData.additional_notes}
                      onChange={(e) => updateField("additional_notes", e.target.value)}
                    />
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-neutral-50 rounded-xl p-4 md:p-5 space-y-3">
                  <h3 className="text-base md:text-lg font-semibold">Speaker Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs md:text-sm">Full access to all conference sessions</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs md:text-sm">Networking opportunities with industry leaders</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs md:text-sm">Featured on SynergyCon promotional materials</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs md:text-sm">Speaker gift package and certificate</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3 md:pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base rounded-xl"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Speaker Application"}
                  </Button>
                  <p className="text-xs md:text-sm text-muted-foreground mt-3">
                    We'll review your application and get back to you within 1-5 days.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
