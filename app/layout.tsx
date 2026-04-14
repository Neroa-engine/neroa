import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neroa",
  description: "Neroa is a premium SaaS workspace for lane-based planning, execution, and AI-guided operating systems."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-transparent text-slate-900 antialiased">{children}</body>
    </html>
  );
}
