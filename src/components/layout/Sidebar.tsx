"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Clock,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Star,
  Users,
  Sword,
  Compass,
  CircleDot,
  Bike,
  Car,
  Layers,
  Gamepad2,
  MousePointerClick,
  DoorOpen,
  Crosshair,
  Ghost,
  Globe,
  LayoutGrid,
  PuzzleIcon,
  Flag,
  Target,
  Trophy,
  PersonStanding,
  Castle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/recent", label: "Recently Played", icon: Clock },
  { href: "/new", label: "New", icon: Sparkles },
  { href: "/popular", label: "Popular Games", icon: TrendingUp },
  { href: "/updated", label: "Updated", icon: RefreshCw },
  { href: "/originals", label: "Originals", icon: Star, badge: true },
  { href: "/multiplayer", label: "Multiplayer", icon: Users },
] as const;

const CATEGORY_ITEMS = [
  { href: "/category/action", label: "Action", icon: Sword },
  { href: "/category/adventure", label: "Adventure", icon: Compass },
  { href: "/category/basketball", label: "Basketball", icon: CircleDot },
  { href: "/category/bike", label: "Bike", icon: Bike },
  { href: "/category/car", label: "Car", icon: Car },
  { href: "/category/card", label: "Card", icon: Layers },
  { href: "/category/casual", label: "Casual", icon: Gamepad2 },
  { href: "/category/clicker", label: "Clicker", icon: MousePointerClick },
  { href: "/category/driving", label: "Driving", icon: Car },
  { href: "/category/escape", label: "Escape", icon: DoorOpen },
  { href: "/category/fps", label: "FPS", icon: Crosshair },
  { href: "/category/horror", label: "Horror", icon: Ghost },
  { href: "/category/io", label: ".io", icon: Globe },
  { href: "/category/mahjong", label: "Mahjong", icon: LayoutGrid },
  { href: "/category/puzzle", label: "Puzzle", icon: PuzzleIcon },
  { href: "/category/racing", label: "Racing", icon: Flag },
  { href: "/category/shooting", label: "Shooting", icon: Target },
  { href: "/category/soccer", label: "Soccer", icon: CircleDot },
  { href: "/category/sports", label: "Sports", icon: Trophy },
  { href: "/category/stickman", label: "Stickman", icon: PersonStanding },
  { href: "/category/tower-defense", label: "Tower Defense", icon: Castle },
] as const;

interface SidebarProps {
  className?: string;
}

function SidebarItem({
  href,
  label,
  icon: Icon,
  isActive,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "flex items-center rounded-lg transition-colors group",
        // icon-only on tablet (md), full on desktop (lg)
        "py-2 mx-1 px-2 justify-center",
        "lg:mx-2 lg:px-3 lg:gap-3 lg:justify-start",
        isActive
          ? "bg-red-50 text-red-500"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon
        size={18}
        className={cn(
          "shrink-0 transition-colors",
          isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-600"
        )}
      />
      <span
        className={cn(
          "hidden lg:block text-sm truncate",
          isActive && "font-semibold"
        )}
      >
        {label}
      </span>
      {badge && (
        <span className="hidden lg:block ml-auto w-2 h-2 bg-red-500 rounded-full shrink-0" />
      )}
    </Link>
  );
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-[60px] z-40",
        // mobile drawer: 220px; tablet: 60px icon-only; desktop: 220px full
        "w-[220px] md:w-[60px] lg:w-[220px]",
        "h-[calc(100vh-60px)]",
        "bg-white border-r border-gray-200",
        "overflow-y-auto flex flex-col",
        "[&::-webkit-scrollbar]:w-1",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-gray-200",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        className
      )}
    >
      {/* Group 1: Main Navigation */}
      <nav className="pt-3 pb-2">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.href}
            badge={"badge" in item ? (item as { badge?: boolean }).badge : undefined}
          />
        ))}
      </nav>

      {/* Separator */}
      <div className="mx-3 border-t border-gray-200 my-1 lg:mx-4" />

      {/* Group 2: Categories */}
      <nav className="pt-2 pb-4">
        {/* Label hidden on tablet icon-only mode */}
        <p className="hidden lg:block px-5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Categories
        </p>

        {CATEGORY_ITEMS.map(({ href, label, icon }) => (
          <SidebarItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            isActive={pathname === href}
          />
        ))}

        {/* All Tags — hidden on tablet icon-only */}
        <Link
          href="/categories"
          title="All Categories"
          className="hidden lg:flex items-center gap-1 px-5 py-2 mt-1 text-sm text-red-500 hover:underline font-medium"
        >
          All Tags
          <ChevronRight size={14} />
        </Link>
      </nav>
    </aside>
  );
}
