/**
 * GET  /api/elections          — list all elections
 * POST /api/elections          — create an election
 * PUT  /api/elections          — update election (body.id required)
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAdmin } from "@/lib/auth"

export async function GET() {
    try {
        const elections = await db.election.findMany({
            include: {
                positions: {
                    orderBy: { order: "asc" },
                    include: {
                        candidates: { orderBy: { order: "asc" } },
                        _count: { select: { votes: true } },
                    },
                },
                accreditationFields: { orderBy: { order: "asc" } },
                _count: { select: { accreditedVoters: true, voteActivity: true } },
            },
            orderBy: { createdAt: "desc" },
        })
        return NextResponse.json(elections)
    } catch (err) {
        console.error("[GET /api/elections]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const body = await req.json()
        const { title, description, startDate, endDate, status } = body

        if (!title || !startDate || !endDate) {
            return NextResponse.json({ error: "Title, start date, and end date are required." }, { status: 400 })
        }

        const election = await db.election.create({
            data: {
                title,
                description: description || "",
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || "DRAFT",
                accreditationFields: {
                    create: [
                        { label: "Full Name", type: "TEXT", required: true, placeholder: "Enter your full name", order: 1 },
                        { label: "Email Address", type: "EMAIL", required: true, placeholder: "Enter your email address", order: 2 },
                        { label: "National ID Number", type: "TEXT", required: true, placeholder: "Enter your national ID", order: 3 },
                        { label: "Date of Birth", type: "DATE", required: true, placeholder: "", order: 4 },
                        {
                            label: "State of Origin",
                            type: "SELECT",
                            required: true,
                            placeholder: "Select your state",
                            options: ["Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Enugu", "Delta", "Imo", "Anambra"],
                            order: 5,
                        },
                    ],
                },
            },
        })

        return NextResponse.json(election, { status: 201 })
    } catch (err) {
        console.error("[POST /api/elections]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const admin = await getAdmin()
        if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const body = await req.json()
        const { id, title, description, startDate, endDate, status } = body

        if (!id) return NextResponse.json({ error: "Election ID is required." }, { status: 400 })

        const election = await db.election.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(startDate !== undefined && { startDate: new Date(startDate) }),
                ...(endDate !== undefined && { endDate: new Date(endDate) }),
                ...(status !== undefined && { status }),
            },
        })

        return NextResponse.json(election)
    } catch (err) {
        console.error("[PUT /api/elections]", err)
        return NextResponse.json({ error: "Server error." }, { status: 500 })
    }
}
