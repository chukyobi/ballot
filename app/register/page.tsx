"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    User,
    Mail,
    Hash,
    KeyRound,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Lock,
    Info,
    Eye,
    EyeOff,
    Clock,
    ShieldOff,
    Sparkles,
    Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    name: string
    email: string
    nipr: string
    pin: string
    confirmPin: string
}

interface SettingsData {
    registrationOpen: boolean
    registrationStartTime: string | null
    registrationEndTime: string | null
}

// ─── Countdown Hook ──────────────────────────────────────────────────────────

function useCountdown(endTime: string | null) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number; hours: number; minutes: number; seconds: number; total: number; ready: boolean
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: -1, ready: false })

    useEffect(() => {
        if (!endTime) return

        const calc = () => {
            const now = Date.now()
            const end = new Date(endTime).getTime()
            const diff = Math.max(0, end - now)
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
            const minutes = Math.floor((diff / (1000 * 60)) % 60)
            const seconds = Math.floor((diff / 1000) % 60)
            setTimeLeft({ days, hours, minutes, seconds, total: diff, ready: true })
        }

        calc()
        const interval = setInterval(calc, 1000)
        return () => clearInterval(interval)
    }, [endTime])

    return timeLeft
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null)
    const [registrationClosed, setRegistrationClosed] = useState(false)
    const [pageLoaded, setPageLoaded] = useState(false)

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        nipr: "",
        pin: "",
        confirmPin: "",
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [showPin, setShowPin] = useState(false)
    const [showConfirmPin, setShowConfirmPin] = useState(false)
    const [step, setStep] = useState(1)

    const countdown = useCountdown(settings?.registrationEndTime ?? null)

    // Check settings
    useEffect(() => {
        fetch("/api/admin/settings")
            .then((res) => res.json())
            .then((data: SettingsData) => {
                setSettings(data)
                // Check if it was previously open but end time passed
                if (
                    !data.registrationOpen &&
                    data.registrationEndTime &&
                    new Date(data.registrationEndTime).getTime() <= Date.now()
                ) {
                    setRegistrationClosed(true)
                }
            })
            .catch(() =>
                setSettings({ registrationOpen: false, registrationStartTime: null, registrationEndTime: null })
            )

        const timer = setTimeout(() => setPageLoaded(true), 100)
        return () => clearTimeout(timer)
    }, [])

    // Auto-close when countdown reaches zero (only after countdown has been initialized)
    useEffect(() => {
        if (
            countdown.ready &&
            settings?.registrationOpen &&
            settings?.registrationEndTime &&
            countdown.total <= 0
        ) {
            setSettings((prev) => prev ? { ...prev, registrationOpen: false } : prev)
            setRegistrationClosed(true)
        }
    }, [countdown.total, countdown.ready, settings?.registrationOpen, settings?.registrationEndTime])

    const handleChange = useCallback(
        (field: keyof FormData, value: string) => {
            setFormData((prev) => ({ ...prev, [field]: value }))
            if (error) setError("")
        },
        [error]
    )

    const pinMatch = formData.pin === formData.confirmPin && formData.pin.length >= 4
    const pinValid = /^\d{4,6}$/.test(formData.pin)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const missing: string[] = []
        if (!formData.name.trim()) missing.push("Full Name")
        if (!formData.email.trim()) missing.push("Email Address")
        if (!formData.nipr.trim()) missing.push("NIPR Number")
        if (!formData.pin) missing.push("PIN")
        if (!formData.confirmPin) missing.push("Confirm PIN")

        if (missing.length > 0) {
            toast.error(`Please fill in: ${missing.join(", ")}`)
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address.")
            return
        }

        if (formData.nipr.trim().length < 6) {
            toast.error("NIPR number must be at least 6 characters.")
            return
        }

        if (!pinValid) {
            toast.error("PIN must be 4 to 6 digits.")
            return
        }

        if (formData.pin !== formData.confirmPin) {
            toast.error("PINs do not match.")
            return
        }

        setSubmitting(true)
        setError("")

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    nipr: formData.nipr,
                    pin: formData.pin,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data?.error ?? "Registration failed.")
                toast.error(data?.error ?? "Registration failed.")
                return
            }

            setSuccess(true)
            toast.success("Registration successful!")
        } catch {
            const msg = "Network error. Please check your connection."
            setError(msg)
            toast.error(msg)
        } finally {
            setSubmitting(false)
        }
    }

    // ── Loading ─────────────────────────────────────────────────────────────────
    if (settings === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background hero-gradient">
                <div className="text-center animate-pulse">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
                </div>
            </div>
        )
    }

    // ── Registration Not Started ────────────────────────────────────────────────
    if (!settings.registrationOpen && !registrationClosed) {
        return (
            <div className={`fixed inset-0 flex flex-col bg-background hero-gradient overflow-hidden transition-opacity duration-1000 ${pageLoaded ? "opacity-100" : "opacity-0"}`}>
                <div className="pointer-events-none absolute inset-0 z-0">
                    <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px] animate-float" />
                    <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px] animate-float-delayed" />
                </div>
                <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                }} />

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

                <div className="relative z-10 flex-1 flex items-center justify-center px-6">
                    <div className="w-full max-w-lg text-center">
                        <div className="animate-fade-up-in mx-auto mb-8 relative">
                            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm shadow-2xl">
                                <ShieldOff className="h-14 w-14 text-white/20 animate-pulse" />
                            </div>
                            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "8s" }}>
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary/40" />
                            </div>
                            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }}>
                                <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent/40" />
                            </div>
                        </div>

                        <h1 className="animate-fade-up-in-delay-1 font-serif text-4xl font-bold text-white md:text-5xl">
                            No Ongoing Registration
                        </h1>
                        <p className="animate-fade-up-in-delay-2 mt-4 text-lg leading-relaxed text-white/40 max-w-md mx-auto">
                            The voter registration portal is not open at this time. Please check back when the administrator opens registration.
                        </p>

                        <div className="animate-fade-up-in-delay-3 mt-8 mx-auto max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5">
                            <div className="flex items-center justify-center gap-3 text-white/30">
                                <Clock className="h-5 w-5" />
                                <span className="text-sm font-medium">Awaiting administrator action</span>
                            </div>
                        </div>

                        <div className="animate-fade-up-in-delay-4 mt-8">
                            <Link href="/">
                                <Button size="lg" variant="outline" className="gap-2 rounded-xl border-white/12 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                                    <ArrowLeft className="h-4 w-4" /> Return Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── Registration Has Closed ─────────────────────────────────────────────────
    if (registrationClosed && !settings.registrationOpen) {
        return (
            <div className={`fixed inset-0 flex flex-col bg-background hero-gradient overflow-hidden transition-opacity duration-1000 ${pageLoaded ? "opacity-100" : "opacity-0"}`}>
                <div className="pointer-events-none absolute inset-0 z-0">
                    <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px] animate-float" />
                    <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px] animate-float-delayed" />
                </div>
                <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                }} />

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
                            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-destructive/[0.06] border border-destructive/[0.15] backdrop-blur-sm shadow-2xl">
                                <Timer className="h-14 w-14 text-destructive/40" />
                            </div>
                        </div>

                        <h1 className="animate-fade-up-in-delay-1 font-serif text-4xl font-bold text-white md:text-5xl">
                            Registration Has Closed
                        </h1>
                        <p className="animate-fade-up-in-delay-2 mt-4 text-lg leading-relaxed text-white/40 max-w-md mx-auto">
                            The voter registration window has ended. If the administrator decides to extend the registration period, this page will become active again.
                        </p>

                        <div className="animate-fade-up-in-delay-3 mt-8 mx-auto max-w-sm rounded-2xl border border-destructive/[0.15] bg-destructive/[0.04] backdrop-blur-sm p-5">
                            <div className="flex items-center justify-center gap-3 text-destructive/50">
                                <Lock className="h-5 w-5" />
                                <span className="text-sm font-medium">Registration window expired</span>
                            </div>
                        </div>

                        <div className="animate-fade-up-in-delay-4 mt-8 flex flex-col items-center gap-3">
                            <p className="text-sm text-white/25">Already registered?</p>
                            <Link href="/accreditation">
                                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 px-6">
                                    Proceed to Accreditation <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    Return Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── Registration is Open ────────────────────────────────────────────────────
    const canProceedStep1 = formData.name.trim() && formData.email.trim() && formData.nipr.trim().length >= 6

    const handleNext = () => {
        if (!formData.name.trim()) { toast.error("Please enter your full name."); return }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address."); return
        }
        if (formData.nipr.trim().length < 6) { toast.error("NIPR must be at least 6 characters."); return }
        setStep(2)
    }

    return (
        <div className={`fixed inset-0 flex flex-col bg-background hero-gradient overflow-hidden transition-opacity duration-1000 ${pageLoaded ? "opacity-100" : "opacity-0"}`}>
            {/* Mesh background */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px] animate-float" />
                <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px] animate-float-delayed" />
            </div>
            <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
            }} />

            {/* Header */}
            <header className="relative z-10 px-6 py-3 shrink-0">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image src="/nipr-logo.jpeg" alt="NIPR Logo" width={140} height={140} className="h-10 w-10 object-contain" />
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground text-xs">
                            <ArrowLeft className="h-3.5 w-3.5" /> Home
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Countdown Bar — pinned below header */}
            {settings.registrationEndTime && countdown.total > 0 && (
                <div className="relative z-10 shrink-0 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl flex items-center justify-center gap-5 px-6 py-2">
                        <div className="flex items-center gap-2">
                            <Timer className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">Closes in</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {[
                                { value: countdown.days, label: "d" },
                                { value: countdown.hours, label: "h" },
                                { value: countdown.minutes, label: "m" },
                                { value: countdown.seconds, label: "s" },
                            ].map((unit) => (
                                <div key={unit.label} className="flex items-center gap-0.5">
                                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                                        {String(unit.value).padStart(2, "0")}
                                    </span>
                                    <span className="text-[9px] text-white/30 font-medium">{unit.label}</span>
                                </div>
                            ))}
                        </div>
                        {settings.registrationStartTime && settings.registrationEndTime && (
                            <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/20 border-l border-white/[0.06] pl-5">
                                <span>{new Date(settings.registrationStartTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                <span className="text-white/10">→</span>
                                <span>{new Date(settings.registrationEndTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md">

                    {!success ? (
                        <div className="animate-fade-up-in">
                            {/* Title */}
                            <div className="text-center mb-4">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-lg shadow-primary/10">
                                    {step === 1 ? <User className="h-6 w-6 text-primary" /> : <KeyRound className="h-6 w-6 text-primary" />}
                                </div>
                                <h1 className="font-serif text-xl font-bold text-white">
                                    {step === 1 ? "Voter Registration" : "Create Your PIN"}
                                </h1>
                                <p className="mt-1 text-white/40 leading-relaxed max-w-sm mx-auto text-xs">
                                    {step === 1
                                        ? "Enter your personal details to register."
                                        : "Set a secure PIN for accreditation."}
                                </p>
                            </div>

                            {/* Step Indicator */}
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className={`flex items-center gap-2 ${step === 1 ? "text-primary" : "text-white/20"}`}>
                                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${step === 1 ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/40"}`}>1</div>
                                    <span className="text-xs font-medium hidden sm:inline">Details</span>
                                </div>
                                <div className="w-8 h-px bg-white/10" />
                                <div className={`flex items-center gap-2 ${step === 2 ? "text-primary" : "text-white/20"}`}>
                                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${step === 2 ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/40"}`}>2</div>
                                    <span className="text-xs font-medium hidden sm:inline">Security</span>
                                </div>
                            </div>

                            {/* Form Card */}
                            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 shadow-2xl">

                                {/* STEP 1: Personal Details */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-white/70">
                                                <User className="h-4 w-4 text-primary/60" />
                                                Full Name <span className="text-destructive text-xs">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="Enter your full name"
                                                value={formData.name}
                                                onChange={(e) => handleChange("name", e.target.value)}
                                                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/50"
                                                autoComplete="name"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-white/70">
                                                <Mail className="h-4 w-4 text-primary/60" />
                                                Email Address <span className="text-destructive text-xs">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={formData.email}
                                                onChange={(e) => handleChange("email", e.target.value)}
                                                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/50"
                                                autoComplete="email"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nipr" className="flex items-center gap-2 text-sm font-medium text-white/70">
                                                <Hash className="h-4 w-4 text-primary/60" />
                                                NIPR Number <span className="text-destructive text-xs">*</span>
                                            </Label>
                                            <Input
                                                id="nipr"
                                                placeholder="Enter your NIPR number"
                                                value={formData.nipr}
                                                onChange={(e) => handleChange("nipr", e.target.value)}
                                                className="h-11 bg-white/[0.04] border-white/[0.08] text-white font-mono placeholder:text-white/20 focus:border-primary/50"
                                            />
                                            <p className="text-[11px] text-white/25 flex items-center gap-1.5">
                                                <Info className="h-3 w-3" />
                                                Your National Identity & Population Register number.
                                            </p>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={!canProceedStep1}
                                            className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                                        >
                                            Continue <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* STEP 2: PIN Setup */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        {/* Summary of step 1 */}
                                        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-white/40">
                                                    <p className="font-semibold text-white/60">{formData.name}</p>
                                                    <p>{formData.email}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    className="text-[10px] text-primary font-semibold uppercase tracking-wider hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="pin" className="flex items-center gap-2 text-sm font-medium text-white/70">
                                                    <KeyRound className="h-4 w-4 text-primary/60" />
                                                    PIN (4–6 digits) <span className="text-destructive text-xs">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="pin"
                                                        type={showPin ? "text" : "password"}
                                                        placeholder="Enter your PIN"
                                                        value={formData.pin}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/\D/g, "").slice(0, 6)
                                                            handleChange("pin", v)
                                                        }}
                                                        className="h-11 bg-white/[0.04] border-white/[0.08] text-white font-mono tracking-[0.3em] pr-10 placeholder:text-white/20 placeholder:tracking-normal focus:border-primary/50"
                                                        inputMode="numeric"
                                                        maxLength={6}
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPin(!showPin)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                                    >
                                                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {formData.pin && !pinValid && (
                                                    <p className="text-xs text-destructive flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> PIN must be 4 to 6 digits.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPin" className="flex items-center gap-2 text-sm font-medium text-white/70">
                                                    <KeyRound className="h-4 w-4 text-primary/60" />
                                                    Confirm PIN <span className="text-destructive text-xs">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPin"
                                                        type={showConfirmPin ? "text" : "password"}
                                                        placeholder="Re-enter your PIN"
                                                        value={formData.confirmPin}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/\D/g, "").slice(0, 6)
                                                            handleChange("confirmPin", v)
                                                        }}
                                                        className="h-11 bg-white/[0.04] border-white/[0.08] text-white font-mono tracking-[0.3em] pr-10 placeholder:text-white/20 placeholder:tracking-normal focus:border-primary/50"
                                                        inputMode="numeric"
                                                        maxLength={6}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                                    >
                                                        {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {formData.confirmPin && formData.pin !== formData.confirmPin && (
                                                    <p className="text-xs text-destructive flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> PINs do not match.
                                                    </p>
                                                )}
                                                {pinMatch && (
                                                    <p className="text-xs text-primary flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> PINs match!
                                                    </p>
                                                )}
                                            </div>

                                            {error && (
                                                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                                                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setStep(1)}
                                                    className="h-11 gap-2 border-white/12 bg-white/5 text-white/60 hover:bg-white/10"
                                                >
                                                    <ArrowLeft className="h-4 w-4" /> Back
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={submitting || !pinMatch}
                                                    className="flex-1 h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                                                >
                                                    {submitting ? (
                                                        <><Loader2 className="h-4 w-4 animate-spin" /> Registering…</>
                                                    ) : (
                                                        <><ShieldCheck className="h-4 w-4" /> Register</>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <p className="mt-3 text-center text-xs text-white/20 flex items-center justify-center gap-1.5">
                                    <Lock className="h-3 w-3" />
                                    Encrypted & secure connection
                                </p>
                                <p className="mt-2 text-center text-xs text-white/30">
                                    Already registered?{" "}
                                    <Link href="/accreditation" className="font-medium text-primary hover:underline">
                                        Proceed to Accreditation
                                    </Link>
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* ── Success Screen ── */
                        <div className="animate-fade-up-in text-center">
                            <div className="mx-auto mb-5 relative">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 border-2 border-primary/30 shadow-lg shadow-primary/20">
                                    <CheckCircle2 className="h-10 w-10 text-primary" />
                                </div>
                                <div className="absolute inset-0 mx-auto h-20 w-20 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-accent" />
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Registration Complete</span>
                                <Sparkles className="h-4 w-4 text-accent" />
                            </div>

                            <h1 className="font-serif text-3xl font-bold text-white">
                                You&apos;re Registered!
                            </h1>
                            <p className="mt-2 text-white/40 max-w-sm mx-auto text-sm">
                                Your voter registration has been saved successfully.
                            </p>

                            <div className="mt-6 mx-auto max-w-sm rounded-2xl border-2 border-amber-500/30 bg-amber-500/[0.06] backdrop-blur-sm p-5">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <KeyRound className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-bold text-white">Remember Your PIN</span>
                                </div>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    You&apos;ll need your <strong className="text-white/60">NIPR number</strong> and <strong className="text-white/60">PIN</strong> during
                                    accreditation to receive your voting code.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col items-center gap-2">
                                <Link href="/accreditation">
                                    <Button
                                        size="lg"
                                        className="gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                                    >
                                        Proceed to Accreditation
                                        <ArrowRight className="h-4 w-4" />
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
                </div>
            </main>
        </div>
    )
}

