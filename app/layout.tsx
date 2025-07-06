import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import localFont from "next/font/local"
import { SpeedInsights } from "@vercel/speed-insights/next"

// const inter = Inter({ subsets: ["latin"], display: "swap" })

const poppins = localFont({
  src: [
    {
      path: "./fonts/poppins/poppins-v23-latin-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/poppins/poppins-v23-latin-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/poppins/poppins-v23-latin-500italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/poppins/poppins-v23-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/poppins/poppins-v23-latin-700.woff2",
      weight: "700",
      style: "normal",
    },
    // add more weights/styles as you like…
  ],
  display: "swap",
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://saranzafar.vercel.app'),
  title: {
    default: 'Saran Zafar - Software Engineer & Developer',
    template: '%s | Saran Zafar',
  },
  description: 'Saran Zafar is a full-stack software engineer and developer specializing in Next.js, React, Node.js, Electron.js, React Native, Vue.js and mobile app development. Explore my projects and skills.',
  keywords: ['saran', 'saran zafar', 'saranzafar', 'software engineer', 'saran software engineer', 'saran developer', 'full stack developer', 'web developer', 'react developer', 'nextjs developer', 'node.js developer', 'react native developer', 'portfolio'],
  openGraph: {
    title: 'Saran Zafar - Full Stack Software Engineer & Developer Portfolio',
    description: 'Saran Zafar is a full-stack software engineer and developer specializing in Next.js, React, Node.js, Electron.js, React Native, Vue.js and mobile app development. Explore my projects and skills.',
    url: 'https://saranzafar.vercel.app',
    siteName: 'Saran Zafar Portfolio',
    images: [
      {
        url: 'https://yourportfolio.com/og-image.jpg', // Path to your Open Graph image (e.g., a professional headshot or a branded image)
        width: 1200,
        height: 630,
        alt: 'Saran Zafar Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark antialiased scroll-smooth">
      <body className={poppins.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
