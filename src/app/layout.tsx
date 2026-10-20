import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Al-Madinah Tour & Travel | Penyelenggara Umroh & Haji Khusus Resmi",
  description: "Platform Resmi Penyelenggara Perjalanan Ibadah Umroh & Haji Khusus Terakreditasi Kemenag RI dengan Hotel Bintang 5 dan Bimbingan Terpercaya.",
  keywords: ["umroh", "haji khusus", "travel umroh resmi", "paket umroh jakarta", "al madinah travel"],
  authors: [{ name: "Al-Madinah Travel" }],
  openGraph: {
    title: "Al-Madinah Tour & Travel | Umroh & Haji Khusus",
    description: "Penyelenggara Perjalanan Ibadah Umroh dan Haji Khusus Resmi Berizin Kemenag RI.",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d7a64",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const snapUrl =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased font-sans scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
        <Script
          src={snapUrl}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
