import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("mailing_lists")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching mailing lists:", error)
      return NextResponse.json({ error: "Failed to fetch mailing lists" }, { status: 500 })
    }

    return NextResponse.json({ mailingLists: data })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let adminUser
    try {
      adminUser = JSON.parse(adminSessionCookie.value)
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("mailing_lists")
      .insert([
        {
          name,
          description: description || null,
          created_by: adminUser.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating mailing list:", error)
      return NextResponse.json({ error: "Failed to create mailing list" }, { status: 500 })
    }

    return NextResponse.json({ mailingList: data }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
