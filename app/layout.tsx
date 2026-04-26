import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

// ─── Promise.try Polyfill (Type-Safe Version) ──────────────────────────────
// এটি Clerk বা অন্যান্য লাইব্রেরির 'Promise.try is not a function' এররটি ফিক্স করবে।

declare global {
  interface PromiseConstructor {
    try<T, U extends unknown[]>(
      callbackFn: (...args: U) => T | PromiseLike<T>,
      ...args: U
    ): Promise<Awaited<T>>;
  }
}

if (typeof Promise.try !== "function") {
  Promise.try = function <T, U extends unknown[]>(
    callbackFn: (...args: U) => T | PromiseLike<T>,
    ...args: U
  ): Promise<Awaited<T>> {
    return new Promise((resolve, reject) => {
      try {
        // এখানে সরাসরি ফাংশনটি কল করা হচ্ছে যা টাইপ-সেফ
        resolve(callbackFn(...args) as Awaited<T>);
      } catch (error) {
        reject(error);
      }
    });
  };
}

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
        <body 
          className="min-h-screen flex flex-col bg-background text-foreground"
          suppressHydrationWarning
        >
          {children}
          <Toaster richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}