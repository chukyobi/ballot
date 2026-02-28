/**
 * GET /api/admin/voters — list accredited voters for the admin dashboard
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAdmin } from "@/lib/auth"

export async function GET() {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const election = await db.election.findFirst({
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
        })

        if (!election) {
            return NextResponse.json({ voters: [], total: 0 })
        }

        const voters = await db.accreditedVoter.findMany({
            where: { electionId: election.id },
            orderBy: { accreditedAt: "desc" },
            take: 50,
            select: {
                id: true,
                name: true,
                email: true,
                code: true,
                hasVoted: true,
                accreditedAt: true,
                nipr: true,
            },
        })

        const total = await db.accreditedVoter.count({ where: { electionId: election.id } })

        return NextResponse.json({ voters, total })
    } catch (err) {
        console.error("[GET /api/admin/voters]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}
