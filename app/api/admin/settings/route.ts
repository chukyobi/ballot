/**
 * GET  /api/admin/settings  — read current settings
 * POST /api/admin/settings  — update settings (admin-only)
 *
 * Settings include toggle states and registration time-window.
 * Auto-closes registration when endTime has passed.
 */
import { NextResponse } from "next/server"
import { readFile, writeFile, mkdir } from "fs/promises"
import path from "path"

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json")

interface Settings {
    accreditationOpen: boolean
    liveResultsVisible: boolean
    votingOpen: boolean
    registrationOpen: boolean
    registrationStartTime: string | null   // ISO string
    registrationEndTime: string | null     // ISO string
}

const DEFAULT_SETTINGS: Settings = {
    accreditationOpen: false,
    liveResultsVisible: false,
    votingOpen: false,
    registrationOpen: false,
    registrationStartTime: null,
    registrationEndTime: null,
}

async function readSettings(): Promise<Settings> {
    try {
        const raw = await readFile(SETTINGS_PATH, "utf-8")
        const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }

        // Auto-close registration if end time has passed
        if (
            parsed.registrationOpen &&
            parsed.registrationEndTime &&
            new Date(parsed.registrationEndTime).getTime() <= Date.now()
        ) {
            parsed.registrationOpen = false
            // Write back the auto-closed state
            await writeSettingsRaw(parsed)
        }

        return parsed
    } catch {
        return { ...DEFAULT_SETTINGS }
    }
}

async function writeSettingsRaw(settings: Settings): Promise<void> {
    const dir = path.dirname(SETTINGS_PATH)
    await mkdir(dir, { recursive: true })
    await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

export async function GET() {
    const settings = await readSettings()
    return NextResponse.json(settings)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const current = await readSettings()

        const updated: Settings = {
            accreditationOpen: body.accreditationOpen ?? current.accreditationOpen,
            liveResultsVisible: body.liveResultsVisible ?? current.liveResultsVisible,
            votingOpen: body.votingOpen ?? current.votingOpen,
            registrationOpen: body.registrationOpen ?? current.registrationOpen,
            registrationStartTime: body.registrationStartTime !== undefined
                ? body.registrationStartTime
                : current.registrationStartTime,
            registrationEndTime: body.registrationEndTime !== undefined
                ? body.registrationEndTime
                : current.registrationEndTime,
        }

        await writeSettingsRaw(updated)
        return NextResponse.json(updated)
    } catch (err) {
        console.error("[POST /api/admin/settings]", err)
        return NextResponse.json({ error: "Failed to save settings." }, { status: 500 })
    }
}
