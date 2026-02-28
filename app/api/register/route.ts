/**
 * POST /api/register
 * Registers a new voter with name, email, NIPR, and PIN.
 * The PIN is hashed before storage. Voters must register here first
 * before they can get accredited.
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcryptjs"

/**
 * GET /api/register?nipr=XXXXX
 * Look up a registered voter by NIPR. Returns name + email (for accreditation welcome screen).
 * Does NOT return PIN or any sensitive data.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const nipr = searchParams.get("nipr")?.trim().toUpperCase()

        if (!nipr) {
            return NextResponse.json({ error: "NIPR parameter is required." }, { status: 400 })
        }

        const voter = await db.registeredVoter.findUnique({
            where: { nipr },
            select: { name: true, email: true, nipr: true },
        })

        if (!voter) {
            return NextResponse.json(
                { error: "No voter found with this NIPR number. Please register first." },
                { status: 404 }
            )
        }

        return NextResponse.json({
            name: voter.name,
            email: voter.email,
            nipr: voter.nipr,
        })
    } catch (err) {
        console.error("[GET /api/register]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, nipr, pin } = body

        // ── Validate required fields ──────────────────────────────────────────
        if (!name?.trim() || !email?.trim() || !nipr?.trim() || !pin) {
            return NextResponse.json(
                { error: "All fields (name, email, NIPR, and PIN) are required." },
                { status: 400 }
            )
        }

        const trimmedName = name.trim()
        const trimmedEmail = email.trim().toLowerCase()
        const trimmedNipr = nipr.trim().toUpperCase()

        // ── Validate name ─────────────────────────────────────────────────────
        if (trimmedName.length < 3) {
            return NextResponse.json(
                { error: "Name must be at least 3 characters long." },
                { status: 400 }
            )
        }

        // ── Validate email format ─────────────────────────────────────────────
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            )
        }

        // ── Validate NIPR format (min 6 chars) ────────────────────────────────
        if (trimmedNipr.length < 6) {
            return NextResponse.json(
                { error: "NIPR number must be at least 6 characters." },
                { status: 400 }
            )
        }

        // ── Validate PIN (4–6 digits) ─────────────────────────────────────────
        if (!/^\d{4,6}$/.test(pin)) {
            return NextResponse.json(
                { error: "PIN must be 4 to 6 digits." },
                { status: 400 }
            )
        }

        // ── Check for existing registrations ──────────────────────────────────
        const [existingEmail, existingNipr] = await Promise.all([
            db.registeredVoter.findUnique({ where: { email: trimmedEmail } }),
            db.registeredVoter.findUnique({ where: { nipr: trimmedNipr } }),
        ])

        if (existingEmail) {
            return NextResponse.json(
                { error: "This email address is already registered." },
                { status: 409 }
            )
        }

        if (existingNipr) {
            return NextResponse.json(
                { error: "This NIPR number is already registered." },
                { status: 409 }
            )
        }

        // ── Hash PIN and create voter ─────────────────────────────────────────
        const hashedPin = await hash(pin, 10)

        const voter = await db.registeredVoter.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                nipr: trimmedNipr,
                pin: hashedPin,
            },
        })

        return NextResponse.json(
            {
                success: true,
                voter: {
                    id: voter.id,
                    name: voter.name,
                    email: voter.email,
                    nipr: voter.nipr,
                },
                message: "Registration successful! You can now proceed to accreditation when the election is active.",
            },
            { status: 201 }
        )
    } catch (err) {
        console.error("[POST /api/register]", err)
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        )
    }
}
