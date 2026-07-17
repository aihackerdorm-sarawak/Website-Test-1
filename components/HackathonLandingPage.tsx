"use client";

import { useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { ContentSections } from "./ContentSections";
import { Hero } from "./Hero";
import { PartnerForm } from "./PartnerForm";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

function scrollToId(id: string, reducedMotion: boolean) {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function HackathonLandingPage() {
  const reducedMotion = useReducedMotion() ?? false;

  const navigate = useCallback(
    (id: string) => {
      scrollToId(id, reducedMotion);
    },
    [reducedMotion]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030305] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(0,85,255,0.1),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />

      <div className="relative z-10">
        <SiteHeader onNavigate={navigate} />
        <Hero
          onPrimaryAction={() => navigate("partner-form")}
          onSecondaryAction={() => navigate("partner")}
        />
        <ContentSections />
        <PartnerForm />
        <SiteFooter />
      </div>
    </main>
  );
}
