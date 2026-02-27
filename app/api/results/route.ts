/**
 * GET /api/results — live election results + activity feed
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const election = await db.election.findFirst({
            where: { status: "ACTIVE" },
            include: {
                positions: {
                    orderBy: { order: "asc" as const },
                    include: {
                        candidates: {
                            orderBy: { order: "asc" as const },
                            include: { _count: { select: { votes: true } } },
                        },
                    },
                },
                _count: { select: { accreditedVoters: true } },
            },
        })

        if (!election) {
            return NextResponse.json({ error: "No active election." }, { status: 404 })
        }

        // ✅ Infer types directly from the query so Prisma doesn't need to resolve generics
        type Election = typeof election
        type Position = Election["positions"][number]
        type Candidate = Position["candidates"][number]

        const activity = await db.voteActivity.findMany({
            where: { electionId: election.id },
            orderBy: [{ timestamp: "desc" }, { id: "desc" }],
            take: 20,
            include: { candidate: { select: { name: true, party: true, image: true } } },
        })

        type Activity = typeof activity[number]

        const totalVotesCast = await db.vote.count({
            where: { position: { electionId: election.id } },
        })

        const totalBallotsCast = await db.accreditedVoter.count({
            where: { electionId: election.id, hasVoted: true },
        })

        return NextResponse.json({
            election: {
                id: election.id,
                title: election.title,
                description: election.description,
                status: election.status,
                startDate: election.startDate,
                endDate: election.endDate,
                totalAccredited: election._count.accreditedVoters,
                totalVotesCast,
                totalBallotsCast,
                positions: election.positions.map((pos: Position) => ({
                    id: pos.id,
                    title: pos.title,
                    description: pos.description,
                    votingType: pos.votingType,
                    candidates: pos.candidates.map((c: Candidate) => ({
                        id: c.id,
                        name: c.name,
                        party: c.party,
                        bio: c.bio,
                        image: c.image,
                        votes: c._count.votes,
                    })),
                })),
            },
            activity: activity.map((a: Activity) => ({
                id: a.id,
                voterName: a.voterName.startsWith("Voter #")
                    ? a.voterName
                    : `Voter #${String(parseInt(a.id.slice(-4), 16) % 9000 + 1000)}`,
                positionTitle: a.positionTitle,
                candidateName: a.candidate?.name ?? "Unknown",
                candidateParty: a.candidate?.party ?? null,
                candidateImage: a.candidate?.image ?? null,
                timestamp: a.timestamp,
            })),
        })
    } catch (err) {
        console.error("[GET /api/results]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}