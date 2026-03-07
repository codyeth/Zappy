import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const BASE =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://zappy.games").replace(/\/$/, "") +
  (process.env.NEXT_PUBLIC_BASE_PATH ?? "");

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: "Zappy — Play Free Games Online",
  description: "Play hundreds of free HTML5 games directly in your browser. No download, no install. Action, Puzzle, Casual, Racing and more!",
  keywords: ["free games", "online games", "html5 games", "browser games", "casual games"],
  openGraph: {
    title: "Zappy — Play Free Games Online",
    description: "Play hundreds of free HTML5 games directly in your browser.",
    type: "website",
    url: "/",
    siteName: "Zappy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zappy — Play Free Games Online",
    description: "Play hundreds of free HTML5 games directly in your browser.",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
