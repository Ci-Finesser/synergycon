"use client"

import type React from "react"

import { Send, Linkedin, Instagram, Mail } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HoneypotFields } from "@/components/ui/honeypot-fields"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useFormSecurity } from "@/hooks/use-form-security"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPartnershipDialogOpen, setIsPartnershipDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [partnershipType, setPartnershipType] = useState("sponsor")
  const { toast } = useToast()
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.")
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
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

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError)
        throw new Error("Invalid response from server")
      }

      if (response.ok) {
        toast({
          title: "Successfully Subscribed! 🎉",
          description: "You'll receive a welcome email shortly. We'll keep you updated on SynergyCon 2.0!",
        })
        setEmail("")
        setErrorMessage(null)
      } else {
        const message = data?.error || "Something went wrong. Please try again."
        setErrorMessage(message)
        toast({
          title: "Subscription Failed",
          description: message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      setErrorMessage("Failed to subscribe. Please check your connection and try again.")
      toast({
        title: "Error",
        description: "Failed to subscribe. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePartnershipSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPartnershipDialogOpen(false)
    toast({
      title: "Partnership Request Sent!",
      description: "We'll review your request and get back to you soon.",
    })
  }

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsContactDialogOpen(false)
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    })
  }

  return (
    <footer
      className="text-background relative overflow-hidden"
      style={{
        background: "#000000",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">SynergyCon</h3>
            <p className="text-background/70 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
              Nigeria&apos;s flagship summit for the creative economy. One transformative day. Four immersive districts. 
              National Theatre, Lagos • March 26, 2026.
            </p>
            <div className="flex gap-2 md:gap-3 pt-2">
              <a
                href="https://www.instagram.com/cifinesser/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/ci-finesser"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
              <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                    aria-label="Send us a message"
                  >
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 h-[85vh] sm:h-auto max-h-[90vh] overflow-y-auto flex flex-col bottom-0 top-auto translate-y-0 sm:top-[50%] sm:bottom-auto sm:translate-y-[-50%] rounded-t-3xl sm:rounded-2xl">
                  <div className="p-6 md:p-8 overflow-y-auto flex-1">
                    <DialogHeader className="mb-4 md:mb-6">
                      <DialogTitle className="text-xl md:text-2xl">Send Us a Message</DialogTitle>
                      <DialogDescription className="text-xs md:text-sm">
                        Have a question or want to get in touch? Fill out the form below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4 md:space-y-5">
                      {/* Honeypot fields for bot protection */}
                      <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
                      
                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="contact-fullname" className="text-xs md:text-sm">
                          Full Name
                        </Label>
                        <Input
                          id="contact-fullname"
                          placeholder="Enter your full name"
                          required
                          className="text-sm md:text-base h-10 md:h-11"
                        />
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="contact-company" className="text-xs md:text-sm">
                          Company
                        </Label>
                        <Input
                          id="contact-company"
                          placeholder="Your company name"
                          required
                          className="text-sm md:text-base h-10 md:h-11"
                        />
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="contact-email" className="text-xs md:text-sm">
                          Email
                        </Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="your@email.com"
                          required
                          className="text-sm md:text-base h-10 md:h-11"
                        />
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="contact-reason" className="text-xs md:text-sm">
                          Reason for Message
                        </Label>
                        <Select required>
                          <SelectTrigger id="contact-reason" className="text-sm md:text-base h-10 md:h-11">
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                            <SelectItem value="speaking">Speaking Opportunity</SelectItem>
                            <SelectItem value="media">Media & Press</SelectItem>
                            <SelectItem value="sponsorship">Sponsorship</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="contact-message" className="text-xs md:text-sm">
                          Message
                        </Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Tell us more about your inquiry..."
                          rows={4}
                          required
                          className="text-sm md:text-base"
                        />
                      </div>

                      <Button type="submit" className="w-full rounded-xl py-3 md:py-4 text-sm md:text-base">
                        Send Message
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2 md:gap-3">
              <Link
                href="/#overview"
                className="text-background/70 hover:text-background text-xs md:text-sm transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/speakers"
                className="text-background/70 hover:text-background text-xs md:text-sm transition-colors"
              >
                Speakers
              </Link>
              <Link
                href="/schedule"
                className="text-background/70 hover:text-background text-xs md:text-sm transition-colors"
              >
                Schedule
              </Link>
              <Link
                href="/gallery"
                className="text-background/70 hover:text-background text-xs md:text-sm transition-colors"
              >
                Gallery
              </Link>
              <Link
                href="/partners"
                className="text-background/70 hover:text-background text-xs md:text-sm transition-colors"
              >
                Partners
              </Link>
            </nav>
          </div>

          {/* Finesser Network */}
          <div>
            <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Finesser Network</h4>
            <nav className="flex flex-col gap-2 md:gap-3">
              <a
                href="https://finesser.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/70 hover:text-background text-xs md:text-sm transition-colors"
              >
                About Finesser
              </a>
              <Link
                href="/apply-speaker"
                className="text-background/70 hover:text-background text-xs md:text-sm transition-colors"
              >
                Become a Speaker
              </Link>
              <Link
                href="/become-partner"
                className="text-background/70 hover:text-background text-xs md:text-sm transition-colors"
              >
                Partner with Us
              </Link>
            </nav>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Stay Updated</h4>
            <p className="text-background/70 text-xs md:text-sm mb-3 md:mb-4">
              Get the latest updates about SynergyCon 2.0
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2 md:space-y-3">
              {/* Honeypot fields for bot protection */}
              <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
              
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 rounded-lg text-xs md:text-sm"
              />
              {errorMessage ? (
                <p className="text-red-400 text-xs md:text-sm" aria-live="polite">
                  {errorMessage}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 md:px-6 md:py-3 bg-background text-foreground hover:bg-background/90 rounded-lg transition-colors text-xs md:text-sm"
              >
                <Send className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 md:pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <p className="text-background/60 text-xs md:text-sm text-center md:text-left">
            © {currentYear} SynergyCon. A Finesser Initiative. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
