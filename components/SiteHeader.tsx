"use client";

import { ArrowRight, MenuSquare } from "lucide-react";

type SiteHeaderProps = {
  onNavigate: (id: string) => void;
};

const navItems = [
  { label: "About", id: "about" },
  { label: "Why Partner", id: "partner" },
  { label: "Timeline", id: "timeline" },
  { label: "Tracks", id: "tracks" },
  { label: "FAQ", id: "faq" },
];

export function SiteHeader({ onNavigate }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030305]/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate("countdown")}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
            <MenuSquare className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.38em] text-gray-500">
              Hackathon
            </span>
            <span className="block text-sm font-semibold text-white">Northstar 2026</span>
          </span>
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-gray-300 transition-colors hover:border-cyan-400/40 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => onNavigate("partner-form")}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#0055ff] px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
        >
          Register
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
