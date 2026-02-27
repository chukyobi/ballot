"use client"

import Image from "next/image"
import { Trophy, Users, TrendingUp, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useVoting } from "@/lib/voting-context"

export function AdminResults() {
  const { election, accreditedVoters } = useVoting()

  const totalVotes = election.positions.reduce(
    (sum, pos) => sum + pos.candidates.reduce((s, c) => s + c.votes, 0),
    0
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Live Results</h1>
        <p className="mt-1 text-muted-foreground">Real-time vote counts and election results across all positions.</p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{accreditedVoters.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Accredited Voters</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Votes Cast</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
              <Trophy className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{election.positions.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Positions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Position Results */}
      <div className="space-y-6">
        {election.positions.map((position) => {
          const positionTotalVotes = position.candidates.reduce((s, c) => s + c.votes, 0)
          const sortedCandidates = [...position.candidates].sort((a, b) => b.votes - a.votes)
          const leaderId = sortedCandidates[0]?.id

          return (
            <div key={position.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{position.title}</h2>
                    <p className="text-sm text-muted-foreground">{position.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {positionTotalVotes} total votes
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {position.votingType === "single" ? "Single Vote" : "Multiple Votes"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {sortedCandidates.map((candidate, index) => {
                  const percentage = positionTotalVotes > 0
                    ? Math.round((candidate.votes / positionTotalVotes) * 100)
                    : 0
                  const isLeader = candidate.id === leaderId

                  return (
                    <div key={candidate.id} className={`flex items-center gap-4 px-6 py-4 ${isLeader ? "bg-primary/3" : ""}`}>
                      {/* Rank */}
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                        {isLeader ? (
                          <Crown className="h-4 w-4 text-accent" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Photo */}
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-border">
                        <Image
                          src={candidate.image}
                          alt={candidate.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info & Progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">{candidate.name}</span>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">{candidate.party}</Badge>
                            {isLeader && (
                              <Badge className="bg-accent/10 text-accent border-accent/20 text-xs flex-shrink-0">Leading</Badge>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-lg font-bold text-foreground">{candidate.votes}</span>
                            <span className="ml-1 text-sm text-muted-foreground">({percentage}%)</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress
                            value={percentage}
                            className="h-2"
                          />
                        </div>
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
