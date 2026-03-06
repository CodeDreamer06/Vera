import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { LocaleBoot } from "@/components/layout/LocaleBoot";
import { ThemeBoot } from "@/components/layout/ThemeBoot";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "VERA // NEO_BRUTALIST_V2.0",
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
        <LocaleBoot />
        {children}
        <Toaster theme="light" position="top-right" richColors />
      </body>
    </html>
  );
}
