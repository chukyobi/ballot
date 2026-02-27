"use client"

import { useState } from "react"
import { Save, Plus, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useVoting } from "@/lib/voting-context"

export function AdminElectionSetup() {
  const { election, setElection } = useVoting()
  const [title, setTitle] = useState(election.title)
  const [description, setDescription] = useState(election.description)
  const [status, setStatus] = useState(election.status)
  const [startDate, setStartDate] = useState(election.startDate)
  const [endDate, setEndDate] = useState(election.endDate)

  const handleSave = () => {
    setElection({
      ...election,
      title,
      description,
      status: status as "draft" | "active" | "closed",
      startDate,
      endDate,
    })
    toast.success("Election settings saved successfully!")
  }

  const handleAddPosition = () => {
    const newPosition = {
      id: `pos-${Date.now()}`,
      title: "",
      description: "",
      votingType: "single" as const,
      maxVotes: 1,
      candidates: [],
    }
    setElection({
      ...election,
      positions: [...election.positions, newPosition],
    })
    toast.success("New position added!")
  }

  const handleUpdatePosition = (posId: string, field: string, value: string | number) => {
    setElection({
      ...election,
      positions: election.positions.map((pos) =>
        pos.id === posId ? { ...pos, [field]: value } : pos
      ),
    })
  }

  const handleDeletePosition = (posId: string) => {
    setElection({
      ...election,
      positions: election.positions.filter((pos) => pos.id !== posId),
    })
    toast.success("Position removed.")
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Election Setup</h1>
          <p className="mt-1 text-muted-foreground">Configure the election details, positions, and voting format.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-5">
          <Settings className="h-5 w-5 text-primary" />
          General Settings
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium">Election Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background" />
            </div>
          </div>
        </div>
      </div>

      {/* Voting Positions */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Voting Positions</h2>
          <Button onClick={handleAddPosition} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Position
          </Button>
        </div>

        <div className="space-y-4">
          {election.positions.map((position, index) => (
            <div key={position.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Position {index + 1}
                </Badge>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {position.candidates.length} candidate{position.candidates.length !== 1 ? "s" : ""}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePosition(position.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Position Title</Label>
                  <Input
                    value={position.title}
                    onChange={(e) => handleUpdatePosition(position.id, "title", e.target.value)}
                    placeholder="e.g. President"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Voting Type</Label>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={position.votingType === "multiple"}
                        onCheckedChange={(checked) =>
                          handleUpdatePosition(position.id, "votingType", checked ? "multiple" : "single")
                        }
                      />
                      <Label className="text-sm text-muted-foreground">
                        {position.votingType === "single" ? "Single Vote" : "Multiple Votes"}
                      </Label>
                    </div>
                    {position.votingType === "multiple" && (
                      <Input
                        type="number"
                        min={1}
                        value={position.maxVotes}
                        onChange={(e) => handleUpdatePosition(position.id, "maxVotes", parseInt(e.target.value) || 1)}
                        className="w-20 bg-background"
                        placeholder="Max"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Input
                    value={position.description}
                    onChange={(e) => handleUpdatePosition(position.id, "description", e.target.value)}
                    placeholder="Brief description of this position"
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
