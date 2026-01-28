import { Check } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  name: string
  quantity: number
  price: number
  ticketNumbers?: string[]
}

interface OrderSuccessProps {
  orderNumber: string
  items: OrderItem[]
  totalAmount: number
  userEmail?: string
  returnUrl?: string
  returnLabel?: string
  successMessage?: string
}

export function OrderSuccess({
  orderNumber,
  items,
  totalAmount,
  userEmail,
  returnUrl = "/",
  returnLabel = "Return to Homepage",
  successMessage = "Thank you for your purchase!",
}: OrderSuccessProps) {
  return (
    <div className="max-w-2xl mx-auto bg-neutral-100 text-foreground border-[1.5px] border-foreground rounded-lg p-6 md:p-8 text-center">
      <div className="w-14 h-14 md:w-16 md:h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-7 h-7 md:w-8 md:h-8 text-accent-green" />
      </div>

      <h1 className="text-xl md:text-2xl font-bold mb-2">{successMessage}</h1>
      <p className="text-xs md:text-sm text-foreground/70 mb-1.5">
        Your order <span className="font-bold">#{orderNumber}</span> has been confirmed.
      </p>
      <p className="text-xs md:text-sm text-foreground/70 mb-6">
        A confirmation email with your e-tickets has been sent to {userEmail || "your email"}.
      </p>

      <div className="bg-white border-[1.5px] border-foreground rounded-lg p-4 md:p-5 mb-6 text-left">
        <h3 className="font-bold mb-3 text-base">Order Summary</h3>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-xs md:text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
              {item.ticketNumbers && item.ticketNumbers.length > 0 && (
                <div className="text-[10px] md:text-xs text-foreground/60 mt-0.5">
                  Ticket{item.ticketNumbers.length > 1 ? "s" : ""}: {item.ticketNumbers.join(", ")}
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-foreground/20 pt-2.5 mt-2.5">
            <div className="flex justify-between">
              <span className="font-bold text-sm md:text-base">Total Paid</span>
              <span className="text-lg md:text-xl font-bold">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <Link
        href={returnUrl}
        className="inline-block px-6 py-2.5 bg-foreground text-background rounded-lg font-bold text-sm hover:bg-foreground/90 transition-colors"
      >
        {returnLabel}
      </Link>
    </div>
  )
}
