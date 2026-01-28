import { createClient } from "@/lib/supabase/server"

export type Registration = {
  id: string
  order_id: string | null
  full_name: string
  email: string
  phone_number: string | null
  organization: string | null
  role: string | null
  industry: string | null
  how_did_you_hear: string | null
  attendance_reason: string | null
  expectations: string | null
  dietary_requirements: string | null
  tickets: any
  total_amount: number
  status: string
  created_at: string
}

export async function getRegistrations(): Promise<Registration[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching registrations:", error)
    return []
  }

  return data || []
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("registrations").delete().eq("id", id)

  if (error) {
    console.error("Error deleting registration:", error)
    return false
  }

  return true
}

export async function updateRegistration(id: string, data: Partial<Registration>): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("registrations").update(data).eq("id", id)

  if (error) {
    console.error("Error updating registration:", error)
    return false
  }

  return true
}
