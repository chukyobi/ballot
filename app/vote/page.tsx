"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Vote, ArrowLeft, Fingerprint, CheckCircle2, Loader2,
  AlertCircle, Lock, Radio, Clock, Ban,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candidate {
  id: string; name: string; party: string; bio: string; image: string; votes: number
}
interface Position {
  id: string; title: string; description: string; votingType: string
  maxVotes: number; candidates: Candidate[]
}
interface VoterInfo {
  id: string; name: string; code: string; hasVoted: boolean
}
interface ElectionInfo {
  id: string; title: string; description: string; status: string; positions: Position[]
}

export default function VotePage() {
  const [votingOpen, setVotingOpen] = useState<boolean | null>(null)
  const [step, setStep] = useState<"code" | "voting" | "done">("code")
  const [codeInput, setCodeInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [voter, setVoter] = useState<VoterInfo | null>(null)
  const [election, setElection] = useState<ElectionInfo | null>(null)
  const [votedPositions, setVotedPositions] = useState<Record<string, string>>({})
  const [currentPosIdx, setCurrentPosIdx] = useState(0)
  const [voting, setVoting] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)

  // Check if voting is open
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setVotingOpen(data.votingOpen ?? false))
      .catch(() => setVotingOpen(false))

    const timer = setTimeout(() => setPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // ── Verify code ──────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = codeInput.trim().toUpperCase()
    if (!code) { toast.error("Enter your voting code."); return }

    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/vote?code=${encodeURIComponent(code)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid code.")
        toast.error(data.error || "Invalid code.")
        return
      }

      setVoter(data.voter)
      setElection(data.election)
      setVotedPositions(data.votedPositions || {})

      const firstUnvoted = data.election.positions.findIndex(
        (p: Position) => !data.votedPositions[p.id]
      )
      setCurrentPosIdx(firstUnvoted >= 0 ? firstUnvoted : 0)

      const allVoted = data.election.positions.every((p: Position) => data.votedPositions[p.id])
      if (allVoted) setStep("done")
      else setStep("voting")

      toast.success(`Welcome, ${data.voter.name}!`)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Cast vote ────────────────────────────────────────────────────────────────
  const handleVote = async (candidateId: string) => {
    if (!voter || !election) return
    const position = election.positions[currentPosIdx]
    if (!position) return

    setVoting(true)
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voter.code, positionId: position.id, candidateId }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Vote failed.")
        return
      }

      toast.success(data.message || "Vote cast!")
      const updated = { ...votedPositions, [position.id]: candidateId }
      setVotedPositions(updated)

      const nextUnvoted = election.positions.findIndex(
        (p, i) => i > currentPosIdx && !updated[p.id]
      )
      if (nextUnvoted >= 0) {
        setCurrentPosIdx(nextUnvoted)
      } else {
        const anyRemaining = election.positions.findIndex((p) => !updated[p.id])
        if (anyRemaining >= 0) setCurrentPosIdx(anyRemaining)
        else setStep("done")
      }
    } catch {
      toast.error("Network error.")
    } finally {
      setVoting(false)
    }
  }

  const currentPosition = election?.positions[currentPosIdx]
  const votedCount = Object.keys(votedPositions).length
  const totalPositions = election?.positions.length || 0

  // ── Loading ────────────────────────────────────────────────────────────────
  if (votingOpen === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background hero-gradient">
        <div className="text-center animate-pulse">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  // ── Voting Not Started ──────────────────────────────────────────────────────
  if (!votingOpen) {
    return (
      <div className={`fixed inset-0 flex flex-col bg-background hero-gradient overflow-hidden transition-opacity duration-1000 ${pageLoaded ? "opacity-100" : "opacity-0"}`}>
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px] animate-float" />
          <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px] animate-float-delayed" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <header className="relative z-10 px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/nipr-logo.jpeg" alt="NIPR Logo" width={140} height={140} className="h-12 w-12 object-contain" />
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" /> Home
              </Button>
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-lg text-center">
            <div className="animate-fade-up-in mx-auto mb-8 relative">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm shadow-2xl">
                <Ban className="h-14 w-14 text-white/20 animate-pulse" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: "8s" }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary/40" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }}>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent/40" />
              </div>
            </div>

            <h1 className="animate-fade-up-in-delay-1 font-serif text-4xl font-bold text-white md:text-5xl">
              Voting Not Available
            </h1>
            <p className="animate-fade-up-in-delay-2 mt-4 text-lg leading-relaxed text-white/40 max-w-md mx-auto">
              The voting portal is not open yet. Please wait for the administrator to set up the election and begin voting.
            </p>

            <div className="animate-fade-up-in-delay-3 mt-8 mx-auto max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5">
              <div className="flex items-center justify-center gap-3 text-white/30">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Nothing to see here yet</span>
              </div>
            </div>

            <div className="animate-fade-up-in-delay-4 mt-8">
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-xl border-white/12 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Voting is Open ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/nipr-logo.jpeg" alt="NIPR Logo" width={140} height={140} className="h-10 w-10 object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            {voter && <span className="text-sm text-muted-foreground hidden sm:inline">Hey, {voter.name}</span>}
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" /> Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">

        {/* ── Step 1: Enter Code ── */}
        {step === "code" && (
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Fingerprint className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Enter Voting Code</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Enter the unique code you received during accreditation to access the voting portal.
            </p>

            <div className="mt-8 space-y-4">
              <Input
                placeholder="e.g. VOTE-2026-AB3C4D"
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setError("") }}
                className="h-12 text-center text-lg font-mono tracking-wider bg-card"
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <Button onClick={handleVerify} disabled={loading} className="h-11 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {loading ? "Verifying…" : "Access Voting Portal"}
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Don&apos;t have a code?{" "}
              <Link href="/accreditation" className="text-primary hover:underline">Get accredited first</Link>
            </p>
          </div>
        )}

        {/* ── Step 2: Voting ── */}
        {step === "voting" && currentPosition && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">{currentPosition.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{currentPosition.description}</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {votedCount}/{totalPositions} voted
              </Badge>
            </div>

            {/* Position tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
              {election?.positions.map((pos, idx) => {
                const isVoted = !!votedPositions[pos.id]
                const isCurrent = idx === currentPosIdx
                return (
                  <button
                    key={pos.id}
                    onClick={() => !isVoted && setCurrentPosIdx(idx)}
                    disabled={isVoted}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${isCurrent ? "bg-primary text-primary-foreground" :
                      isVoted ? "bg-primary/10 text-primary cursor-default" :
                        "bg-card border border-border text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {isVoted && <CheckCircle2 className="h-3 w-3" />}
                    {pos.title}
                  </button>
                )
              })}
            </div>

            {/* Already voted */}
            {votedPositions[currentPosition.id] ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-primary mb-3" />
                <p className="font-semibold text-foreground">You already voted for {currentPosition.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">Your vote has been recorded.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {currentPosition.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border">
                        <Image
                          src={candidate.image}
                          alt={candidate.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground">{candidate.name}</h3>
                        <Badge variant="secondary" className="text-[10px] mt-1">{candidate.party}</Badge>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">{candidate.bio}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleVote(candidate.id)}
                      disabled={voting}
                      className="mt-4 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {voting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Vote className="h-4 w-4" />}
                      Vote for {candidate.name.split(" ")[0]}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === "done" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">All votes submitted!</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-md mx-auto">
              Thank you, {voter?.name || "voter"}! Your votes have been securely recorded across all {totalPositions} positions.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Link href="/live">
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Radio className="h-4 w-4" /> View Live Results
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
