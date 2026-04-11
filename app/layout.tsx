import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hirepilot.ai"),
  title: {
    default: "HirePilot – AI Interview & Career Coach",
    template: "%s | HirePilot",
  },
  description:
    "AI-powered mock interviews, resume optimization, and career growth tools for modern job seekers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-screen flex flex-col bg-background text-foreground">
          {children}
          <Toaster richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}