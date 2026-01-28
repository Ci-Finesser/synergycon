import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Parse CSV data
function parseCSV(csvText: string): Array<{ email: string; first_name?: string; last_name?: string; [key: string]: any }> {
  const lines = csvText.trim().split("\n")
  if (lines.length === 0) {
    return []
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const emailIndex = headers.findIndex((h) => h === "email" || h === "email address")

  if (emailIndex === -1) {
    throw new Error("CSV must contain an 'email' or 'email address' column")
  }

  const firstNameIndex = headers.findIndex((h) => h === "first_name" || h === "first name" || h === "firstname")
  const lastNameIndex = headers.findIndex((h) => h === "last_name" || h === "last name" || h === "lastname")

  const subscribers: Array<{ email: string; first_name?: string; last_name?: string; custom_fields?: any }> = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""))
    const email = values[emailIndex]?.toLowerCase().trim()

    // Validate email
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const subscriber: any = { email }

      if (firstNameIndex !== -1 && values[firstNameIndex]) {
        subscriber.first_name = values[firstNameIndex]
      }
      if (lastNameIndex !== -1 && values[lastNameIndex]) {
        subscriber.last_name = values[lastNameIndex]
      }

      // Store any additional fields as custom fields
      const customFields: any = {}
      headers.forEach((header, index) => {
        if (index !== emailIndex && index !== firstNameIndex && index !== lastNameIndex && values[index]) {
          customFields[header] = values[index]
        }
      })

      if (Object.keys(customFields).length > 0) {
        subscriber.custom_fields = customFields
      }

      subscribers.push(subscriber)
    }
  }

  return subscribers
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()

    let subscribers: Array<{ email: string; first_name?: string; last_name?: string; custom_fields?: any }>

    try {
      // For now, we'll only support CSV. Excel support would require a library like xlsx
      if (file.name.endsWith(".csv")) {
        subscribers = parseCSV(fileContent)
      } else {
        return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 })
      }
    } catch (parseError: any) {
      console.error("Parse error:", parseError)
      return NextResponse.json({ error: parseError.message || "Failed to parse file" }, { status: 400 })
    }

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No valid email addresses found in file" }, { status: 400 })
    }

    const supabase = await createClient()

    // Prepare subscribers for insertion
    const subscribersToInsert = subscribers.map((sub) => ({
      mailing_list_id: id,
      email: sub.email,
      first_name: sub.first_name || null,
      last_name: sub.last_name || null,
      full_name: [sub.first_name, sub.last_name].filter(Boolean).join(" ") || null,
      custom_fields: sub.custom_fields || {},
    }))

    // Insert subscribers (upsert to handle duplicates)
    const { data, error } = await supabase.from("mailing_list_subscribers").upsert(subscribersToInsert, {
      onConflict: "mailing_list_id,email",
      ignoreDuplicates: true,
    })

    if (error) {
      console.error("Error importing subscribers:", error)
      return NextResponse.json({ error: "Failed to import subscribers" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: subscribers.length,
      message: `Successfully imported ${subscribers.length} subscriber(s)`,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
