"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, Heart, User, Menu, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, signOut, openAuthModal } = useAuth();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white border-b border-gray-200 flex items-center px-4 gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-400 rounded-lg flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
            Zappy
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-[560px] mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games and categories"
            className={cn(
              "w-full h-10 pl-4 pr-10 rounded-full",
              "bg-gray-100 border border-transparent",
              "text-sm text-gray-800 placeholder:text-gray-400",
              "focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 focus:bg-white",
              "transition-all duration-150"
            )}
          />
          <Search
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
            3
          </span>
        </button>

        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Heart size={20} />
        </button>

        {!loading && (
          <>
            {user && profile ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-gray-100 transition-colors"
                >
                  {(profile.avatarUrl ?? (user?.user_metadata?.picture || user?.user_metadata?.avatar_url)) ? (
                    // eslint-disable-next-line @next/next/no-img-element -- avatar from profile or Google/OAuth
                    <img
                      src={profile.avatarUrl ?? user?.user_metadata?.picture ?? user?.user_metadata?.avatar_url ?? ""}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <User size={16} className="text-red-500" />
                    </div>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <Link
                      href={`/profile/${profile.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="ml-1 px-4 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Log in
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
