"use client"

import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Users, Vote, Lock, ArrowRight, CheckCircle2, Fingerprint, Radio, Sparkles, Zap, Globe, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Accreditation",
    description: "Multi-layer identity verification ensures each voter registers only once with a secure, tamper-proof credential process.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-600",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "256-bit AES encryption secures every vote from ballot to tally. Your choice remains private and untamperable.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-600",
  },
  {
    icon: BarChart3,
    title: "Real-Time Results",
    description: "Watch votes come in live with beautiful visualizations. Complete transparency with verifiable audit trails.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-600",
  },
  {
    icon: Globe,
    title: "Vote From Anywhere",
    description: "No app downloads required. Access the voting platform from any device, anywhere — responsive and accessible.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
  },
]

const steps = [
  {
    step: "01",
    title: "Get Accredited",
    description: "Complete the quick accreditation form with your credentials. Verification takes under 2 minutes.",
    icon: Fingerprint,
  },
  {
    step: "02",
    title: "Receive Your Code",
    description: "Get a unique, one-time voting access code delivered instantly upon successful verification.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Cast Your Vote",
    description: "Enter your secure code, review the candidates, and make your choices — fast, private, and final.",
    icon: Vote,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navigation ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Vote className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground font-serif">BallotBox</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How It Works</Link>
            <Link href="/live" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
              Live Results
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">Admin</Button>
            </Link>
            <Link href="/accreditation">
              <Button size="sm" className="bg-primary text-primary-foreground text-sm hover:bg-primary/90 shadow-md shadow-primary/20">
                Get Accredited
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Animated mesh background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px] animate-float" />
          <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] rounded-full bg-primary/5 blur-[80px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-0 pt-16 md:pt-24 lg:pt-32">
          <div className="flex flex-col items-center gap-14 lg:flex-row lg:gap-20">

            {/* ── Left: Text ── */}
            <div className="flex-1 text-center lg:text-left">

              {/* Badge */}
              <div className="animate-fade-up-in mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/8 px-5 py-2.5 shadow-[0_0_32px_oklch(0.45_0.15_150/0.12)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                  Election 2026 — Now Live
                </span>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-up-in-delay-1 text-balance font-serif text-5xl leading-[1.06] tracking-tight text-white md:text-6xl lg:text-[4.75rem]">
                Your Vote,{" "}
                <br className="hidden sm:block" />
                <span className="relative">
                  <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-accent to-amber-300 animate-gradient-shift">
                    Your Power.
                  </span>
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="animate-fade-up-in-delay-2 mx-auto mt-7 max-w-[44ch] text-pretty text-[1.0625rem] leading-[1.8] text-white/50 lg:mx-0">
                A trusted, transparent platform where every vote counts. Get accredited in minutes, receive your secure code, and shape the future — from anywhere.
              </p>

              {/* Trust badges */}
              <div className="animate-fade-up-in-delay-2 mx-auto mt-6 flex items-center justify-center gap-5 lg:justify-start">
                {[
                  { icon: ShieldCheck, label: "256-bit encryption" },
                  { icon: CheckCircle2, label: "One vote per person" },
                  { icon: Lock, label: "Audit trail" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-white/35">
                    <Icon className="h-3.5 w-3.5 text-primary/60" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="animate-fade-up-in-delay-3 mt-10 flex flex-col items-center gap-3.5 sm:flex-row lg:justify-start">
                <Link href="/accreditation">
                  <Button
                    size="lg"
                    className="gap-2.5 rounded-xl bg-primary px-8 text-[0.9375rem] font-semibold text-primary-foreground shadow-[0_8px_32px_oklch(0.45_0.15_150/0.45)] transition-all hover:bg-primary/90 hover:shadow-[0_14px_44px_oklch(0.45_0.15_150/0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Begin Accreditation
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
                    Enter Voting Code
                  </Button>
                </Link>
              </div>

              {/* Tertiary link row */}
              <div className="animate-fade-up-in-delay-4 mt-8 flex items-center justify-center gap-5 lg:justify-start">
                <Link
                  href="/live"
                  className="group inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary/70 transition-colors hover:text-primary"
                >
                  <Radio className="h-3.5 w-3.5" />
                  Watch live results
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <span className="h-4 w-px bg-white/12" />
                <span className="text-[0.8125rem] text-white/25">No app required</span>
              </div>
            </div>

            {/* ── Right: Visual ── */}
            <div className="animate-scale-in relative flex-1">
              <div className="relative mx-auto max-w-lg lg:max-w-none">

                {/* Glow */}
                <div className="absolute -inset-8 rounded-3xl bg-primary/8 blur-[60px]" />

                {/* Main image */}
                <div className="relative overflow-hidden rounded-2xl shadow-[0_32px_80px_oklch(0_0_0/0.5)] ring-1 ring-white/10">
                  <Image
                    src="/images/hero-voting.jpg"
                    alt="African voters at a modern polling station"
                    width={640}
                    height={480}
                    className="h-auto w-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Bottom glassmorphism card */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl glass-dark p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-8 w-8 overflow-hidden rounded-full border-2 border-black/60 ring-1 ring-white/10">
                            <Image
                              src={`/images/candidates/candidate-${i}.jpg`}
                              alt=""
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black/60 bg-primary/25 text-[10px] font-bold text-primary ring-1 ring-white/10">
                          +k
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">10,247 voters accredited</p>
                        <p className="text-xs text-white/40">Join thousands already verified</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating accent image */}
                <div className="absolute -bottom-6 -left-6 hidden h-36 w-28 overflow-hidden rounded-xl border-2 border-white/8 shadow-2xl ring-1 ring-white/5 md:block animate-float-delayed">
                  <Image
                    src="/images/hero-accent.jpg"
                    alt="Hands casting a ballot"
                    width={112}
                    height={144}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Floating security chip */}
                <div className="absolute -right-4 top-6 hidden rounded-2xl glass-dark px-4 py-3.5 shadow-2xl md:block animate-float">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">Security</p>
                      <p className="text-sm font-bold text-white">256-bit AES</p>
                    </div>
                  </div>
                </div>

                {/* Live pulse chip */}
                <div className="absolute -left-4 top-20 hidden items-center gap-2.5 rounded-2xl glass-dark px-4 py-3 shadow-2xl md:flex animate-float-delayed">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                  </span>
                  <p className="text-sm font-semibold text-white">Election is Live</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm md:grid-cols-4">
              {[
                { value: "10,000+", label: "Registered Voters", icon: Users },
                { value: "99.9%", label: "Platform Uptime", icon: CheckCircle2 },
                { value: "256-bit", label: "Encryption", icon: Lock },
                { value: "100%", label: "Transparency", icon: Vote },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group flex flex-col items-center gap-1 p-6 text-center transition-all hover:bg-white/5 md:p-8"
                >
                  <stat.icon className="mb-2 h-5 w-5 text-primary/60 transition-colors group-hover:text-primary" />
                  <div className="font-serif text-2xl font-bold text-white md:text-3xl">{stat.value}</div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/30">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom fade */}
          <div className="pointer-events-none mt-0 h-24 bg-gradient-to-b from-transparent to-background" />
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────── */}
      <section id="features" className="relative py-28 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 dot-grid opacity-50" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Why BallotBox</span>
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              Built for Trust<br className="hidden sm:block" /> and Transparency
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              Every feature is designed to ensure the integrity, security, and accessibility of your election.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="card-hover group relative rounded-2xl border border-border bg-card p-7"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Gradient bg glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                <div className="relative">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-28 bg-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-50" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Simple Process</span>
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              Three Steps to<br className="hidden sm:block" /> Make Your Voice Heard
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              The process is designed to be quick, secure, and accessible to everyone.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((item, index) => (
              <div key={item.step} className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-16 hidden h-px w-full translate-x-1/2 md:block">
                    <div className="h-full w-full bg-gradient-to-r from-primary/30 to-primary/5" />
                  </div>
                )}

                <div className="card-hover relative rounded-2xl border border-border bg-background p-8">
                  {/* Step number in background */}
                  <div className="absolute -top-3 -right-2 font-serif text-[5rem] font-bold text-primary/[0.06] leading-none select-none">
                    {item.step}
                  </div>

                  <div className="relative">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                      <item.icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(1_0_0/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.65_0.18_55/0.15)_0%,transparent_50%)]" />

        {/* Decorative floating shapes */}
        <div className="pointer-events-none absolute top-10 left-10 h-32 w-32 rounded-full border border-white/8 animate-float" />
        <div className="pointer-events-none absolute bottom-10 right-16 h-24 w-24 rounded-full border border-white/5 animate-float-delayed" />
        <div className="pointer-events-none absolute top-1/2 right-1/4 h-16 w-16 rounded-full bg-white/5 animate-float" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <Vote className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90">Ready?</span>
          </div>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-white md:text-5xl text-balance">
            Ready to Cast Your Vote?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70 text-pretty">
            Start by getting accredited. The process takes less than 2 minutes and ensures your vote is secure and counted.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/accreditation">
              <Button size="lg" className="bg-white text-primary gap-2.5 px-8 text-base font-semibold hover:bg-white/90 shadow-[0_8px_32px_oklch(0_0_0/0.2)] hover:-translate-y-0.5 transition-all">
                Get Accredited Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/live">
              <Button size="lg" variant="outline" className="gap-2.5 border-white/20 text-white px-8 text-base font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition-all">
                <Radio className="h-4 w-4" />
                View Live Results
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/15">
                <Vote className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground font-serif">BallotBox</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/accreditation" className="hover:text-foreground transition-colors">Accreditation</Link>
              <Link href="/vote" className="hover:text-foreground transition-colors">Vote</Link>
              <Link href="/live" className="hover:text-foreground transition-colors">Live Results</Link>
              <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
            </div>
            <div className="h-px w-full max-w-sm bg-gradient-to-r from-transparent via-border to-transparent" />
            <p className="text-sm text-muted-foreground/60">
              © 2026 BallotBox. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
