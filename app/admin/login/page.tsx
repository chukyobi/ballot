"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Vote, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Login failed.")
                toast.error(data.error || "Login failed.")
                return
            }

            toast.success(data.message || "Login successful!")
            router.push("/admin/dashboard")
        } catch {
            setError("Network error. Please try again.")
            toast.error("Network error.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                            <Vote className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-serif text-2xl font-bold text-foreground">BallotBox</span>
                    </Link>
                    <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">Admin Login</h1>
                    <p className="mt-2 text-muted-foreground">
                        Sign in to manage elections, candidates, and results.
                    </p>
                    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-primary">
                        🔒 Secure admin access — only authorized administrators.
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
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
                                autoComplete="current-password"
                                placeholder="Enter your password"
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
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in…
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
                    <p>
                        Don&apos;t have an account?{" "}
                        <Link href="/admin/signup" className="font-medium text-primary hover:underline">
                            Create one
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
