"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
    Vote, LayoutDashboard, Users, Settings, UserPlus, BarChart3,
    Activity, Clock, ChevronRight, FileText, Shield, LogOut,
    Plus, Trash2, Loader2, AlertCircle, CheckCircle2, Save,
    Sparkles, TrendingUp, ArrowUpRight, Eye, Radio, Power, Timer, ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candidate {
    id: string; name: string; party: string; bio: string; image: string; order: number
    _count?: { votes: number }; votes?: number
}
interface Position {
    id: string; title: string; description: string; votingType: "SINGLE" | "MULTIPLE"
    maxVotes: number; order: number; candidates: Candidate[]; _count?: { votes: number }
}
interface Election {
    id: string; title: string; description: string; status: "DRAFT" | "ACTIVE" | "CLOSED"
    startDate: string; endDate: string; positions: Position[]
    _count?: { accreditedVoters: number; voteActivity: number }
}
interface Voter {
    id: string; name: string; email: string; code: string; hasVoted: boolean
    accreditedAt: string; nipr: string
}

interface AdminSettings {
    accreditationOpen: boolean
    liveResultsVisible: boolean
    votingOpen: boolean
    registrationOpen: boolean
    registrationStartTime: string | null
    registrationEndTime: string | null
}

type Tab = "dashboard" | "election" | "candidates" | "accreditation" | "results"

const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "election", label: "Election Setup", icon: Settings },
    { id: "candidates", label: "Candidates", icon: UserPlus },
    { id: "accreditation", label: "Accreditation", icon: FileText },
    { id: "results", label: "Results", icon: BarChart3 },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>("dashboard")
    const [election, setElection] = useState<Election | null>(null)
    const [voters, setVoters] = useState<Voter[]>([])
    const [voterCount, setVoterCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [adminName, setAdminName] = useState("")
    const [settings, setSettings] = useState<AdminSettings>({
        accreditationOpen: false,
        liveResultsVisible: false,
        votingOpen: false,
        registrationOpen: false,
        registrationStartTime: null,
        registrationEndTime: null,
    })

    const loadSettings = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/settings")
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            }
        } catch { /* silent */ }
    }, [])

    const toggleSetting = async (key: keyof AdminSettings) => {
        if (key === 'registrationOpen' || key === 'registrationStartTime' || key === 'registrationEndTime') return
        const updated = { ...settings, [key]: !settings[key] }
        setSettings(updated)
        try {
            await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            })
            toast.success(`${key === 'accreditationOpen' ? 'Accreditation' : key === 'liveResultsVisible' ? 'Live Results' : 'Voting'} ${updated[key] ? 'enabled' : 'disabled'}.`)
        } catch {
            setSettings(settings) // revert
            toast.error("Failed to update setting.")
        }
    }

    const updateRegistration = async (payload: Partial<AdminSettings>) => {
        const updated = { ...settings, ...payload }
        setSettings(updated)
        try {
            await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            })
        } catch {
            setSettings(settings)
            toast.error("Failed to update.")
        }
    }

    const loadElection = useCallback(async () => {
        const res = await fetch("/api/elections")
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
            setElection(data[0])
        }
    }, [])

    const loadVoters = useCallback(async () => {
        const res = await fetch("/api/admin/voters")
        if (res.ok) {
            const data = await res.json()
            setVoters(data.voters || [])
            setVoterCount(data.total || 0)
        }
    }, [])

    const refreshAll = useCallback(async () => {
        await Promise.all([loadElection(), loadVoters(), loadSettings()])
    }, [loadElection, loadVoters, loadSettings])

    useEffect(() => {
        (async () => {
            const me = await fetch("/api/admin/me")
            if (!me.ok) { router.push("/admin/login"); return }
            const meData = await me.json()
            setAdminName(meData.admin?.name || "Admin")
            await refreshAll()
            setLoading(false)
        })()
    }, [router, refreshAll])

    useEffect(() => {
        if (loading) return
        const interval = setInterval(refreshAll, 15000)
        return () => clearInterval(interval)
    }, [loading, refreshAll])

    useEffect(() => {
        if (!loading) refreshAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])

    const handleLogout = async () => {
        await fetch("/api/admin/me", { method: "POST" })
        router.push("/admin/login")
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading dashboard…</p>
                </div>
            </div>
        )
    }

    const totalVotes = election?.positions.reduce(
        (s, p) => s + p.candidates.reduce((cs, c) => cs + (c._count?.votes ?? c.votes ?? 0), 0), 0
    ) ?? 0
    const totalCandidates = election?.positions.reduce((s, p) => s + p.candidates.length, 0) ?? 0

    return (
        <div className="flex min-h-screen bg-background">
            {/* ── Sidebar ── */}
            <aside className="hidden w-[260px] flex-shrink-0 lg:block">
                <div className="fixed top-0 left-0 bottom-0 w-[260px] bg-sidebar flex flex-col border-r border-sidebar-border">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5 px-6 py-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg shadow-primary/15">
                            <Vote className="h-4 w-4 text-sidebar-primary-foreground" />
                        </div>
                        <div>
                            <span className="text-base font-bold text-sidebar-foreground font-serif">BallotBox</span>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">Admin Panel</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-5">
                        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/30">Navigation</p>
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setTab(item.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${tab === item.id
                                        ? "bg-sidebar-primary/10 text-sidebar-primary shadow-sm"
                                        : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                    {tab === item.id && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="space-y-2 px-4 pb-5">
                        <div className="mx-2 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent mb-3" />
                        <div className="flex items-center gap-3 px-2 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/15 text-xs font-bold text-sidebar-primary">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-sidebar-foreground truncate">{adminName}</p>
                                <p className="text-[10px] text-sidebar-foreground/35">Administrator</p>
                            </div>
                        </div>
                        <Button
                            variant="outline" size="sm"
                            onClick={handleLogout}
                            className="w-full gap-2 border-sidebar-border text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </Button>
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="w-full gap-2 text-sidebar-foreground/35 hover:text-sidebar-foreground/60">
                                <Shield className="h-3.5 w-3.5" />
                                Exit Admin
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Mobile Header */}
                <header className="border-b border-border bg-card/80 backdrop-blur-xl px-6 py-4 lg:hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                <Vote className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="text-base font-bold text-foreground font-serif">Admin</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                        </Button>
                    </div>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setTab(item.id)}
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${tab === item.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                <item.icon className="h-3 w-3" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-6xl p-6 md:p-8">
                        {tab === "dashboard" && (
                            <DashboardTab
                                election={election}
                                voters={voters}
                                voterCount={voterCount}
                                totalVotes={totalVotes}
                                totalCandidates={totalCandidates}
                                setTab={setTab}
                                settings={settings}
                                onUpdateRegistration={updateRegistration}
                                onToggleSetting={toggleSetting}
                            />
                        )}
                        {tab === "election" && (
                            <ElectionSetupTab election={election} onRefresh={loadElection} />
                        )}
                        {tab === "candidates" && (
                            <CandidateManagerTab election={election} onRefresh={loadElection} />
                        )}
                        {tab === "accreditation" && (
                            <AccreditationTab voters={voters} voterCount={voterCount} onRefresh={loadVoters} />
                        )}
                        {tab === "results" && (
                            <ResultsTab election={election} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({
    election, voters, voterCount, totalVotes, totalCandidates, setTab, settings, onToggleSetting, onUpdateRegistration,
}: {
    election: Election | null; voters: Voter[]; voterCount: number
    totalVotes: number; totalCandidates: number; setTab: (t: Tab) => void
    settings: AdminSettings; onToggleSetting: (key: keyof AdminSettings) => void
    onUpdateRegistration: (payload: Partial<AdminSettings>) => Promise<void>
}) {
    // Registration date-range state
    const toLocalDatetimeStr = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0")
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    const nowDate = new Date()
    const [regStartDate, setRegStartDate] = useState(toLocalDatetimeStr(nowDate))
    const [regEndDate, setRegEndDate] = useState(
        toLocalDatetimeStr(new Date(nowDate.getTime() + 24 * 60 * 60 * 1000))
    )
    const [extendAmount, setExtendAmount] = useState("1")
    const [extendUnit, setExtendUnit] = useState<"hours" | "days">("days")

    // Sync fields when settings change
    useEffect(() => {
        if (settings.registrationStartTime) {
            setRegStartDate(toLocalDatetimeStr(new Date(settings.registrationStartTime)))
        }
        if (settings.registrationEndTime) {
            setRegEndDate(toLocalDatetimeStr(new Date(settings.registrationEndTime)))
        }
    }, [settings.registrationStartTime, settings.registrationEndTime])

    const handleActivateRegistration = async () => {
        const start = new Date(regStartDate)
        const end = new Date(regEndDate)
        if (end <= start) {
            toast.error("End date must be after start date.")
            return
        }
        await onUpdateRegistration({
            registrationOpen: true,
            registrationStartTime: start.toISOString(),
            registrationEndTime: end.toISOString(),
        })
        toast.success("Registration window activated!")
    }

    const handleExtendRegistration = async () => {
        const amount = parseInt(extendAmount) || 1
        const ms = extendUnit === "days" ? amount * 24 * 60 * 60 * 1000 : amount * 60 * 60 * 1000
        const currentEnd = settings.registrationEndTime
            ? new Date(settings.registrationEndTime)
            : new Date()
        const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + ms)
        await onUpdateRegistration({
            registrationOpen: true,
            registrationEndTime: newEnd.toISOString(),
        })
        toast.success(`Registration extended by ${amount} ${extendUnit}.`)
    }

    const handleStopRegistration = async () => {
        await onUpdateRegistration({ registrationOpen: false })
        toast.success("Registration closed.")
    }

    const regStartTime = settings.registrationStartTime ? new Date(settings.registrationStartTime) : null
    const regEndTime = settings.registrationEndTime ? new Date(settings.registrationEndTime) : null
    const regIsExpired = regEndTime ? regEndTime.getTime() <= Date.now() : false
    const regNotStartedYet = regStartTime ? regStartTime.getTime() > Date.now() : false
    const fmtDate = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
        " at " +
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                        <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Overview</p>
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="mt-1 text-muted-foreground">Your election at a glance — stats, activity, and quick actions.</p>
            </div>

            {!election ? (
                <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No election created yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Set up your first election to get started.</p>
                    <Button className="mt-6 gap-2" onClick={() => setTab("election")}>
                        <Plus className="h-4 w-4" />
                        Create Election
                    </Button>
                </div>
            ) : (
                <>
                    {/* Election banner */}
                    <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{election.title}</h2>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2 max-w-lg">{election.description}</p>
                            </div>
                            <Badge className={`capitalize text-xs px-3 py-1 ${election.status === "ACTIVE" ? "bg-primary/10 text-primary border-primary/20"
                                : election.status === "CLOSED" ? "bg-destructive/10 text-destructive border-destructive/20"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${election.status === "ACTIVE" ? "bg-primary animate-pulse" : election.status === "CLOSED" ? "bg-destructive" : "bg-muted-foreground"
                                    }`} />
                                {election.status.toLowerCase()}
                            </Badge>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(election.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — {new Date(election.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {[
                            { label: "Total Positions", value: election.positions.length, icon: FileText, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10", text: "text-emerald-600" },
                            { label: "Total Candidates", value: totalCandidates, icon: UserPlus, gradient: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", text: "text-amber-600" },
                            { label: "Accredited Voters", value: voterCount, icon: Users, gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10", text: "text-blue-600" },
                            { label: "Total Votes Cast", value: totalVotes, icon: TrendingUp, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-500/10", text: "text-violet-600" },
                        ].map((s) => (
                            <div key={s.label} className="stat-card rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</span>
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
                                        <s.icon className={`h-4 w-4 ${s.text}`} />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-foreground tabular-nums">{s.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent accreditations */}
                    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-8">
                        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <Activity className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Recent Accreditations</h3>
                                    <p className="text-xs text-muted-foreground">{voterCount} total accredited</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setTab("accreditation")} className="gap-1 text-xs text-muted-foreground">
                                View all <ArrowUpRight className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="divide-y divide-border">
                            {voters.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                                    No voters accredited yet.
                                </div>
                            ) : voters.slice(0, 5).map((v) => (
                                <div key={v.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-semibold text-primary">
                                            {v.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{v.name}</p>
                                            <p className="text-xs text-muted-foreground">{v.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="font-mono text-[10px] bg-muted/60">{v.code}</Badge>
                                        <Badge className={`text-[10px] ${v.hasVoted ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
                                            {v.hasVoted ? "✓ Voted" : "Pending"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Control Panel ── */}
                    <div className="mb-8">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Control Panel</p>

                        {/* Registration Control — Date Range */}
                        <div className={`mb-4 rounded-2xl border p-5 shadow-sm transition-all ${settings.registrationOpen
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-card border-border'
                            }`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${settings.registrationOpen ? 'bg-amber-500/20' : 'bg-muted'
                                        }`}>
                                        <ClipboardList className={`h-5 w-5 ${settings.registrationOpen ? 'text-amber-500' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">Registration Portal</h4>
                                        <p className="text-xs text-muted-foreground">Set a date window for voter registration.</p>
                                    </div>
                                </div>
                                <Badge className={`text-[10px] ${settings.registrationOpen && !regIsExpired
                                        ? regNotStartedYet
                                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                        : regIsExpired && settings.registrationEndTime
                                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                                            : 'bg-muted text-muted-foreground border-border'
                                    }`}>
                                    {settings.registrationOpen && !regIsExpired
                                        ? regNotStartedYet ? '● Scheduled' : '● Active'
                                        : regIsExpired && settings.registrationEndTime
                                            ? '● Expired'
                                            : '○ Inactive'}
                                </Badge>
                            </div>

                            {/* Date inputs — only when NOT active */}
                            {!settings.registrationOpen && (
                                <div className="grid gap-3 sm:grid-cols-2 mb-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-1 block">Start Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={regStartDate}
                                            onChange={(e) => setRegStartDate(e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-1 block">End Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={regEndDate}
                                            onChange={(e) => setRegEndDate(e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Active window summary */}
                            {settings.registrationOpen && regStartTime && regEndTime && (
                                <div className="mb-4 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="text-muted-foreground block mb-0.5">Opens</span>
                                            <span className="font-semibold text-foreground">{fmtDate(regStartTime)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-0.5">Closes</span>
                                            <span className="font-semibold text-foreground">{fmtDate(regEndTime)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-end gap-3 flex-wrap">
                                {!settings.registrationOpen ? (
                                    <Button
                                        size="sm"
                                        onClick={handleActivateRegistration}
                                        className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                                    >
                                        <Timer className="h-3.5 w-3.5" />
                                        {regIsExpired && settings.registrationEndTime ? 'Reopen Registration' : 'Activate Registration'}
                                    </Button>
                                ) : (
                                    <>
                                        {/* Extend controls */}
                                        <div className="flex items-end gap-2">
                                            <div className="w-[70px]">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Amount</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={extendAmount}
                                                    onChange={(e) => setExtendAmount(e.target.value)}
                                                    className="h-9 text-xs"
                                                />
                                            </div>
                                            <div className="w-[100px]">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Unit</Label>
                                                <Select value={extendUnit} onValueChange={(v: "hours" | "days") => setExtendUnit(v)}>
                                                    <SelectTrigger className="h-9 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hours">Hours</SelectItem>
                                                        <SelectItem value="days">Days</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleExtendRegistration}
                                                className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                            >
                                                <Timer className="h-3.5 w-3.5" />
                                                Extend
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleStopRegistration}
                                            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                                        >
                                            Close Now
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Expired info */}
                            {!settings.registrationOpen && regIsExpired && settings.registrationEndTime && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
                                    <Clock className="h-3.5 w-3.5" />
                                    Registration expired on {fmtDate(new Date(settings.registrationEndTime))}
                                </div>
                            )}
                        </div>

                        {/* Toggle Controls Grid */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                {
                                    key: "accreditationOpen" as keyof AdminSettings,
                                    icon: FileText,
                                    title: "Accreditation",
                                    desc: "Open or close the accreditation portal for voters.",
                                    activeColor: "bg-emerald-500",
                                    activeBg: "bg-emerald-500/10 border-emerald-500/30",
                                    inactiveBg: "bg-card border-border",
                                },
                                {
                                    key: "liveResultsVisible" as keyof AdminSettings,
                                    icon: Radio,
                                    title: "Live Results",
                                    desc: "Show or hide the live results link on the public page.",
                                    activeColor: "bg-blue-500",
                                    activeBg: "bg-blue-500/10 border-blue-500/30",
                                    inactiveBg: "bg-card border-border",
                                },
                                {
                                    key: "votingOpen" as keyof AdminSettings,
                                    icon: Power,
                                    title: "Voting Portal",
                                    desc: "Open or close the voting portal for accredited voters.",
                                    activeColor: "bg-violet-500",
                                    activeBg: "bg-violet-500/10 border-violet-500/30",
                                    inactiveBg: "bg-card border-border",
                                },
                            ].map((ctrl) => {
                                const isActive = settings[ctrl.key] as boolean
                                return (
                                    <div
                                        key={ctrl.key}
                                        className={`rounded-2xl border p-5 shadow-sm transition-all ${isActive ? ctrl.activeBg : ctrl.inactiveBg}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? ctrl.activeColor + '/20' : 'bg-muted'}`}>
                                                <ctrl.icon className={`h-5 w-5 ${isActive ? ctrl.activeColor.replace('bg-', 'text-') : 'text-muted-foreground'}`} />
                                            </div>
                                            <button
                                                onClick={() => onToggleSetting(ctrl.key)}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isActive ? ctrl.activeColor : 'bg-muted'}`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>
                                        <h4 className="text-sm font-bold text-foreground">{ctrl.title}</h4>
                                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{ctrl.desc}</p>
                                        <Badge className={`mt-2 text-[10px] ${isActive ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                            {isActive ? '● Active' : '○ Inactive'}
                                        </Badge>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</p>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { id: "election" as Tab, icon: Settings, title: "Configure Election", desc: "Set up voting format and election details.", gradient: "from-emerald-500/10 to-teal-500/10", iconColor: "text-emerald-600" },
                                { id: "candidates" as Tab, icon: UserPlus, title: "Manage Candidates", desc: "Add, edit, or remove candidates.", gradient: "from-amber-500/10 to-orange-500/10", iconColor: "text-amber-600" },
                                { id: "results" as Tab, icon: BarChart3, title: "View Results", desc: "Monitor live vote counts and results.", gradient: "from-violet-500/10 to-purple-500/10", iconColor: "text-violet-600" },
                            ].map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => setTab(action.id)}
                                    className="card-hover group rounded-2xl border border-border bg-card p-5 text-left shadow-sm"
                                >
                                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} transition-transform group-hover:scale-110`}>
                                        <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                                    </div>
                                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{action.title}</h4>
                                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// ─── Election Setup Tab ───────────────────────────────────────────────────────

function ElectionSetupTab({ election, onRefresh }: { election: Election | null; onRefresh: () => Promise<void> }) {
    const [title, setTitle] = useState(election?.title || "")
    const [description, setDescription] = useState(election?.description || "")
    const [startDate, setStartDate] = useState(election?.startDate?.split("T")[0] || "")
    const [endDate, setEndDate] = useState(election?.endDate?.split("T")[0] || "")
    const [status, setStatus] = useState(election?.status || "DRAFT")
    const [saving, setSaving] = useState(false)

    const [newPosTitle, setNewPosTitle] = useState("")
    const [newPosDesc, setNewPosDesc] = useState("")
    const [newPosType, setNewPosType] = useState<"SINGLE" | "MULTIPLE">("SINGLE")

    const handleSaveElection = async () => {
        setSaving(true)
        try {
            if (election) {
                await fetch("/api/elections", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: election.id, title, description, startDate, endDate, status }),
                })
                toast.success("Election updated.")
            } else {
                await fetch("/api/elections", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, description, startDate, endDate, status }),
                })
                toast.success("Election created!")
            }
            await onRefresh()
        } catch { toast.error("Failed to save.") }
        finally { setSaving(false) }
    }

    const handleAddPosition = async () => {
        if (!election || !newPosTitle.trim()) { toast.error("Enter a position title."); return }
        await fetch("/api/positions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ electionId: election.id, title: newPosTitle, description: newPosDesc, votingType: newPosType }),
        })
        setNewPosTitle(""); setNewPosDesc("")
        toast.success("Position added!")
        await onRefresh()
    }

    const handleDeletePosition = async (id: string) => {
        await fetch("/api/positions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        toast.success("Position deleted.")
        await onRefresh()
    }

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                        <Settings className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Configuration</p>
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Election Setup</h1>
                <p className="mt-1 text-muted-foreground">Configure the election details, status, and positions.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Election Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Student Union Election 2026" className="h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the election" className="h-11" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11" />
                    </div>
                </div>
                <Button onClick={handleSaveElection} disabled={saving} className="gap-2 h-10">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {election ? "Save Changes" : "Create Election"}
                </Button>
            </div>

            {election && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-foreground">Positions ({election.positions.length})</h2>
                    </div>
                    <div className="space-y-3">
                        {election.positions.map((pos) => (
                            <div key={pos.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all">
                                <div>
                                    <p className="font-semibold text-foreground">{pos.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[10px]">{pos.votingType}</Badge>
                                        <span className="text-xs text-muted-foreground">{pos.candidates.length} candidates</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePosition(pos.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-card/50 p-5 space-y-3">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            Add New Position
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Input placeholder="Position title" value={newPosTitle} onChange={(e) => setNewPosTitle(e.target.value)} className="h-10" />
                            <Input placeholder="Description (optional)" value={newPosDesc} onChange={(e) => setNewPosDesc(e.target.value)} className="h-10" />
                            <Select value={newPosType} onValueChange={(v) => setNewPosType(v as typeof newPosType)}>
                                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SINGLE">Single Vote</SelectItem>
                                    <SelectItem value="MULTIPLE">Multiple Votes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddPosition} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Add Position
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Candidate Manager Tab ────────────────────────────────────────────────────

function CandidateManagerTab({ election, onRefresh }: { election: Election | null; onRefresh: () => Promise<void> }) {
    const [selectedPos, setSelectedPos] = useState("")
    const [name, setName] = useState("")
    const [party, setParty] = useState("")
    const [bio, setBio] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (election?.positions[0] && !selectedPos) setSelectedPos(election.positions[0].id)
    }, [election, selectedPos])

    const currentPosition = election?.positions.find((p) => p.id === selectedPos)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)
    }

    const clearImage = () => {
        setImageFile(null)
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleAddCandidate = async () => {
        if (!name.trim() || !party.trim()) { toast.error("Name and party are required."); return }

        setUploading(true)
        let imageUrl = "/images/candidates/default.jpg"

        try {
            if (imageFile) {
                const formData = new FormData()
                formData.append("file", imageFile)

                const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
                if (!uploadRes.ok) {
                    const err = await uploadRes.json()
                    toast.error(err.error || "Image upload failed.")
                    setUploading(false)
                    return
                }
                const uploadData = await uploadRes.json()
                imageUrl = uploadData.url
            }

            await fetch("/api/candidates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ positionId: selectedPos, name, party, bio, image: imageUrl }),
            })

            setName(""); setParty(""); setBio("")
            clearImage()
            toast.success("Candidate added!")
            await onRefresh()
        } catch {
            toast.error("Failed to add candidate.")
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteCandidate = async (id: string) => {
        await fetch("/api/candidates", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        toast.success("Candidate removed.")
        await onRefresh()
    }

    if (!election) return (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-muted-foreground">Create an election first.</p>
        </div>
    )

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                        <UserPlus className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Management</p>
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Candidate Manager</h1>
                <p className="mt-1 text-muted-foreground">Add and manage candidates for each position.</p>
            </div>

            {/* Position selector */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                {election.positions.map((pos) => (
                    <button
                        key={pos.id}
                        onClick={() => setSelectedPos(pos.id)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedPos === pos.id ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                            }`}
                    >
                        {pos.title} ({pos.candidates.length})
                    </button>
                ))}
            </div>

            {/* Candidate list */}
            {currentPosition && (
                <div className="space-y-3">
                    {currentPosition.candidates.map((c) => (
                        <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-border">
                                <Image src={c.image} alt={c.name} width={56} height={56} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{c.name}</p>
                                <p className="text-xs text-muted-foreground">{c.party}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.bio}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCandidate(c.id)} className="text-destructive shrink-0 hover:bg-destructive/10 rounded-xl">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add candidate form */}
            <div className="mt-6 rounded-2xl border-2 border-dashed border-border bg-card/50 p-5 space-y-4">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Add Candidate to {currentPosition?.title || "…"}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
                    <Input placeholder="Party / Affiliation" value={party} onChange={(e) => setParty(e.target.value)} className="h-10" />
                    <Input placeholder="Short bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} className="sm:col-span-2 h-10" />
                </div>

                {/* Image upload */}
                <div className="space-y-2">
                    <Label className="text-sm">Candidate Photo</Label>
                    <div className="flex items-center gap-4">
                        <div
                            className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[10px] mt-0.5">Photo</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-2"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                {imageFile ? "Change Photo" : "Upload Photo"}
                            </Button>
                            {imageFile && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{imageFile.name}</span>
                                    <button onClick={clearImage} className="text-xs text-destructive hover:underline">Remove</button>
                                </div>
                            )}
                            <p className="text-[11px] text-muted-foreground">JPEG, PNG, or WebP. Max 5 MB.</p>
                        </div>
                    </div>
                </div>

                <Button onClick={handleAddCandidate} size="sm" className="gap-2" disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {uploading ? "Uploading…" : "Add Candidate"}
                </Button>
            </div>
        </div>
    )
}

// ─── Accreditation Tab ────────────────────────────────────────────────────────

function AccreditationTab({ voters, voterCount, onRefresh }: { voters: Voter[]; voterCount: number; onRefresh: () => Promise<void> }) {
    useEffect(() => { onRefresh() }, [onRefresh])

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Voter Registry</p>
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Accredited Voters</h1>
                <p className="mt-1 text-muted-foreground">{voterCount} total voters accredited.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">NIPR</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {voters.map((v) => (
                                <tr key={v.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-foreground">{v.name}</td>
                                    <td className="px-5 py-3.5 text-muted-foreground">{v.email}</td>
                                    <td className="px-5 py-3.5"><Badge variant="secondary" className="font-mono text-[10px] bg-muted/60">{v.code}</Badge></td>
                                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{v.nipr}</td>
                                    <td className="px-5 py-3.5">
                                        <Badge className={`text-[10px] ${v.hasVoted ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
                                            {v.hasVoted ? "✓ Voted" : "Pending"}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{new Date(v.accreditedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {voters.length === 0 && (
                    <div className="p-8 text-center">
                        <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No voters accredited yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Results Tab ──────────────────────────────────────────────────────────

interface LivePosition {
    id: string; title: string; description: string; votingType: string
    candidates: { id: string; name: string; party: string; bio: string; image: string; votes: number }[]
}
interface LiveElection {
    id: string; title: string; totalAccredited: number; totalVotesCast: number; totalBallotsCast: number; positions: LivePosition[]
}

function ResultsTab({ election: parentElection }: { election: Election | null }) {
    const [liveData, setLiveData] = useState<LiveElection | null>(null)
    const [loadingResults, setLoadingResults] = useState(true)

    const fetchResults = useCallback(async () => {
        try {
            const res = await fetch("/api/results")
            if (res.ok) {
                const data = await res.json()
                setLiveData(data.election)
            }
        } catch { /* silent */ }
        finally { setLoadingResults(false) }
    }, [])

    useEffect(() => {
        fetchResults()
        const interval = setInterval(fetchResults, 10000)
        return () => clearInterval(interval)
    }, [fetchResults])

    if (!parentElection && !liveData) return (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-muted-foreground">No election data available.</p>
        </div>
    )

    if (loadingResults && !liveData) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    const positions: LivePosition[] = liveData?.positions ?? []
    const totalAccredited = liveData?.totalAccredited ?? 0
    const totalVotesCast = liveData?.totalVotesCast ?? 0
    const totalBallotsCast = liveData?.totalBallotsCast ?? 0
    const turnoutPct = totalAccredited > 0 ? Math.round((totalBallotsCast / totalAccredited) * 100) : 0

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                            <BarChart3 className="h-3.5 w-3.5 text-violet-600" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Analytics</p>
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-foreground">Election Results</h1>
                    <p className="mt-1 text-muted-foreground">Live vote counts — auto-refreshing every 10s.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchResults} className="gap-2 rounded-xl">
                    <Activity className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Summary stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
                {[
                    { label: "Total Votes", value: totalVotesCast, icon: TrendingUp, bg: "bg-emerald-500/10", text: "text-emerald-600" },
                    { label: "Ballots Cast", value: totalBallotsCast, icon: CheckCircle2, bg: "bg-blue-500/10", text: "text-blue-600" },
                    { label: "Accredited", value: totalAccredited, icon: Users, bg: "bg-amber-500/10", text: "text-amber-600" },
                    { label: "Turnout", value: `${turnoutPct}%`, icon: Activity, bg: "bg-violet-500/10", text: "text-violet-600" },
                ].map((s) => (
                    <div key={s.label} className="stat-card rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                                <s.icon className={`h-3.5 w-3.5 ${s.text}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-foreground tabular-nums">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                {positions.map((pos) => {
                    const posTotal = pos.candidates.reduce((s, c) => s + c.votes, 0)
                    const sorted = [...pos.candidates].sort((a, b) => b.votes - a.votes)

                    return (
                        <div key={pos.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <BarChart3 className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground">{pos.title}</h3>
                                        <p className="text-xs text-muted-foreground">{posTotal.toLocaleString()} total votes • {pos.votingType}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="text-xs">{pos.candidates.length} candidates</Badge>
                            </div>

                            <div className="divide-y divide-border">
                                {sorted.map((c, idx) => {
                                    const pct = posTotal > 0 ? Math.round((c.votes / posTotal) * 100) : 0
                                    return (
                                        <div key={c.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${idx === 0 ? "bg-primary/[0.03]" : "hover:bg-muted/10"}`}>
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${idx === 0 ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-border shrink-0">
                                                <Image src={c.image} alt={c.name} width={40} height={40} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground">{c.name}</span>
                                                        <Badge variant="secondary" className="text-[10px]">{c.party}</Badge>
                                                        {idx === 0 && <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">Leading</Badge>}
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="text-lg font-bold text-foreground tabular-nums">{c.votes.toLocaleString()}</span>
                                                        <span className="ml-1 text-sm text-muted-foreground">({pct}%)</span>
                                                    </div>
                                                </div>
                                                <Progress value={pct} className="mt-2 h-2" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
