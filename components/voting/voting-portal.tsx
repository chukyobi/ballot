"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Vote,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Users,
  ShieldCheck,
  Radio,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useVoting, type Candidate, type Position } from "@/lib/voting-context"

function CandidateCard({
  candidate,
  position,
  isVoted,
  hasVotedForPosition,
  onVote,
}: {
  candidate: Candidate
  position: Position
  isVoted: boolean
  hasVotedForPosition: boolean
  onVote: () => void
}) {
  const canVote =
    !hasVotedForPosition ||
    (position.votingType === "multiple" && !isVoted)

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all ${
        isVoted
          ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border bg-card hover:border-primary/20 hover:shadow-md"
      }`}
    >
      {isVoted && (
        <div className="absolute right-3 top-3 z-10">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-muted">
        <Image
          src={candidate.image}
          alt={candidate.name}
          fill
          className="object-cover object-top transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-4">
          <Badge variant="secondary" className="bg-card/90 text-card-foreground text-xs font-medium backdrop-blur-sm">
            {candidate.party}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground">{candidate.name}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">
          {candidate.position}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {candidate.bio}
        </p>

        {/* Vote Count */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">{candidate.votes.toLocaleString()}</span>
            <span className="ml-1 text-xs text-muted-foreground">votes</span>
          </div>
        </div>

        {/* Vote Button */}
        <Button
          onClick={onVote}
          disabled={!canVote || isVoted}
          className={`mt-4 w-full transition-all ${
            isVoted
              ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isVoted ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Voted
            </>
          ) : hasVotedForPosition && position.votingType === "single" ? (
            "Already Voted"
          ) : (
            <>
              <Vote className="mr-2 h-4 w-4" />
              Cast Vote
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function VotingBallot() {
  const { election, castVote, votedPositions, currentVoter, setCurrentVoter } = useVoting()
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const currentPosition = election.positions[currentPositionIndex]
  const totalPositions = election.positions.length
  const votedForCurrent = votedPositions[currentPosition?.id] || []
  const progress = ((currentPositionIndex) / totalPositions) * 100

  const handleVote = (candidateId: string) => {
    if (currentPosition.votingType === "single" && votedForCurrent.length > 0) {
      toast.error("You can only vote for one candidate in this category.")
      return
    }
    castVote(currentPosition.id, candidateId)
    toast.success("Vote cast successfully!")
  }

  const handleNext = () => {
    if (votedForCurrent.length === 0) {
      toast.error("Please cast at least one vote before proceeding.")
      return
    }
    if (currentPositionIndex < totalPositions - 1) {
      setCurrentPositionIndex((prev) => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex((prev) => prev - 1)
    }
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground">Thank You for Voting!</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Your votes have been recorded successfully. Every vote makes a difference.
        </p>

        <div className="mx-auto mt-10 max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Voting Summary</h3>
          <div className="space-y-3">
            {election.positions.map((pos) => {
              const votedIds = votedPositions[pos.id] || []
              const votedCandidates = pos.candidates.filter((c) => votedIds.includes(c.id))
              return (
                <div key={pos.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-muted-foreground">{pos.title}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {votedCandidates.map((c) => c.name).join(", ") || "Skipped"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/live">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Radio className="h-4 w-4" />
              Watch Live Results
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">Return Home</Button>
          </Link>
          <Button
            variant="ghost"
            size="lg"
            className="text-muted-foreground"
            onClick={() => {
              setCurrentVoter(null)
              setIsComplete(false)
              setCurrentPositionIndex(0)
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Position {currentPositionIndex + 1} of {totalPositions}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Position Header */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20">
              {currentPosition.votingType === "single" ? "Single Vote" : `Multiple Votes (up to ${currentPosition.maxVotes})`}
            </Badge>
            <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">{currentPosition.title}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{currentPosition.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accredited as</p>
            <p className="text-sm font-semibold text-foreground">{currentVoter?.name}</p>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentPosition.candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            position={currentPosition}
            isVoted={votedForCurrent.includes(candidate.id)}
            hasVotedForPosition={votedForCurrent.length > 0}
            onVote={() => handleVote(candidate.id)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentPositionIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          {votedForCurrent.length > 0 ? (
            <span className="flex items-center gap-1.5 text-primary font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Vote Cast
            </span>
          ) : (
            "Select a candidate to proceed"
          )}
        </span>
        <Button
          onClick={handleNext}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {currentPositionIndex === totalPositions - 1 ? "Finish Voting" : "Next Position"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function VotingPortal() {
  const { accreditedVoters, setCurrentVoter, currentVoter } = useVoting()
  const [accessCode, setAccessCode] = useState("")

  const handleLogin = () => {
    const voter = accreditedVoters.find((v) => v.code === accessCode.trim().toUpperCase())
    if (!voter) {
      toast.error("Invalid access code. Please check your code and try again.")
      return
    }
    if (voter.hasVoted) {
      toast.error("You have already voted. Each voter can only vote once.")
      return
    }
    setCurrentVoter(voter)
    toast.success(`Welcome, ${voter.name}!`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Vote className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground font-serif">BallotBox</span>
          </Link>
          <div className="flex items-center gap-3">
            {currentVoter && (
              <div className="hidden items-center gap-2 sm:flex">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{currentVoter.name}</span>
              </div>
            )}
            <Link href="/live">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Radio className="h-4 w-4" />
                <span className="hidden sm:inline">Live Results</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        {!currentVoter ? (
          /* Access Code Entry */
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Enter Voting Code</h1>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Enter the unique access code you received during accreditation.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Access Code</Label>
                  <Input
                    type="text"
                    placeholder="VOTE-2026-XXXXXX"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="h-12 text-center font-mono text-lg tracking-wider bg-background"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  className="w-full bg-primary text-primary-foreground h-12 text-base hover:bg-primary/90"
                >
                  Access Ballot
                </Button>
              </div>

              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Demo Code:</strong> Use{" "}
                  <code className="font-mono text-primary">VOTE-2026-A1B2C3</code> to test the voting portal.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {"Don't have a code? "}
                <Link href="/accreditation" className="font-semibold text-primary hover:underline">
                  Get Accredited
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <VotingBallot />
        )}
      </main>
    </div>
  )
}
