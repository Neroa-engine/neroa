import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neroa",
  description:
    "Neroa is a premium product-building platform for strategy, roadmap, preview, inspection, approvals, and guided execution."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060816] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
