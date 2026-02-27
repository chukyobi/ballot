/**
 * POST /api/admin/login   — authenticate admin
 * POST /api/admin/login   body: { email, password }
 */
import { NextResponse } from "next/server"
import { compare, hash } from "bcryptjs"
import { db } from "@/lib/db"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
        }

        // Auto-create the first admin if none exist (bootstrap)
        const adminCount = await db.admin.count()
        if (adminCount === 0) {
            const hashed = await hash(password, 12)
            const admin = await db.admin.create({
                data: { email: email.toLowerCase().trim(), password: hashed, name: "Admin" },
            })
            const token = await signToken({ adminId: admin.id, email: admin.email, name: admin.name })
            await setAuthCookie(token)
            return NextResponse.json({
                success: true,
                admin: { id: admin.id, email: admin.email, name: admin.name },
                message: "First admin account created and logged in.",
            })
        }

        // Normal login
        const admin = await db.admin.findUnique({ where: { email: email.toLowerCase().trim() } })
        if (!admin) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
        }

        const valid = await compare(password, admin.password)
        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
        }

        const token = await signToken({ adminId: admin.id, email: admin.email, name: admin.name })
        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            admin: { id: admin.id, email: admin.email, name: admin.name },
        })
    } catch (err) {
        console.error("[POST /api/admin/login]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}
