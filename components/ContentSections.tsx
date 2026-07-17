"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, CalendarDays, Globe2, Handshake, Trophy, Users } from "lucide-react";
import { SectionReveal } from "./SectionReveal";

type StatCard = {
  label: string;
  value: string;
  copy: string;
};

type TimelineItem = {
  title: string;
  date: string;
  copy: string;
};

type TrackItem = {
  title: string;
  copy: string;
};

const aboutStats: StatCard[] = [
  {
    label: "Format",
    value: "Hybrid",
    copy: "In-person energy with a partner-friendly remote track for guests, mentors, and sponsors.",
  },
  {
    label: "Audience",
    value: "Universities + orgs",
    copy: "Built to attract decision-makers, student teams, and community partners in one flow.",
  },
  {
    label: "Outcome",
    value: "Interest capture",
    copy: "The page is optimized to convert attention into registrations and follow-up conversations.",
  },
];

const partnerReasons = [
  {
    icon: Users,
    title: "Talent pipeline",
    copy: "Meet students, faculty, and early-career builders who are already looking for meaningful collaborations.",
  },
  {
    icon: BadgeCheck,
    title: "Brand visibility",
    copy: "Put your organization in the same space as the strongest teams, mentors, and project demos.",
  },
  {
    icon: Handshake,
    title: "Mentor and judge roles",
    copy: "Create a high-trust way to participate without needing a heavy sponsorship activation.",
  },
];

const timeline: TimelineItem[] = [
  {
    title: "Applications open",
    date: "Week 1",
    copy: "Collect universities, student groups, and organizations that want to participate or partner.",
  },
  {
    title: "Partner briefing",
    date: "Week 2",
    copy: "Share sponsorship tiers, mentor slots, judging roles, and event logistics.",
  },
  {
    title: "Hackathon weekend",
    date: "Event day",
    copy: "Teams build, mentors advise, judges review, and partner visibility peaks in the room.",
  },
  {
    title: "Demo + follow-up",
    date: "Post-event",
    copy: "Convert interest into ongoing campus relationships, hiring conversations, and future sponsorships.",
  },
];

const tracks: TrackItem[] = [
  {
    title: "AI for campus operations",
    copy: "Tools that streamline admin, scheduling, student engagement, or accessibility.",
  },
  {
    title: "Climate and civic systems",
    copy: "Public-good projects for transportation, resilience, sustainability, and local services.",
  },
  {
    title: "Builder productivity",
    copy: "Developer tools, workflow accelerators, and experiment-heavy prototypes with real utility.",
  },
];

const faqs = [
  {
    question: "Who should register interest?",
    answer:
      "Universities, student organizations, companies, nonprofits, and community groups that want to attend, mentor, sponsor, or partner.",
  },
  {
    question: "Is this only for students?",
    answer:
      "No. The page is intentionally written for both students and decision-makers so organizations can move from curiosity to contact quickly.",
  },
  {
    question: "Can the event be hybrid?",
    answer:
      "Yes. The information architecture explicitly supports a hybrid format with in-person and remote partner participation.",
  },
  {
    question: "What happens after submission?",
    answer:
      "Your request enters the contact endpoint, which can be wired to email, CRM, Slack, or a registration backend in one place.",
  },
];

function SectionHeader({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cyan-200">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">{copy}</p>
    </div>
  );
}

export function ContentSections() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <SectionReveal id="about" className="scroll-mt-28">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
          <SectionHeader
            eyebrow="About"
            title="What is Northstar Hackathon?"
            copy="Northstar Hackathon is a partner-first build event designed to bring local universities and organizations into the same room. It focuses on high-energy collaboration, visible outcomes, and a path to real follow-up after the event."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {aboutStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{stat.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal id="partner" className="scroll-mt-28" delay={reducedMotion ? 0 : 0.04}>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
          <SectionHeader
            eyebrow="Why Partner"
            title="Built to convert decision-makers, not just attendees."
            copy="This section speaks to the people who can actually green-light collaboration: university administrators, innovation teams, nonprofits, and local companies looking for a meaningful presence."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {partnerReasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={reason.title}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{reason.copy}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Tiered sponsorship", "Offer simple options for visibility, mentoring, or deeper activation."],
              ["Judging access", "Invite organizations to help evaluate strong submissions and meet builders directly."],
              ["Campus reach", "Create a repeatable relationship with student groups and academic leaders."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-base font-semibold text-white">{title}</div>
                <p className="mt-2 text-sm leading-6 text-gray-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal id="timeline" className="scroll-mt-28" delay={reducedMotion ? 0 : 0.08}>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
          <SectionHeader
            eyebrow="Timeline"
            title="A quick schedule that makes the event feel real."
            copy="Use a concise timeline to show momentum and help partners understand when they should respond, join, and prepare."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {timeline.map((item, index) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-gray-500">
                    {item.date}
                  </p>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{item.copy}</p>
                <div className="mt-4 h-px bg-white/10" />
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gray-500">
                  Step {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal id="tracks" className="scroll-mt-28" delay={reducedMotion ? 0 : 0.12}>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
          <SectionHeader
            eyebrow="Tracks and prizes"
            title="Give teams a creative direction without constraining the energy."
            copy="Tracks and prizes make the event easier to understand for partners while giving teams a sharper reason to build."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
            <div className="grid gap-4">
              {tracks.map((track) => (
                <div key={track.title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{track.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{track.copy}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Prize structure</h3>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    "Best University Team",
                    "Best Partner Collaboration",
                    "Most Practical Prototype",
                    "People's Choice",
                  ].map((prize) => (
                    <div
                      key={prize}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300"
                    >
                      {prize}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Partner use cases</h3>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-gray-400">
                  <p>- Recruit students and early-career talent through direct interaction.</p>
                  <p>- Offer mentors, judges, and speakers without building a large activation.</p>
                  <p>- Keep the event useful for the university even if sponsorship is light.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal id="faq" className="scroll-mt-28" delay={reducedMotion ? 0 : 0.16}>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
          <SectionHeader
            eyebrow="FAQ"
            title="Make the final objections easy to resolve."
            copy="Short answers remove friction and help partners move from curiosity to action."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-white outline-none">
                  <span className="flex items-center justify-between gap-3">
                    <span>{faq.question}</span>
                    <span className="text-cyan-200 transition-transform">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-gray-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
