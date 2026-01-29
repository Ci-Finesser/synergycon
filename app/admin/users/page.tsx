import { redirect } from "next/navigation"
import { AdminNavigation } from "@/components/admin-navigation"
import { AdminUsersManager } from "@/components/admin/admin-users-manager"
import { getAdminUser } from "@/lib/admin-auth"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Admin User Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage admin users, create new admins, and control access permissions
            </p>
          </div>

          <AdminUsersManager currentAdminId={adminUser.id} />
        </div>
      </main>
    </>
  )
}
