"use client"

import { useState } from "react"
import { Plus, Trash2, Save, GripVertical, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useVoting, type AccreditationField } from "@/lib/voting-context"

export function AdminAccreditationConfig() {
  const { election, setElection } = useVoting()
  const [fields, setFields] = useState<AccreditationField[]>(election.accreditationFields)

  const handleAddField = () => {
    const newField: AccreditationField = {
      id: `field-${Date.now()}`,
      label: "",
      type: "text",
      required: true,
      placeholder: "",
      options: [],
    }
    setFields([...fields, newField])
  }

  const handleUpdateField = (fieldId: string, updates: Partial<AccreditationField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    )
  }

  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId))
    toast.success("Field removed.")
  }

  const handleSave = () => {
    setElection({
      ...election,
      accreditationFields: fields,
    })
    toast.success("Accreditation form saved!")
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Accreditation Form</h1>
          <p className="mt-1 text-muted-foreground">Configure the fields voters must fill during accreditation.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4" />
          Save Form
        </Button>
      </div>

      {/* Info Card */}
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Accreditation Form Builder</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Design the form that voters will fill out during accreditation. Add fields, set field types, and mark required fields. The system will automatically prevent duplicate registrations.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Field {index + 1}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteField(field.id)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                  placeholder="e.g. Full Name"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Field Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value) => handleUpdateField(field.id, { type: value as AccreditationField["type"] })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Placeholder</Label>
                <Input
                  value={field.placeholder}
                  onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                  placeholder="Placeholder text"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Required</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => handleUpdateField(field.id, { required: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.required ? "Required" : "Optional"}
                  </span>
                </div>
              </div>
            </div>

            {/* Options for Select Type */}
            {field.type === "select" && (
              <div className="mt-4 space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Options (comma-separated)</Label>
                <Input
                  value={field.options?.join(", ") || ""}
                  onChange={(e) =>
                    handleUpdateField(field.id, {
                      options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Option 1, Option 2, Option 3"
                  className="bg-background"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleAddField} variant="outline" className="mt-4 w-full gap-2 border-dashed">
        <Plus className="h-4 w-4" />
        Add Field
      </Button>

      {/* Preview */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Form Preview</h3>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                {field.label || "Untitled Field"}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === "select" ? (
                <Select disabled>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={field.placeholder || "Select..."} />
                  </SelectTrigger>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled
                  className="bg-background"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
