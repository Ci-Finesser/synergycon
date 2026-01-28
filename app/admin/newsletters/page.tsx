import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function AdminNewslettersPage() {
  const cookieStore = await cookies()
  const adminSessionCookie = cookieStore.get("admin_session")

  if (!adminSessionCookie) {
    redirect("/admin/login")
  }

  redirect("/admin/email-templates")
}
