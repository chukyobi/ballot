/**
 * POST /api/accreditation
 * Accredits a registered voter by verifying their NIPR + PIN.
 * Returns the generated voting code on success.
 *
 * Flow:
 *  1. Voter must already exist in RegisteredVoter (via /register).
 *  2. NIPR must match a record → if not, error.
 *  3. PIN must be correct → if not, error.
 *  4. If valid, creates an AccreditedVoter record with a unique voting code.
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"

/** Generates a human-readable, unambiguous voting code */
function generateVotingCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let suffix = ""
    for (let i = 0; i < 6; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `VOTE-2026-${suffix}`
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, nipr, pin, electionId } = body

        // ── Validate required fields ─────────────────────────────────────────
        if (!name?.trim() || !email?.trim() || !nipr?.trim() || !pin) {
            return NextResponse.json(
                { error: "All fields (name, email, NIPR, and PIN) are required." },
                { status: 400 }
            )
        }

        const trimmedNipr = nipr.trim().toUpperCase()
        const trimmedEmail = email.trim().toLowerCase()

        // ── Look up registered voter by NIPR ──────────────────────────────────
        const registeredVoter = await db.registeredVoter.findUnique({
            where: { nipr: trimmedNipr },
        })

        if (!registeredVoter) {
            return NextResponse.json(
                { error: "No voter found with this NIPR number. Please register first." },
                { status: 404 }
            )
        }

        // ── Verify PIN ────────────────────────────────────────────────────────
        const pinValid = await compare(pin, registeredVoter.pin)
        if (!pinValid) {
            return NextResponse.json(
                { error: "Incorrect PIN. Please try again." },
                { status: 401 }
            )
        }

        // ── Resolve election ──────────────────────────────────────────────────
        let election
        if (electionId) {
            election = await db.election.findUnique({ where: { id: electionId } })
        } else {
            election = await db.election.findFirst({
                where: { status: "ACTIVE" },
                orderBy: { startDate: "asc" },
            })
        }

        if (!election) {
            return NextResponse.json(
                { error: "No active election found." },
                { status: 404 }
            )
        }

        // ── Duplicate checks ──────────────────────────────────────────────────
        const [existingEmail, existingNipr] = await Promise.all([
            db.accreditedVoter.findUnique({
                where: { electionId_email: { electionId: election.id, email: trimmedEmail } },
            }),
            db.accreditedVoter.findUnique({
                where: { electionId_nipr: { electionId: election.id, nipr: trimmedNipr } },
            }),
        ])

        if (existingEmail || existingNipr) {
            return NextResponse.json(
                { error: "You have already been accredited for this election." },
                { status: 409 }
            )
        }

        // ── Generate a unique code ────────────────────────────────────────────
        let code = generateVotingCode()
        let attempts = 0
        while (await db.accreditedVoter.findUnique({ where: { code } })) {
            code = generateVotingCode()
            if (++attempts > 10) throw new Error("Code generation failed.")
        }

        // ── Persist ───────────────────────────────────────────────────────────
        const voter = await db.accreditedVoter.create({
            data: {
                electionId: election.id,
                registeredVoterId: registeredVoter.id,
                code,
                name: name.trim(),
                email: trimmedEmail,
                nipr: trimmedNipr,
            },
        })

        return NextResponse.json(
            {
                success: true,
                code: voter.code,
                voterId: voter.id,
                message: "Accreditation successful! Keep your voting code safe.",
            },
            { status: 201 }
        )
    } catch (err) {
        console.error("[POST /api/accreditation]", err)
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        )
    }
}

/**
 * GET /api/accreditation?code=VOTE-2026-XXXXXX
 * Looks up a voter by their voting code — used by the /vote page.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const code = searchParams.get("code")
        const email = searchParams.get("email")

        if (!code && !email) {
            return NextResponse.json(
                { error: "Provide a code or email to look up." },
                { status: 400 }
            )
        }

        const voter = code
            ? await db.accreditedVoter.findUnique({ where: { code } })
            : await db.accreditedVoter.findFirst({
                where: { email: email!.toLowerCase() },
            })

        if (!voter) {
            return NextResponse.json({ error: "Voter not found." }, { status: 404 })
        }

        return NextResponse.json({
            id: voter.id,
            code: voter.code,
            name: voter.name,
            email: voter.email,
            nipr: voter.nipr,
            hasVoted: voter.hasVoted,
            accreditedAt: voter.accreditedAt,
        })
    } catch (err) {
        console.error("[GET /api/accreditation]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}
