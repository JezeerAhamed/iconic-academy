import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ICONIC ACADEMY – AI-Powered A/L Learning Platform",
    template: "%s | ICONIC ACADEMY",
  },
  description:
    "Sri Lanka's most advanced A/L learning platform. Master Physics, Chemistry, Biology & Combined Maths with AI-powered tutoring, past papers, and structured learning paths.",
  keywords: [
    "A/L Sri Lanka",
    "Advanced Level",
    "Physics",
    "Chemistry",
    "Biology",
    "Combined Maths",
    "AI Tutor",
    "Iconic Academy",
    "Sri Lanka education",
    "exam preparation",
  ],
  authors: [{ name: "Iconic Academy" }],
  creator: "Iconic Academy",
  openGraph: {
    type: "website",
    locale: "en_LK",
    title: "ICONIC ACADEMY – AI-Powered A/L Learning Platform",
    description: "Master Sri Lankan A/L subjects with AI-powered tutoring and structured learning.",
    siteName: "ICONIC ACADEMY",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICONIC ACADEMY",
    description: "Sri Lanka's #1 AI-powered A/L learning platform.",
  },
};

export const viewport: Viewport = {
  themeColor: "#080c14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} antialiased bg-[#080c14] text-slate-100`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f1623',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
