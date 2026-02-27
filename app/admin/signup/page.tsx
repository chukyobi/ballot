"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Vote,
    Lock,
    Mail,
    User,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// ─── Password strength helpers ────────────────────────────────────────────────

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 1) return { score, label: "Weak", color: "bg-destructive" }
    if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" }
    if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" }
    if (score <= 4) return { score, label: "Strong", color: "bg-emerald-500" }
    return { score, label: "Very Strong", color: "bg-emerald-400" }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AdminSignupPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const strength = getPasswordStrength(password)
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Client-side validation
        if (name.trim().length < 2) {
            setError("Name must be at least 2 characters.")
            return
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/admin/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Signup failed.")
                toast.error(data.error || "Signup failed.")
                return
            }

            toast.success(data.message || "Account created!")
            router.push("/admin/dashboard")
        } catch {
            setError("Network error. Please try again.")
            toast.error("Network error.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                            <Vote className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-serif text-2xl font-bold text-foreground">BallotBox</span>
                    </Link>
                    <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">Create Admin Account</h1>
                    <p className="mt-2 text-muted-foreground">
                        Register as an administrator to manage elections.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignup} className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoComplete="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError("") }}
                            className="h-11 bg-background"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="admin@ballotbox.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError("") }}
                            className="h-11 bg-background"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                placeholder="Minimum 8 characters"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError("") }}
                                className="h-11 bg-background pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {/* Password strength indicator */}
                        {password.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-muted"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Password strength: <span className="font-medium text-foreground">{strength.label}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError("") }}
                                className={`h-11 bg-background pr-10 ${confirmPassword.length > 0
                                        ? passwordsMatch
                                            ? "border-emerald-500/50 focus-visible:ring-emerald-500/30"
                                            : "border-destructive/50 focus-visible:ring-destructive/30"
                                        : ""
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && (
                            <div className={`flex items-center gap-1.5 text-xs ${passwordsMatch ? "text-emerald-600" : "text-destructive"}`}>
                                {passwordsMatch ? (
                                    <>
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Passwords match
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Passwords do not match
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={loading || !passwordsMatch || password.length < 8}
                        className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account…
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>

                {/* Footer links */}
                <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
                    <p>
                        Already have an account?{" "}
                        <Link href="/admin/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                    <p>
                        <Link href="/" className="text-primary hover:underline">← Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
