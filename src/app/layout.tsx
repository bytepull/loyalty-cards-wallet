import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loyalty Cards Wallet",
  applicationName: "Loyalty",
  description: "Simple Loyalty Cards Wallet",
  manifest: "/manifest",
  authors: {
    name: "Bytepull",
    url: "Uhttps://github.com/bytepull",
  },
  generator: "Next.js",
  appleWebApp: {
    // https://nextjs.org/docs/app/api-reference/functions/generate-metadata#applewebapp
    title: "Loyalty",
    capable: true,
    statusBarStyle: "black",
    startupImage: {
      url: "/icon1.png",
      media:
        "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
    },
  },
  icons: {
    icon: {
      type: "image/ico",
      sizes: "48x48",
      rel: "icon",
      url: "/favicon.ico",
    },
    // shortcut: "/favicon.ico",
    apple: {
      type: "image/png",
      sizes: "192x192",
      rel: "apple-touch-icon",
      url: "/apple-icon.png",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen w-screen">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiase w-full h-full app`}
      >
        {children}
      </body>
    </html>
  );
}
