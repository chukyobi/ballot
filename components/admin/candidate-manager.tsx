"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Plus, Trash2, Upload, UserPlus, Edit, X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useVoting, type Candidate } from "@/lib/voting-context"

export function AdminCandidateManager() {
  const { election, setElection } = useVoting()
  const [selectedPosition, setSelectedPosition] = useState(election.positions[0]?.id || "")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    bio: "",
    image: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string>("")

  const currentPosition = election.positions.find((p) => p.id === selectedPosition)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPreviewImage(result)
        setFormData((prev) => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCandidate = () => {
    if (!formData.name || !formData.party) {
      toast.error("Please fill in the candidate name and party.")
      return
    }

    const newCandidate: Candidate = {
      id: editingCandidate?.id || `cand-${Date.now()}`,
      name: formData.name,
      party: formData.party,
      bio: formData.bio,
      image: formData.image || "/images/candidates/candidate-1.jpg",
      votes: editingCandidate?.votes || 0,
      position: currentPosition?.title || "",
    }

    setElection({
      ...election,
      positions: election.positions.map((pos) => {
        if (pos.id !== selectedPosition) return pos
        if (editingCandidate) {
          return {
            ...pos,
            candidates: pos.candidates.map((c) => (c.id === editingCandidate.id ? newCandidate : c)),
          }
        }
        return { ...pos, candidates: [...pos.candidates, newCandidate] }
      }),
    })

    toast.success(editingCandidate ? "Candidate updated!" : "Candidate added!")
    resetForm()
  }

  const handleDeleteCandidate = (candidateId: string) => {
    setElection({
      ...election,
      positions: election.positions.map((pos) => {
        if (pos.id !== selectedPosition) return pos
        return { ...pos, candidates: pos.candidates.filter((c) => c.id !== candidateId) }
      }),
    })
    toast.success("Candidate removed.")
  }

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setFormData({
      name: candidate.name,
      party: candidate.party,
      bio: candidate.bio,
      image: candidate.image,
    })
    setPreviewImage(candidate.image)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", party: "", bio: "", image: "" })
    setPreviewImage("")
    setEditingCandidate(null)
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Candidate Management</h1>
          <p className="mt-1 text-muted-foreground">Add, edit, and manage candidates for each voting position.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editingCandidate ? "Edit Candidate" : "Add New Candidate"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Candidate Photo</Label>
                <div className="flex items-center gap-4">
                  {previewImage ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-border">
                      <Image src={previewImage} alt="Preview" fill className="object-cover" />
                      <button
                        onClick={() => { setPreviewImage(""); setFormData((prev) => ({ ...prev, image: "" })) }}
                        className="absolute right-1 top-1 rounded-full bg-foreground/80 p-0.5 text-background"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/30"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                  <div className="flex-1">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Upload className="h-3 w-3" />
                      Upload Photo
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Amara Okafor"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Party / Affiliation</Label>
                <Input
                  value={formData.party}
                  onChange={(e) => setFormData((prev) => ({ ...prev, party: e.target.value }))}
                  placeholder="e.g. Progressive Alliance"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Biography</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief background and manifesto..."
                  rows={3}
                  className="bg-background"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleAddCandidate} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="h-4 w-4" />
                  {editingCandidate ? "Update" : "Add"} Candidate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Position Filter */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Label className="text-sm font-medium text-muted-foreground">Position:</Label>
        <div className="flex gap-2 flex-wrap">
          {election.positions.map((pos) => (
            <button
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedPosition === pos.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {pos.title || "Untitled"} ({pos.candidates.length})
            </button>
          ))}
        </div>
      </div>

      {/* Candidates List */}
      {currentPosition && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{currentPosition.title || "Untitled Position"}</h2>
              <p className="text-sm text-muted-foreground">
                {currentPosition.votingType === "single" ? "Single vote" : `Multiple votes (max ${currentPosition.maxVotes})`}
              </p>
            </div>
            <Badge variant="secondary">{currentPosition.candidates.length} candidates</Badge>
          </div>

          {currentPosition.candidates.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-12 text-center">
              <UserPlus className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground">No candidates yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add candidates to this position using the button above.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentPosition.candidates.map((candidate) => (
                <div key={candidate.id} className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
                  <div className="relative h-40 bg-muted">
                    <Image
                      src={candidate.image}
                      alt={candidate.name}
                      fill
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/50 to-transparent p-3">
                      <Badge variant="secondary" className="bg-card/90 text-card-foreground text-xs backdrop-blur-sm">
                        {candidate.party}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-foreground">{candidate.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{candidate.bio}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{candidate.votes} votes</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(candidate)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
