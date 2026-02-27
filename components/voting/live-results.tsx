"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Vote,
  ArrowLeft,
  TrendingUp,
  Users,
  Activity,
  Crown,
  Radio,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candidate {
  id: string
  name: string
  party: string
  bio: string
  image: string
  votes: number
}
interface Position {
  id: string
  title: string
  description: string
  votingType: string
  candidates: Candidate[]
}
interface ElectionData {
  id: string
  title: string
  description: string
  status: string
  startDate: string
  endDate: string
  totalAccredited: number
  totalVotesCast: number
  totalBallotsCast: number
  positions: Position[]
}
interface ActivityItem {
  id: string
  voterName: string
  positionTitle: string
  candidateName: string
  candidateParty: string
  candidateImage: string
  timestamp: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(timestamp: string) {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
      </span>
      <span className="text-sm font-bold uppercase tracking-wider text-destructive">Live</span>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  accent = false,
}: {
  icon: React.ElementType
  value: string | number
  label: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? "bg-accent/10" : "bg-primary/10"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-accent" : "text-primary"}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Position Leaderboard ─────────────────────────────────────────────────────

function PositionLeaderboard({ position }: { position: Position }) {
  const totalVotes = position.candidates.reduce((s, c) => s + c.votes, 0)
  const sorted = [...position.candidates].sort((a, b) => b.votes - a.votes)
  const leaderId = sorted[0]?.id
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between border-b border-border px-6 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{position.title}</h3>
            <p className="text-xs text-muted-foreground">{totalVotes.toLocaleString()} total votes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
            {position.votingType === "SINGLE" ? "Single Vote" : "Multiple Votes"}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-border">
          {sorted.map((candidate, index) => {
            const pct = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
            const isLeader = candidate.id === leaderId

            return (
              <div
                key={candidate.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${isLeader ? "bg-primary/[0.03]" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${isLeader ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                    }`}
                >
                  {isLeader ? <Crown className="h-4 w-4" /> : index + 1}
                </div>

                <div className={`relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-2 ${isLeader ? "border-accent" : "border-border"}`}>
                  <Image src={candidate.image} alt={candidate.name} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">{candidate.name}</span>
                      <Badge variant="secondary" className="text-[10px] flex-shrink-0 px-1.5 py-0">{candidate.party}</Badge>
                      {isLeader && (
                        <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] flex-shrink-0 px-1.5 py-0">Leading</Badge>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-bold text-foreground tabular-nums">{candidate.votes.toLocaleString()}</span>
                      <span className="ml-1 text-sm text-muted-foreground">({pct}%)</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={pct} className="h-2" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  const [displayCount, setDisplayCount] = useState(8)
  const visible = activity.slice(0, displayCount)

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Live Activity Feed</h3>
            <p className="text-xs text-muted-foreground">{activity.length} vote events</p>
          </div>
        </div>
        <LiveIndicator />
      </div>

      <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
        {visible.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No voting activity yet. Votes will appear here in real time.
          </div>
        ) : (
          visible.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-3.5 px-6 py-3.5 ${idx === 0 ? "bg-primary/[0.03]" : ""}`}
            >
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-border">
                <Image src={item.candidateImage} alt={item.candidateName} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">
                  <span className="font-medium text-muted-foreground">{item.voterName}</span>
                  <span className="text-muted-foreground">{" voted for "}</span>
                  <span className="font-semibold text-primary">{item.candidateName}</span>
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{item.positionTitle}</span>
                  <span className="text-muted-foreground/40">{"/"}</span>
                  <span className="text-[10px] text-muted-foreground">{item.candidateParty}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 text-muted-foreground" suppressHydrationWarning>
                <Clock className="h-3 w-3" />
                <span className="text-[10px] font-medium tabular-nums" suppressHydrationWarning>{timeAgo(item.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {displayCount < activity.length && (
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setDisplayCount((p) => p + 8)}
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function CountdownOrStatus({ endDate, status }: { endDate: string; status: string }) {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setMounted(true)
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Loading…</span>
      </div>
    )
  }

  const end = new Date(endDate + (endDate.includes("T") ? "" : "T23:59:59"))
  const diff = end.getTime() - now.getTime()

  if (status === "CLOSED" || diff <= 0) {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground border-border text-xs px-3 py-1">
        Election Closed
      </Badge>
    )
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">Ends in</span>
      <div className="flex items-center gap-1">
        {days > 0 && (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tabular-nums">
            {days}d
          </span>
        )}
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tabular-nums">
          {String(hours).padStart(2, "0")}h
        </span>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tabular-nums">
          {String(minutes).padStart(2, "0")}m
        </span>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tabular-nums">
          {String(seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LiveResults() {
  const [election, setElection] = useState<ElectionData | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | string>("all")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/results")
      if (!res.ok) {
        if (res.status === 404) {
          setError("No active election found.")
        } else {
          setError("Failed to load results.")
        }
        setLoading(false)
        return
      }
      const data = await res.json()
      setElection(data.election)
      setActivity(data.activity || [])
      setError("")
      setLastRefresh(new Date())
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + auto-refresh every 10 seconds
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const getFilteredPositions = useCallback(() => {
    if (!election) return []
    if (activeTab === "all") return election.positions
    return election.positions.filter((p) => p.id === activeTab)
  }, [activeTab, election])

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading live results…</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !election) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">
            {error || "No election data available."}
          </h2>
          <p className="mt-2 text-muted-foreground">Check back when an election is live.</p>
          <Link href="/">
            <Button className="mt-6 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const turnoutPct = election.totalAccredited > 0
    ? Math.round(((election.totalBallotsCast ?? 0) / election.totalAccredited) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Vote className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground font-serif">BallotBox</span>
          </Link>
          <div className="flex items-center gap-4">
            <CountdownOrStatus endDate={election.endDate} status={election.status} />
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchData}
              className="gap-1.5 text-muted-foreground"
              title={`Last refreshed: ${lastRefresh.toLocaleTimeString()}`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Title */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <LiveIndicator />
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                {election.status === "ACTIVE" ? "Voting in Progress" : "Election Ended"}
              </Badge>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              {election.title}
            </h1>
            <p className="mt-2 text-muted-foreground leading-relaxed max-w-2xl text-pretty">
              Watch votes come in live across all positions. Results update automatically every 10 seconds.
            </p>
          </div>
          <Link href="/vote">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 flex-shrink-0">
              <Vote className="h-4 w-4" />
              Cast Your Vote
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={TrendingUp} value={election.totalVotesCast.toLocaleString()} label="Total Votes Cast" />
          <StatCard icon={Users} value={election.totalAccredited.toLocaleString()} label="Accredited Voters" accent />
          <StatCard icon={Radio} value={`${election.positions.length}`} label="Positions" />
          <StatCard icon={Activity} value={`${turnoutPct}%`} label="Voter Turnout" accent />
        </div>

        {/* Position Filter Tabs */}
        <div className="mt-8 mb-6 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground border border-border hover:text-foreground hover:border-primary/30"
              }`}
          >
            All Positions
          </button>
          {election.positions.map((pos) => (
            <button
              key={pos.id}
              onClick={() => setActiveTab(pos.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === pos.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:text-foreground hover:border-primary/30"
                }`}
            >
              {pos.title}
            </button>
          ))}
        </div>

        {/* Main Content: Leaderboards + Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {getFilteredPositions().map((position) => (
              <PositionLeaderboard key={position.id} position={position} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <ActivityFeed activity={activity} />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Results displayed are updated automatically every 10 seconds from the database.
            Official results will be certified after the election period ends on{" "}
            <span className="font-semibold text-foreground" suppressHydrationWarning>
              {new Date(election.endDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>.
          </p>
        </div>
      </main>
    </div>
  )
}
