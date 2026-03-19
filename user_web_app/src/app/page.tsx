"use client";

import React from "react";
import { ArrowUpRight, Brain, Laptop, Monitor, ShieldCheck, Smartphone, Sparkles, Trophy } from "lucide-react";

import { useAuth } from "../auth/AuthProvider";
import { MarketingNav } from "../components/layout/MarketingNav";
import { BrandLaunchOverlay } from "../components/marketing/BrandLaunchOverlay";
import { MotionIn } from "../components/motion/MotionIn";
import { ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const features = [
  {
    title: "AI Quiz Generation",
    description: "Generate custom quizzes instantly.",
    icon: Sparkles,
  },
  {
    title: "Adaptive Learning",
    description: "Improve weak topics using smart question selection.",
    icon: Brain,
  },
  {
    title: "Gamified Progress",
    description: "Track learning progress and compete with yourself.",
    icon: Trophy,
  },
];

const steps = [
  {
    title: "Create an account",
    description: "Sign up in seconds and verify your email.",
  },
  {
    title: "Generate quizzes",
    description: "Pick a subject and customize your session.",
  },
  {
    title: "Improve your learning",
    description: "Review results and target weak spots.",
  },
];

const downloads = [
  {
    title: "Android App",
    description: "Install MANABU on your Android device",
    href: "https://github.com/Aviral128/Manabu/releases/download/v1.0/manabu-android.apk",
    buttonLabel: "Download APK",
    status: "Available now",
    icon: Smartphone,
  },
  {
    title: "Windows Desktop",
    description: "Use MANABU as a desktop application",
    href: "https://github.com/Aviral128/Manabu/releases/download/v1.0/manabu-desktop.zip",
    buttonLabel: "Download for Windows",
    status: "Available now",
    icon: Monitor,
  },
  {
    title: "macOS",
    description: "Native Mac app coming soon",
    buttonLabel: "Coming Soon",
    status: "Coming soon",
    icon: Laptop,
  },
];

export default function LandingPage(): JSX.Element {
  const { state } = useAuth();
  const getStartedHref = state.status === "auth" ? "/app/dashboard" : "/signup";

  return (
    <main className="container">
      <BrandLaunchOverlay />
      <MarketingNav />

      <section className="landingHero">
        <MotionIn>
          <div className="landingHeroContent">
            <span className="landingHeroBadge">AI-powered learning</span>
            <h1 className="landingHeroTitle">Learn Faster with AI-Generated Quizzes</h1>
            <p className="landingHeroSubtitle">
              MANABU turns any subject into focused practice sessions, adapts to your weak areas, and keeps your momentum
              visible day after day.
            </p>
            <div className="landingHeroActions">
              <ButtonLink href={getStartedHref}>Get Started</ButtonLink>
              <ButtonLink href="/login" variant="ghost">
                I already have an account
              </ButtonLink>
            </div>
            <div className="landingHeroNote">Works great on web and mobile. No setup required.</div>
          </div>
        </MotionIn>
      </section>

      <section className="landingSection landingDownloadSection">
        <div className="downloadSectionShell">
          <div className="sectionHeader">
            <div className="sectionKicker">Download</div>
            <h2 className="sectionTitle">Get the MANABU App</h2>
            <p className="sectionSubtitle">Access MANABU anywhere — mobile, desktop, and more.</p>
          </div>
          <div className="downloadGrid">
            {downloads.map((item, index) => {
              const Icon = item.icon;

              return (
                <MotionIn key={item.title} delay={0.05 * index}>
                  <Card className={["downloadCard", !item.href ? "downloadCardDisabled" : ""].filter(Boolean).join(" ")}>
                    <div className="downloadCardInner">
                      <div className="downloadCardTop">
                        <div className="downloadIcon">
                          <Icon size={20} />
                        </div>
                        <span className={["downloadStatus", item.href ? "downloadStatusReady" : "downloadStatusSoon"].join(" ")}>
                          {item.status}
                        </span>
                      </div>
                      <div className="downloadCardBody">
                        <h3 className="downloadCardTitle">{item.title}</h3>
                        <p className="downloadCardDescription">{item.description}</p>
                      </div>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="downloadAction downloadActionPrimary"
                        >
                          <span>{item.buttonLabel}</span>
                          <ArrowUpRight size={18} />
                        </a>
                      ) : (
                        <button type="button" className="downloadAction downloadActionDisabled" disabled>
                          {item.buttonLabel}
                        </button>
                      )}
                    </div>
                  </Card>
                </MotionIn>
              );
            })}
          </div>
          <div className="downloadTrustNote">
            <ShieldCheck size={16} />
            <span>Downloads are securely hosted on GitHub Releases</span>
          </div>
        </div>
      </section>

      <section className="landingSection">
        <div className="sectionHeader">
          <div className="sectionKicker">Features</div>
          <h2 className="sectionTitle">Everything you need to learn with momentum</h2>
          <p className="sectionSubtitle">
            Build quizzes fast, get adaptive question flow, and keep progress visible so every session feels purposeful.
          </p>
        </div>
        <div className="featureGrid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <MotionIn key={feature.title} delay={0.05}>
                <Card className="featureCard" style={{ padding: 22 }}>
                  <div className="featureIcon">
                    <Icon size={20} />
                  </div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>{feature.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 14 }}>{feature.description}</div>
                </Card>
              </MotionIn>
            );
          })}
        </div>
      </section>

      <section className="landingSection">
        <div className="sectionHeader">
          <div className="sectionKicker">How it works</div>
          <h2 className="sectionTitle">Three steps to a smarter study loop</h2>
          <p className="sectionSubtitle">Start quickly, practice intentionally, and grow your mastery.</p>
        </div>
        <div className="stepsGrid">
          {steps.map((step, index) => (
            <MotionIn key={step.title} delay={0.04 * index}>
              <Card className="stepCard" style={{ padding: 22 }}>
                <div className="stepBadge">{`0${index + 1}`}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>{step.title}</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>{step.description}</div>
              </Card>
            </MotionIn>
          ))}
        </div>
      </section>

      <section className="ctaSection">
        <div className="sectionKicker">Ready to begin?</div>
        <h2 className="ctaTitle">Start Learning Smarter Today</h2>
        <p className="ctaSubtitle">Create your account and jump straight into a focused quiz session.</p>
        <div className="ctaActions">
          <ButtonLink href={getStartedHref}>Get Started</ButtonLink>
          <ButtonLink href="/login" variant="ghost">
            Log in
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
