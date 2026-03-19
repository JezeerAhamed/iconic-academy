import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";
import TopNavbar from "@/components/layout/TopNavbar";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ICONIC ACADEMY — Sri Lanka's A/L Learning Platform",
    template: "%s | ICONIC ACADEMY",
  },
  description:
    "Sri Lanka's A/L learning platform for Physics, Chemistry, Biology, and Combined Maths with AI tutoring, past papers, and structured exam preparation.",
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
    title: "ICONIC ACADEMY — Sri Lanka's A/L Learning Platform",
    description:
      "Master Sri Lankan A/L subjects with AI tutoring, past papers, and structured learning paths built for the local syllabus.",
    siteName: "ICONIC ACADEMY",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Iconic Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ICONIC ACADEMY",
    description:
      "Sri Lanka's A/L learning platform built for Physics, Chemistry, Biology, and Combined Maths.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
    <html lang="en" className={sourceSans.variable} suppressHydrationWarning>
      <body className={`${sourceSans.className} antialiased`}>
        <Providers>
          <TopNavbar />
          <main className="min-h-screen bg-white">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                color: "#1F1F1F",
                border: "1px solid #E0E0E0",
                borderRadius: "8px",
                fontSize: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
