import type React from "react"
import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { MobileScrollFix } from "@/components/mobile-scroll-fix"
import { siteConfig, generateRootJsonLd, JsonLdScript } from "@/lib/seo"

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "SynergyCon",
    "SynergyCon 2026",
    "Creative Economy",
    "Nigeria Conference",
    "Tech Conference Nigeria",
    "Innovation Summit",
    "Lagos Conference",
    "Abuja Conference",
    "Port Harcourt Conference",
    "Nigerian Tech",
    "Creative Industry",
    "Digital Arts",
    "Music Conference",
    "Film Conference",
    "Gaming Nigeria",
    "Entrepreneurship",
    "Finesser",
    "The Framework For Brainwork",
  ],
  authors: [{ name: "SynergyCon", url: siteConfig.url }],
  creator: "SynergyCon / Finesser",
  publisher: "SynergyCon",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon.svg", color: "#0A0A0A" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Nigeria's Premier Creative Economy Conference`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: "@synergycon",
    site: "@synergycon",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "en-NG": siteConfig.url,
    },
  },
  category: "conference",
  classification: "Business, Technology, Creative Economy",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynergyCon 2026",
  },
  applicationName: "SynergyCon 2026",
  generator: "finesser.co",
  referrer: "origin-when-cross-origin",
  verification: {
    // Add your verification codes when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  other: {
    "msapplication-TileColor": "#0A0A0A",
    "msapplication-config": "/browserconfig.xml",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0A0A0A",
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
}

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const csrfToken = headersList.get("x-csrf-token") || "";
  const jsonLdData = generateRootJsonLd();

  return (
    <html lang="en">
      <head>
        <meta name="csrf-token" content={csrfToken} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="SynergyCon" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for third-party services */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* JSON-LD Structured Data for Rich Snippets & Sitelinks */}
        <JsonLdScript data={jsonLdData} />
      </head>
      <body className="antialiased" style={{ minHeight: "100dvh" }}>
        <PWAProvider>
          <MobileScrollFix />
          {children}
          <Toaster />
        </PWAProvider>
      </body>
    </html>
  );
}
