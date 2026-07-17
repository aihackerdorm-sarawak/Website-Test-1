import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css"

export const metadata: Metadata = {
  title: "Northstar Hackathon",
  description:
    "A high-conversion hackathon landing page built for universities, organizations, and partner outreach.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#030305] text-white antialiased">{children}</body>
    </html>
  );
}
