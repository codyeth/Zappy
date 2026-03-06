import { Zap, Download, Star, Users } from "lucide-react";

const USPs = [
  { icon: Zap, label: "Instant Play" },
  { icon: Download, label: "No Download" },
  { icon: Star, label: "50+ Games" },
  { icon: Users, label: "Free Forever" },
] as const;

export default function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-400 to-orange-400 px-6 py-7 md:px-10 md:py-8">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-4 bottom-0 h-28 w-28 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-40 -bottom-6 h-20 w-20 rounded-full bg-orange-300/20" />
      <div className="pointer-events-none absolute right-20 top-4 h-10 w-10 rounded-full bg-white/15" />

      <div className="relative z-10">
        {/* Title row */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/25">
            <Zap size={20} className="fill-white text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-white md:text-3xl">
              Welcome to Zappy!
            </h1>
            <p className="text-sm text-red-100">
              Play free browser games instantly — no download, no sign-up needed
            </p>
          </div>
        </div>

        {/* USP chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {USPs.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
            >
              <Icon size={13} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
