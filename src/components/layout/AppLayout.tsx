"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ScrollToTop from "./ScrollToTop";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Header onMenuToggle={() => setMobileMenuOpen((v) => !v)} />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile as drawer */}
      <div
        className={cn(
          "md:block",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen bg-gray-50",
          "pt-[60px]",
          "md:pl-[60px]",   // tablet: icon-only sidebar
          "lg:pl-[220px]",  // desktop: full sidebar
        )}
      >
        <div className="p-5 md:p-6">
          {children}
        </div>
      </main>
      <ScrollToTop />
    </>
  );
}
