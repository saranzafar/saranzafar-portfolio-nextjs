import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const poppins = localFont({
  src: [
    { path: "./fonts/poppins/poppins-v23-latin-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins/poppins-v23-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins/poppins-v23-latin-500italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/poppins/poppins-v23-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins/poppins-v23-latin-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://saranzafar.vercel.app"),
  title: {
    default: "Saran Zafar - Software Engineer & Developer",
    template: "%s | Saran Zafar",
  },
  description:
    "Full-stack software engineer specializing in Next.js, React, Node.js, Electron.js, React Native, Django, and Vue. Explore my projects, articles, and skills.",
  keywords: [
    "Saran Zafar",
    "saranzafar",
    "SARAN ZAFAR",
    "software engineer",
    "full stack developer",
    "Next.js developer",
    "React developer",
    "Django developer",
    "Node.js developer",
    "React Native developer",
    "Electron.js",
    "portfolio",
    "nextjs portfolio",
    "saran portfolio",
    "saran zafar portfolio",
    "saranzafar portfolio",
  ],
  applicationName: "Saran Zafar",
  authors: [{ name: "Saran Zafar", url: "https://saranzafar.com" }],
  creator: "Saran Zafar",
  publisher: "Saran Zafar",
  alternates: {
    canonical: "/", // Per-page canonical should override in generateMetadata
  },
  openGraph: {
    title: "Saran Zafar - Software Engineer & Full Stack Developer",
    description:
      "Full-stack software engineer specializing in Next.js, React, Node.js, Electron.js, React Native, and Vue. Explore my projects, articles, and skills.",
    url: "https://saranzafar.com/",
    siteName: "Saran Zafar Portfolio",
    images: [
      {
        url: "/og.png", // Prefer a branded 1200x630 image in /public
        width: 1200,
        height: 630,
        alt: "Saran Zafar Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saran Zafar - Software Engineer & Full Stack Developer",
    description:
      "Full-stack software engineer specializing in Next.js, React, Node.js, Electron.js, React Native, and Vue. Explore my projects, articles, and skills.",
    images: ["/og.png"],
    creator: "@", // add your handle if you have one
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  referrer: "strict-origin-when-cross-origin",
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  // Optional: add verification once you connect Search Console, etc.
  verification: { google: "XXXXXXXXX" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a", // matches dark theme
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased scroll-smooth">
      <body className={poppins.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
