"use client";

import React from "react";
import {
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Laptop,
  LoaderCircle,
  Monitor,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
} from "lucide-react";

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
    id: "android",
    title: "Android App",
    description: "Install MANABU on your Android device",
    href: "https://github.com/Aviral128/Manabu/releases/download/v1.0/manabu-android.apk",
    buttonLabel: "Download APK",
    status: "Available now",
    fileInfo: "APK • ~25 MB",
    installHint: "Enable unknown sources before installing",
    icon: Smartphone,
  },
  {
    id: "windows",
    title: "Windows Desktop",
    description: "Use MANABU as a desktop application",
    href: "https://github.com/Aviral128/Manabu/releases/download/v1.0/manabu-desktop-windows.zip",
    buttonLabel: "Download for Windows",
    status: "Available now",
    fileInfo: "ZIP • ~150 MB",
    installHint: "Extract ZIP and run the app",
    icon: Monitor,
  },
  {
    id: "macos",
    title: "macOS",
    description: "Run MANABU on your Mac device",
    href: "https://github.com/Aviral128/Manabu/releases/download/v1.0/manabu-desktop-macos.zip",
    buttonLabel: "Download for macOS",
    status: "Available now",
    fileInfo: "ZIP • ~160 MB",
    installHint: "Extract ZIP and run the app",
    icon: Laptop,
  },
];

const trustSignals = [
  "Secure download via GitHub",
  "No viruses / open-source safe",
  "Free to use",
] as const;

export default function LandingPage(): JSX.Element {
  const { state } = useAuth();
  const getStartedHref = state.status === "auth" ? "/app/dashboard" : "/signup";
  const [recommendedPlatform, setRecommendedPlatform] = React.useState<string | null>(null);
  const [startingDownloadId, setStartingDownloadId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof navigator === "undefined") return;

    const userAgent = navigator.userAgent;
    if (/Android/i.test(userAgent)) {
      setRecommendedPlatform("android");
      return;
    }

    if (/Mac/i.test(userAgent)) {
      setRecommendedPlatform("macos");
      return;
    }

    if (/Win/i.test(userAgent)) {
      setRecommendedPlatform("windows");
      return;
    }

    setRecommendedPlatform(null);
  }, []);

  React.useEffect(() => {
    if (!startingDownloadId) return undefined;

    const timeout = window.setTimeout(() => {
      setStartingDownloadId(null);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [startingDownloadId]);

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
              const isRecommended = recommendedPlatform === item.id;
              const isStartingDownload = startingDownloadId === item.id;

              return (
                <MotionIn key={item.title} delay={0.05 * index}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={["downloadCardLink", isRecommended ? "downloadCardLinkRecommended" : ""].filter(Boolean).join(" ")}
                    onClick={() => setStartingDownloadId(item.id)}
                    aria-label={`${item.buttonLabel} for ${item.title}`}
                  >
                    <Card className={["downloadCard", isRecommended ? "downloadCardRecommended" : ""].filter(Boolean).join(" ")}>
                      <div className="downloadCardInner">
                        <div className="downloadCardTop">
                          <div className="downloadIcon">
                            <Icon size={20} />
                          </div>
                          <div className="downloadBadgeGroup">
                            {isRecommended ? (
                              <span className="downloadStatus downloadStatusRecommended">Recommended for your device</span>
                            ) : null}
                            <span className="downloadStatus downloadStatusReady">{item.status}</span>
                          </div>
                        </div>
                        <div className="downloadCardBody">
                          <h3 className="downloadCardTitle">{item.title}</h3>
                          <p className="downloadCardDescription">{item.description}</p>
                        </div>
                        <div className="downloadCardFooter">
                          <span
                            className={[
                              "downloadAction",
                              isRecommended ? "downloadActionPrimary" : "downloadActionSecondary",
                              isStartingDownload ? "downloadActionLoading" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {isStartingDownload ? <LoaderCircle size={18} className="downloadSpinner" /> : <ArrowUpRight size={18} />}
                            <span>{isStartingDownload ? "Starting download..." : item.buttonLabel}</span>
                          </span>
                          <div className="downloadFileInfo">{item.fileInfo}</div>
                          <div className="downloadInstallHint">{item.installHint}</div>
                        </div>
                      </div>
                    </Card>
                  </a>
                </MotionIn>
              );
            })}
          </div>
          <div className="downloadTrustPanel">
            <div className="downloadTrustNote">
              <ShieldCheck size={16} />
              <span>Downloads are securely hosted via GitHub Releases</span>
            </div>
            <div className="downloadTrustGrid">
              {trustSignals.map((signal) => (
                <div key={signal} className="downloadTrustItem">
                  <CheckCircle2 size={16} />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
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
