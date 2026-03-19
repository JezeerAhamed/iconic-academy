import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";
import TopNavbar from "@/components/layout/TopNavbar";
import { baseMetadata } from "@/lib/seo";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = baseMetadata;

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
