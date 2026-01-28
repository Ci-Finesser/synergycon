import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("mailing_list_subscribers")
      .select("*")
      .eq("mailing_list_id", id)
      .order("subscribed_at", { ascending: false })

    if (error) {
      console.error("Error fetching subscribers:", error)
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
    }

    return NextResponse.json({ subscribers: data })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { email, first_name, last_name, custom_fields } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const supabase = await createClient()

    // Build full name from first and last name
    const full_name = [first_name, last_name].filter(Boolean).join(" ")

    const { data, error } = await supabase
      .from("mailing_list_subscribers")
      .insert([
        {
          mailing_list_id: id,
          email: email.toLowerCase().trim(),
          first_name: first_name || null,
          last_name: last_name || null,
          full_name: full_name || null,
          custom_fields: custom_fields || {},
        },
      ])
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Email already exists in this mailing list" }, { status: 409 })
      }
      console.error("Error adding subscriber:", error)
      return NextResponse.json({ error: "Failed to add subscriber" }, { status: 500 })
    }

    return NextResponse.json({ subscriber: data }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const subscriberId = searchParams.get("subscriberId")

    if (!subscriberId) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("mailing_list_subscribers")
      .delete()
      .eq("id", subscriberId)
      .eq("mailing_list_id", id)

    if (error) {
      console.error("Error deleting subscriber:", error)
      return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
