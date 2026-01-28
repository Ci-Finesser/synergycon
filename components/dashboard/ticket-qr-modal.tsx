'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface TicketQRModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  ticketNumber: string
}

export function TicketQRModal({ isOpen, onClose, ticketId, ticketNumber }: TicketQRModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && !qrCode) {
      generateQRCode()
    }
  }, [isOpen])

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/qr`)
      const data = await res.json()
      
      if (data.success) {
        setQrCode(data.qr_image)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = `ticket-${ticketNumber}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket QR Code</DialogTitle>
          <DialogDescription>
            Present this QR code at the event entrance for check-in
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : qrCode ? (
            <>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <Image
                  src={qrCode}
                  alt="Ticket QR Code"
                  width={256}
                  height={256}
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Ticket #{ticketNumber}
              </p>
              <Button onClick={handleDownload} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </>
          ) : (
            <div className="text-center text-gray-600">
              Failed to generate QR code
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
