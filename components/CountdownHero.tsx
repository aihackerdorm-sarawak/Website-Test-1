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
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeightPx, setHeaderHeightPx] = useState(0);
  const opacity = Math.min(1, intersectionRatio / 0.5);

  useEffect(() => {
    const element = headerRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const update = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setHeaderHeightPx(entry.contentRect.height);
    };

    setHeaderHeightPx(element.getBoundingClientRect().height);
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="countdown"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden border-b border-white/10 px-4 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 z-0">
        <CountdownScene
          active={isInView}
          reducedMotion={reducedMotion}
          quality={quality}
          headerHeightPx={headerHeightPx}
        />
      </div>

      <motion.div
        aria-hidden="true"
        animate={
          reducedMotion
            ? undefined
            : {
                opacity: [0.84, 1, 0.84],
                scale: [1, 1.02, 1],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.12),transparent_30%),radial-gradient(circle_at_50%_75%,rgba(0,85,255,0.14),transparent_24%),linear-gradient(to_bottom,rgba(3,3,5,0.08),rgba(3,3,5,0.7))]"
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:68px_68px] opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

      <div
        className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4 py-10 text-center transition-opacity duration-300 sm:py-12 lg:py-14"
        style={{ opacity }}
      >
        <div ref={headerRef} className="flex flex-col items-center gap-4">
          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl text-center text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.18)]"
          >
            Our Hackathon starts in
          </motion.h1>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.34em] text-cyan-100 backdrop-blur-md sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.85)]" />
              Countdown active
            </div>
            <div className="h-px w-28 bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.7),transparent)] opacity-80" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
