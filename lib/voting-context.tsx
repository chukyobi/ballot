"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface Candidate {
  id: string
  name: string
  party: string
  bio: string
  image: string
  votes: number
  position: string
}

export interface Position {
  id: string
  title: string
  description: string
  votingType: "single" | "multiple"
  maxVotes: number
  candidates: Candidate[]
}

export interface VoteActivity {
  id: string
  voterName: string
  candidateName: string
  candidateParty: string
  candidateImage: string
  positionTitle: string
  timestamp: string
}

export interface AccreditationField {
  id: string
  label: string
  type: "text" | "email" | "number" | "select" | "date"
  required: boolean
  placeholder: string
  options?: string[]
}

export interface Election {
  id: string
  title: string
  description: string
  status: "draft" | "active" | "closed"
  startDate: string
  endDate: string
  positions: Position[]
  accreditationFields: AccreditationField[]
}

export interface AccreditedVoter {
  id: string
  code: string
  name: string
  email: string
  accreditedAt: string
  hasVoted: boolean
  data: Record<string, string>
}

interface VotingContextType {
  election: Election
  setElection: (election: Election) => void
  accreditedVoters: AccreditedVoter[]
  addAccreditedVoter: (voter: AccreditedVoter) => void
  currentVoter: AccreditedVoter | null
  setCurrentVoter: (voter: AccreditedVoter | null) => void
  castVote: (positionId: string, candidateId: string) => void
  votedPositions: Record<string, string[]>
  setVotedPositions: (positions: Record<string, string[]>) => void
  voteActivity: VoteActivity[]
}

const defaultAccreditationFields: AccreditationField[] = [
  { id: "1", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
  { id: "2", label: "Email Address", type: "email", required: true, placeholder: "Enter your email address" },
  { id: "3", label: "National ID Number", type: "text", required: true, placeholder: "Enter your national ID" },
  { id: "4", label: "Date of Birth", type: "date", required: true, placeholder: "" },
  { id: "5", label: "State of Origin", type: "select", required: true, placeholder: "Select your state", options: ["Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Enugu", "Delta", "Imo", "Anambra"] },
]

const defaultElection: Election = {
  id: "1",
  title: "Student Union Government Election 2026",
  description: "Annual election for the Student Union Government leadership positions. Cast your vote for the candidates of your choice.",
  status: "active",
  startDate: "2026-03-01",
  endDate: "2026-03-15",
  accreditationFields: defaultAccreditationFields,
  positions: [
    {
      id: "president",
      title: "President",
      description: "The President serves as the chief executive and representative of the student body.",
      votingType: "single",
      maxVotes: 1,
      candidates: [
        { id: "p1", name: "Amara Okafor", party: "Progressive Alliance", bio: "A 400-level Law student passionate about student welfare and campus development. Has served as class representative for 3 years.", image: "/images/candidates/candidate-1.jpg", votes: 234, position: "President" },
        { id: "p2", name: "Kwame Mensah", party: "Unity Front", bio: "Engineering student and former sports director. Advocates for improved facilities and academic excellence.", image: "/images/candidates/candidate-2.jpg", votes: 189, position: "President" },
        { id: "p3", name: "Fatima Bello", party: "Reform Movement", bio: "Medical student with a vision for transparent governance and inclusive policies for all students.", image: "/images/candidates/candidate-3.jpg", votes: 156, position: "President" },
      ],
    },
    {
      id: "vice-president",
      title: "Vice President",
      description: "The Vice President assists the President and presides over the Student Senate.",
      votingType: "single",
      maxVotes: 1,
      candidates: [
        { id: "vp1", name: "Chiamaka Eze", party: "Progressive Alliance", bio: "A dedicated 300-level Political Science student with leadership experience in community service.", image: "/images/candidates/candidate-4.jpg", votes: 198, position: "Vice President" },
        { id: "vp2", name: "Yusuf Ibrahim", party: "Unity Front", bio: "Computer Science student focused on digital transformation of student services and communication.", image: "/images/candidates/candidate-5.jpg", votes: 167, position: "Vice President" },
      ],
    },
    {
      id: "secretary",
      title: "General Secretary",
      description: "The General Secretary manages all official communications and documentation.",
      votingType: "single",
      maxVotes: 1,
      candidates: [
        { id: "s1", name: "Ngozi Adeyemi", party: "Progressive Alliance", bio: "Mass Communication student known for excellent organizational skills and attention to detail.", image: "/images/candidates/candidate-6.jpg", votes: 210, position: "General Secretary" },
        { id: "s2", name: "Emeka Chukwu", party: "Reform Movement", bio: "Business Administration student with experience in event coordination and public relations.", image: "/images/candidates/candidate-7.jpg", votes: 175, position: "General Secretary" },
      ],
    },
    {
      id: "welfare",
      title: "Welfare Director",
      description: "The Welfare Director oversees student welfare, health, and accommodation matters.",
      votingType: "single",
      maxVotes: 1,
      candidates: [
        { id: "w1", name: "Aisha Mohammed", party: "Unity Front", bio: "Nursing student committed to improving healthcare access and mental health support on campus.", image: "/images/candidates/candidate-8.jpg", votes: 145, position: "Welfare Director" },
        { id: "w2", name: "Oluwaseun Adeola", party: "Progressive Alliance", bio: "Social Work student dedicated to creating support systems for vulnerable students.", image: "/images/candidates/candidate-9.jpg", votes: 132, position: "Welfare Director" },
        { id: "w3", name: "Chidi Nnamdi", party: "Reform Movement", bio: "Psychology student advocating for comprehensive wellness programs and student safety.", image: "/images/candidates/candidate-10.jpg", votes: 118, position: "Welfare Director" },
      ],
    },
  ],
}

const seedActivity: VoteActivity[] = [
  { id: "a1", voterName: "Adebayo T.", candidateName: "Amara Okafor", candidateParty: "Progressive Alliance", candidateImage: "/images/candidates/candidate-1.jpg", positionTitle: "President", timestamp: new Date(Date.now() - 45000).toISOString() },
  { id: "a2", voterName: "Chinelo M.", candidateName: "Chiamaka Eze", candidateParty: "Progressive Alliance", candidateImage: "/images/candidates/candidate-4.jpg", positionTitle: "Vice President", timestamp: new Date(Date.now() - 92000).toISOString() },
  { id: "a3", voterName: "Ibrahim K.", candidateName: "Fatima Bello", candidateParty: "Reform Movement", candidateImage: "/images/candidates/candidate-3.jpg", positionTitle: "President", timestamp: new Date(Date.now() - 138000).toISOString() },
  { id: "a4", voterName: "Grace O.", candidateName: "Ngozi Adeyemi", candidateParty: "Progressive Alliance", candidateImage: "/images/candidates/candidate-6.jpg", positionTitle: "General Secretary", timestamp: new Date(Date.now() - 210000).toISOString() },
  { id: "a5", voterName: "Emeka U.", candidateName: "Kwame Mensah", candidateParty: "Unity Front", candidateImage: "/images/candidates/candidate-2.jpg", positionTitle: "President", timestamp: new Date(Date.now() - 285000).toISOString() },
  { id: "a6", voterName: "Fatou S.", candidateName: "Aisha Mohammed", candidateParty: "Unity Front", candidateImage: "/images/candidates/candidate-8.jpg", positionTitle: "Welfare Director", timestamp: new Date(Date.now() - 340000).toISOString() },
  { id: "a7", voterName: "Kofi D.", candidateName: "Yusuf Ibrahim", candidateParty: "Unity Front", candidateImage: "/images/candidates/candidate-5.jpg", positionTitle: "Vice President", timestamp: new Date(Date.now() - 415000).toISOString() },
  { id: "a8", voterName: "Amina B.", candidateName: "Emeka Chukwu", candidateParty: "Reform Movement", candidateImage: "/images/candidates/candidate-7.jpg", positionTitle: "General Secretary", timestamp: new Date(Date.now() - 500000).toISOString() },
  { id: "a9", voterName: "Tunde A.", candidateName: "Oluwaseun Adeola", candidateParty: "Progressive Alliance", candidateImage: "/images/candidates/candidate-9.jpg", positionTitle: "Welfare Director", timestamp: new Date(Date.now() - 580000).toISOString() },
  { id: "a10", voterName: "Zainab H.", candidateName: "Chidi Nnamdi", candidateParty: "Reform Movement", candidateImage: "/images/candidates/candidate-10.jpg", positionTitle: "Welfare Director", timestamp: new Date(Date.now() - 665000).toISOString() },
]

const VotingContext = createContext<VotingContextType | null>(null)

export function VotingProvider({ children }: { children: ReactNode }) {
  const [election, setElection] = useState<Election>(defaultElection)
  const [accreditedVoters, setAccreditedVoters] = useState<AccreditedVoter[]>([
    { id: "demo1", code: "VOTE-2026-A1B2C3", name: "Demo User", email: "demo@example.com", accreditedAt: "2026-02-25T10:00:00Z", hasVoted: false, data: {} },
  ])
  const [currentVoter, setCurrentVoter] = useState<AccreditedVoter | null>(null)
  const [votedPositions, setVotedPositions] = useState<Record<string, string[]>>({})
  const [voteActivity, setVoteActivity] = useState<VoteActivity[]>(seedActivity)

  const addAccreditedVoter = useCallback((voter: AccreditedVoter) => {
    setAccreditedVoters((prev) => [...prev, voter])
  }, [])

  const castVote = useCallback((positionId: string, candidateId: string) => {
    setElection((prev) => {
      const position = prev.positions.find((p) => p.id === positionId)
      const candidate = position?.candidates.find((c) => c.id === candidateId)

      if (candidate && position) {
        const newActivity: VoteActivity = {
          id: `a-${Date.now()}`,
          voterName: currentVoter?.name || "Anonymous",
          candidateName: candidate.name,
          candidateParty: candidate.party,
          candidateImage: candidate.image,
          positionTitle: position.title,
          timestamp: new Date().toISOString(),
        }
        setVoteActivity((prevActivity) => [newActivity, ...prevActivity])
      }

      return {
        ...prev,
        positions: prev.positions.map((pos) => {
          if (pos.id !== positionId) return pos
          return {
            ...pos,
            candidates: pos.candidates.map((c) =>
              c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
            ),
          }
        }),
      }
    })
    setVotedPositions((prev) => ({
      ...prev,
      [positionId]: [...(prev[positionId] || []), candidateId],
    }))
  }, [currentVoter])

  return (
    <VotingContext.Provider
      value={{
        election,
        setElection,
        accreditedVoters,
        addAccreditedVoter,
        currentVoter,
        setCurrentVoter,
        castVote,
        votedPositions,
        setVotedPositions,
        voteActivity,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

export function useVoting() {
  const context = useContext(VotingContext)
  if (!context) {
    throw new Error("useVoting must be used within a VotingProvider")
  }
  return context
}
