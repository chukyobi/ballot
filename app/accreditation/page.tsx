"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import {
  Vote,
  ArrowLeft,
  Copy,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Hash,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string
  email: string
  nationalId: string
  dateOfBirth: string
  stateOfOrigin: string
}

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
  "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
]

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: "form" | "review" | "success" }) {
  const steps = ["Registration", "Review", "Complete"]
  const currentIndex = step === "form" ? 0 : step === "review" ? 1 : 2

  return (
    <div className="mb-12 flex items-center justify-center gap-4">
      {steps.map((label, i) => {
        const isActive = i === currentIndex
        const isComplete = i < currentIndex
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                {label}
              </span>
            </div>
            {i < 2 && <div className="hidden h-px w-12 bg-border sm:block" />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Form field row ────────────────────────────────────────────────────────────

const FIELD_ICONS: Record<string, typeof User> = {
  name: User,
  email: Mail,
  nationalId: Hash,
  dateOfBirth: Calendar,
  stateOfOrigin: MapPin,
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AccreditationPage() {
  const [step, setStep] = useState<"form" | "review" | "success">("form")
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    nationalId: "",
    dateOfBirth: "",
    stateOfOrigin: "",
  })
  const [generatedCode, setGeneratedCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Seed the DB on first load (idempotent)
  useEffect(() => {
    fetch("/api/seed", { method: "POST" }).catch(() => {
      /* silent — seed has already run */
    })
  }, [])

  const handleChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (error) setError("")
    },
    [error]
  )

  // ── Validate before showing review ──────────────────────────────────────────
  const handleSubmit = () => {
    const missing: string[] = []
    if (!formData.name.trim()) missing.push("Full Name")
    if (!formData.email.trim()) missing.push("Email Address")
    if (!formData.nationalId.trim()) missing.push("National ID Number")
    if (!formData.dateOfBirth) missing.push("Date of Birth")
    if (!formData.stateOfOrigin) missing.push("State of Origin")

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`)
      return
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address.")
      return
    }

    setStep("review")
  }

  // ── Submit to backend ────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/accreditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data?.error ?? "Accreditation failed. Please try again."
        setError(msg)
        toast.error(msg)
        if (res.status === 409) setStep("form") // duplicate — send back to form
        return
      }

      setGeneratedCode(data.code)
      setStep("success")
      toast.success("Accreditation successful! Your voting code is ready.")
    } catch {
      const msg = "Network error. Please check your connection and try again."
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    toast.success("Code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Vote className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">
              BallotBox
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 md:py-20">
        <StepIndicator step={step} />

        {/* ── Form Step ── */}
        {step === "form" && (
          <div>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Voter Accreditation
              </h1>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Complete the form below to verify your identity. Your information is
                encrypted and secure.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="space-y-5">
                {/* Full Name */}
                <Field
                  id="name"
                  label="Full Name"
                  icon={FIELD_ICONS.name}
                  required
                >
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-11 bg-background"
                    autoComplete="name"
                  />
                </Field>

                {/* Email */}
                <Field
                  id="email"
                  label="Email Address"
                  icon={FIELD_ICONS.email}
                  required
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-11 bg-background"
                    autoComplete="email"
                  />
                </Field>

                {/* National ID */}
                <Field
                  id="nationalId"
                  label="National ID Number"
                  icon={FIELD_ICONS.nationalId}
                  required
                >
                  <Input
                    id="nationalId"
                    placeholder="Enter your national ID number"
                    value={formData.nationalId}
                    onChange={(e) => handleChange("nationalId", e.target.value)}
                    className="h-11 bg-background"
                  />
                </Field>

                {/* Date of Birth */}
                <Field
                  id="dateOfBirth"
                  label="Date of Birth"
                  icon={FIELD_ICONS.dateOfBirth}
                  required
                >
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    className="h-11 bg-background"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </Field>

                {/* State of Origin */}
                <Field
                  id="stateOfOrigin"
                  label="State of Origin"
                  icon={FIELD_ICONS.stateOfOrigin}
                  required
                >
                  <Select
                    value={formData.stateOfOrigin}
                    onValueChange={(v) => handleChange("stateOfOrigin", v)}
                  >
                    <SelectTrigger id="stateOfOrigin" className="h-11 bg-background">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  🔒 All data is encrypted and protected.
                </p>
                <Button
                  id="btn-continue"
                  onClick={handleSubmit}
                  className="bg-primary px-8 text-primary-foreground hover:bg-primary/90"
                >
                  Continue to Review
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Review Step ── */}
        {step === "review" && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Review Your Information
              </h1>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Please verify that all your details are correct before submitting.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="space-y-4">
                {(
                  [
                    ["Full Name", formData.name],
                    ["Email Address", formData.email],
                    ["National ID Number", formData.nationalId],
                    ["Date of Birth", formData.dateOfBirth],
                    ["State of Origin", formData.stateOfOrigin],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-right text-sm font-semibold text-foreground">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setError("")
                    setStep("form")
                  }}
                  disabled={submitting}
                >
                  Edit Information
                </Button>
                <Button
                  id="btn-confirm"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="bg-primary px-8 text-primary-foreground hover:bg-primary/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    "Confirm & Get Code"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Success Step ── */}
        {step === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Accreditation Successful!
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Your identity has been verified and saved. Use the code below to access
              the voting portal.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-xl border-2 border-primary/30 bg-primary/5 p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                Your Unique Voting Code
              </p>
              <div className="flex items-center justify-center gap-3">
                <code className="font-mono text-3xl font-bold tracking-widest text-foreground">
                  {generatedCode}
                </code>
                <button
                  onClick={handleCopy}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Save this code securely. You will need it to access the voting portal.
                It cannot be recovered.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Link href="/vote">
                <Button
                  id="btn-vote"
                  size="lg"
                  className="gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90"
                >
                  Proceed to Vote
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

// ─── Helper component ──────────────────────────────────────────────────────────

function Field({
  id,
  label,
  icon: Icon,
  required,
  children,
}: {
  id: string
  label: string
  icon: typeof User
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  )
}
