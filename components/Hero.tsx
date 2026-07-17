"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroScene = dynamic(
  () => import("./HeroScene").then((module) => module.HeroScene),
  {
    ssr: false,
    loading: () => <HeroPoster />,
  }
);

type QualityTier = "low" | "medium" | "high";

type HeroProps = {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
};

type DeviceProfile = {
  quality: QualityTier;
};

function useDeviceProfile() {
  const [profile, setProfile] = useState<DeviceProfile>({ quality: "medium" });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const saveData =
      typeof navigator !== "undefined" &&
      "connection" in navigator &&
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const lowEnd = saveData || cores <= 4 || (coarse && cores <= 6);
    const medium = cores <= 8 || coarse;

    setProfile({
      quality: lowEnd ? "low" : medium ? "medium" : "high",
    });
  }, []);

  return profile;
}

function useInView<T extends HTMLElement>(rootMargin = "-12% 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries.some((entry) => entry.isIntersecting));
      },
      { root: null, threshold: 0.12, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isInView };
}

function HeroPoster() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(0,85,255,0.16),transparent_28%),linear-gradient(to_bottom,#050510,#030305_72%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60" />
      <div className="absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15 bg-cyan-400/5 shadow-[0_0_120px_rgba(0,240,255,0.14)]" />
    </div>
  );
}

function renderHeadline(text: string, reducedMotion: boolean) {
  if (reducedMotion) {
    return text;
  }

  return text.split("").map((char, index) => (
    <motion.span
      key={`${char}-${index}`}
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, delay: 0.28 + index * 0.015, ease: [0.16, 1, 0.3, 1] }}
      className={char === " " ? "inline-block w-[0.28em]" : "inline-block"}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  ));
}

export function Hero({ onPrimaryAction, onSecondaryAction }: HeroProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const { ref, isInView } = useInView<HTMLDivElement>();
  const { quality } = useDeviceProfile();
  const [typedStatus, setTypedStatus] = useState(
    reducedMotion ? "// INITIALIZING NETWORK BRIDGE" : ""
  );
  const statusText = useMemo(() => "// INITIALIZING NETWORK BRIDGE", []);

  useEffect(() => {
    if (reducedMotion) {
      setTypedStatus(statusText);
      return;
    }

    let index = 0;
    let intervalId: number | undefined;
    const startDelay = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setTypedStatus(statusText.slice(0, index));
        if (index >= statusText.length) {
          if (intervalId) {
            window.clearInterval(intervalId);
          }
        }
      }, 28);
    }, 160);

    return () => {
      window.clearTimeout(startDelay);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [reducedMotion, statusText]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-[100svh] overflow-hidden border-b border-white/10"
    >
      <div className="absolute inset-0 z-0">
        <HeroScene active={isInView} reducedMotion={reducedMotion} quality={quality} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.14),transparent_30%),radial-gradient(circle_at_50%_75%,rgba(0,85,255,0.14),transparent_24%),linear-gradient(to_bottom,rgba(3,3,5,0.08),rgba(3,3,5,0.76))]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:68px_68px] opacity-50 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none flex items-start justify-between gap-4">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-400/10 text-cyan-200">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.34em] text-gray-500">
                Northstar Hackathon
              </div>
              <div className="text-sm text-white">Partner-first registration</div>
            </div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.32em] text-gray-300 backdrop-blur-md md:block"
          >
            {typedStatus || " "}
          </motion.div>
        </div>

        <div className="grid items-center gap-10 pb-8 pt-10 lg:grid-cols-[0.95fr_1.05fr] lg:pb-12 lg:pt-0">
          <div className="pointer-events-none space-y-8">
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-200 backdrop-blur-md">
              // Connecting campuses, companies, and communities
            </div>

            <div className="max-w-3xl space-y-5">
              <p className="max-w-xl font-mono text-[11px] uppercase tracking-[0.5em] text-gray-500">
                Hybrid hackathon launch site
              </p>
              <h1 className="max-w-5xl text-[clamp(2.5rem,7vw,5.75rem)] font-bold uppercase leading-[0.95] tracking-[-0.05em] text-white [word-break:keep-all] [overflow-wrap:normal] sm:text-[clamp(2.75rem,6.4vw,5.75rem)] lg:max-w-5xl">
                {renderHeadline("Build the campus launchpad", reducedMotion)}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-gray-400 sm:text-base lg:text-lg">
                Immersive WebGL for the first impression, then a focused scroll path that turns
                partner interest into registrations.
              </p>
            </div>

            <div className="pointer-events-auto flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#0055ff] px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Register Your Team
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onSecondaryAction}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400/40 hover:bg-white/10"
              >
                Partner With Us
              </button>
            </div>

            <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["Fall 2026", "target window"],
                ["Hybrid", "format"],
                ["60fps", "mobile target"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-md"
                >
                  <div className="font-mono text-lg text-white">{value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-gray-500">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto relative"
          >
            <div className="pointer-events-none absolute inset-[-20%] -z-10 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.78),rgba(0,0,0,0.36)_52%,transparent_78%)] blur-2xl" />
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_0_90px_rgba(0,240,255,0.08)] backdrop-blur-md sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-200">
                    Live registration
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Secure your slot before the wave fills up.
                  </h2>
                </div>

                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">
                  active
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Sponsor visibility",
                    copy: "Get your logo, mentor slot, and judging presence in front of students and faculty.",
                  },
                  {
                    title: "Talent pipeline",
                    copy: "Meet builders who are already shipping, collaborating, and looking for the next challenge.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="text-base font-semibold text-white">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{item.copy}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gray-500">
                  Tip
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  The hero canvas is paused when it leaves the viewport so the rest of the page
                  keeps its frame budget.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
