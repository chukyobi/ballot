"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Vote, Lock, ArrowRight, CheckCircle2, Fingerprint, Radio, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [liveResultsVisible, setLiveResultsVisible] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)

  useEffect(() => {
    // Check if live results should be visible
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setLiveResultsVisible(data.liveResultsVisible ?? false))
      .catch(() => { })

    // Trigger page load animation
    const timer = setTimeout(() => setPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`fixed inset-0 flex flex-col bg-background hero-gradient overflow-hidden transition-opacity duration-1000 ${pageLoaded ? "opacity-100" : "opacity-0"
        }`}
    >
      {/* Animated mesh background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px] animate-float" />
        <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* ─── Navigation ──────────────────────────────────────────────── */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/nipr-logo.jpeg"
              alt="NIPR Logo"
              width={140}
              height={140}
              className="h-15 w-15 object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-6">
            {liveResultsVisible && (
              <Link
                href="/live"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                </span>
                Live Results
              </Link>
            )}
            <Link href="/register">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground text-sm hover:bg-primary/90 shadow-md shadow-primary/20"
              >
                Register to Vote
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero (fills remaining viewport) ──────────────────────────── */}
      <section className="relative flex-1 flex flex-col overflow-hidden">

        {/* ── Floating Decorative Icons ── */}
        {/* Left icon — Fingerprint, slanted */}
        <div className="pointer-events-none absolute left-[8%] top-[30%] z-[1] hidden lg:block animate-float">
          <Fingerprint
            className="h-28 w-28 text-primary/[0.07] drop-shadow-2xl"
            style={{ transform: "rotate(-15deg)" }}
          />
        </div>

        {/* Right icon — Shield, slanted */}
        <div className="pointer-events-none absolute right-[8%] top-[25%] z-[1] hidden lg:block animate-float-delayed">
          <Shield
            className="h-24 w-24 text-accent/[0.08] drop-shadow-2xl"
            style={{ transform: "rotate(12deg)" }}
          />
        </div>

        {/* Additional floating Vote icon bottom-left */}
        <div className="pointer-events-none absolute left-[15%] bottom-[22%] z-[1] hidden lg:block animate-float-delayed">
          <Vote
            className="h-16 w-16 text-primary/[0.05]"
            style={{ transform: "rotate(-8deg)" }}
          />
        </div>

        {/* Additional floating Lock icon top-right */}
        <div className="pointer-events-none absolute right-[14%] bottom-[30%] z-[1] hidden lg:block animate-float">
          <Lock
            className="h-14 w-14 text-accent/[0.06]"
            style={{ transform: "rotate(20deg)" }}
          />
        </div>

        {/* ── Center content ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-4xl text-center">

            {/* Badge */}
            <div className="animate-fade-up-in mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/8 px-5 py-2 shadow-[0_0_32px_oklch(0.45_0.15_150/0.12)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                NIPR Election - 2026 (Anambra)
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up-in-delay-1 text-balance font-serif text-5xl leading-[1.08] tracking-tight text-white md:text-6xl lg:text-[4.5rem]">
              Your Vote,{" "}
              <br className="hidden sm:block" />
              <span className="relative">
                <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-accent to-amber-300 animate-gradient-shift">
                  Your Power.
                </span>
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="animate-fade-up-in-delay-2 mx-auto mt-5 max-w-[52ch] text-pretty text-[1.0625rem] leading-[1.7] text-white/50">
              A trusted, transparent platform where every vote counts. Get
              accredited in minutes, receive your secure code, and shape the
              future — from anywhere.
            </p>

            {/* Trust badges */}
            <div className="animate-fade-up-in-delay-2 mx-auto mt-5 flex items-center justify-center gap-5">
              {[
                { icon: ShieldCheck, label: "Secure Voting System" },
                { icon: CheckCircle2, label: "One vote per person" },
                { icon: Lock, label: "Fair and Transparent" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/35"
                >
                  <Icon className="h-3.5 w-3.5 text-primary/60" />
                  {label}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="animate-fade-up-in-delay-3 mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2.5 rounded-xl bg-primary px-8 text-[0.9375rem] font-semibold text-primary-foreground shadow-[0_8px_32px_oklch(0.45_0.15_150/0.45)] transition-all hover:bg-primary/90 hover:shadow-[0_14px_44px_oklch(0.45_0.15_150/0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Register to Vote
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/vote">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2.5 rounded-xl border-white/12 bg-white/5 px-8 text-[0.9375rem] font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:-translate-y-0.5"
                >
                  <Fingerprint className="h-4 w-4" />
                  Cast Vote
                </Button>
              </Link>
            </div>

            {/* Tertiary link row */}
            <div className="animate-fade-up-in-delay-4 mt-6 flex items-center justify-center gap-5">
              {liveResultsVisible && (
                <>
                  <Link
                    href="/live"
                    className="group inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary/70 transition-colors hover:text-primary"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    Watch live results
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <span className="h-4 w-px bg-white/12" />
                </>
              )}
              {/* <span className="text-[0.8125rem] text-white/25">No app required</span> */}
            </div>
          </div>
        </div>

        {/* ── Footer / Copyright ── */}
        <div className="relative z-10 shrink-0 pb-5 pt-3">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-3 h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <p className="text-sm text-muted-foreground/60">
              © 2026 NIPR. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
