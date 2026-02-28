/**
 * GET  /api/admin/settings  — read current settings
 * POST /api/admin/settings  — update settings (admin-only)
 *
 * Settings are stored in the database (Settings table) as a singleton row.
 * This avoids filesystem writes which fail on read-only deployments (Vercel).
 * Auto-closes registration when endTime has passed.
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const SETTINGS_ID = "global"

interface SettingsResponse {
    accreditationOpen: boolean
    liveResultsVisible: boolean
    votingOpen: boolean
    registrationOpen: boolean
    registrationStartTime: string | null   // ISO string
    registrationEndTime: string | null     // ISO string
}

async function readSettings(): Promise<SettingsResponse> {
    // Upsert ensures the row always exists
    const row = await db.settings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID },
        update: {},
    })

    let registrationOpen = row.registrationOpen

    // Auto-close registration if end time has passed
    if (
        registrationOpen &&
        row.registrationEndTime &&
        row.registrationEndTime.getTime() <= Date.now()
    ) {
        registrationOpen = false
        await db.settings.update({
            where: { id: SETTINGS_ID },
            data: { registrationOpen: false },
        })
    }

    return {
        accreditationOpen: row.accreditationOpen,
        liveResultsVisible: row.liveResultsVisible,
        votingOpen: row.votingOpen,
        registrationOpen,
        registrationStartTime: row.registrationStartTime?.toISOString() ?? null,
        registrationEndTime: row.registrationEndTime?.toISOString() ?? null,
    }
}

export async function GET() {
    try {
        const settings = await readSettings()
        return NextResponse.json(settings)
    } catch (err) {
        console.error("[GET /api/admin/settings] Error:", err)
        return NextResponse.json({ error: "Failed to read settings." }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const data: Record<string, unknown> = {}

        if (body.accreditationOpen !== undefined) data.accreditationOpen = body.accreditationOpen
        if (body.liveResultsVisible !== undefined) data.liveResultsVisible = body.liveResultsVisible
        if (body.votingOpen !== undefined) data.votingOpen = body.votingOpen
        if (body.registrationOpen !== undefined) data.registrationOpen = body.registrationOpen

        if (body.registrationStartTime !== undefined) {
            data.registrationStartTime = body.registrationStartTime
                ? new Date(body.registrationStartTime)
                : null
        }
        if (body.registrationEndTime !== undefined) {
            data.registrationEndTime = body.registrationEndTime
                ? new Date(body.registrationEndTime)
                : null
        }

        const row = await db.settings.upsert({
            where: { id: SETTINGS_ID },
            create: { id: SETTINGS_ID, ...data },
            update: data,
        })

        const response: SettingsResponse = {
            accreditationOpen: row.accreditationOpen,
            liveResultsVisible: row.liveResultsVisible,
            votingOpen: row.votingOpen,
            registrationOpen: row.registrationOpen,
            registrationStartTime: row.registrationStartTime?.toISOString() ?? null,
            registrationEndTime: row.registrationEndTime?.toISOString() ?? null,
        }

        return NextResponse.json(response)
    } catch (err) {
        console.error("[POST /api/admin/settings]", err)
        return NextResponse.json({ error: "Failed to save settings." }, { status: 500 })
    }
}
