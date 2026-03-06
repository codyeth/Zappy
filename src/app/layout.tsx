import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zappy — Play Free Games Online",
  description: "Play hundreds of free HTML5 games directly in your browser. No download, no install. Action, Puzzle, Casual, Racing and more!",
  keywords: ["free games", "online games", "html5 games", "browser games", "casual games"],
  openGraph: {
    title: "Zappy — Play Free Games Online",
    description: "Play hundreds of free HTML5 games directly in your browser.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
