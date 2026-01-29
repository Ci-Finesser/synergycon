import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Mail, Key, ArrowLeft } from "lucide-react"
import { AdminNavigation } from "@/components/admin-navigation"
import { Button } from "@/components/ui/button"
import { TwoFactorSettings } from "@/components/admin/two-factor-settings"
import { verifyAdminSessionWithout2FA } from "@/lib/admin-auth"

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  // Use session check that doesn't require 2FA (since this is where 2FA is set up)
  const adminUser = await verifyAdminSessionWithout2FA()

  if (!adminUser) {
    redirect("/admin/login")
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your admin account security and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Account Information</h2>
                  <p className="text-sm text-muted-foreground">Your admin account details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="text-sm font-medium">{adminUser.full_name}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="text-sm font-medium">{adminUser.email}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Role</div>
                  <div className="text-sm font-medium capitalize">{adminUser.role}</div>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <TwoFactorSettings adminId={adminUser.id} />
          </div>
        </div>
      </main>
    </>
  )
}
