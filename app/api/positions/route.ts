/**
 * POST /api/positions   — create a new position for an election
 * PUT  /api/positions   — update a position
 * DELETE /api/positions — delete a position (body: { id })
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAdmin } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const body = await req.json()
        const { electionId, title, description, votingType, maxVotes } = body

        if (!electionId || !title) {
            return NextResponse.json({ error: "electionId and title are required." }, { status: 400 })
        }

        const count = await db.position.count({ where: { electionId } })

        const position = await db.position.create({
            data: {
                electionId,
                title,
                description: description || "",
                votingType: votingType || "SINGLE",
                maxVotes: maxVotes || 1,
                order: count + 1,
            },
        })

        return NextResponse.json(position, { status: 201 })
    } catch (err) {
        console.error("[POST /api/positions]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const body = await req.json()
        const { id, title, description, votingType, maxVotes } = body

        if (!id) return NextResponse.json({ error: "Position ID is required." }, { status: 400 })

        const position = await db.position.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(votingType !== undefined && { votingType }),
                ...(maxVotes !== undefined && { maxVotes }),
            },
        })

        return NextResponse.json(position)
    } catch (err) {
        console.error("[PUT /api/positions]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const { id } = await req.json()
        if (!id) return NextResponse.json({ error: "Position ID is required." }, { status: 400 })

        await db.position.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("[DELETE /api/positions]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}
