"use client";

import Link from "next/link";
import { User, Gamepad2, Clock, Trophy, Award } from "lucide-react";
import type { Profile, RecentScoreEntry, ProfileStats } from "@/lib/types";

function formatMemberSince(createdAt: string) {
  const d = new Date(createdAt);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDate(createdAt: string) {
  return new Date(createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}

interface ProfileClientProps {
  profile: Profile;
  recentScores: RecentScoreEntry[];
  stats: ProfileStats;
  isOwnProfile: boolean;
}

export default function ProfileClient({
  profile,
  recentScores,
  stats,
  isOwnProfile,
}: ProfileClientProps) {
  return (
    <>
      {/* Header card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-red-100">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar URL from Supabase storage
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-red-50">
                <User size={36} className="text-red-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
            <p className="text-sm text-gray-500">{profile.displayName}</p>
            <p className="mt-1 text-xs text-gray-400">
              Member since {formatMemberSince(profile.createdAt)}
            </p>
            {isOwnProfile && (
              <Link
                href={`/profile/${profile.username}/settings`}
                className="mt-3 inline-block rounded-lg border-2 border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
              >
                Edit profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats: 3 cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Gamepad2 size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Games Played
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {stats.gamesPlayed}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Time
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatTime(stats.totalTimeSeconds)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Trophy size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Favorite Game
            </span>
          </div>
          <p className="mt-1 truncate text-lg font-bold text-gray-900">
            {stats.favoriteGameTitle ?? "—"}
          </p>
        </div>
      </div>

      {/* Recent scores */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <h2 className="border-b border-gray-100 px-5 py-3 text-sm font-bold text-gray-900">
          Recent scores
        </h2>
        {recentScores.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            No scores yet. Play games to see them here!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-4 py-3">Game</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentScores.map((row) => (
                  <tr
                    key={`${row.gameId}-${row.createdAt}`}
                    className="border-b border-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/game/${row.gameSlug}`}
                        className="flex items-center gap-3 hover:text-red-500"
                      >
                        <div
                          className="h-10 w-14 shrink-0 rounded-lg"
                          style={{ background: row.thumbnailGradient }}
                        />
                        <span className="font-medium text-gray-800">
                          {row.gameTitle}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                      {row.score.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Achievements placeholder */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Award size={18} className="text-red-500" />
          Achievements
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Achievements are coming soon. Keep playing!
        </p>
      </div>
    </>
  );
}
