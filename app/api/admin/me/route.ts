/**
 * GET  /api/admin/me      — check if admin is authenticated
 * POST /api/admin/me      — logout (clears cookie)
 */
import { NextResponse } from "next/server"
import { getAdmin, clearAuthCookie } from "@/lib/auth"

export async function GET() {
    const admin = await getAdmin()
    if (!admin) {
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    return NextResponse.json({ authenticated: true, admin })
}

export async function POST() {
    await clearAuthCookie()
    return NextResponse.json({ success: true, message: "Logged out." })
}
