"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getLeaderboard } from "@/lib/supabase/helpers";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Game, LeaderboardEntry } from "@/lib/types";

const MEDAL = ["#FFD700", "#A8A9AD", "#CD7F32"]; // gold / silver / bronze

export default function Leaderboard({
  game,
  myBest,
}: {
  game: Game;
  myBest: number;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    const supabase = createClient();
    const data = await getLeaderboard(supabase, game.id);
    setEntries(data);
    setLoading(false);
  }, [game.id]);

  useEffect(() => {
    fetchEntries();

    // Realtime: refetch whenever a new score is inserted for this game
    const supabase = createClient();
    const channel = supabase
      .channel(`scores-${game.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scores", filter: `game_id=eq.${game.id}` },
        fetchEntries
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [game.id, fetchEntries]);

  return (
    <div className="space-y-4">
      {/* Your best */}
      {myBest > 0 && (
        <div className="flex items-center justify-between rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">Your best</span>
          <span className="text-lg font-extrabold text-red-500">{myBest.toLocaleString()}</span>
        </div>
      )}

      {/* Board */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 flex-1 max-w-[120px]" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          No scores yet — be the first to set a record!
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="pb-2 pr-3 w-10">#</th>
              <th className="pb-2">Player</th>
              <th className="pb-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.userId} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2.5 pr-3">
                  {i < 3 ? (
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-white"
                      style={{ background: MEDAL[i] }}
                    >
                      {i + 1}
                    </span>
                  ) : (
                    <span className="pl-1 text-gray-400">{i + 1}</span>
                  )}
                </td>
                <td className="py-2.5">
                  <span className="font-medium text-gray-800 truncate">
                    {e.displayName || e.username || "Anonymous"}
                  </span>
                </td>
                <td className="py-2.5 text-right font-bold text-gray-900">
                  {e.bestScore.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="text-center text-xs text-gray-400">
        Sign in to submit your score to the leaderboard
      </p>
    </div>
  );
}
