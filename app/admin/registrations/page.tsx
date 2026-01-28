import { redirect } from "next/navigation"
import { AdminNavigation } from "@/components/admin-navigation"
import { getRegistrations } from "@/lib/registrations"
import { RegistrationsManager } from "@/components/admin/registrations-manager"
import { getAdminUser } from "@/lib/admin-auth"

export const dynamic = 'force-dynamic'

export default async function AdminRegistrationsPage() {
  try {
    await getAdminUser()
  } catch (error) {
    redirect("/admin/login")
  }

  const registrations = await getRegistrations()

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Event Attendees</h1>
            <p className="text-sm text-muted-foreground">Manage all event attendees ({registrations.length} total)</p>
          </div>

          <RegistrationsManager initialRegistrations={registrations} />
        </div>
      </main>
    </>
  )
}
