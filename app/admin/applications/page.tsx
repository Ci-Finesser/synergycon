import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNavigation } from "@/components/admin-navigation"
import { ApplicationsManager } from "@/components/applications-manager"
import { getAdminUser } from "@/lib/admin-auth"

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  let adminUser
  try {
    adminUser = await getAdminUser()
  } catch (error) {
    redirect("/admin/login")
  }

  const supabase = await createClient()

  // Fetch speaker applications
  const { data: speakerApplications, error: speakerError } = await supabase
    .from("speaker_applications")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch partnership applications
  const { data: partnershipApplications, error: partnershipError } = await supabase
    .from("partnership_applications")
    .select("*")
    .order("created_at", { ascending: false })

  if (speakerError || partnershipError) {
    console.error("Error fetching applications:", speakerError || partnershipError)
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Applications</h1>
            <p className="text-sm text-muted-foreground">Review and manage speaker and partnership applications</p>
          </div>

          <ApplicationsManager
            speakerApplications={speakerApplications || []}
            partnershipApplications={partnershipApplications || []}
          />
        </div>
      </main>
    </>
  )
}
