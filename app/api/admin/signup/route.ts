/**
 * POST /api/admin/signup — register a new admin account
 * Body: { name, email, password }
 */
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        // ── Validation ──────────────────────────────────────────────────
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required." },
                { status: 400 }
            )
        }

        const trimmedName = name.trim()
        const trimmedEmail = email.toLowerCase().trim()

        if (trimmedName.length < 2) {
            return NextResponse.json(
                { error: "Name must be at least 2 characters." },
                { status: 400 }
            )
        }

        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters." },
                { status: 400 }
            )
        }

        // ── Check for existing admin with same email ────────────────────
        const existing = await db.admin.findUnique({
            where: { email: trimmedEmail },
        })

        if (existing) {
            return NextResponse.json(
                { error: "An admin with this email already exists." },
                { status: 409 }
            )
        }

        // ── Create admin ────────────────────────────────────────────────
        const hashedPassword = await hash(password, 12)

        const admin = await db.admin.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                password: hashedPassword,
            },
        })

        // ── Auto-login: issue JWT + set cookie ──────────────────────────
        const token = await signToken({
            adminId: admin.id,
            email: admin.email,
            name: admin.name,
        })
        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            admin: { id: admin.id, email: admin.email, name: admin.name },
            message: "Account created successfully.",
        })
    } catch (err) {
        console.error("[POST /api/admin/signup]", err)
        return NextResponse.json(
            { error: "Server error. Please try again." },
            { status: 500 }
        )
    }
}
