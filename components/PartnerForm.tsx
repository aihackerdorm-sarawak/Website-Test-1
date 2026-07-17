"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, TriangleAlert } from "lucide-react";
import { SectionReveal } from "./SectionReveal";

type OrganizationType = "University" | "Company" | "Nonprofit" | "Other";

type PartnerFormValues = {
  fullName: string;
  email: string;
  organization: string;
  organizationType: OrganizationType;
  role: string;
  message: string;
};

type PartnerFormErrors = Partial<Record<keyof PartnerFormValues, string>>;

type SubmitStatus = "idle" | "loading" | "success" | "error";

const initialValues: PartnerFormValues = {
  fullName: "",
  email: "",
  organization: "",
  organizationType: "University",
  role: "",
  message: "",
};

const organizationTypes: OrganizationType[] = ["University", "Company", "Nonprofit", "Other"];

function validate(values: PartnerFormValues): PartnerFormErrors {
  const errors: PartnerFormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.fullName.trim()) errors.fullName = "Please add a contact name.";
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.organization.trim()) errors.organization = "Organization name is required.";
  if (!values.role.trim()) errors.role = "Tell us your role or title.";

  return errors;
}

export function PartnerForm() {
  const reducedMotion = useReducedMotion() ?? false;
  const [values, setValues] = useState<PartnerFormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof PartnerFormValues, boolean>>>({});
  const [errors, setErrors] = useState<PartnerFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const isDisabled = useMemo(() => status === "loading", [status]);

  const submitEndpoint = "/api/contact";
  // Wire this single endpoint to your real CRM, email service, or webhook.

  const updateValue = <K extends keyof PartnerFormValues>(field: K, value: PartnerFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
  };

  const markTouched = (field: keyof PartnerFormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const getFieldError = (field: keyof PartnerFormValues) => {
    return touched[field] ? errors[field] : undefined;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({
      fullName: true,
      email: true,
      organization: true,
      organizationType: true,
      role: true,
      message: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setStatusMessage("Please fix the highlighted fields and try again.");
      return;
    }

    setStatus("loading");
    setStatusMessage("Submitting your interest...");

    try {
      const response = await fetch(submitEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Submission failed.");
      }

      setStatus("success");
      setStatusMessage("Thanks. Your interest request has been received.");
      setValues(initialValues);
      setTouched({});
      setErrors({});
    } catch {
      setStatus("error");
      setStatusMessage("Something went wrong. Please try again in a moment.");
    }
  };

  const inputClassName =
    "h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-cyan-400 focus:bg-black/40 focus:shadow-[0_0_0_4px_rgba(0,240,255,0.12)]";

  return (
    <SectionReveal id="partner-form" className="scroll-mt-28" delay={reducedMotion ? 0 : 0.08}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cyan-200">
              Partner & Registration Form
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Capture the conversation while intent is high.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
              This is the conversion point. Keep the form short, validate inline, and send the
              submission to one real endpoint so the data lands somewhere useful.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">Single integration point</p>
                    <p className="text-sm text-gray-400">
                      POST the payload to <code className="font-mono text-cyan-200">/api/contact</code>{" "}
                      or swap the endpoint for your preferred CRM/webhook.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-base font-semibold text-white">What gets captured</p>
                <div className="mt-3 grid gap-2 text-sm text-gray-400">
                  <p>- Full name and role/title</p>
                  <p>- Organization name and type</p>
                  <p>- Contact email for follow-up</p>
                  <p>- Optional message for partnership details</p>
                </div>
              </div>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8"
          >
            <div
              className={`mb-5 rounded-3xl border px-4 py-3 ${
                status === "success"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                  : status === "error"
                    ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
                    : "border-white/10 bg-black/20 text-gray-300"
              }`}
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-sm">
                {status === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : status === "error" ? (
                  <TriangleAlert className="h-4 w-4" />
                ) : null}
                <span>{statusMessage || "All fields marked with an asterisk are required."}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full name"
                value={values.fullName}
                error={getFieldError("fullName")}
                onBlur={() => markTouched("fullName")}
                onChange={(value) => updateValue("fullName", value)}
                placeholder="Jordan Lee"
                className={inputClassName}
              />
              <Field
                label="Email"
                value={values.email}
                error={getFieldError("email")}
                onBlur={() => markTouched("email")}
                onChange={(value) => updateValue("email", value)}
                placeholder="jordan@school.edu"
                className={inputClassName}
                type="email"
              />
              <Field
                label="Organization"
                value={values.organization}
                error={getFieldError("organization")}
                onBlur={() => markTouched("organization")}
                onChange={(value) => updateValue("organization", value)}
                placeholder="North Valley University"
                className={inputClassName}
              />
              <Field
                label="Role / title"
                value={values.role}
                error={getFieldError("role")}
                onBlur={() => markTouched("role")}
                onChange={(value) => updateValue("role", value)}
                placeholder="Innovation lead"
                className={inputClassName}
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">Organization type</label>
                <select
                  value={values.organizationType}
                  onChange={(event) =>
                    updateValue("organizationType", event.target.value as OrganizationType)
                  }
                  onBlur={() => markTouched("organizationType")}
                  className={inputClassName}
                >
                  {organizationTypes.map((item) => (
                    <option key={item} value={item} className="bg-slate-950">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  Message <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={values.message}
                  onChange={(event) => updateValue("message", event.target.value)}
                  onBlur={() => markTouched("message")}
                  placeholder="Tell us what you're looking for, who should attend, or how you'd like to partner."
                  rows={5}
                  className="min-h-36 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-cyan-400 focus:bg-black/40 focus:shadow-[0_0_0_4px_rgba(0,240,255,0.12)]"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="submit"
                disabled={isDisabled}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#0055ff] px-6 text-sm font-semibold text-slate-950 transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit interest"
                )}
              </button>

              <p className="self-center text-xs leading-6 uppercase tracking-[0.24em] text-gray-500">
                Client validation, success state, and one backend handoff
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </SectionReveal>
  );
}

function Field({
  label,
  value,
  error,
  onBlur,
  onChange,
  placeholder,
  className,
  type = "text",
}: {
  label: string;
  value: string;
  error?: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-300">
        {label}
        <span className="text-gray-500"> *</span>
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`${className} ${error ? "border-rose-400/70 focus:border-rose-400" : ""}`}
      />
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </label>
  );
}
