"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const CountdownScene = dynamic(
  () => import("./CountdownScene").then((module) => module.CountdownScene),
  {
    ssr: false,
    loading: () => <CountdownPoster />,
  }
);

type QualityTier = "low" | "medium" | "high";

type DeviceProfile = {
  quality: QualityTier;
};

function getDeviceQuality(): QualityTier {
  if (typeof window === "undefined") {
    return "medium";
  }

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const saveData =
    typeof navigator !== "undefined" &&
    "connection" in navigator &&
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  const lowEnd = saveData || cores <= 4 || (coarse && cores <= 6);
  const medium = cores <= 8 || coarse;

  return lowEnd ? "low" : medium ? "medium" : "high";
}

function useDeviceProfile() {
  const [profile] = useState<DeviceProfile>(() => ({ quality: getDeviceQuality() }));

  return profile;
}

function useInView<T extends HTMLElement>(rootMargin = "-12% 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(true);
  const [intersectionRatio, setIntersectionRatio] = useState(1);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        setIsInView(entry.isIntersecting);
        setIntersectionRatio(entry.intersectionRatio);
      },
      { root: null, threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isInView, intersectionRatio };
}

function CountdownPoster() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.14),transparent_34%),radial-gradient(circle_at_bottom,rgba(0,85,255,0.16),transparent_28%),linear-gradient(to_bottom,#050510,#030305_72%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
      <div className="absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-80 w-[42rem] max-w-[82vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/12 bg-cyan-400/5 shadow-[0_0_120px_rgba(0,240,255,0.14)]" />
    </div>
  );
}

export function CountdownHero() {
  const reducedMotion = useReducedMotion() ?? false;
  const { ref, isInView, intersectionRatio } = useInView<HTMLDivElement>();
  const { quality } = useDeviceProfile();
  const opacity = Math.min(1, intersectionRatio / 0.5);

  return (
    <section
      ref={ref}
      id="countdown"
      className="relative min-h-[120svh] overflow-hidden border-b border-white/10 sm:min-h-[100svh]"
    >
      <div className="absolute inset-0 z-0">
        <CountdownScene active={isInView} reducedMotion={reducedMotion} quality={quality} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.12),transparent_30%),radial-gradient(circle_at_50%_75%,rgba(0,85,255,0.14),transparent_24%),linear-gradient(to_bottom,rgba(3,3,5,0.08),rgba(3,3,5,0.7))]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:68px_68px] opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

      <div
        className="pointer-events-none relative z-10 mx-auto flex min-h-[120svh] w-full max-w-7xl flex-col items-center justify-start px-4 pt-10 pb-10 transition-opacity duration-300 sm:min-h-[100svh] sm:px-6 sm:pt-14 lg:px-8 lg:pt-16"
        style={{ opacity }}
      >
        <motion.h1
          initial={reducedMotion ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl text-center text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white"
        >
          Our Hackathon starts in
        </motion.h1>
      </div>
    </section>
  );
}
