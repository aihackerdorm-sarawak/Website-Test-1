import { NextResponse } from "next/server";

type ContactPayload = {
  fullName: string;
  email: string;
  organization: string;
  organizationType: "University" | "Company" | "Nonprofit" | "Other";
  role: string;
  message: string;
};

const allowedTypes: ContactPayload["organizationType"][] = [
  "University",
  "Company",
  "Nonprofit",
  "Other",
];

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<ContactPayload>;

  const requiredFields: Array<keyof ContactPayload> = [
    "fullName",
    "email",
    "organization",
    "organizationType",
    "role",
  ];

  const hasMissingField = requiredFields.some((field) => {
    const value = payload[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (
    hasMissingField ||
    !allowedTypes.includes(payload.organizationType as ContactPayload["organizationType"])
  ) {
    return NextResponse.json(
      { ok: false, message: "Missing or invalid contact data." },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 450));

  return NextResponse.json({
    ok: true,
    message: "Registration request received.",
  });
}
