import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Calendar, Building2, ImageIcon, UserCheck, Mail, FileText, Shield, Ticket, ScanLine } from "lucide-react"
import { AdminNavigation } from "@/components/admin-navigation"
import { getAdminUser } from "@/lib/admin-auth"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  let adminUser
  try {
    adminUser = await getAdminUser()
  } catch (error) {
    redirect("/admin/login")
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {adminUser.full_name}. Manage all aspects of the SynergyCon 2026 website
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/users" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-accent-purple" />
                </div>
                <h2 className="text-lg font-bold mb-2">Admin Users</h2>
                <p className="text-sm text-muted-foreground">Manage admin accounts and permissions</p>
              </div>
            </Link>

            <Link href="/admin/speakers" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-accent-blue" />
                </div>
                <h2 className="text-lg font-bold mb-2">Speakers</h2>
                <p className="text-sm text-muted-foreground">Manage speakers and their profiles</p>
              </div>
            </Link>

            <Link href="/admin/schedule" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-accent-green" />
                </div>
                <h2 className="text-lg font-bold mb-2">Schedule</h2>
                <p className="text-sm text-muted-foreground">Manage event schedule and sessions</p>
              </div>
            </Link>

            <Link href="/admin/sponsors" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5 text-accent-purple" />
                </div>
                <h2 className="text-lg font-bold mb-2">Sponsors</h2>
                <p className="text-sm text-muted-foreground">Manage sponsors and partners</p>
              </div>
            </Link>

            <Link href="/admin/gallery" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5 text-accent-orange" />
                </div>
                <h2 className="text-lg font-bold mb-2">Gallery</h2>
                <p className="text-sm text-muted-foreground">Manage photos and videos</p>
              </div>
            </Link>

            <Link href="/admin/registrations" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-red/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5 text-accent-red" />
                </div>
                <h2 className="text-lg font-bold mb-2">Attendees</h2>
                <p className="text-sm text-muted-foreground">View event attendees and registrations</p>
              </div>
            </Link>

            <Link href="/admin/tickets" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Ticket className="w-5 h-5 text-accent-blue" />
                </div>
                <h2 className="text-lg font-bold mb-2">Tickets</h2>
                <p className="text-sm text-muted-foreground">Manage ticket types and pricing</p>
              </div>
            </Link>

            <Link href="/admin/validate-tickets" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ScanLine className="w-5 h-5 text-accent-green" />
                </div>
                <h2 className="text-lg font-bold mb-2">Validate Tickets</h2>
                <p className="text-sm text-muted-foreground">Scan and check-in attendee tickets</p>
              </div>
            </Link>

            <Link href="/admin/campaigns" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-yellow/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-accent-yellow" />
                </div>
                <h2 className="text-lg font-bold mb-2">Email Campaigns</h2>
                <p className="text-sm text-muted-foreground">Send emails and manage mailing lists</p>
              </div>
            </Link>

            <Link href="/admin/applications" className="group">
              <div className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-accent-green" />
                </div>
                <h2 className="text-lg font-bold mb-2">Applications</h2>
                <p className="text-sm text-muted-foreground">Review speaker and partnership applications</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
