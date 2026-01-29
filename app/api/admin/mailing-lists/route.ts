import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminSession()

    if (!adminUser) {
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
    const adminUser = await verifyAdminSession()

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await verifyAdminSession()

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description } = body

    if (!id) {
      return NextResponse.json({ error: "Mailing list ID is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("mailing_lists")
      .update({
        name,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating mailing list:", error)
      return NextResponse.json({ error: "Failed to update mailing list" }, { status: 500 })
    }

    return NextResponse.json({ mailingList: data })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await verifyAdminSession()

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Mailing list ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // First delete all subscribers in this list
    await supabase
      .from("mailing_list_subscribers")
      .delete()
      .eq("mailing_list_id", id)

    // Then delete the mailing list
    const { error } = await supabase
      .from("mailing_lists")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting mailing list:", error)
      return NextResponse.json({ error: "Failed to delete mailing list" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
