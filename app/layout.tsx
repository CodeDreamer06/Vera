import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeBoot } from "@/components/layout/ThemeBoot";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vera Command Center",
  description:
    "Offline-first hydroponic command center with LLM-powered plant intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
      >
        <ThemeBoot />
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
