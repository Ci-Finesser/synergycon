"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Home, ArrowLeft, Settings, Monitor, Users, Ticket, ScanLine } from "lucide-react"
import { logoutAdmin } from "@/app/admin/login/actions"

export function AdminNavigation() {
  const pathname = usePathname()
  const isDashboard = pathname === "/admin"

  if (!isDashboard) {
    return (
      <nav className="sticky top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Back to Dashboard */}
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="rounded-lg -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button size="sm" variant="ghost" className="rounded-lg">
                  <Home className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">View Site</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button size="sm" variant="ghost" className="rounded-lg">
                  <Users className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Admins</span>
                </Button>
              </Link>
              <Link href="/admin/tickets">
                <Button size="sm" variant="ghost" className="rounded-lg">
                  <Ticket className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Tickets</span>
                </Button>
              </Link>
              <Link href="/admin/validate-tickets">
                <Button size="sm" variant="ghost" className="rounded-lg">
                  <ScanLine className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Validate</span>
                </Button>
              </Link>
              <Link href="/admin/sessions">
                <Button size="sm" variant="ghost" className="rounded-lg">
                  <Monitor className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Sessions</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button size="sm" variant="ghost" className="rounded-lg">
                  <Settings className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Settings</span>
                </Button>
              </Link>
              <form action={logoutAdmin}>
                <Button type="submit" size="sm" variant="outline" className="rounded-lg bg-transparent">
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/admin" className="text-lg font-bold">
            SynergyCon Admin
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button size="sm" variant="ghost" className="rounded-lg">
                <Home className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">View Site</span>
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button size="sm" variant="ghost" className="rounded-lg">
                <Users className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Admins</span>
              </Button>
            </Link>
            <Link href="/admin/tickets">
              <Button size="sm" variant="ghost" className="rounded-lg">
                <Ticket className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Tickets</span>
              </Button>
            </Link>
            <Link href="/admin/validate-tickets">
              <Button size="sm" variant="ghost" className="rounded-lg">
                <ScanLine className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Validate</span>
              </Button>
            </Link>
            <Link href="/admin/sessions">
              <Button size="sm" variant="ghost" className="rounded-lg">
                <Monitor className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Sessions</span>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button size="sm" variant="ghost" className="rounded-lg">
                <Settings className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            </Link>
            <form action={logoutAdmin}>
              <Button type="submit" size="sm" variant="outline" className="rounded-lg bg-transparent">
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
