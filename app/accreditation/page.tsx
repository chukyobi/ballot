"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ShieldCheck,
  Hash,
  KeyRound,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Copy,
  CheckCircle2,
  Clock,
  ShieldOff,
  ArrowLeft,
  Fingerprint,
  Sparkles,
  User,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "nipr" | "welcome" | "pin" | "success"

interface VoterInfo {
  name: string
  email: string
  nipr: string
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AccreditationPage() {
  const [accreditationOpen, setAccreditationOpen] = useState<boolean | null>(null)
  const [step, setStep] = useState<Step>("nipr")
  const [nipr, setNipr] = useState("")
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [voterInfo, setVoterInfo] = useState<VoterInfo | null>(null)
  const [generatedCode, setGeneratedCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pageLoaded, setPageLoaded] = useState(false)

  // Check if accreditation is open
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setAccreditationOpen(data.accreditationOpen ?? false))
      .catch(() => setAccreditationOpen(false))

    const timer = setTimeout(() => setPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // ── Step 1: Look up NIPR ──────────────────────────────────────────────────
  const handleNiprLookup = useCallback(async () => {
    const trimmed = nipr.trim().toUpperCase()
    if (!trimmed) {
      toast.error("Please enter your NIPR number.")
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/register?nipr=${encodeURIComponent(trimmed)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "NIPR number not found. Please register first.")
        return
      }

      setVoterInfo({ name: data.name, email: data.email, nipr: trimmed })
      setStep("welcome")
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }, [nipr])

  // ── Step 2: Verify PIN & get code ─────────────────────────────────────────
  const handlePinVerify = useCallback(async () => {
    if (!pin || pin.length < 4) {
      toast.error("Please enter your PIN.")
      return
    }
    if (!voterInfo) return

    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/accreditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: voterInfo.name,
          email: voterInfo.email,
          nipr: voterInfo.nipr,
          pin,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Verification failed.")
        if (res.status === 401) {
          // Wrong PIN — stay on PIN step
        } else {
          setStep("nipr")
        }
        return
      }

      setGeneratedCode(data.code)
      setStep("success")
      toast.success("Accreditation successful!")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [pin, voterInfo])

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    toast.success("Voting code copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  // Mask email: j***@gmail.com
  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@")
    return local.charAt(0) + "***@" + domain
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (accreditationOpen === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background hero-gradient">
        <div className="text-center animate-pulse">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  // ── Accreditation Not Started ─────────────────────────────────────────────
  if (!accreditationOpen) {
    return (
      <div className={`fixed inset-0 flex flex-col bg-background hero-gradient overflow-hidden transition-opacity duration-1000 ${pageLoaded ? "opacity-100" : "opacity-0"}`}>
        {/* Mesh background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px] animate-float" />
          <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px] animate-float-delayed" />
        </div>

        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Header */}
        <header className="relative z-10 px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/nipr-logo.jpeg" alt="NIPR Logo" width={140} height={140} className="h-12 w-12 object-contain" />
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </header>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-lg text-center">
            {/* Animated icon */}
            <div className="animate-fade-up-in mx-auto mb-8 relative">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm shadow-2xl">
                <ShieldOff className="h-14 w-14 text-white/20 animate-pulse" />
              </div>
              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: "8s" }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary/40" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }}>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent/40" />
              </div>
            </div>

            <h1 className="animate-fade-up-in-delay-1 font-serif text-4xl font-bold text-white md:text-5xl">
              Accreditation Not Started
            </h1>
            <p className="animate-fade-up-in-delay-2 mt-4 text-lg leading-relaxed text-white/40 max-w-md mx-auto">
              The accreditation window has not been opened yet. Please check back soon or contact the election administrator.
            </p>

            {/* Status card */}
            <div className="animate-fade-up-in-delay-3 mt-8 mx-auto max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5">
              <div className="flex items-center justify-center gap-3 text-white/30">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Awaiting administrator action</span>
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

  // ── Accreditation is Open ─────────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 flex flex-col bg-background hero-gradient overflow-hidden transition-opacity duration-1000 ${pageLoaded ? "opacity-100" : "opacity-0"}`}>
      {/* Mesh background */}
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

      {/* Header */}
      <header className="relative z-10 px-6 py-4 shrink-0">
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

      {/* Main area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* ── Step: NIPR Input ── */}
          {step === "nipr" && (
            <div className="animate-fade-up-in">
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 shadow-lg shadow-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-white">Voter Accreditation</h1>
                <p className="mt-2 text-white/40 leading-relaxed max-w-sm mx-auto">
                  Enter your NIPR number to begin the accreditation process.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nipr" className="flex items-center gap-2 text-sm font-medium text-white/70">
                      <Hash className="h-4 w-4 text-primary/60" />
                      NIPR Number
                    </Label>
                    <Input
                      id="nipr"
                      placeholder="Enter your NIPR number"
                      value={nipr}
                      onChange={(e) => { setNipr(e.target.value); setError("") }}
                      className="h-12 bg-white/[0.04] border-white/[0.08] text-white font-mono placeholder:text-white/20 focus:border-primary/50"
                      onKeyDown={(e) => e.key === "Enter" && handleNiprLookup()}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleNiprLookup}
                    disabled={loading}
                    className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                    {loading ? "Verifying…" : "Find My Record"}
                  </Button>
                </div>

                <p className="mt-4 text-center text-xs text-white/25 flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  Encrypted & secure connection
                </p>
              </div>

              <p className="mt-6 text-center text-sm text-white/30">
                Not registered?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          )}

          {/* ── Step: Welcome + Proceed to PIN ── */}
          {step === "welcome" && voterInfo && (
            <div className="animate-fade-up-in text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
                <User className="h-10 w-10 text-primary" />
              </div>

              <h1 className="font-serif text-3xl font-bold text-white">
                Welcome, {voterInfo.name.split(" ")[0]}!
              </h1>
              <p className="mt-2 text-white/40 flex items-center justify-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {maskEmail(voterInfo.email)}
              </p>

              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-white/70">NIPR verified successfully</span>
                </div>
                <p className="text-sm text-white/35 leading-relaxed">
                  To complete accreditation, please enter the PIN you created during registration.
                </p>
              </div>

              <Button
                onClick={() => setStep("pin")}
                className="mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 px-8"
                size="lg"
              >
                <KeyRound className="h-4 w-4" />
                Enter PIN
              </Button>
            </div>
          )}

          {/* ── Step: PIN Input ── */}
          {step === "pin" && voterInfo && (
            <div className="animate-fade-up-in">
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 shadow-lg shadow-primary/10">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-white">
                  Enter Your PIN
                </h1>
                <p className="mt-2 text-white/40 text-sm">
                  Welcome back, <strong className="text-white/60">{voterInfo.name}</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pin" className="flex items-center gap-2 text-sm font-medium text-white/70">
                      <Lock className="h-4 w-4 text-primary/60" />
                      Security PIN
                    </Label>
                    <div className="relative">
                      <Input
                        id="pin"
                        type={showPin ? "text" : "password"}
                        placeholder="Enter your 4-6 digit PIN"
                        value={pin}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 6)
                          setPin(v)
                          setError("")
                        }}
                        className="h-12 bg-white/[0.04] border-white/[0.08] text-white font-mono tracking-[0.3em] text-center text-lg placeholder:text-white/20 placeholder:tracking-normal placeholder:text-sm focus:border-primary/50 pr-10"
                        inputMode="numeric"
                        maxLength={6}
                        onKeyDown={(e) => e.key === "Enter" && handlePinVerify()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handlePinVerify}
                    disabled={loading}
                    className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {loading ? "Verifying…" : "Verify & Get Voting Code"}
                  </Button>
                </div>
              </div>

              <button
                onClick={() => { setStep("nipr"); setPin(""); setError("") }}
                className="mt-6 mx-auto flex items-center gap-1.5 text-sm text-white/30 hover:text-white/50 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Use a different NIPR
              </button>
            </div>
          )}

          {/* ── Step: Success ── */}
          {step === "success" && (
            <div className="animate-fade-up-in text-center">
              {/* Success animation */}
              <div className="mx-auto mb-6 relative">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 border-2 border-primary/30 shadow-lg shadow-primary/20">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute inset-0 mx-auto h-24 w-24 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Accreditation Complete</span>
                <Sparkles className="h-5 w-5 text-accent" />
              </div>

              <h1 className="font-serif text-3xl font-bold text-white">
                You&apos;re Verified!
              </h1>
              <p className="mt-2 text-white/40 max-w-sm mx-auto">
                Your identity has been confirmed. Here is your unique voting code.
              </p>

              {/* Voting code display */}
              <div className="mt-8 mx-auto max-w-sm rounded-2xl border-2 border-primary/30 bg-primary/[0.06] backdrop-blur-sm p-8 shadow-[0_0_60px_oklch(0.45_0.15_150/0.15)]">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Your Unique Voting Code
                </p>
                <div className="flex items-center justify-center gap-3">
                  <code className="font-mono text-3xl font-bold tracking-widest text-white select-all">
                    {generatedCode}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="rounded-lg p-2.5 text-white/40 transition-all hover:bg-white/10 hover:text-white"
                    aria-label="Copy code"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <p className="mt-4 text-xs text-white/30 leading-relaxed">
                  Save this code securely. You will need it to cast your vote.<br />
                  <strong className="text-white/40">It cannot be recovered once lost.</strong>
                </p>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3">
                <Link href="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-white/12 bg-white/5 text-white hover:bg-white/10"
                  >
                    Return to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
