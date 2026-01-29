"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Minus, Info, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@/lib/supabase/client"
import { useNetworkStore } from "@/lib/stores/network-store"
import { useToast } from "@/hooks/use-toast"
import { TICKET_TYPES } from "@/lib/constants"

type TicketType = {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  benefits: string[]
}

function generateOrderNumber(): string {
  const prefix = "SYN2"
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `${prefix}-${randomStr}`
}

function generateTicketNumber(orderNumber: string, index: number): string {
  const ticketNum = String(index + 1).padStart(3, "0")
  return `${orderNumber}-T${ticketNum}`
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const { isOnline } = useNetworkStore()
  const { toast } = useToast()
  
  // Show offline warning
  useEffect(() => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Your registration will be queued and submitted when connection is restored.",
        variant: "default",
      })
    }
  }, [isOnline, toast])
  
  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.tickets) {
            // Transform API tickets to local format with quantity
            const transformedTickets = data.tickets.map((t: any) => ({
              id: t.ticket_id,
              name: t.name,
              description: t.description || '',
              price: t.price,
              quantity: 0,
              benefits: t.benefits || [],
            }))
            setTickets(transformedTickets)
          }
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
        // Keep hardcoded fallback tickets if API fails
      }
    }
    
    fetchTickets()
  }, [])
  
  const [tickets, setTickets] = useState<TicketType[]>([
    {
      id: "vip",
      name: TICKET_TYPES.vip.name,
      description: TICKET_TYPES.vip.description,
      price: TICKET_TYPES.vip.price,
      quantity: 0,
      benefits: TICKET_TYPES.vip.features.slice(0, 3),
    },
    {
      id: "vip-plus",
      name: TICKET_TYPES["vip-plus"].name,
      description: TICKET_TYPES["vip-plus"].description,
      price: TICKET_TYPES["vip-plus"].price,
      quantity: 0,
      benefits: TICKET_TYPES["vip-plus"].features.slice(0, 3),
    },
    {
      id: "vvip",
      name: TICKET_TYPES.vvip.name,
      description: TICKET_TYPES.vvip.description,
      price: TICKET_TYPES.vvip.price,
      quantity: 0,
      benefits: TICKET_TYPES.vvip.features.slice(0, 3),
    },
    {
      id: "priority-pass",
      name: TICKET_TYPES["priority-pass"].name,
      description: TICKET_TYPES["priority-pass"].description,
      price: TICKET_TYPES["priority-pass"].price,
      quantity: 0,
      benefits: TICKET_TYPES["priority-pass"].features.slice(0, 3),
    },
  ])

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    heardFrom: "",
    organization: "",
    role: "",
    industry: "",
    attendanceReason: "",
    expectations: "",
    dietaryRequirements: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [error, setError] = useState("")
  const [ticketNumbers, setTicketNumbers] = useState<Record<string, string[]>>({})

  const updateQuantity = (id: string, change: number) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === id) {
          const newQuantity = Math.max(0, ticket.quantity + change)
                    return { ...ticket, quantity: newQuantity }
        }
        return ticket
      }),
    )
    setError("")
  }

  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0)
  const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)

  const getOrderSummary = () => {
    return tickets
      .filter((t) => t.quantity > 0)
      .map((t) => ({
        id: t.id,
        name: t.name,
        quantity: t.quantity,
        price: t.price,
        ticketNumbers: ticketNumbers[t.id] || [],
      }))
  }

  const handleContinue = () => {
    if (currentStep === 1 && totalTickets === 0) {
      setError("Please select at least one ticket")
      return
    }
    setError("")

    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.heardFrom) {
        setError("Please fill in all required contact details")
        return
      }
    }

    if (currentStep === 2) {
      if (!formData.organization || !formData.role || !formData.industry) {
        setError("Please fill in all required onboarding details")
        return
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePayment = async () => {
    setIsSubmitting(true)
    const newOrderId = generateOrderNumber()
    setOrderId(newOrderId)
    setError("")

    // Generate ticket numbers for each ticket purchased
    const newTicketNumbers: Record<string, string[]> = {}
    let ticketIndex = 0

    tickets.forEach((ticket) => {
      if (ticket.quantity > 0) {
        const numbers: string[] = []
        for (let i = 0; i < ticket.quantity; i++) {
          numbers.push(generateTicketNumber(newOrderId, ticketIndex))
          ticketIndex++
        }
        newTicketNumbers[ticket.id] = numbers
      }
    })

    setTicketNumbers(newTicketNumbers)

    try {
      // First, create the order in the database
      const supabase = createBrowserClient()
      
      // Use correct database column names (customer_* prefix)
      const orderData = {
        order_number: newOrderId,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        how_did_you_hear: formData.heardFrom,
        organization: formData.organization,
        role: formData.role,
        industry: formData.industry,
        attendance_reason: formData.attendanceReason,
        expectations: formData.expectations,
        dietary_requirements: formData.dietaryRequirements,
        quantity: totalTickets,
        total_amount: totalAmount,
        payment_status: "pending",
        fulfillment_status: "pending",
        metadata: { tickets: getOrderSummary() },
      }

      const { error: dbError } = await supabase.from("ticket_orders").insert([orderData])

      if (dbError) {
        console.error("Failed to create order:", dbError)
        setError("Failed to create order. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Order created successfully - show success
      toast({
        title: "Success!",
        description: "Your ticket order has been submitted successfully.",
        variant: "default",
      })
      setSubmitted(true)
    } catch (error) {
      console.error("Order creation error:", error)
      setError("An error occurred while creating your order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-[1.5px] border-foreground">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5">
            <Link href="/">
              <Button variant="ghost" size="sm" className="group -ml-2 rounded-md">
                <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <section className="py-6 md:py-10 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-background border-[1.5px] border-foreground rounded-2xl p-5 md:p-6">
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-accent-green" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2.5">Order Submitted!</h3>
                <p className="text-muted-foreground text-sm md:text-base mb-2 max-w-md mx-auto">
                  Thank you for registering for SynergyCon 2.0. Your order has been received and is being processed.
                </p>
                <p className="text-sm font-medium mb-5">
                  Order Number: <span className="font-bold text-foreground">{orderId}</span>
                </p>

                {/* Order Summary */}
                <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left max-w-sm mx-auto">
                  <h4 className="font-bold mb-3 text-sm">Order Summary</h4>
                  <div className="space-y-2">
                    {getOrderSummary().map((ticket) => (
                      <div key={ticket.id} className="flex justify-between text-sm">
                        <span>
                          {ticket.name} × {ticket.quantity}
                        </span>
                        <span className="font-bold">₦{(ticket.price * ticket.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t border-foreground/20 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-bold">Total</span>
                        <span className="text-base font-bold">₦{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-5 max-w-md mx-auto">
                  A confirmation email has been sent to <span className="font-medium">{formData.email}</span>. 
                  Our team will contact you with payment details shortly.
                </p>

                <Link href="/">
                  <Button variant="outline" className="rounded-xl bg-transparent text-sm">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="border-b-[1.5px] border-foreground">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">CHECKOUT</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Complete your purchase for SynergyCon 2.0. You're just a few steps away from an unforgettable
                experience.
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 md:mb-12">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2 md:gap-4">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                      currentStep >= step
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground border border-foreground/20"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 md:w-20 h-[2px] ${currentStep > step ? "bg-foreground" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>

        {/* Step 1: Ticket Selection & Contact Details */}
        {currentStep === 1 && (
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left: Ticket Selection */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">1. Select Your Tickets</h2>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border-[1.5px] border-foreground rounded-lg p-3 md:p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm md:text-base font-bold mb-0.5">{ticket.name}</h3>
                        <p className="text-xs text-muted-foreground mb-1.5">{ticket.description}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg md:text-xl font-bold text-foreground">
                            ₦{ticket.price.toLocaleString()}
                          </p>
                          {/* Info icon with hover tooltip */}
                          <div className="group relative">
                            <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                            <div className="absolute left-0 top-6 w-56 bg-foreground text-background p-2.5 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <p className="text-xs font-semibold mb-1.5">What's included:</p>
                              <ul className="space-y-0.5">
                                {ticket.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs">
                                    <Minus className="w-3 h-3 shrink-0 mt-0.5" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => updateQuantity(ticket.id, -1)}
                          disabled={ticket.quantity === 0}
                          className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base"
                        >
                          −
                        </button>
                        <span className="text-lg md:text-xl font-bold w-7 text-center">{ticket.quantity}</span>
                        <button
                          onClick={() => updateQuantity(ticket.id, 1)}
                          className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center font-bold text-base"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary & Contact Details */}
            <div>
              {/* Order Summary */}
              <div className="border-[1.5px] border-foreground rounded-lg p-5 md:p-6 mb-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4">2. Order Summary</h2>
                {totalTickets === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {getOrderSummary().map((ticket) => (
                      <div key={ticket.id} className="flex justify-between items-center text-sm">
                        <span>
                          {ticket.name} × {ticket.quantity}
                        </span>
                        <span className="font-bold">₦{(ticket.price * ticket.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t-[1.5px] border-foreground pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base md:text-lg font-bold">Total</span>
                        <span className="text-xl md:text-2xl font-bold">₦{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div className="border-[1.5px] border-foreground rounded-lg p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4">3. Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium mb-1.5 block">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="h-9 border-[1.5px] border-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-9 border-[1.5px] border-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium mb-1.5 block">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-9 border-[1.5px] border-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="heardFrom" className="text-sm font-medium mb-1.5 block">
                      Where did you hear about us?
                    </Label>
                    <NativeSelect
                      id="heardFrom"
                      value={formData.heardFrom}
                      onChange={(e) => setFormData({ ...formData, heardFrom: e.target.value })}
                      placeholder="Select an option"
                      className="h-9 border-[1.5px] border-foreground"
                    >
                      <option value="social-media">Social Media</option>
                      <option value="friend">Friend/Colleague</option>
                      <option value="website">Website</option>
                      <option value="email">Email Newsletter</option>
                      <option value="search">Search Engine</option>
                      <option value="event">Event/Conference</option>
                      <option value="other">Other</option>
                    </NativeSelect>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs mt-4">{error}</p>}

              <Button
                onClick={handleContinue}
                disabled={totalTickets === 0}
                className="w-full mt-6 h-11 bg-foreground text-background hover:bg-foreground/90 font-bold text-base"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Onboarding Questions */}
        {currentStep === 2 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Tell Us About Yourself</h2>
            <div className="border-[1.5px] border-foreground rounded-lg p-6 md:p-8 space-y-5">
              <div>
                <Label htmlFor="organization" className="text-sm font-medium mb-1.5 block">
                  Organization
                </Label>
                <Input
                  id="organization"
                  placeholder="Your company or organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="h-10 border-[1.5px] border-foreground"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-sm font-medium mb-1.5 block">
                  Role/Position
                </Label>
                <Input
                  id="role"
                  placeholder="Your job title"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="h-10 border-[1.5px] border-foreground"
                />
              </div>

              <div>
                <Label htmlFor="industry" className="text-sm font-medium mb-1.5 block">
                  Industry
                </Label>
                <NativeSelect
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Select your industry"
                  className="h-10 border-[1.5px] border-foreground"
                >
                  <option value="technology">Technology</option>
                  <option value="creative">Creative Arts</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="government">Government</option>
                  <option value="other">Other</option>
                </NativeSelect>
              </div>

              <div>
                <Label htmlFor="attendanceReason" className="text-sm font-medium mb-1.5 block">
                  Why do you want to attend SynergyCon 2.0?
                </Label>
                <Textarea
                  id="attendanceReason"
                  placeholder="Share your reasons for attending..."
                  value={formData.attendanceReason}
                  onChange={(e) => setFormData({ ...formData, attendanceReason: e.target.value })}
                  className="min-h-[100px] border-[1.5px] border-foreground"
                />
              </div>

              <div>
                <Label htmlFor="expectations" className="text-sm font-medium mb-1.5 block">
                  What do you hope to gain from this event?
                </Label>
                <Textarea
                  id="expectations"
                  placeholder="Your expectations..."
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  className="min-h-[100px] border-[1.5px] border-foreground"
                />
              </div>

              <div>
                <Label htmlFor="dietaryRequirements" className="text-sm font-medium mb-1.5 block">
                  Dietary Requirements (Optional)
                </Label>
                <Input
                  id="dietaryRequirements"
                  placeholder="Any dietary restrictions or preferences"
                  value={formData.dietaryRequirements}
                  onChange={(e) => setFormData({ ...formData, dietaryRequirements: e.target.value })}
                  className="h-10 border-[1.5px] border-foreground"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-11 border-[1.5px] border-foreground hover:bg-muted bg-transparent"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 h-11 bg-foreground text-background hover:bg-foreground/90 font-bold"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Review & Submit</h2>
            <div className="border-[1.5px] border-foreground rounded-lg p-6 md:p-8">
              <p className="text-center text-muted-foreground mb-6">Please review your order details before submitting.</p>

              {/* Order Summary */}
              <div className="bg-muted/30 rounded-lg p-5 mb-6">
                <h3 className="font-bold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {getOrderSummary().map((ticket) => (
                    <div key={ticket.id} className="flex justify-between text-sm">
                      <span>
                        {ticket.name} × {ticket.quantity}
                      </span>
                      <span className="font-bold">₦{(ticket.price * ticket.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-foreground/20 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="text-xl font-bold">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1 h-11 border-[1.5px] border-foreground hover:bg-muted bg-transparent"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-foreground text-background hover:bg-foreground/90 font-bold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Order"
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                By submitting, you agree to our terms. Our team will contact you with payment details.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
