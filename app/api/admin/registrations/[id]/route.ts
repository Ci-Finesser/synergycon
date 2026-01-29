import { type NextRequest, NextResponse } from "next/server"
import { deleteRegistration, updateRegistration } from "@/lib/registrations"
import { verifyAdminSession, createUnauthorizedResponse } from "@/lib/admin-auth"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    const { id } = await params
    const data = await request.json()

    const success = await updateRegistration(id, data)

    if (!success) {
      return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    const { id } = await params

    const success = await deleteRegistration(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
