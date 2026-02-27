/**
 * POST /api/vote — cast a vote
 * Body: { code, positionId, candidateId }
 *
 * GET /api/vote?code=VOTE-2026-XXXXXX — verify code & return voter + election data
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
    try {
        const { code, positionId, candidateId } = await req.json()

        if (!code || !positionId || !candidateId) {
            return NextResponse.json(
                { error: "code, positionId, and candidateId are required." },
                { status: 400 }
            )
        }

        // ── Validate voter ────────────────────────────────────────────────────────
        const voter = await db.accreditedVoter.findUnique({ where: { code } })
        if (!voter) {
            return NextResponse.json({ error: "Invalid voting code." }, { status: 404 })
        }

        // ── Validate position belongs to voter's election ─────────────────────────
        const position = await db.position.findUnique({
            where: { id: positionId },
            include: { candidates: true },
        })
        if (!position || position.electionId !== voter.electionId) {
            return NextResponse.json({ error: "Invalid position." }, { status: 400 })
        }

        // ── Validate candidate belongs to position ────────────────────────────────
        const candidate = position.candidates.find((c) => c.id === candidateId)
        if (!candidate) {
            return NextResponse.json({ error: "Invalid candidate." }, { status: 400 })
        }

        // ── Check if already voted for this position ──────────────────────────────
        const existingVote = await db.vote.findUnique({
            where: { voterId_positionId: { voterId: voter.id, positionId } },
        })
        if (existingVote) {
            return NextResponse.json(
                { error: "You have already voted for this position." },
                { status: 409 }
            )
        }

        // ── Cast the vote + create activity record in a transaction ───────────────
        const [vote] = await db.$transaction([
            db.vote.create({
                data: { voterId: voter.id, positionId, candidateId },
            }),
            db.voteActivity.create({
                data: {
                    electionId: voter.electionId,
                    voterId: voter.id,
                    candidateId,
                    positionTitle: position.title,
                    voterName: `Voter #${String(Math.floor(Math.random() * 9000) + 1000)}`,
                },
            }),
        ])

        // ── Check if voter has voted for all positions — mark as hasVoted ─────────
        const totalPositions = await db.position.count({ where: { electionId: voter.electionId } })
        const totalVotesForVoter = await db.vote.count({
            where: { voterId: voter.id, position: { electionId: voter.electionId } },
        })

        if (totalVotesForVoter >= totalPositions) {
            await db.accreditedVoter.update({
                where: { id: voter.id },
                data: { hasVoted: true },
            })
        }

        return NextResponse.json({
            success: true,
            voteId: vote.id,
            message: `Vote cast for ${candidate.name} as ${position.title}.`,
        })
    } catch (err) {
        console.error("[POST /api/vote]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const code = searchParams.get("code")

        if (!code) {
            return NextResponse.json({ error: "Voting code is required." }, { status: 400 })
        }

        const voter = await db.accreditedVoter.findUnique({
            where: { code },
            include: {
                votes: { select: { positionId: true, candidateId: true } },
                election: {
                    include: {
                        positions: {
                            orderBy: { order: "asc" },
                            include: {
                                candidates: {
                                    orderBy: { order: "asc" },
                                    include: { _count: { select: { votes: true } } },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!voter) {
            return NextResponse.json({ error: "Invalid voting code." }, { status: 404 })
        }

        if (voter.election.status !== "ACTIVE") {
            return NextResponse.json({ error: "This election is not currently active." }, { status: 403 })
        }

        // Build a map of which positions the voter already voted on
        const votedPositions: Record<string, string> = {}
        for (const v of voter.votes) {
            votedPositions[v.positionId] = v.candidateId
        }

        return NextResponse.json({
            voter: {
                id: voter.id,
                name: voter.name,
                code: voter.code,
                hasVoted: voter.hasVoted,
            },
            election: {
                id: voter.election.id,
                title: voter.election.title,
                description: voter.election.description,
                status: voter.election.status,
                positions: voter.election.positions.map((pos) => ({
                    id: pos.id,
                    title: pos.title,
                    description: pos.description,
                    votingType: pos.votingType,
                    maxVotes: pos.maxVotes,
                    candidates: pos.candidates.map((c) => ({
                        id: c.id,
                        name: c.name,
                        party: c.party,
                        bio: c.bio,
                        image: c.image,
                        votes: c._count.votes,
                    })),
                })),
            },
            votedPositions,
        })
    } catch (err) {
        console.error("[GET /api/vote]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}
