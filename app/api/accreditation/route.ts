/**
 * POST /api/accreditation
 * Registers a new voter for the active election.
 * Returns the generated voting code on success.
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

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
        const { name, email, nationalId, dateOfBirth, stateOfOrigin, electionId } = body

        // ── Validate required fields ─────────────────────────────────────────────
        if (!name || !email || !nationalId || !dateOfBirth || !stateOfOrigin) {
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            )
        }

        // ── Resolve election ──────────────────────────────────────────────────────
        let election
        if (electionId) {
            election = await db.election.findUnique({ where: { id: electionId } })
        } else {
            // Fall back to the first ACTIVE election
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

        // ── Duplicate checks ──────────────────────────────────────────────────────
        const [existingEmail, existingId] = await Promise.all([
            db.accreditedVoter.findUnique({
                where: { electionId_email: { electionId: election.id, email } },
            }),
            db.accreditedVoter.findUnique({
                where: { electionId_nationalId: { electionId: election.id, nationalId } },
            }),
        ])

        if (existingEmail) {
            return NextResponse.json(
                { error: "This email has already been accredited for this election." },
                { status: 409 }
            )
        }

        if (existingId) {
            return NextResponse.json(
                { error: "This National ID has already been accredited for this election." },
                { status: 409 }
            )
        }

        // ── Generate a unique code ────────────────────────────────────────────────
        let code = generateVotingCode()
        // Ensure uniqueness (extremely unlikely clash, but let's be safe)
        let attempts = 0
        while (await db.accreditedVoter.findUnique({ where: { code } })) {
            code = generateVotingCode()
            if (++attempts > 10) throw new Error("Code generation failed.")
        }

        // ── Persist ───────────────────────────────────────────────────────────────
        const voter = await db.accreditedVoter.create({
            data: {
                electionId: election.id,
                code,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                nationalId: nationalId.trim(),
                dateOfBirth,
                stateOfOrigin,
            },
        })

        return NextResponse.json(
            {
                success: true,
                code: voter.code,
                voterId: voter.id,
                message: "Accreditation successful. Keep your code safe.",
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
            stateOfOrigin: voter.stateOfOrigin,
            hasVoted: voter.hasVoted,
            accreditedAt: voter.accreditedAt,
        })
    } catch (err) {
        console.error("[GET /api/accreditation]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}
