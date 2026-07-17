"use client";

const sponsors = [
  "University Partner",
  "Innovation Lab",
  "Cloud Sponsor",
  "Mentor Collective",
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-cyan-200">
              Sponsor strip
            </p>
            <div className="flex flex-wrap gap-3">
              {sponsors.map((sponsor) => (
                <span
                  key={sponsor}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300"
                >
                  {sponsor}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-gray-500">
                Contact
              </p>
              <a
                href="mailto:partnerships@northstarhackathon.dev"
                className="mt-2 block text-lg text-white transition-colors hover:text-cyan-200"
              >
                partnerships@northstarhackathon.dev
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-gray-500">
                Social
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-300">
                <a href="#" className="transition-colors hover:text-white">
                  X / Twitter
                </a>
                <a href="#" className="transition-colors hover:text-white">
                  LinkedIn
                </a>
                <a href="#" className="transition-colors hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
