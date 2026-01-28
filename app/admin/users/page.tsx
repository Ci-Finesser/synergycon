import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminNavigation } from "@/components/admin-navigation"
import { AdminUsersManager } from "@/components/admin/admin-users-manager"

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const adminSessionCookie = cookieStore.get("admin_session")

  if (!adminSessionCookie) {
    redirect("/admin/login")
  }

  let adminUser
  try {
    adminUser = JSON.parse(adminSessionCookie.value)
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
