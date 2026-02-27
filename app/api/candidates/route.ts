/**
 * POST   /api/candidates — create a candidate for a position
 * PUT    /api/candidates — update a candidate
 * DELETE /api/candidates — delete a candidate (body: { id })
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAdmin } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const body = await req.json()
        const { positionId, name, party, bio, image } = body

        if (!positionId || !name || !party) {
            return NextResponse.json({ error: "positionId, name, and party are required." }, { status: 400 })
        }

        const count = await db.candidate.count({ where: { positionId } })

        const candidate = await db.candidate.create({
            data: {
                positionId,
                name,
                party,
                bio: bio || "",
                image: image || "/images/candidates/default.jpg",
                order: count + 1,
            },
        })

        return NextResponse.json(candidate, { status: 201 })
    } catch (err) {
        console.error("[POST /api/candidates]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const body = await req.json()
        const { id, name, party, bio, image } = body

        if (!id) return NextResponse.json({ error: "Candidate ID is required." }, { status: 400 })

        const candidate = await db.candidate.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(party !== undefined && { party }),
                ...(bio !== undefined && { bio }),
                ...(image !== undefined && { image }),
            },
        })

        return NextResponse.json(candidate)
    } catch (err) {
        console.error("[PUT /api/candidates]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const { id } = await req.json()
        if (!id) return NextResponse.json({ error: "Candidate ID is required." }, { status: 400 })

        await db.candidate.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("[DELETE /api/candidates]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}
